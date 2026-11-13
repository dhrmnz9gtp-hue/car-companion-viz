import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-phase2");
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const results = [],
  errors = [];
const pass = (name) => {
  results.push(name);
  console.log("PASS", name);
};
const diag = (page) => page.locator("canvas").evaluate((c) => c.labDiagnostics());
const ready = (page) => page.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
const stable = (page) =>
  page.waitForFunction(
    () =>
      [...document.querySelectorAll(".lab-assembly-actions button")].find(
        (b) => b.textContent === "Detener",
      )?.disabled,
  );
const range = async (page, id, value) => {
  const slider = page.locator(id);
  await slider.focus();
  await slider.press(value === 100 ? "End" : "Home");
  if (value !== 100) for (let i = 0; i < value; i++) await slider.press("ArrowRight");
  await stable(page);
};
const positions = (state) =>
  Object.fromEntries(Object.entries(state.parts).map(([id, p]) => [id, p.position]));
const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.000001);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(base + "/laboratorio/motor-electrico");
  assert.equal(response.status(), 200);
  assert(!(await response.text()).includes("<canvas"));
  await ready(page);
  const original = await diag(page);
  await page.locator(".lab-stage").screenshot({ path: output + "/ensamblado.png" });
  await page.screenshot({ path: output + "/ensamblado-pagina.png", fullPage: true });
  await page.getByRole("button", { name: "Desmontar", exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Girar a la derecha", exact: true }).click();
  await page.getByRole("button", { name: "Detener", exact: true }).click();
  const stopped = await diag(page);
  const level = Number(await page.locator("#lab-separation").inputValue());
  assert(level > 0 && level < 100);
  await page.waitForTimeout(250);
  assert.deepEqual(positions(await diag(page)), positions(stopped));
  assert(
    !close(
      stopped.camera.map((v) => v / stopped.distance),
      original.camera.map((v) => v / original.distance),
    ),
  );
  pass("Desmontar is animated, camera remains available and Detener freezes the current position");
  await range(page, "#lab-separation", 50);
  const halfway = await diag(page);
  assert(
    halfway.parts["rotor.core"].position[2] > 0 && halfway.parts["rotor.core"].position[2] < 3.8,
  );
  assert(close(halfway.parts["rotor.core"].position, halfway.parts["magnets.pole.1"].position));
  assert(close(halfway.parts["rotor.core"].position, halfway.parts["shaft.main"].position));
  assert.equal(halfway.parts["housing.shell"].position[1], 0);
  pass("Range reaches 50%, preserves the rotating unit and respects staged extraction");
  await page.getByRole("button", { name: "Seleccionar Imanes permanentes", exact: true }).click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Imanes permanentes");
  await page.getByRole("button", { name: "Aislar componente", exact: true }).click();
  let isolated = await diag(page);
  assert(
    Object.entries(isolated.parts).every(([id, p]) => p.visible === id.startsWith("magnets.")),
  );
  await page.locator("canvas").scrollIntoViewIfNeeded();
  const rect = await page.locator("canvas").boundingBox();
  const point = isolated.parts["magnets.pole.1"].pickPoint;
  await page.mouse.click(
    rect.x + ((point[0] + 1) / 2) * rect.width,
    rect.y + ((1 - point[1]) / 2) * rect.height,
  );
  await page.waitForSelector(".lab-part-name");
  assert.match(await page.locator(".lab-part-name").innerText(), /Imán/);
  await page.getByRole("button", { name: "Enfocar componente", exact: true }).click();
  const focus = await diag(page);
  assert(focus.target[2] > 1);
  await page.getByRole("button", { name: "Mostrar todo", exact: true }).click();
  assert(Object.values((await diag(page)).parts).every((p) => p.visible));
  pass("Picking, education, focus and component isolation work while separated");
  await page.getByRole("button", { name: "Restablecer vista", exact: true }).click();
  await page.getByRole("button", { name: "Desmontar", exact: true }).click();
  await stable(page);
  const exploded = await diag(page);
  assert.equal(await page.locator("#lab-separation").inputValue(), "100");
  assert(Math.abs(exploded.parts["rotor.core"].position[2] - 3.8) < 0.000001);
  assert.equal(exploded.parts["housing.shell"].position[1], 2);
  assert(exploded.distance > original.distance);
  assert.equal(exploded.geometries, original.geometries);
  await page.locator(".lab-stage").screenshot({ path: output + "/desmontado.png" });
  await page.screenshot({ path: output + "/desmontado-pagina.png", fullPage: true });
  // Captures may change viewport visibility and request a final demand frame.
  // Measure steady idle only after those interactions have settled.
  await page.waitForTimeout(150);
  const frameA = (await diag(page)).frame;
  await page.waitForTimeout(300);
  assert.equal((await diag(page)).frame, frameA);
  pass(
    "100% disassembly keeps 65 geometries, expands camera framing and returns to idle rendering",
  );
  await page.getByRole("button", { name: "Ensamblar", exact: true }).click();
  await page.waitForTimeout(180);
  const reverse = await diag(page);
  assert(reverse.parts["housing.shell"].position[1] < 2);
  await stable(page);
  assert.deepEqual(positions(await diag(page)), positions(original));
  pass("Ensamblar returns every part exactly to its original position");
  await range(page, "#lab-transparency", 60);
  const ghost = await diag(page);
  assert.equal(ghost.parts["housing.shell"].opacity, 0.4);
  assert.equal(ghost.parts["housing.shell"].depthWrite, false);
  assert(
    Object.entries(ghost.parts)
      .filter(([id]) => id.startsWith("housing."))
      .every(([id, p]) => p.visible === (id === "housing.shell")),
  );
  await page.locator(".lab-stage").screenshot({ path: output + "/transparencia.png" });
  await range(page, "#lab-transparency", 100);
  assert(
    Object.entries((await diag(page)).parts)
      .filter(([id]) => id.startsWith("housing."))
      .every(([, p]) => !p.visible),
  );
  await range(page, "#lab-transparency", 0);
  assert(Object.values((await diag(page)).parts).every((p) => p.visible));
  pass(
    "Transparency uses one depth-safe shell, hides it at 100% and restores all housing parts at 0%",
  );
  await range(page, "#lab-transparency", 100);
  await page.getByRole("button", { name: "Seleccionar Rotor", exact: true }).click();
  await page.getByRole("button", { name: "Aislar componente", exact: true }).click();
  await page.getByRole("button", { name: "Seleccionar Carcasa exterior", exact: true }).click();
  assert.equal(await page.locator("#lab-transparency").inputValue(), "0");
  assert(
    Object.entries((await diag(page)).parts).every(
      ([id, p]) => p.visible === id.startsWith("housing."),
    ),
  );
  await page.getByRole("button", { name: "Mostrar todo", exact: true }).click();
  pass("Switching an isolated selection to a hidden housing restores its visibility");
  await range(page, "#lab-separation", 40);
  await page.getByRole("button", { name: "Esquema 2D", exact: true }).click();
  assert.equal(await page.locator("canvas").count(), 0);
  assert.equal(await page.locator("#lab-separation").count(), 0);
  await page
    .getByRole("button", { name: "Seleccionar Estator en el esquema", exact: true })
    .click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Estator");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await ready(page);
  assert.equal(await page.locator("#lab-separation").inputValue(), "40");
  assert((await diag(page)).distance > original.distance);
  pass(
    "2D stays educational and assembled; returning to 3D restores separation and camera framing",
  );
  await page.getByRole("button", { name: "Aislar componente", exact: true }).click();
  await range(page, "#lab-transparency", 50);
  await page.getByRole("button", { name: "Restablecer vista", exact: true }).click();
  const reset = await diag(page);
  assert.deepEqual(positions(reset), positions(original));
  assert(close(reset.camera, original.camera));
  assert(Object.values(reset.parts).every((p) => p.visible && p.opacity === 1));
  assert.equal(await page.locator('.lab-component-list [aria-pressed="true"]').count(), 0);
  pass("Reset clears separation, transparency, isolation, selection and camera");
  await page.getByRole("button", { name: "Desmontar", exact: true }).click();
  await stable(page);
  await page
    .locator("canvas")
    .evaluate((c) => c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
  await page.locator(".lab-fallback-message").waitFor();
  assert.equal(await page.locator("#lab-separation").count(), 0);
  await page.getByRole("button", { name: "Seleccionar Eje", exact: true }).click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Eje");
  pass("Context loss after disassembly removes 3D controls and preserves the 2D lesson");

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const phone = await mobile.newPage();
  phone.on("pageerror", (e) => errors.push(e.message));
  await phone.goto(base + "/laboratorio/motor-electrico");
  await ready(phone);
  await phone.getByRole("button", { name: "Desmontar", exact: true }).tap();
  await stable(phone);
  assert.equal(await phone.locator("#lab-separation").inputValue(), "100");
  await phone.locator("#lab-separation").scrollIntoViewIfNeeded();
  const slider = await phone.locator("#lab-separation").boundingBox();
  await phone.touchscreen.tap(slider.x + slider.width * 0.5, slider.y + slider.height / 2);
  await stable(phone);
  const middle = Number(await phone.locator("#lab-separation").inputValue());
  assert(middle > 30 && middle < 70);
  await phone.getByRole("button", { name: "Seleccionar Rotor", exact: true }).tap();
  await phone.getByRole("button", { name: "Aislar componente", exact: true }).tap();
  assert(
    Object.entries((await diag(phone)).parts).every(
      ([id, p]) => p.visible === (id === "rotor.core"),
    ),
  );
  await phone.getByRole("button", { name: "Mostrar todo", exact: true }).tap();
  await phone.getByRole("button", { name: "Desmontar", exact: true }).tap();
  await stable(phone);
  assert.equal(
    await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await phone.screenshot({ path: output + "/desmontado-movil.png", fullPage: true });
  await phone.getByRole("button", { name: "Ensamblar", exact: true }).tap();
  await stable(phone);
  assert.equal(await phone.locator("#lab-separation").inputValue(), "0");
  pass(
    "Touch emulation: disassembly, range tap, isolation, show all and assembly without overflow",
  );
  await mobile.close();
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  reduced.on("pageerror", (e) => errors.push(e.message));
  await reduced.goto(base + "/laboratorio/motor-electrico");
  await ready(reduced);
  await reduced.getByRole("button", { name: "Desmontar", exact: true }).click();
  assert.equal(await reduced.locator("#lab-separation").inputValue(), "100");
  assert.equal(
    await reduced.getByRole("button", { name: "Detener", exact: true }).isDisabled(),
    true,
  );
  assert.equal((await diag(reduced)).parts["housing.shell"].position[1], 2);
  await reduced.close();
  pass("Reduced-motion preference reaches the requested position without animation");
  assert.deepEqual(errors, []);
  await writeFile(
    output + "/assembly-browser-results.json",
    JSON.stringify(
      {
        results,
        errors,
        renderer: "Chrome + SwiftShader; touch emulation, no physical mobile/FPS claim",
      },
      null,
      2,
    ),
  );
} catch (error) {
  await writeFile(
    output + "/assembly-browser-failure.json",
    JSON.stringify({ error: String(error), results, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
