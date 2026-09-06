#!/usr/bin/env node
/** SENW assembled + isolate every slot. Preview :8080.
 *  node .grok/skills/last-harvest-concept/scripts/export-ref-sheet.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://127.0.0.1:8080";
const OUT = "/workspace/artifacts/lookdev";
const SKILL = "/workspace/.grok/skills/last-harvest-concept/assets/lookdev";
const DIRS = ["s", "e", "n", "w"];
const SLOTS = ["legs", "body", "head", "arms", "weapon"];

mkdirSync(OUT, { recursive: true });
mkdirSync(SKILL, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
await page.goto(BASE, { waitUntil: "commit", timeout: 20000 });
await page.waitForSelector("[data-live='1']", { timeout: 8000 });
await page.locator("[data-qa=title-bay3d]").click();
await page.waitForFunction(() => !!window.__lh3d, { timeout: 15000 });
await page.waitForTimeout(400);

async function shot(name, dir, slot) {
  await page.evaluate(
    ({ d, s }) => {
      window.__lh3d.solo(s);
      window.__lh3d.setDir(d);
    },
    { d: dir, s: slot },
  );
  await page.waitForTimeout(80);
  const buf = await page.locator("canvas").first().screenshot({ type: "png" });
  writeFileSync(`${OUT}/${name}`, buf);
  writeFileSync(`${SKILL}/${name}`, buf);
}

for (let i = 0; i < 4; i++) await shot(`gold-assembled_${DIRS[i]}.png`, i, null);
for (const slot of SLOTS) {
  for (let i = 0; i < 4; i++) await shot(`gold-${slot}_${DIRS[i]}.png`, i, slot);
}

await browser.close();
console.log("PASS gold grey SENW + isolates");
