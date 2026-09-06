#!/usr/bin/env node
/** Slice 1 smoke. Run after rebuild, with vite on :8080.
 *  node .grok/skills/last-harvest/scripts/qa-slice1.mjs
 */
import { chromium } from "playwright";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE || "http://127.0.0.1:8080";

function fail(msg) {
  console.error("FAIL", msg);
  process.exitCode = 1;
}

function walkTs(dir, acc = []) {
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, n.name);
    if (n.isDirectory()) walkTs(p, acc);
    else if (/\.(ts|tsx)$/.test(n.name)) acc.push(p);
  }
  return acc;
}

const gameRoot = join(process.cwd(), "src/game");
for (const f of walkTs(gameRoot)) {
  const t = readFileSync(f, "utf8");
  if (t.includes("Perception")) fail(f + " still says Perception");
  if (/\bpilot\.per\b/.test(t)) fail(f + " still uses pilot.per");
  if (f.endsWith("save.ts")) continue;
  if (/\bper:\s*number/.test(t)) fail(f + " still types per as a primary");
}
const saveSrc = readFileSync(join(gameRoot, "save.ts"), "utf8");
if (!saveSrc.includes("migrateWits")) fail("save.ts missing migrateWits");
if (!saveSrc.includes('delete o.per')) fail("migrateWits must drop per");
if (!saveSrc.includes("wits")) fail("save.ts must write wits");

function migrateWitsQa(raw) {
  if (Array.isArray(raw)) return raw.map(migrateWitsQa);
  if (!raw || typeof raw !== "object") return raw;
  const o = { ...raw };
  if (Object.prototype.hasOwnProperty.call(o, "per")) {
    if (o.wits == null) o.wits = o.per;
    delete o.per;
  }
  for (const k of Object.keys(o)) o[k] = migrateWitsQa(o[k]);
  return o;
}
const migrated = migrateWitsQa({ stur: 1, avo: 1, per: 7, stash: { per: 2 }, loadout: { body: "p000" } });
if (migrated.wits !== 7) fail("old per did not map to wits");
if ("per" in migrated) fail("dual key per still on pilot");
if (migrated.stash && "per" in migrated.stash) fail("nested per leftover");
const fresh = migrateWitsQa({ stur: 1, avo: 1, wits: 3 });
if (fresh.wits !== 3 || "per" in fresh) fail("new run must stay wits-only");
const pilotSrc = readFileSync(join(gameRoot, "pilot.ts"), "utf8");
if (!/\bwits:\s*number/.test(pilotSrc)) fail("Pilot missing wits field");
if (/\bper:\s*number/.test(pilotSrc)) fail("Pilot still has per; field is wits");
const roamSrc = readFileSync(join(gameRoot, "roam.ts"), "utf8");
if (!roamSrc.includes("export function survivalChance")) fail("no survivalChance");
if (!roamSrc.includes("export function afterWalk")) fail("no afterWalk");
if (!roamSrc.includes("Debris Primer")) fail("no Debris Primer");
if (!roamSrc.includes("soft: 0.7")) fail("soft band not 0.70");
if (!roamSrc.includes("standard: 0.55")) fail("standard band");
if (!roamSrc.includes("pressure: 0.4")) fail("pressure band");
if (!roamSrc.includes("dungeon: 0.35")) fail("dungeon band");
if (!roamSrc.includes("shipCalls < 2")) fail("ship-call cap missing");
const dataSrc = readFileSync(join(gameRoot, "data.ts"), "utf8");
if (!dataSrc.includes('help: "Beefy companion. More health regen. Same world."')) fail("Story picker copy drifted");
if (/Hard/.test(dataSrc.split("DIFFICULTY")[1]?.split("DEFAULT_RUN")[0] ?? "")) fail("Hard on difficulty picker");
if (!pilotSrc.includes("wits: mods.witsStart")) fail("applyDifficulty must snap start Wits (no Story leak)");
const simSrc = readFileSync(join(gameRoot, "sim.ts"), "utf8");
if (simSrc.includes("runMods") && /smallHp[^\n]*runMods|runMods[^\n]*smallHp/.test(simSrc)) fail("Story leaked into enemy HP");
if (!simSrc.includes("afterWalk(")) fail("sim does not hook afterWalk");
if (!simSrc.includes("csub")) fail("Gasket missing ¼-cell csub");
if (!simSrc.includes("tickKernel") && !simSrc.includes("runDungeonAi")) fail("drop missing shared AI kernel");
const aiSrc = readFileSync(join(gameRoot, "ai.ts"), "utf8");
if (!aiSrc.includes("gasketCmd") || !aiSrc.includes("stripekin")) fail("AI kernel missing gasket cmds / stripekin policy");
const gridSrc = readFileSync(join(gameRoot, "grid.ts"), "utf8");
if (!gridSrc.includes("export function canEnterQuarter") || !gridSrc.includes("export function canEnterTile")) fail("occupancy law V1 missing canEnterQuarter/Tile");
if (!gridSrc.includes("pickLanceOnTile") || !gridSrc.includes("b.qy - a.qy")) fail("Lancer ¼ pick missing closest/+Y tiebreak");
const foeSrc = readFileSync(join(gameRoot, "solace3d/foe3d.ts"), "utf8");
if (!foeSrc.includes("SMALL_UNIT_SCALE = 0.24")) fail("Stripekin not ¼-cell scale");
if (!foeSrc.includes("tickFoe") || !foeSrc.includes("stripekin_bob")) fail("Stripekin idle tick missing");
if (!foeSrc.includes("barkback_shield") || !foeSrc.includes("barkback_mace")) fail("Barkback missing shield-arm / scrap mace");
if (!foeSrc.includes("BARKBACK_SCALE = 1.08")) fail("Barkback not taller bunker scale");
if (!gridSrc.includes("export function faceSmall")) fail("¼ face helper missing");
const gaskSrc = readFileSync(join(gameRoot, "solace3d/gasket.ts"), "utf8");
if (!gaskSrc.includes("scale: 0.28") || !gaskSrc.includes("Math.min(0.5")) fail("Gasket not companion-small clamped");
const simLance = readFileSync(join(gameRoot, "sim.ts"), "utf8");
if (!simLance.includes("stickyLance") || !simLance.includes("closestLanceFoe")) fail("Lancer sticky/closest Shoot missing");
if (/function shootCannon[\s\S]{0,500}d\.aiming = true/.test(simLance)) fail("Shoot still opens Aim tile-pick");
if (!simLance.includes("function enterAim") && !simLance.includes("export function enterAim")) fail("enterAim missing");
const hudSrc = readFileSync(join(gameRoot, "LastHarvest.tsx"), "utf8");
if (hudSrc.includes('dungeon.aiming ? "Lance: pick a tile"')) fail("drop-log still gates Shoot behind pick-a-tile");
if (/aiming[\s\S]{0,400}fireCannon/.test(hudSrc)) fail("Aim path still fires the cannon");
if (!hudSrc.includes("enterAim") || !hudSrc.includes("shootCannon")) fail("Aim/Shoot split handlers missing");
const nestSrc = readFileSync(join(gameRoot, "solace3d/Nest3D.tsx"), "utf8");
if (!nestSrc.includes('qa="nest-aim"') || !nestSrc.includes('qa="nest-shoot"') || !nestSrc.includes("nest-stance-")) fail("Nest Lancer Aim/Shoot chrome missing");
if (!nestSrc.includes('data-qa="nest-pin-before"') || !nestSrc.includes('data-qa="nest-pin-after"') || !nestSrc.includes('data-qa="nest-pin-hit"')) fail("Nest pin plates missing");
if (!nestSrc.includes("occSmoke")) fail("Nest spawn missing occupancy smoke");
if (!nestSrc.includes('qa="nest-step"') || !nestSrc.includes('qa="nest-move-n"')) fail("Nest Move stick / Step ¼ missing");
if (nestSrc.includes("No Move stick")) fail("dead-end No Move stick copy still in Nest");
const nestLogic = readFileSync(join(gameRoot, "solace3d/nest.ts"), "utf8");
if (!nestLogic.includes("PIN_BODIES") || !nestLogic.includes("nestAlive") || !nestLogic.includes("nestPinLine")) fail("Nest Pin missing per-body HP / plate line");
if (!nestLogic.includes("shootCannon") || !nestLogic.includes("enterAim")) fail("Nest Aim/Shoot forked off drop handlers");
if (simLance.includes("Lance wide")) fail("Lancer Pin still has Lance-wide log");
if (!simLance.includes('LANCER_PROJECTILE = "pin"')) fail("Lancer projectileClass not pin");
if (!simLance.includes("function primaryOnTile")) fail("Aim-tile Pin missing primaryOnTile");
const pulseSrc = readFileSync(join(gameRoot, "solace3d/pulse.ts"), "utf8");
if (!pulseSrc.includes("makePinMark") || !pulseSrc.includes("aimTile")) fail("Pin secondary mark / full-tile Aim missing");
const dropSrc = readFileSync(join(gameRoot, "solace3d/Drop3D.tsx"), "utf8");
if (!dropSrc.includes("subCell(d.cx, d.cy")) fail("drop Gasket not on ¼-cell");
if (!dropSrc.includes("cannonMuzzles") || !dropSrc.includes("getWorldPosition")) fail("Aim beam not barrel-tipped");
if (!dropSrc.includes("spawnPulse") && !dropSrc.includes("pulse_orb")) fail("Lance shot missing pulse orb");
if (!nestLogic.includes("row.kind === \"smith\") count = Math.min(2")) fail("Barkback Nest spawn not capped at 2");
const parts3dSrc = readFileSync(join(gameRoot, "solace3d/parts3d.ts"), "utf8");
if (!parts3dSrc.includes("muzzle_tip") || !parts3dSrc.includes("export function cannonMuzzles")) fail("cannon muzzle_tip missing");
if (!pilotSrc.includes("primerDone")) fail("Pilot missing primerDone");
if (!pilotSrc.includes("survivalBonus")) fail("Pilot missing survivalBonus");
const partsSrc = readFileSync(join(gameRoot, "parts.ts"), "utf8");
if (!partsSrc.includes("back_lancers") || !partsSrc.includes("dual: r && l && hasCellPack")) fail("Lancers bus gate missing");
const dataHub = readFileSync(join(gameRoot, "data.ts"), "utf8");
if (!dataHub.includes("HUB_STANCES") || !dataHub.includes("back_twohand")) fail("Hub stance table missing");
if (dataHub.includes("Harvester") && dataHub.includes("Sawbones")) fail("obsolete stance names on Hub");

const html = await fetch(BASE).then((r) => r.text());
if (!html.includes("Last Harvest") || !html.includes("Bloom-ore") || !html.includes("Veldt-9")) fail("SSR HTML missing title copy");
if (html.includes("data-qa=\"title-board\"")) fail("SSR shipped dead title-board (hydrate gap)");
if (html.includes("data-qa=\"diff-story\"")) fail("SSR shipped dead difficulty plates");
if (html.includes("Fitting visor")) fail("visor gate in first HTML");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  localStorage.setItem(
    "last-harvest-pilot",
    JSON.stringify({ level: 1, stur: 1, avo: 1, per: 7, hp: 62, max: 62, weapon: "twohand", name: "Solace", difficulty: "default" }),
  );
});
const reqs = [];
let phase = "title";
page.on("request", (r) => {
  reqs.push({ phase, url: r.url() });
});
page.on("pageerror", (e) => fail("pageerror " + e.message));

const t0 = Date.now();
await page.goto(BASE, { waitUntil: "commit", timeout: 20000 });
await page.waitForSelector("[data-live='1']", { timeout: 8000 });
const tLive = Date.now() - t0;
if (tLive > 2500) fail("title hydrate slow tLive=" + tLive);
const migratedSave = await page.evaluate(() => JSON.parse(localStorage.getItem("last-harvest-pilot") || "{}"));
if ("per" in migratedSave) fail("old save still has per after hydrate");
if (migratedSave.wits !== 7) fail("old per save did not rewrite wits");

const titleUrls = reqs.filter((r) => r.phase === "title").map((r) => r.url);
const bootHeavy = titleUrls.filter((u) => /\/src\/game\/(sim|render|play)\.ts|solace\/compose|solace3d|three|tiles\/forest|enemies\/(orc|blacksmith|goblin)|parts\/p00/.test(u));
if (bootHeavy.length) fail("title fetched dungeon graph " + bootHeavy.join(" "));

const board = page.locator("[data-qa=title-board]");
if ((await board.count()) !== 1) fail("title-board count " + (await board.count()));
if ((await page.locator("[data-qa=title-bay3d]").count()) !== 1) fail("no 3D Bay plate");
if ((await page.locator("[data-qa=title-nest]").count()) !== 1) fail("no Monster Nest plate");
if ((await page.locator("[data-qa=diff-story]").count()) !== 0) fail("difficulty leaked onto title");
await page.locator("[data-qa=title-nest]").click();
await page.waitForSelector("[data-qa=nest3d]", { timeout: 8000 });
await page.locator("[data-qa=nest-biome-forest]").click();
await page.locator("[data-qa=nest-foe-stripekin]").click();
await page.locator("[data-qa=nest-pack-3]").click();
await page.locator("[data-qa=nest-spawn]").click();
await page.waitForFunction(() => (document.querySelector("[data-qa=nest-pin-before]")?.textContent || "").includes("{id:"), { timeout: 12000 });
const pinBefore = await page.locator("[data-qa=nest-pin-before]").innerText();
const beforeBodies = [...pinBefore.matchAll(/\{id:(\d+), hp:(\d+)\}/g)].map((m) => ({ id: m[1], hp: Number(m[2]) }));
if (beforeBodies.length !== 3) fail("nest-pin-before bodies " + beforeBodies.length + " " + pinBefore);
await page.locator("[data-qa=nest-stance-lancer]").click();
await page.waitForSelector("[data-qa=nest-shoot]", { timeout: 4000 });
await page.locator("[data-qa=nest-aim]").click();
await page.locator("[data-qa=nest-shoot]").click();
await page.waitForFunction(() => /^dmg=\d+ id=/.test((document.querySelector("[data-qa=nest-pin-hit]")?.textContent || "").trim()), { timeout: 4000 });
const pinAfter = await page.locator("[data-qa=nest-pin-after]").innerText();
const pinHit = (await page.locator("[data-qa=nest-pin-hit]").innerText()).trim();
const afterBodies = [...pinAfter.matchAll(/\{id:(\d+), hp:(\d+)\}/g)].map((m) => ({ id: m[1], hp: Number(m[2]) }));
const hit = pinHit.match(/^dmg=(\d+) id=(\d+)$/);
if (!hit) fail("nest-pin-hit format " + pinHit);
const hitDmg = Number(hit[1]);
const hitId = hit[2];
const beforeMap = Object.fromEntries(beforeBodies.map((b) => [b.id, b.hp]));
const afterMap = Object.fromEntries(afterBodies.map((b) => [b.id, b.hp]));
const changed = beforeBodies.filter((b) => (afterMap[b.id] ?? 0) !== b.hp);
if (changed.length !== 1) fail("pin changed " + changed.length + " bodies after=" + pinAfter);
if (changed[0].id !== hitId) fail("pin hit id " + hitId + " vs changed " + changed[0].id);
const drop = changed[0].hp - (afterMap[hitId] ?? 0);
if (drop !== hitDmg) fail("Hit N mismatch dmg=" + hitDmg + " delta=" + drop);
const sumBefore = beforeBodies.reduce((n, b) => n + b.hp, 0);
const sumAfter = afterBodies.reduce((n, b) => n + b.hp, 0);
if (sumAfter !== sumBefore - hitDmg) fail("pack sum not before-dmg " + sumBefore + " -> " + sumAfter);
if (hitDmg <= 0) fail("pin dmg 0");
const logTxt = await page.locator("[data-qa=nest-log]").innerText();
if (!logTxt.includes("Hit " + hitDmg)) fail("nest-log missing Hit N " + logTxt);
if (!(await page.locator("[data-qa=nest-step]").count())) fail("Move stick gone after pin");
await page.locator("[data-qa=nest3d-back]").click();
await page.waitForSelector("[data-qa=title-board]", { timeout: 4000 });
if ((await page.locator("[data-qa=diff-story]").count()) !== 0) fail("difficulty leaked onto title");
const y = await board.evaluate((el) => el.getBoundingClientRect().y);
if (y > 500) fail("title plate too low (preview chrome) y=" + y);
await board.click();
await page.waitForSelector("[data-qa=ng-diff]", { timeout: 4000 });
if ((await page.locator("[data-qa=diff-story]").count()) !== 1) fail("no Story difficulty plate");
if ((await page.locator("[data-qa=diff-default]").count()) !== 1) fail("no Default difficulty plate");
if ((await page.locator("[data-qa=diff-hard]").count()) !== 0) fail("Hard mode on New Game");
await page.locator("[data-qa=diff-story]").click();
const diffText = await page.locator("[data-qa=ng-diff]").innerText();
if (!diffText.includes("difficult by design")) fail("missing difficulty warning");
if (!diffText.includes("Beefy companion. More health regen. Same world.")) fail("Story help copy missing");
if (/\bWits\b|\bSurvival\b|\bPerception\b|bonus stats/i.test(diffText)) fail("difficulty UI leaked jargon");
await page.locator("[data-qa=diff-default]").click();
await page.locator("[data-qa=ng-diff-next]").click();
await page.waitForSelector("[data-qa=ng-stance]", { timeout: 4000 });
for (const id of ["twohand", "sawboard", "sawlance", "lancer", "lancers"]) {
  if ((await page.locator(`[data-qa=ng-stance-${id}]`).count()) !== 1) fail("missing stance card " + id);
}
if (await page.locator("[data-qa=bay3d-bones]").count()) fail("Bay warehouse on stance select");
if ((await page.locator("[data-qa=ng-stance]").innerText()).includes("Spawn pack")) fail("Nest toolbar on stance");
phase = "drop";
await page.locator("[data-qa=ng-stance-board]").click();
await page.waitForSelector("[data-qa=drop-hud]", { timeout: 8000 });
await page.waitForFunction(() => [...document.querySelectorAll("canvas")].some((c) => c.width >= 200 && c.height >= 200), {
  timeout: 8000,
});
const other = [...new Set(reqs.map((r) => r.url))].filter((u) => /ruins|mines/.test(u));
if (other.length) fail("drop fetched other biomes " + other.join(" "));
const foePng = [...new Set(reqs.map((r) => r.url))].filter((u) => /\/game\/enemies\//.test(u));
if (foePng.length) fail("drop fetched enemy PNGs " + foePng.join(" "));
const c = await page.evaluate(() => {
  const els = [...document.querySelectorAll("canvas")];
  const el = els.sort((a, b) => b.width * b.height - a.width * a.height)[0];
  return el ? { w: el.width, h: el.height } : { w: 0, h: 0 };
});
if (c.w < 200 || c.h < 200) fail("dungeon canvas " + JSON.stringify(c));
const text = await page.locator("body").innerText();
if (!text.includes("Veldt-9")) fail("no Veldt-9 on drop");
if (!(await page.locator(".iso-dir").count())) fail("no iso d-pad");
if (!(await page.locator("[data-qa=drop-wait]").count())) fail("no Wait / End Turn");
if (!(await page.locator("[data-qa=drop-harvest]").count())) fail("no Harvest verb");
if (!(await page.locator("[data-qa=drop-gasket-follow]").count())) fail("no Gasket Follow chip");
if (await page.locator("[data-qa=menu-gasket]").count()) fail("old Gasket sheet still on drop");
if (/\bWits\b|\bSurvival\b|\bPerception\b/.test(await page.locator("[data-qa=drop-hud]").innerText())) fail("drop HUD leaked jargon");
if (await page.locator("[data-qa=drop-hud]").locator("[data-qa=bay3d-bones]").count()) fail("Bay Bones on drop");
if ((await page.locator("[data-qa=drop-hud]").innerText()).includes("Spawn pack")) fail("Nest toolbar on drop");
const dropText = await page.locator("[data-qa=drop-hud]").innerText();
if (dropText.includes("STATS_KEYS") || dropText.includes("Created with Grok")) fail("drop leaked debug/remix");
if (!(await page.locator("[data-qa=drop-log]").count())) fail("no readable turn log");
if (!(await page.locator("[data-qa=drop-hint]").count())) fail("no verb range hint");
if (!(await page.locator("[data-qa=drop-sg-0]").count()) || !(await page.locator("[data-qa=drop-sg-1]").count())) fail("need two skillgram slots");
if ((await page.locator("[data-qa=drop-sg-0]").innerText()) === "" && (await page.locator("[data-qa=drop-sg-1]").innerText()) === "") fail("skillgram slots blank");
await browser.close();
if (!process.exitCode) console.log("PASS slice1 smoke tLive=" + tLive + "ms");
