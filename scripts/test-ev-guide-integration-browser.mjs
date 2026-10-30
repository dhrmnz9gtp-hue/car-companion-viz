import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
const out = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-guide-integration");
await mkdir(out, { recursive: true });
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
const button = (page, name) => page.getByRole("button", { name, exact: true });
const frame = (page) => page.frameLocator("iframe");
const ready = (page) => page.waitForSelector('[data-testid="lab-viewport"][data-ready="true"]');
const restored = async (page) => {
  await frame(page).locator('[data-key="motor"].on').waitFor();
  await frame(page).locator("#motor-lab-link").waitFor();
};
const capture = async (page, name) =>
  page.screenshot({
    path: out + "/" + name + ".png",
    fullPage: (await page.getByRole("dialog").count()) === 0,
    animations: "disabled",
    timeout: 60000,
  });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  const response = await page.goto(base + "/");
  assert.equal(response.status(), 200);
  assert(!(await response.text()).includes("<canvas"));
  await page.waitForFunction(() => {
    const opener = document.querySelector("[data-ev-guide-opener]");
    return opener && getComputedStyle(opener.parentElement).opacity === "1";
  });
  await capture(page, "01-portada");
  await page.evaluate(() => scrollTo(0, 120));
  await page.waitForFunction(() => scrollY === 120);
  await button(page, "Guía de Vehículo EV").click();
  await frame(page).getByRole("heading", { name: "Cómo funciona un vehículo eléctrico" }).waitFor();
  assert.equal(await frame(page).locator(".navbtn").count(), 6);
  assert.equal(await page.locator("canvas").count(), 0);
  assert.equal(await frame(page).locator("canvas").count(), 0);
  await capture(page, "02-guia-educativa");
  pass(
    "A/J: educational entry explicitly activates the existing HTML with all six sections and zero canvases",
  );

  await frame(page).locator('[data-key="bateria"]').focus();
  await frame(page).locator('[data-key="bateria"]').press("ArrowRight");
  await restored(page);
  assert((await frame(page).locator("#p-body").innerText()).includes("diferentes tecnologías"));
  assert((await frame(page).locator("#p-extra").innerText()).includes("Modelo didáctico genérico"));
  assert.equal(
    requests.filter((url) => /Scene\.client|react-three|three\.js|\/viewer\/geometry/.test(url))
      .length,
    0,
  );
  await frame(page).locator("#motor-lab-link").scrollIntoViewIfNeeded();
  await capture(page, "03-motor-acceso");
  pass(
    "B/C/K/M: Motor via keyboard, contextual educational explanation, CTA and no early Three requests",
  );

  // Same-origin messages from the top window are not messages from the guide iframe.
  await page.evaluate(() =>
    window.postMessage(
      { channel: "pura-ev-guide-v1", type: "open-lab", section: "motor" },
      location.origin,
    ),
  );
  await page.waitForTimeout(150);
  assert.equal(new URL(page.url()).pathname, "/");
  await frame(page)
    .locator("body")
    .evaluate(() => {
      parent.postMessage(
        {
          channel: "pura-ev-guide-v1",
          type: "open-lab",
          section: "not-a-section",
          url: "https://invalid.test",
        },
        location.origin,
      );
      parent.postMessage({ channel: "wrong", type: "open-lab", section: "motor" }, location.origin);
    });
  await page.waitForTimeout(150);
  assert.equal(new URL(page.url()).pathname, "/");
  pass(
    "Security: sender window, channel and section validation reject forged or malformed navigation",
  );

  await frame(page).locator("#motor-lab-link").click();
  await ready(page);
  assert.equal(new URL(page.url()).pathname, "/laboratorio/motor-electrico");
  assert.equal(await page.locator("iframe").count(), 0);
  assert.equal(await page.locator("canvas").count(), 1);
  assert.equal(await page.getByRole("link", { name: "Volver a guías" }).count(), 1);
  await capture(page, "04-laboratorio-contexto");
  pass(
    "D/N: main-window navigation unmounts iframe and mounts exactly one existing 3D viewer; catalog remains available",
  );

  await button(page, "← Regresar a Motor · Guía de Vehículo EV").click();
  await restored(page);
  await page.waitForFunction(
    () => document.querySelector("iframe")?.contentDocument?.activeElement?.id === "motor-lab-link",
  );
  assert.equal(await page.locator("canvas").count(), 0);
  const stored = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("pura.ev-guide.return.v1")),
  );
  const restoredY = await frame(page)
    .locator("body")
    .evaluate(() => scrollY);
  assert(Math.abs(restoredY - stored.frameY) <= 4, "iframe scroll restored");
  assert.equal(await page.locator("body").evaluate((el) => el.style.top), "-120px");
  await capture(page, "05-regreso-motor");
  pass("E: contextual return restores Motor, CTA focus and guide scroll; canvas is unmounted");

  const cdp = await page.context().newCDPSession(page);
  const keyboardListeners = async () => {
    const doc = await cdp.send("Runtime.evaluate", {
      expression: "document",
      objectGroup: "guide-lifetime",
    });
    const info = await cdp.send("DOMDebugger.getEventListeners", { objectId: doc.result.objectId });
    await cdp.send("Runtime.releaseObjectGroup", { objectGroup: "guide-lifetime" });
    return info.listeners.filter((e) => e.type === "keydown" || e.type === "keyup").length;
  };
  const listenerBaseline = await keyboardListeners();
  for (let cycle = 0; cycle < 3; cycle++) {
    await frame(page).locator("#motor-lab-link").click();
    await ready(page);
    await button(page, "← Regresar a Motor · Guía de Vehículo EV").click();
    await restored(page);
    assert.equal(await page.locator("canvas").count(), 0);
    assert.equal(await keyboardListeners(), listenerBaseline);
  }
  pass(
    "Repeated lifecycles: three route round trips leave no canvas and no accumulating document keyboard handlers",
  );

  await page.goForward();
  await ready(page);
  await page.goBack();
  await restored(page);
  await frame(page).locator("#motor-lab-link").click();
  await ready(page);
  await page.reload();
  await ready(page);
  await button(page, "← Regresar a Motor · Guía de Vehículo EV").click();
  await restored(page);
  await page.reload();
  await restored(page);
  pass(
    "F/G: Back/Forward, lab reload and guide reload retain safe educational return without history loops",
  );

  await frame(page).locator("#motor-lab-link").press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(await page.locator("body").evaluate((el) => el.style.position), "");
  await button(page, "Guía de Vehículo EV").focus();
  await button(page, "Guía de Vehículo EV").press("Enter");
  await frame(page).locator(".navbtn").first().waitFor();
  await button(page, "Cerrar").focus();
  await button(page, "Cerrar").press("Tab");
  assert.equal(
    await frame(page)
      .locator("body")
      .evaluate(() => document.activeElement.matches("button, a, summary")),
    true,
  );
  await button(page, "Cerrar").click();
  pass(
    "Close/focus: Escape inside iframe closes modal, body scroll unlocks, keyboard can reenter the guide",
  );

  // The individual Tesla entry must retain its original text and all sections.
  const teslaCard = page.locator('a[href="/guias/tesla-model-3"]');
  await teslaCard.getByRole("button", { name: "Abrir modelo interactivo", exact: false }).click();
  await frame(page).getByRole("heading", { name: "Tesla Model 3", exact: true }).waitFor();
  assert.equal(await frame(page).locator("#motor-lab-link").count(), 0);
  const original = process.env.LAB_BASELINE_HTML
    ? await readFile(process.env.LAB_BASELINE_HTML, "utf8")
    : null;
  if (original) {
    const definition = original.slice(
      original.indexOf("const SECTIONS ="),
      original.indexOf("const el ="),
    );
    const sections = runInNewContext(definition + "; SECTIONS");
    for (const s of sections) {
      await frame(page)
        .locator('[data-key="' + s.key + '"]')
        .click();
      assert.equal(await frame(page).locator("#p-body").innerText(), s.body);
      assert.equal(await frame(page).locator("#p-title").innerText(), s.title);
      assert.equal(await frame(page).locator("#motor-lab-link").count(), 0);
    }
  }
  await capture(page, "06-tesla-especifico");
  await button(page, "Cerrar").click();
  await page.goto(base + "/guias/tesla-model-3");
  assert.equal(await page.locator("canvas").count(), 0);
  pass(
    "I: Tesla-specific HTML preserves original six explanations and titles, with no generic motor CTA; individual guide remains separate",
  );

  await page.goto(base + "/laboratorio/motor-electrico");
  await ready(page);
  assert.equal(
    await page.getByRole("navigation", { name: "Regreso a la guía educativa" }).count(),
    0,
  );
  await page.goto(base + "/laboratorio/motor-electrico?from=https://invalid.test");
  await ready(page);
  assert.equal(
    await page.getByRole("navigation", { name: "Regreso a la guía educativa" }).count(),
    0,
  );
  const direct = await browser.newPage();
  await direct.goto(base + "/laboratorio/motor-electrico?from=ev-guide");
  await ready(direct);
  await button(direct, "← Regresar a Motor · Guía de Vehículo EV").click();
  await restored(direct);
  await direct.close();
  pass(
    "H: direct lab access, invalid origin and contextual deep link use safe fallbacks without arbitrary redirects",
  );

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto(base + "/");
  await mobile.waitForFunction(() => {
    const opener = document.querySelector("[data-ev-guide-opener]");
    return opener && getComputedStyle(opener.parentElement).opacity === "1";
  });
  await button(mobile, "Guía de Vehículo EV").tap();
  await frame(mobile).locator(".navbtn").first().waitFor();
  await frame(mobile).locator('[data-key="motor"]').tap();
  await restored(mobile);
  assert.equal(
    await frame(mobile)
      .locator("body")
      .evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
  );
  await frame(mobile).locator("#motor-lab-link").scrollIntoViewIfNeeded();
  const mobilePanel = await frame(mobile).locator("#panel").boundingBox();
  const mobileNav = await frame(mobile).locator("#nav").boundingBox();
  assert(
    mobilePanel.y + mobilePanel.height <= mobileNav.y + 1,
    "mobile panel and section navigation must not overlap",
  );
  await capture(mobile, "07-movil-emulado");
  await frame(mobile).locator("#motor-lab-link").tap();
  await ready(mobile);
  await button(mobile, "← Regresar a Motor · Guía de Vehículo EV").tap();
  await restored(mobile);
  await button(mobile, "Cerrar").tap();
  await mobile.close();
  pass(
    "L: touch-emulated mobile entry, Motor, CTA, lab and return work without guide horizontal overflow; not physical hardware",
  );
  assert.deepEqual(errors, []);
  pass(
    "O: hydrated navigation has no unhandled page errors; SSR/Cloudflare coverage is also run against compiled preview",
  );
} finally {
  await writeFile(
    out + "/integration-results.json",
    JSON.stringify(
      { base, results, errors, browser: browser.version(), physicalDevice: false },
      null,
      2,
    ),
  );
  await browser.close();
}
