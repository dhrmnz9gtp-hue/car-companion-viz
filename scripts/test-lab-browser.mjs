import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-validation");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE || undefined,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const results = [];
const errors = [];
const names = [
  "Carcasa exterior",
  "Estator",
  "Bobinados",
  "Rotor",
  "Imanes permanentes",
  "Eje",
  "Rodamientos",
];
const success = (name, detail) => {
  results.push({ name, status: "passed", detail });
  console.log("PASS", name, detail || "");
};
const observe = (page) => page.on("pageerror", (error) => errors.push(error.message));
const ready = (page) => page.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
const diagnostic = (page) => page.locator("canvas").evaluate((canvas) => canvas.labDiagnostics?.());
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  observe(page);
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  assert.equal((await page.goto(base + "/"))?.status(), 200);
  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.equal(
    requests.filter((url) => /Scene\.client|react-three|three\.js|\/viewer\/geometry/.test(url))
      .length,
    0,
  );
  assert.equal(await page.locator('a[href="/laboratorio/motor-electrico"]').count(), 0);
  success("Homepage keeps its content and does not load the 3D engine");
  assert.equal((await page.goto(base + "/guias"))?.status(), 200);
  await page.getByRole("heading", { name: "Guías de vehículos eléctricos" }).waitFor();
  assert.equal((await page.goto(base + "/guias/byd-yuan-up"))?.status(), 200);
  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.equal(await page.locator("#bateria").count(), 1);
  success("Existing React guide routes load");
  assert.equal((await page.goto(base + "/interactivos/byd-yuan-up.html"))?.status(), 200);
  const oldHotspot = page.locator('[data-key="motor"]').first();
  if (await oldHotspot.count()) {
    await oldHotspot.click();
    assert.match(await page.locator("body").innerText(), /motor/i);
  }
  success("Existing HTML guide loads and responds to a hotspot");
  const response = await page.goto(base + "/laboratorio/motor-electrico");
  assert.equal(response?.status(), 200);
  const ssr = await response.text();
  assert.match(ssr, /La energía se vuelve/);
  assert.doesNotMatch(ssr, /<canvas/);
  await ready(page);
  success("New route returns educational SSR HTML, hydrates and renders WebGL");
  const baseline = await diagnostic(page);
  assert(baseline && baseline.triangles < 100000 && baseline.meshes > 7);
  await page.waitForTimeout(500);
  const idleA = await diagnostic(page);
  await page.waitForTimeout(600);
  const idleB = await diagnostic(page);
  assert.equal(idleA.frame, idleB.frame);
  success("Scene stays idle without interaction", baseline);
  for (const name of names) {
    await page.getByRole("button", { name: `Seleccionar ${name}`, exact: true }).click();
    assert.equal(await page.locator(".lab-education h2").innerText(), name);
    assert((await page.locator(".lab-explanation p").innerText()).length > 60);
    assert((await page.locator(".lab-connection p").innerText()).length > 60);
  }
  success("All seven component selectors update Spanish explanations");
  await page.getByRole("button", { name: "Restablecer vista" }).click();
  const canvas = page.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + box.width * 0.53, box.y + box.height * 0.51);
  await page.waitForSelector(".lab-part-name");
  success(
    "Mesh picking identifies a specific physical part",
    await page.locator(".lab-part-name").innerText(),
  );
  await page.getByRole("button", { name: "Enfocar componente" }).click();
  await page.waitForTimeout(100);
  assert.notDeepEqual((await diagnostic(page)).target, baseline.target);
  await page.getByRole("button", { name: "Restablecer vista" }).click();
  assert.equal(await page.locator('.lab-component-list [aria-pressed="true"]').count(), 0);
  await page.mouse.move(box.x + box.width * 0.46, box.y + box.height * 0.52);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.55, { steps: 12 });
  await page.mouse.up();
  assert.notDeepEqual((await diagnostic(page)).camera, baseline.camera);
  assert.equal(
    await page.locator('.lab-component-list [aria-pressed="true"]').count(),
    0,
    "drag should not select",
  );
  success("Mouse orbit changes camera without accidental selection");
  await page.getByRole("button", { name: "Restablecer vista" }).click();
  for (let i = 0; i < 24; i++)
    await page.getByRole("button", { name: "Girar a la derecha", exact: true }).click();
  assert(
    (await diagnostic(page)).camera.every(
      (value, i) => Math.abs(value - baseline.camera[i]) < 0.001,
    ),
  );
  for (let i = 0; i < 12; i++)
    await page.getByRole("button", { name: "Acercar", exact: true }).click();
  assert(Math.abs((await diagnostic(page)).distance - 4.8) < 0.001);
  for (let i = 0; i < 12; i++)
    await page.getByRole("button", { name: "Alejar", exact: true }).click();
  assert(Math.abs((await diagnostic(page)).distance - 14) < 0.001);
  await page.getByRole("button", { name: "Restablecer vista" }).click();
  const reset = await diagnostic(page);
  assert(reset.camera.every((value, i) => Math.abs(value - baseline.camera[i]) < 0.001));
  success("360° orbit, zoom bounds and reset verified");
  await page.locator(".lab-stage").focus();
  await page.keyboard.press("ArrowLeft");
  assert.notDeepEqual((await diagnostic(page)).camera, baseline.camera);
  await page.keyboard.press("Home");
  await page.keyboard.press("Escape");
  assert.equal(
    await page.getByRole("button", { name: "Activar exploración" }).getAttribute("aria-pressed"),
    "false",
  );
  await page.getByRole("button", { name: "Seleccionar Estator", exact: true }).focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".lab-education h2").innerText(), "Estator");
  success("Keyboard camera controls and component selection work");
  await page.getByRole("button", { name: "Esquema 2D", exact: true }).click();
  assert.equal(await page.locator("canvas").count(), 0);
  await page
    .getByRole("button", { name: "Seleccionar Bobinados en el esquema", exact: true })
    .click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Bobinados");
  await page.screenshot({ path: output + "/diagram-desktop.png", fullPage: true });
  success("Interactive 2D mode reuses educational content and releases the canvas");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await ready(page);
  await page.getByRole("button", { name: "Restablecer vista" }).click();
  await page.screenshot({ path: output + "/desktop.png", fullPage: true });

  // A genuinely unavailable WebGL2 context, not an application-specific test switch.
  const noGpu = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await noGpu.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return kind === "webgl2" ? null : original.call(this, kind, ...args);
    };
  });
  const fallbackPage = await noGpu.newPage();
  observe(fallbackPage);
  await fallbackPage.goto(base + "/laboratorio/motor-electrico");
  await fallbackPage.locator(".lab-fallback-message").waitFor();
  assert.equal(await fallbackPage.locator("canvas").count(), 0);
  assert.equal(await fallbackPage.getByRole("group", { name: "Controles de cámara" }).count(), 0);
  assert.equal(await fallbackPage.getByRole("button", { name: "Activar exploración" }).count(), 0);
  for (const name of names) {
    await fallbackPage.getByRole("button", { name: `Seleccionar ${name}`, exact: true }).click();
    assert.equal(await fallbackPage.locator(".lab-education h2").innerText(), name);
  }
  assert.equal(await fallbackPage.getByRole("button", { name: "Enfocar componente" }).count(), 0);
  await fallbackPage.screenshot({ path: output + "/fallback-mobile.png", fullPage: true });
  success("Unavailable WebGL2 falls back to 2D with all seven explanations");
  await noGpu.close();

  await page.locator("canvas").evaluate((canvas) => {
    canvas.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext();
  });
  await page.locator(".lab-fallback-message").waitFor();
  await page.getByRole("button", { name: "Seleccionar Eje", exact: true }).click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Eje");
  success("Loss of an existing graphics context preserves education");

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const phone = await mobile.newPage();
  observe(phone);
  await phone.goto(base + "/laboratorio/motor-electrico");
  await ready(phone);
  assert.equal(
    await phone.getByRole("button", { name: "Activar exploración" }).getAttribute("aria-pressed"),
    "false",
  );
  const overflows = await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflows, false);
  await phone.getByRole("button", { name: "Activar exploración" }).tap();
  await phone.locator("canvas").scrollIntoViewIfNeeded();
  const phoneBefore = await diagnostic(phone);
  const touchBox = await phone.locator("canvas").boundingBox();
  const cdp = await mobile.newCDPSession(phone);
  const x = touchBox.x + touchBox.width * 0.35,
    y = touchBox.y + touchBox.height * 0.52;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 75, y: y + 10 }],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await phone.waitForTimeout(150);
  assert.notDeepEqual((await diagnostic(phone)).camera, phoneBefore.camera);
  const beforePinch = (await diagnostic(phone)).distance;
  const centerX = touchBox.x + touchBox.width / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: centerX - 30, y },
      { x: centerX + 30, y },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: centerX - 65, y },
      { x: centerX + 65, y },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await phone.waitForTimeout(100);
  assert((await diagnostic(phone)).distance < beforePinch, "two-finger pinch must zoom in");
  await phone.getByRole("button", { name: "Pausar interacción" }).tap();
  assert.equal(
    await phone.locator("canvas").evaluate((canvas) => getComputedStyle(canvas).touchAction),
    "pan-y",
  );
  await phone.getByRole("button", { name: "Seleccionar Imanes permanentes", exact: true }).tap();
  assert.equal(await phone.locator(".lab-education h2").innerText(), "Imanes permanentes");
  await phone.screenshot({ path: output + "/mobile.png", fullPage: true });
  success(
    "390px touch emulation: orbit, pinch zoom, selection, scroll release, no horizontal overflow",
    {
      physicalDevice: false,
    },
  );
  await mobile.close();
  assert.deepEqual(errors, []);
  success("No unhandled browser or hydration errors", errors);
  await writeFile(
    output + "/browser-results.json",
    JSON.stringify(
      {
        base,
        results,
        errors,
        mobile: "Chromium emulation, not a physical device",
        renderer: "SwiftShader (software), no real-device FPS claim",
      },
      null,
      2,
    ),
  );
} catch (error) {
  await writeFile(
    output + "/browser-failure.json",
    JSON.stringify({ error: String(error), results, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
