import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-simulation");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const results = [],
  errors = [],
  knownResourceIssues = [];
const pass = (name) => {
  results.push(name);
  console.log("PASS", name);
};
const ready = (p) => p.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
const diag = (p) => p.locator("canvas").evaluate((c) => c.labDiagnostics());
const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
const button = (p, name) => p.getByRole("button", { name, exact: true });
const input = (p, name) => p.getByRole("spinbutton", { name, exact: true });
const setRange = async (p, selector, value) => {
  await p.locator(selector).evaluate((el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await p.waitForTimeout(100);
};
const track = (p) => {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() !== "error") return;
    const url = m.location().url;
    if (url === base + "/favicon.ico" && m.text().includes("404")) {
      knownResourceIssues.push({ url, message: m.text() });
    } else errors.push(m.text());
  });
};
const read = (p, id) => p.getByTestId(id).innerText();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  track(page);
  const response = await page.goto(base + "/laboratorio/motor-electrico");
  assert.equal(response.status(), 200);
  assert(!(await response.text()).includes("<canvas"));
  await ready(page);
  await button(page, "Simular").click();
  assert.equal(await page.locator("canvas").count(), 1);
  assert.equal(await read(page, "sim-mechanical"), "47.12 kW");
  assert.equal(await read(page, "sim-hp"), "≈ 63.19 hp");
  assert.equal(await read(page, "sim-electrical"), "52.36 kW");
  assert.equal(await read(page, "sim-losses"), "5.24 kW");
  assert(await button(page, "Pausar").isDisabled());
  const stage = await page.locator(".lab-stage").boundingBox();
  assert(stage.width >= 990 && stage.height === 500);
  pass("SSR, one preserved 3D viewer, paused initial state and known kW/hp results");

  await input(page, "Torque · Nm").fill("300");
  assert.equal(await read(page, "sim-mechanical"), "94.25 kW");
  await input(page, "Eficiencia supuesta · %").fill("100");
  assert.equal(await read(page, "sim-losses"), "0 kW");
  await input(page, "Eficiencia supuesta · %").fill("0");
  assert.equal(await input(page, "Eficiencia supuesta · %").getAttribute("aria-invalid"), "true");
  assert.equal(await read(page, "sim-losses"), "0 kW");
  await input(page, "Eficiencia supuesta · %").press("Tab");
  assert.equal(await input(page, "Eficiencia supuesta · %").inputValue(), "100");
  await input(page, "Velocidad mecánica · rpm").fill("12001");
  assert.equal(await input(page, "Velocidad mecánica · rpm").getAttribute("aria-invalid"), "true");
  await input(page, "Velocidad mecánica · rpm").fill("0");
  assert.equal(await read(page, "sim-mechanical"), "0 kW");
  assert(await button(page, "Iniciar").isDisabled());
  const zero = await diag(page);
  await page.waitForTimeout(150);
  assert(close((await diag(page)).parts["rotor.core"].matrix, zero.parts["rotor.core"].matrix));
  await page
    .getByRole("slider", { name: "Ajustar Velocidad mecánica · rpm", exact: true })
    .press("End");
  assert.equal(await input(page, "Velocidad mecánica · rpm").inputValue(), "12000");
  await page.getByRole("slider", { name: "Ajustar Torque · Nm", exact: true }).press("Home");
  assert.equal(await read(page, "sim-electrical"), "0 kW");
  pass(
    "Numeric validation, efficiency zero rejection, zero speed/torque and keyboard slider bounds",
  );

  await button(page, "Restablecer escenarios").click();
  await input(page, "Torque · Nm").fill("200");
  await button(page, "Escenario B").click();
  assert.equal(await input(page, "Torque · Nm").inputValue(), "100");
  await input(page, "Velocidad mecánica · rpm").fill("4500");
  await button(page, "Escenario A").click();
  assert.equal(await input(page, "Torque · Nm").inputValue(), "200");
  await page.locator(".lab-sim-comparison summary").click();
  assert((await page.locator(".lab-sim-comparison").innerText()).includes("4,500"));
  assert((await page.locator(".lab-sim-comparison").innerText()).includes("62.83"));
  await page.getByLabel("Eje de la gráfica de potencia").selectOption("torque");
  assert(
    (
      await page
        .getByRole("region", { name: "Relación entre torque, velocidad y potencia" })
        .innerText()
    ).includes("3,000 rpm fijas"),
  );
  await page.locator(".lab-sim-comparison").screenshot({ path: output + "/comparacion.png" });
  pass("Independent editable A/B scenarios, shared mathematical comparison and both plot axes");

  await button(page, "Restablecer escenarios").click();
  const before = await diag(page);
  await button(page, "Iniciar").click();
  await page.waitForTimeout(300);
  await button(page, "Pausar").click();
  const after = await diag(page);
  const moving = Object.keys(before.parts).filter(
    (id) => !close(before.parts[id].matrix, after.parts[id].matrix),
  );
  assert.deepEqual(
    moving.sort(),
    [
      "rotor.core",
      "shaft.main",
      "bearings.inner.-1",
      "bearings.inner.1",
      ...Array.from({ length: 8 }, (_, i) => `magnets.pole.${i + 1}`),
    ].sort(),
  );
  for (const id of Object.keys(before.parts))
    assert(close(before.parts[id].position, after.parts[id].position), id + " pivot");
  await page.waitForTimeout(150);
  assert(close((await diag(page)).parts["rotor.core"].matrix, after.parts["rotor.core"].matrix));
  await page.getByLabel("Escala temporal visual").selectOption("0.01");
  assert((await read(page, "sim-visual-speed")).includes("30 rpm visuales"));
  await input(page, "Torque · Nm").fill("250");
  assert((await read(page, "sim-visual-speed")).includes("30 rpm visuales"));
  await input(page, "Velocidad mecánica · rpm").fill("6000");
  assert((await read(page, "sim-visual-speed")).includes("60 rpm visuales"));
  pass(
    "Only 12 moving parts rotate, fixed pivots stay intact, pause works and rpm/time scaling excludes torque",
  );

  await button(page, "Iniciar").click();
  await button(page, "Desmontar").click();
  await page.waitForTimeout(100);
  assert(await button(page, "Pausar").isDisabled());
  assert(await button(page, "Iniciar").isDisabled());
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("button")].find((b) => b.textContent === "Detener")?.disabled,
  );
  await button(page, "Seleccionar Rotor").click();
  await button(page, "Aislar componente").click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Rotor");
  await button(page, "Mostrar todo").click();
  await setRange(page, "#lab-transparency", 70);
  await button(page, "Girar a la derecha").click();
  await button(page, "Restablecer vista").click();
  assert.equal(await page.locator("#lab-separation").inputValue(), "0");
  assert.equal(await input(page, "Torque · Nm").inputValue(), "250");
  pass(
    "Disassembly pauses/blocks playback; selection, isolation, transparency, camera and reset preserve scenarios",
  );

  await button(page, "Iniciar").click();
  await button(page, "Cómo funciona").click();
  assert(await button(page, "Pausar").isDisabled());
  await page.getByLabel("Velocidad de reproducción").selectOption("0.25");
  await button(page, "Explorar").click();
  assert.equal(await page.locator(".lab-electrical").count(), 0);
  await button(page, "Simular").click();
  assert.equal(await input(page, "Torque · Nm").inputValue(), "250");
  assert.equal(await page.getByLabel("Escala temporal visual").inputValue(), "0.01");
  await button(page, "Esquema 2D").click();
  assert.equal(await page.locator("canvas").count(), 0);
  await input(page, "Torque · Nm").fill("175");
  assert.equal(await read(page, "sim-mechanical"), "109.96 kW");
  assert(await button(page, "Iniciar").isDisabled());
  await button(page, "3D").click();
  await ready(page);
  assert.equal(await input(page, "Torque · Nm").inputValue(), "175");
  await button(page, "Cómo funciona").click();
  assert.equal(await page.getByLabel("Velocidad de reproducción").inputValue(), "0.25");
  await button(page, "Simular").click();
  await button(page, "Restablecer escenarios").click();
  assert.equal(await input(page, "Torque · Nm").inputValue(), "150");
  assert.equal(await page.getByLabel("Escala temporal visual").inputValue(), "0.005");
  pass(
    "All mode transitions, 2D calculations, retained settings and independent scenario/view resets",
  );
  await setRange(page, "#lab-transparency", 70);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: output + "/simulacion-escritorio.png", fullPage: true });
  await page.screenshot({ path: output + "/simulacion-escritorio-vista.png" });
  await page.locator(".lab-simulation").screenshot({ path: output + "/simulacion-panel.png" });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  track(mobile);
  await mobile.goto(base + "/laboratorio/motor-electrico");
  await ready(mobile);
  const mobileBefore = await mobile.locator(".lab-stage").boundingBox();
  await button(mobile, "Simular").tap();
  await input(mobile, "Torque · Nm").fill("200");
  assert.equal(await read(mobile, "sim-mechanical"), "62.83 kW");
  const slider = mobile.getByRole("slider", {
    name: "Ajustar Velocidad mecánica · rpm",
    exact: true,
  });
  await slider.scrollIntoViewIfNeeded();
  const rect = await slider.boundingBox();
  await mobile.touchscreen.tap(rect.x + rect.width * 0.6, rect.y + rect.height / 2);
  assert(Number(await input(mobile, "Velocidad mecánica · rpm").inputValue()) > 3000);
  await button(mobile, "Escenario B").tap();
  assert.equal(await input(mobile, "Torque · Nm").inputValue(), "100");
  await button(mobile, "Iniciar").tap();
  await button(mobile, "Pausar").tap();
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const mstage = await mobile.locator(".lab-stage").boundingBox();
  assert.equal(mstage.height, mobileBefore.height);
  assert.equal(mstage.width, mobileBefore.width);
  await button(mobile, "Restablecer escenarios").tap();
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.screenshot({ path: output + "/simulacion-movil.png", fullPage: true });
  await mobile
    .locator(".lab-simulation")
    .screenshot({ path: output + "/simulacion-movil-panel.png" });
  pass(
    "Touch emulation at 390px: controls, scenarios, playback, full-height viewer and no horizontal overflow",
  );
  await mobile.close();
  const fallback = await browser.newPage();
  track(fallback);
  await fallback.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await fallback.goto(base + "/laboratorio/motor-electrico");
  await button(fallback, "Simular").click();
  await input(fallback, "Torque · Nm").fill("200");
  assert.equal(await read(fallback, "sim-mechanical"), "62.83 kW");
  assert(await button(fallback, "Iniciar").isDisabled());
  pass("No-WebGL fallback retains the educational calculator without starting animation");
  // Renderer capability errors are deliberately induced only by this last fallback case.
  const unexpected = errors.filter((message) => !message.includes("Error creating WebGL context"));
  assert.deepEqual(unexpected, []);
  await writeFile(
    output + "/simulation-results.json",
    JSON.stringify(
      {
        results,
        errors: unexpected,
        knownResourceIssues,
        note: "Chrome SwiftShader and touch emulation; no physical phone tested.",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
