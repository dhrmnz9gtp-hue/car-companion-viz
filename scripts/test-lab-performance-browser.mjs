import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-performance");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE,
  headless: true,
});
const results = [],
  errors = [];
const pass = (name) => {
  results.push(name);
  console.log("PASS", name);
};
const button = (p, name) => p.getByRole("button", { name, exact: true });
const ready = (p) => p.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
const diag = (p) => p.locator("canvas").evaluate((c) => c.labDiagnostics());
const view = (p) => p.locator(".lab-stage").scrollIntoViewIfNeeded();
const away = async (p) => {
  await p.evaluate(() => {
    // Finish editing before measuring the separate rapid-scroll action.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    scrollTo(0, document.body.scrollHeight);
  });
  await p.waitForFunction(() =>
    document.querySelector(".lab-playback-status")?.textContent.includes("visibilidad"),
  );
  await p.waitForTimeout(250);
};
const phase = async (p) => Number(await p.locator("#lab-cycle").inputValue());
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(base + "/laboratorio/motor-electrico");
  assert.equal(response.status(), 200);
  assert(!(await response.text()).includes("<canvas"));
  await ready(page);
  const cdp = await page.context().newCDPSession(page);
  const documentListeners = async () => {
    const doc = await cdp.send("Runtime.evaluate", {
      expression: "document",
      objectGroup: "listener-check",
    });
    const events = await cdp.send("DOMDebugger.getEventListeners", {
      objectId: doc.result.objectId,
    });
    const counts = Object.fromEntries(
      ["keydown", "keyup"].map((type) => [
        type,
        events.listeners.filter((e) => e.type === type).length,
      ]),
    );
    await cdp.send("Runtime.releaseObjectGroup", { objectGroup: "listener-check" });
    return counts;
  };
  // Warm React's delegated event roots before comparing independent canvas mounts.
  await button(page, "Esquema 2D").click();
  await page.waitForTimeout(700);
  await button(page, "3D").click();
  await ready(page);
  await page.waitForTimeout(700);
  const listeners = await documentListeners();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.down("Control");
    await button(page, "Esquema 2D").click();
    await page.waitForTimeout(700);
    await page.keyboard.up("Control");
    await button(page, "3D").click();
    await ready(page);
    await page.waitForTimeout(700);
    assert.deepEqual(await documentListeners(), listeners);
  }
  assert.equal((await diag(page)).meshes, 65);
  assert.equal((await diag(page)).triangles, 30496);
  pass(
    "Repeated detached-canvas cleanup, including Control held during unmount, leaves no document listener growth",
  );
  await button(page, "Cómo funciona").click();
  await button(page, "Seleccionar Rotor").click();
  await page.getByLabel("Velocidad de reproducción").selectOption("0.25");
  await button(page, "Iniciar").click();
  await view(page);
  await page.waitForTimeout(300);
  await away(page);
  const frozen = await phase(page),
    frame = (await diag(page)).frame;
  await page.waitForTimeout(1000);
  assert.equal(await phase(page), frozen);
  assert.equal((await diag(page)).frame, frame);
  assert.equal(await page.locator(".lab-education h2").innerText(), "Rotor");
  await view(page);
  await page.waitForFunction(
    (v) => Number(document.querySelector("#lab-cycle").value) !== v,
    frozen,
  );
  const resumed = await phase(page);
  assert((resumed - frozen + 1440) % 1440 < 25, "return must exclude invisible wall time");
  await button(page, "Pausar").click();
  pass(
    "Offscreen playback freezes phase and render frames, then resumes without a temporal jump or lost selection",
  );
  await button(page, "Iniciar").click();
  await view(page);
  await away(page);
  await button(page, "Pausar").click();
  const paused = await phase(page);
  await view(page);
  await page.waitForTimeout(400);
  assert.equal(await phase(page), paused);
  await button(page, "Iniciar").click();
  await away(page);
  await button(page, "Simular").click();
  assert(await button(page, "Pausar").isDisabled());
  pass("Manual pause and lesson changes override visibility resume");
  await page.getByRole("spinbutton", { name: "Torque · Nm", exact: true }).fill("250");
  await button(page, "Escenario B").click();
  await page.getByRole("spinbutton", { name: "Torque · Nm", exact: true }).fill("130");
  await page.getByLabel("Escala temporal visual").selectOption("0.01");
  await button(page, "Iniciar").click();
  await view(page);
  await page.waitForTimeout(200);
  await away(page);
  await page.getByRole("spinbutton", { name: "Torque · Nm", exact: true }).fill("175");
  // Input automation scrolls the stage back into view; leave it again before
  // asserting suspended frames and the preserved rotor orientation.
  await away(page);
  const rotor = (await diag(page)).parts["rotor.core"].matrix;
  await page.waitForTimeout(250);
  const settled = (await diag(page)).frame;
  await page.waitForTimeout(700);
  assert.equal((await diag(page)).frame, settled);
  assert.deepEqual((await diag(page)).parts["rotor.core"].matrix, rotor);
  assert.equal(await page.getByTestId("sim-mechanical").innerText(), "109.96 kW");
  await view(page);
  await page.waitForTimeout(200);
  assert.notDeepEqual((await diag(page)).parts["rotor.core"].matrix, rotor);
  await button(page, "Pausar").click();
  await button(page, "Escenario A").click();
  assert.equal(
    await page.getByRole("spinbutton", { name: "Torque · Nm", exact: true }).inputValue(),
    "250",
  );
  assert.equal(await page.getByLabel("Escala temporal visual").inputValue(), "0.01");
  pass("Edited calculations, scenarios, temporal scale and rotor orientation survive suspension");
  await button(page, "Cómo funciona").click();
  await button(page, "Esquema 2D").click();
  await button(page, "Iniciar").click();
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const p2d = await phase(page);
  await page.waitForTimeout(300);
  assert.notEqual(await phase(page), p2d);
  assert.equal(await page.locator("canvas").count(), 0);
  await button(page, "Pausar").click();
  pass("2D electrical signals continue without a visible WebGL viewer");
  await button(page, "3D").click();
  await ready(page);
  await page
    .locator("canvas")
    .evaluate((c) => c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
  await page.locator(".lab-fallback-message").waitFor();
  assert(await button(page, "Iniciar").isDisabled());
  pass("WebGL context loss still recovers the educational fallback and pauses playback");
  for (const profile of [
    {
      name: "portrait-touch",
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      expected: 1,
    },
    {
      name: "landscape-touch",
      viewport: { width: 844, height: 390 },
      isMobile: true,
      hasTouch: true,
      expected: 1,
    },
    {
      name: "narrow-fine-desktop",
      viewport: { width: 390, height: 844 },
      isMobile: false,
      hasTouch: false,
      expected: 1.5,
    },
  ]) {
    const { name, expected, ...options } = profile;
    const ctx = await browser.newContext({ ...options, deviceScaleFactor: 3 });
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
    });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(base + "/laboratorio/motor-electrico");
    await ready(p);
    const graphics = await p.locator("canvas").evaluate((c) => ({
      ratio: c.width / c.clientWidth,
      aa: c.getContext("webgl2").getContextAttributes().antialias,
    }));
    assert(Math.abs(graphics.ratio - expected) < 0.01, name);
    assert.equal(graphics.aa, expected > 1, name);
    await p.screenshot({ path: output + "/" + name + ".png", fullPage: true });
    await ctx.close();
  }
  pass(
    "DPR policy is stable across touch orientations and preserves fine-pointer desktop quality independent of width",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    output + "/performance-browser-results.json",
    JSON.stringify(
      {
        results,
        errors,
        note: "Desktop native Metal, emulated viewports and capabilities; no physical phone.",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
