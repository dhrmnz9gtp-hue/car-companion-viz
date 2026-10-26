import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-layout");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
const results = [],
  errors = [];
const pass = (name) => {
  results.push(name);
  console.log("PASS", name);
};
const ready = (p) => p.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(base + "/laboratorio/motor-electrico");
  assert.equal(response.status(), 200);
  assert(!(await response.text()).includes("<canvas"));
  await ready(page);
  await page.getByRole("button", { name: "Cómo funciona", exact: true }).click();
  const stage = await page.locator(".lab-stage").boundingBox();
  const before = await readFile(resolve(output, "../before/funcionamiento-3d.png"));
  assert(Math.abs(stage.width - before.readUInt32BE(16)) <= 1);
  assert(Math.abs(stage.height - before.readUInt32BE(20)) <= 1);
  const viewer = await page.locator(".lab-viewer-card").boundingBox();
  const tools = await page.locator(".lab-electrical").boundingBox();
  const components = await page.locator(".lab-components").boundingBox();
  const education = await page.locator(".lab-education").boundingBox();
  const lessons = await page.locator(".lab-lessons").boundingBox();
  assert(tools.x > viewer.x + viewer.width && Math.abs(tools.y - viewer.y) < 1);
  assert(
    components.y >= viewer.y + viewer.height && education.y >= components.y + components.height,
  );
  assert(lessons.y >= education.y + education.height && Math.abs(education.x - viewer.x) < 1);
  assert.equal(await page.locator(".lab-electrical details").count(), 0);
  assert.equal(await page.locator(".lab-electrical .lab-education").count(), 0);
  assert.equal(await page.locator('.lab-electrical svg[role="img"]').count(), 2);
  pass(
    "Desktop separates electrical tools from educational sections without reducing the 3D viewport",
  );
  await page.locator("#lab-cycle").focus();
  await page.locator("#lab-cycle").press("Home");
  for (let i = 0; i < 90; i++) await page.locator("#lab-cycle").press("ArrowRight");
  await page.screenshot({ path: output + "/despues-escritorio.png", fullPage: true });
  await page.setViewportSize({ width: 1200, height: 1000 });
  assert(
    await page
      .locator(".lab-component-list button")
      .evaluateAll((buttons) =>
        buttons.every((button) => button.scrollWidth <= button.clientWidth),
      ),
  );
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: output + "/despues-escritorio-1200.png", fullPage: true });
  pass("Narrow desktop keeps component labels inside their buttons");
  await page.setViewportSize({ width: 1440, height: 1100 });
  const names = [
    "Carcasa exterior",
    "Estator",
    "Bobinados",
    "Rotor",
    "Imanes permanentes",
    "Eje",
    "Rodamientos",
  ];
  for (const name of names) {
    await page.getByRole("button", { name: "Seleccionar " + name, exact: true }).click();
    assert.equal(await page.locator(".lab-education h2").innerText(), name);
    assert(await page.locator(".lab-education .lab-function").innerText());
    assert(await page.locator(".lab-education .lab-explanation p").innerText());
    assert(await page.locator(".lab-education .lab-connection p").innerText());
  }
  await page.getByRole("button", { name: "Seleccionar Eje", exact: true }).click();
  await page.getByRole("button", { name: "Enfocar componente", exact: true }).click();
  const target = await page.locator("canvas").evaluate((c) => c.labDiagnostics().target);
  assert(Math.abs(target[1]) < 0.001);
  pass(
    "All seven selections update the relocated explanation and the focus button still moves the camera",
  );
  const details = page.locator(".lab-lessons details");
  assert.equal(await details.count(), 7);
  for (let i = 0; i < 7; i++) {
    const item = details.nth(i),
      summary = item.locator("summary");
    await summary.focus();
    await summary.press("Enter");
    assert.notEqual(await item.getAttribute("open"), null);
    assert((await item.innerText()).length > 80);
    await summary.press("Enter");
    assert.equal(await item.getAttribute("open"), null);
  }
  await details.nth(0).locator("summary").click();
  await details.nth(1).locator("summary").click();
  assert.equal(await page.locator(".lab-lessons details[open]").count(), 2);
  await page.locator(".lab-education").screenshot({ path: output + "/componente-escritorio.png" });
  await page.locator(".lab-lessons").screenshot({ path: output + "/explicaciones-escritorio.png" });
  pass(
    "Seven independent disclosures expand and collapse with keyboard; content is not duplicated",
  );
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  // Playback suspends when the 3D stage is offscreen.
  await page.locator(".lab-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  assert.equal(await page.locator('[role="status"]').innerText(), "En pausa");
  pass("Playback and pause remain accessible after reading the relocated content");
  await page.getByRole("button", { name: "Restablecer vista", exact: true }).click();
  await page.getByRole("button", { name: "Seleccionar Rotor", exact: true }).click();
  await page.screenshot({ path: output + "/despues-componente-escritorio.png", fullPage: true });
  for (const [label, width, height] of [
    ["tablet", 1024, 1366],
    ["movil", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(150);
    const boxes = await page
      .locator(".lab-viewer-card, .lab-electrical, .lab-components, .lab-education, .lab-lessons")
      .evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, bottom: r.bottom };
        }),
      );
    for (let i = 1; i < boxes.length; i++) {
      assert(Math.abs(boxes[i].x - boxes[0].x) < 1);
      assert(boxes[i].y >= boxes[i - 1].bottom);
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.locator(".lab-lessons details").count(), 7);
    await page.screenshot({ path: output + "/despues-" + label + ".png", fullPage: true });
    pass(label + ": single-column DOM order, intact charts and no horizontal overflow");
  }
  assert.deepEqual(errors, []);
  await writeFile(
    output + "/layout-results.json",
    JSON.stringify({ results, errors, desktopStage: stage, physicalMobile: false }, null, 2),
  );
} finally {
  await browser.close();
}
