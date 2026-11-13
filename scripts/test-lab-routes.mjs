import assert from "node:assert/strict";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const base = process.env.LAB_BASE_URL || "http://127.0.0.1:5173";
const output = resolve(process.env.LAB_ARTIFACT_DIR || "/tmp/ev-lab-simulation");
const source = await readFile("src/data/vehicleGuides.ts", "utf8");
const guides = [...source.matchAll(/slug: "([^"]+)"/g)].map((match) => "/guias/" + match[1]);
const interactive = (await readdir("public/interactivos"))
  .filter((name) => name.endsWith(".html"))
  .map((name) => "/interactivos/" + name);
assert.equal(guides.length, 10);
assert.equal(interactive.length, 10);
const results = [];
for (const path of [...guides, ...interactive]) {
  const response = await fetch(base + path);
  const html = await response.text();
  assert.equal(response.status, 200, path);
  assert(/<h1[\s>]/.test(html), path + " meaningful educational content");
  assert(!html.includes("Simular para entender"), path + " is not the lab fallback");
  results.push({ path, status: response.status, bytes: Buffer.byteLength(html) });
}
await mkdir(output, { recursive: true });
await writeFile(output + "/routes-results.json", JSON.stringify(results, null, 2));
console.log("PASS 20 existing educational URLs: 10 React SSR guides and 10 HTML interactives");
