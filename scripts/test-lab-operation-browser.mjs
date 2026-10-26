import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173",
  output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-operation");
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
const diag = (p) => p.locator("canvas").evaluate((c) => c.labDiagnostics());
const ready = (p) => p.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
const stable = (p) =>
  p.waitForFunction(
    () =>
      [...document.querySelectorAll(".lab-assembly-actions button")].find(
        (b) => b.textContent === "Detener",
      )?.disabled,
  );
const setRange = async (p, id, value) => {
  await p.locator(id).evaluate((el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await p.waitForTimeout(80);
};
const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(base + "/laboratorio/motor-electrico");
  assert.equal(response.status(), 200);
  assert(!(await response.text()).includes("<canvas"));
  await ready(page);
  const before = await diag(page);
  await page.getByRole("button", { name: "Cómo funciona", exact: true }).click();
  await page.getByRole("region", { name: "Funcionamiento electromagnético" }).waitFor();
  assert.equal(await page.locator("#lab-cycle").inputValue(), "0");
  assert.equal(await page.getByRole("button", { name: "Pausar", exact: true }).isDisabled(), true);
  pass("Opt-in educational mode starts paused with SSR and hydration intact");
  await setRange(page, "#lab-cycle", 360);
  assert.equal(await page.locator('[data-testid="mechanical-angle"]').innerText(), "90.0°");
  const quarter = await diag(page);
  const rotating = [];
  for (const [id, part] of Object.entries(before.parts)) {
    if (!close(quarter.parts[id].matrix, part.matrix)) rotating.push(id);
    assert(
      close(quarter.parts[id].position, part.position),
      "axis positions must stay fixed: " + id,
    );
  }
  assert.deepEqual(
    rotating.toSorted(),
    [
      "rotor.core",
      "shaft.main",
      "bearings.inner.-1",
      "bearings.inner.1",
      ...Array.from({ length: 8 }, (_, i) => `magnets.pole.${i + 1}`),
    ].toSorted(),
  );
  await setRange(page, "#lab-cycle", 1440);
  for (const [id, part] of Object.entries(before.parts))
    assert(close((await diag(page)).parts[id].matrix, part.matrix));
  pass(
    "One electrical cycle rotates only the 12 moving parts by 90°; four cycles restore every transform",
  );
  await setRange(page, "#lab-cycle", 90);
  const values = await page.locator("[data-phase]").allTextContents();
  assert(Math.abs(Number(values[0]) + 0.5) < 0.011);
  assert(Math.abs(Number(values[1]) - 1) < 0.011);
  assert(Math.abs(Number(values[2]) + 0.5) < 0.011);
  await page.locator(".lab-stage").screenshot({ path: output + "/funcionamiento-3d.png" });
  await page
    .locator(".lab-operation")
    .screenshot({ path: output + "/senales-y-explicaciones.png" });
  await page.screenshot({ path: output + "/funcionamiento-escritorio.png", fullPage: true });
  pass("Current readouts follow the same electrical phase as the mechanical rotation");
  await page.getByRole("button", { name: "Restablecer funcionamiento", exact: true }).click();
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert(Number(await page.locator("#lab-cycle").inputValue()) > 0);
  await page.getByRole("button", { name: "Seleccionar Imanes permanentes", exact: true }).click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Imanes permanentes");
  await page.getByRole("button", { name: "Girar a la derecha", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const paused = await page.locator("#lab-cycle").inputValue();
  await page.waitForTimeout(200);
  assert.equal(await page.locator("#lab-cycle").inputValue(), paused);
  await page.getByLabel("Velocidad de reproducción").selectOption("0.25");
  await page.getByRole("button", { name: "Restablecer funcionamiento", exact: true }).click();
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const slow = Number(await page.locator("#lab-cycle").inputValue());
  await page.getByLabel("Velocidad de reproducción").selectOption("2");
  await page.getByRole("button", { name: "Restablecer funcionamiento", exact: true }).click();
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const fast = Number(await page.locator("#lab-cycle").inputValue());
  assert(fast > slow * 3);
  pass("Start, pause, speed, camera and selection stay usable during playback");
  await page.getByRole("button", { name: "Aislar componente", exact: true }).click();
  let view = await diag(page);
  assert(
    Object.entries(view.parts)
      .filter(([id]) => id)
      .every(([id, p]) => p.visible === id.startsWith("magnets.")),
  );
  await page.locator("canvas").scrollIntoViewIfNeeded();
  const box = await page.locator("canvas").boundingBox();
  let picked = false;
  for (const id of Array.from({ length: 8 }, (_, i) => `magnets.pole.${i + 1}`)) {
    const point = view.parts[id].pickPoint;
    await page.mouse.click(
      box.x + ((point[0] + 1) * box.width) / 2,
      box.y + ((1 - point[1]) * box.height) / 2,
    );
    if (await page.locator(".lab-part-name").count()) {
      picked = true;
      break;
    }
  }
  assert(picked);
  assert.match(await page.locator(".lab-part-name").innerText(), /Imán/);
  await page.getByRole("button", { name: "Mostrar todo", exact: true }).click();
  await setRange(page, "#lab-transparency", 60);
  assert.equal((await diag(page)).parts["housing.shell"].opacity, 0.4);
  pass("Rotated geometry remains pickable; isolation and transparency preserve the lesson");
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Desmontar", exact: true }).click();
  await stable(page);
  const frozen = await page.locator("#lab-cycle").inputValue();
  assert.equal(await page.getByRole("button", { name: "Iniciar", exact: true }).isDisabled(), true);
  await page.waitForTimeout(200);
  assert.equal(await page.locator("#lab-cycle").inputValue(), frozen);
  const separated = await diag(page);
  assert.equal(separated.meshes, 65);
  const fixedOrientation = separated.parts["rotor.core"].quaternion;
  await page.getByRole("button", { name: "Ensamblar", exact: true }).click();
  await stable(page);
  assert(close((await diag(page)).parts["rotor.core"].quaternion, fixedOrientation));
  assert.equal(
    await page.getByRole("button", { name: "Iniciar", exact: true }).isDisabled(),
    false,
  );
  pass(
    "Disassembly pauses and locks playback, preserves orientation and permits restart only when assembled",
  );
  await page.getByRole("button", { name: "Restablecer vista", exact: true }).click();
  assert.equal(await page.locator("#lab-cycle").inputValue(), "0");
  const reset = await diag(page);
  for (const [id, part] of Object.entries(before.parts))
    assert(close(reset.parts[id].matrix, part.matrix));
  await page.getByRole("button", { name: "Esquema 2D", exact: true }).click();
  assert.equal(await page.locator("canvas").count(), 0);
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  assert(Number(await page.locator("#lab-cycle").inputValue()) > 0);
  await page
    .getByRole("button", { name: "Seleccionar Estator en el esquema", exact: true })
    .click();
  assert.equal(await page.locator(".lab-education h2").innerText(), "Estator");
  await page.screenshot({ path: output + "/funcionamiento-2d.png", fullPage: true });
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await ready(page);
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page
    .locator("canvas")
    .evaluate((c) => c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
  await page.locator(".lab-fallback-message").waitFor();
  assert.equal(await page.getByRole("button", { name: "Iniciar", exact: true }).isDisabled(), true);
  const stopped = await page.locator("#lab-cycle").inputValue();
  await page.waitForTimeout(200);
  assert.equal(await page.locator("#lab-cycle").inputValue(), stopped);
  await page.getByRole("button", { name: "Esquema 2D", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: "Iniciar", exact: true }).isDisabled(),
    false,
  );
  pass("Reset restores the reference state; 2D signals work and WebGL loss safely pauses playback");
  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  phone.on("pageerror", (e) => errors.push(e.message));
  await phone.goto(base + "/laboratorio/motor-electrico");
  await ready(phone);
  await phone.getByRole("button", { name: "Cómo funciona", exact: true }).tap();
  assert.equal(await phone.getByRole("button", { name: "Pausar", exact: true }).isDisabled(), true);
  await phone.getByRole("button", { name: "Iniciar", exact: true }).tap();
  // Playback suspends when the 3D stage is offscreen.
  await phone.locator(".lab-stage").scrollIntoViewIfNeeded();
  await phone.waitForTimeout(200);
  await phone.getByRole("button", { name: "Pausar", exact: true }).tap();
  assert(Number(await phone.locator("#lab-cycle").inputValue()) > 0);
  await phone.getByLabel("Velocidad de reproducción").selectOption("0.5");
  await phone.locator("#lab-cycle").scrollIntoViewIfNeeded();
  const slider = await phone.locator("#lab-cycle").boundingBox();
  await phone.touchscreen.tap(slider.x + slider.width / 4, slider.y + slider.height / 2);
  assert(Number(await phone.locator("#lab-cycle").inputValue()) > 0);
  assert.equal(
    await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await phone.screenshot({ path: output + "/funcionamiento-movil.png", fullPage: true });
  await phone.close();
  pass(
    "Touch controls and manual phase work at 390px; reduced motion never autoplays and there is no horizontal overflow",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    output + "/operation-browser-results.json",
    JSON.stringify(
      {
        results,
        errors,
        mobile: "Chrome touch emulation, not a physical device",
        renderer: "SwiftShader",
      },
      null,
      2,
    ),
  );
} catch (error) {
  await writeFile(
    output + "/operation-browser-failure.json",
    JSON.stringify({ error: String(error), results, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
