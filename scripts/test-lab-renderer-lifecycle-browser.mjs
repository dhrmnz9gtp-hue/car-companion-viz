import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-performance");
await mkdir(output, { recursive: true });
const fixture = `
import { WebGLRenderer, Scene, PerspectiveCamera, Mesh, SphereGeometry, MeshStandardMaterial, AmbientLight } from 'three';
import { manageRendererLifetime } from './src/features/ev-lab/viewer/rendererLifecycle';
const make=()=>{const renderer=new WebGLRenderer({antialias:false});renderer.setSize(64,64);document.body.append(renderer.domElement);manageRendererLifetime(renderer);const scene=new Scene(),camera=new PerspectiveCamera(45,1,.1,20);camera.position.z=4;const geometry=new SphereGeometry(1,12,8),material=new MeshStandardMaterial({color:'#6ee7b7'});scene.add(new Mesh(geometry,material),new AmbientLight(0xffffff,2));renderer.render(scene,camera);const texture=renderer.properties.get(material).uniforms.dfgLUT.value;return {renderer,scene,camera,geometry,material,texture,draw(){renderer.render(scene,camera);},dispose(){geometry.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};};
const a=make(), b=make(),shared=a.texture;
const initial={sameTexture:a.texture===b.texture,listeners:shared._listeners.dispose.length,version:shared.version,data:shared.image.data.length};
a.dispose();b.draw();const afterFirst={listeners:shared._listeners.dispose.length,triangles:b.renderer.info.render.triangles,lost:b.renderer.getContext().isContextLost(),version:shared.version,data:shared.image.data.length};
const cycles=[];for(let i=0;i<20;i++){const c=make();c.dispose();b.draw();cycles.push(shared._listeners.dispose.length);}
b.dispose();window.result={initial,afterFirst,cycles,finalListeners:shared._listeners.dispose.length,finalData:shared.image.data.length};
`;
await build({
  stdin: {
    contents: fixture,
    resolveDir: process.cwd(),
    sourcefile: "renderer-lifecycle-fixture.ts",
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  outfile: output + "/renderer-lifecycle-fixture.js",
  logLevel: "silent",
});
const javascript = await readFile(output + "/renderer-lifecycle-fixture.js", "utf8");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE,
  headless: true,
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("http://renderer.test/**", (route) =>
    route.fulfill(
      route.request().url().endsWith("fixture.js")
        ? { contentType: "text/javascript", body: javascript }
        : {
            contentType: "text/html",
            body: '<!doctype html><html><body><script type="module" src="/fixture.js"></script></body></html>',
          },
    ),
  );
  await page.goto("http://renderer.test/");
  await page.waitForFunction(() => Boolean(window.result));
  const result = await page.evaluate(() => window.result);
  assert.deepEqual(errors, []);
  assert.equal(result.initial.sameTexture, true);
  assert.equal(result.initial.listeners, 2);
  assert.equal(result.afterFirst.listeners, 1);
  assert(result.afterFirst.triangles > 0);
  assert.equal(result.afterFirst.lost, false);
  assert.equal(result.afterFirst.version, result.initial.version);
  assert.equal(result.afterFirst.data, result.initial.data);
  assert(result.cycles.every((n) => n === 1));
  assert.equal(result.finalListeners, 0);
  assert.equal(result.finalData, result.initial.data);
  await writeFile(
    output + "/renderer-lifecycle-results.json",
    JSON.stringify(
      {
        result,
        errors,
        note: "Two concurrent real WebGL renderers; shared LUT is preserved. Desktop Chrome, no physical phone.",
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS Disposing 21 renderers removes only their own LUT callbacks; a concurrent viewer keeps rendering with the same shared texture",
  );
} finally {
  await browser.close();
}
