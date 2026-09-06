#!/usr/bin/env node
/** 3D Bay smoke. Preview :8080. node .grok/skills/solace-3d-qa/scripts/qa-3d.mjs */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://127.0.0.1:8080";
const ROOT = process.env.QA_ROOT || "/workspace";

function fail(msg) {
  console.error("FAIL", msg);
  process.exitCode = 1;
}

const kit = readFileSync(`${ROOT}/src/game/solace3d/kit.ts`, "utf8");
if (!kit.includes("export function buildWanzer")) fail("Q4 no buildWanzer");
for (const s of [
  "hips",
  "spine_low",
  "spine_mid",
  "chest",
  "gasket_mount",
  "pack_mount",
  "core_mount",
  "skirt_ring",
  "weapon_mount_",
  "upper_arm_",
  "thigh_",
]) {
  if (!kit.includes(s)) fail("Q4 missing socket " + s);
}
if (!kit.includes("export const GOLD_GREY")) fail("Q7 no GOLD_GREY");
if (!kit.includes("export const GOLD_SIT")) fail("Q7 no GOLD_SIT");
if (!kit.includes("1.28")) fail("Q7 gold snath length 1.28 missing (solace-gold)");
if (!kit.includes("chestW: 0.38")) fail("Q7 gold chestW 0.38 missing");
if (!kit.includes("chestD: 0.22")) fail("Q7 gold chestD 0.22 missing");
if (!kit.includes("thighLen: 0.19")) fail("Q7 gold thighLen 0.19 missing");
if (!kit.includes("shinLen: 0.14")) fail("Q7 gold shinLen 0.14 missing");
if (!kit.includes("stance: 0.12")) fail("Q7 gold stance 0.12 missing");
if (!kit.includes("scale: 1.1")) fail("Q7 gold scale 1.1 missing (tile plant)");
if (!kit.includes("function ribs")) fail("Q7 torso still a box cage — need tapered ribs");
if (kit.includes("[1, -1]") && kit.includes("[-1, 1]")) {
  fail("Q7 rib posts are box corners — need cardinal oval");
}
if (kit.includes("function makeScythe") || kit.includes("texMat(\"visor\")")) {
  fail("Q8 dressed labor still the base — bay default is bare armature");
}
if (kit.includes("slashFan") || kit.includes("PlaneGeometry(2.15")) fail("Q9 3-tile fan VFX");
if (!kit.includes("tick: (now: number)") && !kit.includes("const tick = (now: number)")) fail("Q10 no idle tick");
if (!kit.includes('head: ["none"')) fail("Q10 head none must be first");
if (!kit.includes('body: ["none"')) fail("Q10 body none must be first");
if (!kit.includes('legs: ["none"')) fail("Q10 legs none must be first");
if (!kit.includes('arms: ["none"')) fail("Q10 arms none must be first");
if (!kit.includes('handR: ["none"')) fail("Q10 handR none must be first");
if (!kit.includes('handL: ["none"')) fail("Q10 handL none must be first");
if (!kit.includes('"bucket"')) fail("Q10 head needs a non-none part");
if (!kit.includes('"can"')) fail("Q10 body needs a non-none part");
if (!kit.includes('"piston"')) fail("Q10 legs needs a non-none part");
if (!kit.includes('"crane"')) fail("Q10 arms needs a non-none part");
if (!kit.includes('"scythe"')) fail("Q10 handR needs scythe");
if (!kit.includes('"saw"')) fail("Q10 handR needs saw");
if (!kit.includes('"cannon"')) fail("Q10 cannon missing");
if (!kit.includes('"shield"')) fail("Q10 handL needs shield");
if (!kit.includes('"cell"')) fail("Q10 body needs cell pack");
if (!kit.includes("buildHeadShell") || !kit.includes("attachArmShell")) fail("Q10 no default shells");
if (!kit.includes("export function setBonesVisible")) fail("Q10 no setBonesVisible");
if (!kit.includes("rLimb")) fail("Q10 limb brass (elbow/wrist/knee/ankle) not sized");
if (!kit.includes("head: 0, body: 0, legs: 0, arms: 0, handR: 1, handL: 1")) fail("Q10 GOLD_GREY armor none, scythe both hands");
if (!kit.includes("gripScale")) fail("Q10 no gripScale sit");
if (!kit.includes("tool_seat")) fail("Q10 no tool_seat");
if (!kit.includes("setSeatGizmoVisible")) fail("Q10 no seat gizmo toggle");
if (!kit.includes("HOLD_PROFILES")) fail("Q10 no HOLD_PROFILES");
if (!kit.includes("export function resetGoldGlobals")) fail("Q10 Reset gold must keep hold profiles");
if (!kit.includes("export const SIT_HEAVY")) fail("Q10 no Heavy labor sit preset");
if (!kit.includes("shoulderW")) fail("Q10 no shoulderW sit");
if (!kit.includes("hipsW")) fail("Q10 no hipsW sit");
if (!kit.includes("footSize")) fail("Q10 no footSize sit");
if (!kit.includes("* 2")) fail("Q10 limb brass not ~2x");
if (!kit.includes("export function applyHold")) fail("Q10 no applyHold");
if (!kit.includes("hold: HOLD_PROFILES")) fail("Q10 GOLD_SIT missing hold table");
if (!kit.includes("buildGripper")) fail("Q10 no universal gripper");
if (!kit.includes('handL: ["none", "scythe"')) fail("Q10 handL scythe occupies both slots");

const sprites = readFileSync(`${ROOT}/src/game/solace3d/sprites.ts`, "utf8");
const iso3d = readFileSync(`${ROOT}/src/game/solace3d/iso3d.ts`, "utf8");
const bay = readFileSync(`${ROOT}/src/game/solace3d/Bay3D.tsx`, "utf8");
if (bay.includes("foe3d") || bay.includes('from "./sprites"') || bay.includes("Nest3D") || bay.includes("./nest")) fail("Q1 Bay imports drop/nest graph");
if (bay.includes("crane upper") || bay.includes("crane fore")) fail("Q10 gold labels still say crane");
if (!bay.includes('label: "upper arm"') || !bay.includes('label: "forearm"')) fail("Q10 arm length labels");
if (!bay.includes("bay3d-sit-heavy")) fail("Q10 no Heavy labor preset");
const hangerFn = iso3d.split("export function hangerCell")[1]?.split("export function")[0] ?? "";
if (!iso3d.includes("export function hangerCell")) fail("Q11 S57 no hangerCell");
if (sprites.includes("export function hangerTile")) fail("Q11 S57 hangerTile (top-down) still exported");
if (hangerFn.includes("Sprite")) fail("Q11 S59 hangerCell still a billboard");
if (bay.includes("hangerTile")) fail("Q11 S57 bay uses hangerTile");
if (bay.includes("SpriteMaterial")) fail("Q11 S59 bay deck still billboards");
if (bay.includes('from "./sprites"')) fail("Q11 bay imports Drop tile loaders (sprites.ts)");
if (bay.includes("foe3d") || bay.includes("buildFoe")) fail("Q11 bay loads foes");
if (bay.includes("forest.png") || bay.includes("loadIsoTile") || bay.includes("sliceSheet")) fail("Q11 bay loads Veldt tiles");
const nestUi = readFileSync(`${ROOT}/src/game/solace3d/Nest3D.tsx`, "utf8");
const nestSrc = readFileSync(`${ROOT}/src/game/solace3d/nest.ts`, "utf8");
if (nestUi.includes("from \"./Bay3D\"") || nestUi.includes("KIT_NAMES")) fail("Q11 Nest opened parts catalog");
if (!nestUi.includes("nest-spawn") || !nestUi.includes("nest-reset") || !nestUi.includes("nest-fight")) fail("Q11 Nest missing sandbox plates");
if (!nestUi.includes("keepGasket") || !nestUi.includes("nest_pilot_mannequin")) fail("Q11 Nest Gasket identity not guarded");
if (nestUi.includes('makeNestGasket("harvester"')) fail("Q11 Nest default companion is the pilot");
if (!nestUi.includes("GASKET_SIT_YARD")) fail("Q11 Nest missing yardstick");
if (!nestUi.includes("nest-diff-story")) fail("Q11 Nest missing Story chip");
if (!nestSrc.includes("ready: false")) fail("Q11 Nest must grey unready foes");
if (!nestSrc.includes("Cleave chaff")) fail("Q11 Stripekin teach missing");
if (!nestSrc.includes("stepSmall")) fail("Q11 Nest not using shared ¼ stepper");
if (!nestUi.includes("nest-gasket-cmd") || nestUi.includes("data-qa=\"nest-pad\"")) fail("Q11 Nest still has Gasket Move stick");
if (!nestSrc.includes("tickKernel")) fail("Q11 Nest not on shared AI kernel");
if (/\bper\b/.test(nestSrc) && nestSrc.includes("Perception")) fail("Q11 Nest resurrected per");
if (!bay.includes("hangerCell")) fail("Q11 S57 bay not using hangerCell");
if (!bay.includes("bay3d-bones")) fail("Q10 no bay bones overlay");
if (!bay.includes("HoldSliders")) fail("Q10 no per-weapon hold sliders");
const drop = readFileSync(`${ROOT}/src/game/solace3d/Drop3D.tsx`, "utf8");
if (!drop.includes("setBonesVisible(wanzer.root, false)")) fail("Q10 play still shows gold bones");
if (drop.includes("GASKET_SIT_YARD")) fail("Q11 play/drop must not auto-promote Nest yardstick");
if (!drop.includes("gasket.scale.setScalar(0.36)")) fail("Q6 drop Gasket scale lock drifted");
if (iso3d.includes("return { x: tx, z: ty }")) fail("Q12 S58 isoCell is axis-aligned (crab/double-iso)");
if (!iso3d.includes("(tx - ty)")) fail("Q12 S58 isoCell missing diamond pack");
if (!iso3d.includes("export const ISO_YAW")) fail("Q12 S58 no ISO_YAW");
if (!iso3d.includes("Math.PI / 4")) fail("Q12 S58 ISO_YAW not on iso axes");
if (bay.includes("(d * Math.PI) / 2")) fail("Q12 S58 yaw still world-cardinal guess");

const gasket = readFileSync(`${ROOT}/src/game/solace3d/gasket.ts`, "utf8");
if (!gasket.includes("export function buildGasket")) fail("Q6 no buildGasket");
if (!gasket.includes('name = "gasket"')) fail("Q6 gasket root unnamed");
if (!gasket.includes('name = "eye"')) fail("Q6 cute gasket missing visor-eye");
if (!gasket.includes("GASKET_SIT_YARD")) fail("Q6 no Nest yardstick sit");
if (!gasket.includes("gasketSitVis")) fail("Q6 no Nest-only sit markers");
if (/p0\d\d/.test(gasket)) fail("Q6 Gasket uses p###");

const lh = readFileSync(`${ROOT}/src/game/LastHarvest.tsx`, "utf8");
if (lh.includes('from "./solace3d') && !lh.includes("lazy(")) fail("Q1 LastHarvest static-imports solace3d");
if (!lh.includes('qa="title-bay3d"')) fail("Q2 no title-bay3d");

const html = await fetch(BASE).then((r) => r.text());
if (html.includes("data-qa=\"title-board\"")) fail("SSR shipped dead title-board");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const reqs = [];
page.on("request", (r) => reqs.push(r.url()));
page.on("pageerror", (e) => fail("pageerror " + e.message));

await page.goto(BASE, { waitUntil: "commit", timeout: 20000 });
await page.waitForSelector("[data-live='1']", { timeout: 8000 });

const titleHit = reqs.filter((u) => /three|solace3d|Bay3D/i.test(u));
if (titleHit.length) fail("Q1 title fetched 3D graph " + titleHit.join(" "));

const bayBtn = page.locator("[data-qa=title-bay3d]");
if ((await bayBtn.count()) !== 1) fail("Q2 title-bay3d count " + (await bayBtn.count()));
await bayBtn.click();
await page.waitForTimeout(1200);
const bayHit = reqs.filter((u) => /tiles\/forest|enemies\/|lookdev\/|foe3d/.test(u));
if (bayHit.length) fail("Q11 bay fetched drop/foe/lookdev " + bayHit.join(" "));
const gl = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  if (!c) return { ok: false, why: "no canvas" };
  const glc = c.getContext("webgl2") || c.getContext("webgl");
  return { ok: !!glc, w: c.width, h: c.height };
});
if (!gl.ok) fail("Q3 no WebGL canvas " + JSON.stringify(gl));
if (gl.w < 64 || gl.h < 64) fail("Q3 canvas tiny " + JSON.stringify(gl));

await page.locator("[data-qa=bay3d-back]").click();
await page.waitForSelector("[data-qa=title-nest]", { timeout: 8000 });
await page.locator("[data-qa=title-nest]").click();
await page.waitForSelector("[data-qa=nest3d]", { timeout: 8000 });
await page.locator("[data-qa=nest-biome-forest]").click();
await page.waitForTimeout(500);
await page.locator("[data-qa=nest-foe-stripekin]").click();
const detail = await page.locator("[data-qa=nest-detail]").innerText();
if (!detail.includes("Stripekin") || !detail.includes("Cleave chaff")) fail("Q11 nest teach " + detail);
if (/goblin/i.test(detail)) fail("Q11 goblin label in nest");
await page.locator("[data-qa=nest-pack-3]").click();
await page.locator("[data-qa=nest-spawn]").click();
await page.waitForTimeout(900);
await page.locator("[data-qa=nest-gasket-sit]").click();
await page.waitForSelector("[data-qa=nest-gasket-sit-dock]", { timeout: 4000 });
const sitScale = page.locator("[data-qa=nest-gasket-sit-scale]");
await sitScale.evaluate((el) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(el, "0.5");
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.waitForTimeout(120);
const nestText = await page.locator("[data-qa=nest3d]").innerText();
if (/goblin/i.test(nestText)) fail("Q11 goblin on nest canvas chrome");
if (!nestText.includes("¼-grid") && !nestText.includes("1/4")) fail("Q11 occupancy note missing");

await browser.close();
if (!process.exitCode) console.log("PASS qa-3d");
