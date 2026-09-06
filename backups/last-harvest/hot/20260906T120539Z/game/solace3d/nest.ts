import * as THREE from "three";
import { applyDef, derive, runMods, type Difficulty } from "../data";
import { canEnterQuarter, canEnterTile, faceSmall, manhSmall, manhToTile, occSmoke, stepSmall, stepSmallToward, type OccBody, type SmallCell } from "../grid";
import { roleOf, tickKernel, type AiActor, type AiWorld, type GasketCmd } from "../ai";
import { addOutline, mat as texMat } from "./tex";
import { SMALL_UNIT_SCALE } from "./foe3d";
import { emptyBag } from "../inventory";
import { newPilot, type Pilot } from "../pilot";
import { enterAim, exitAim, lastPinHits, shootCannon, type Dungeon, type Enemy, type Fx } from "../sim";

export type NestBiome = "forest" | "ossuary" | "brine";

export type NestFoe = {
  id: string;
  name: string;
  /** Forest live kinds. Other biomes use dummy nest meshes. */
  kind?: "small" | "big" | "elite" | "smith";
  dummy?: "ghost" | "skeleton" | "crawler" | "vein";
  scale: number;
  /** False = grey in Nest; do not spawn (mesh not ready). */
  ready: boolean;
  role: string;
  tags: string[];
  counter: string;
  occupancy: "¼-grid" | "full tile";
};

export type NestSpec = {
  id: NestBiome;
  planet: string;
  label: string;
  help: string;
  bg: number;
  tiles: "forest" | "paint";
  paint: { floor: number; variant: number; fog: number };
  roster: NestFoe[];
};

export const NEST_PACK = [1, 3, 6] as const;
export type NestPack = (typeof NEST_PACK)[number];

export const NEST_BIOMES: NestSpec[] = [
  {
    id: "forest",
    planet: "Veldt-9",
    label: "Canopy",
    help: "Bloom-ore tribes. Spawn a pack, then Fight.",
    bg: 0x0c1810,
    tiles: "forest",
    paint: { floor: 0x8a6e4a, variant: 0x6a5844, fog: 0x142414 },
    roster: [
      {
        id: "stripekin",
        name: "Stripekin",
        kind: "small",
        scale: SMALL_UNIT_SCALE,
        ready: true,
        role: "Cleave chaff; don't 1v1 the cloud.",
        tags: ["humanoid", "swarm-ish"],
        counter: "Cleaving Sweep",
        occupancy: "¼-grid",
      },
      {
        id: "antlerkin",
        name: "Antlerkin",
        kind: "big",
        scale: 0.92,
        ready: true,
        role: "Stag brute. Don't trade the maul.",
        tags: ["humanoid", "brute"],
        counter: "Charge / gap-close",
        occupancy: "full tile",
      },
      {
        id: "rootwarden",
        name: "Rootwarden",
        kind: "elite",
        scale: 0.92,
        ready: true,
        role: "Pickaxe poke. Step in or eat reach.",
        tags: ["humanoid", "reach"],
        counter: "Charge",
        occupancy: "full tile",
      },
      {
        id: "barkback",
        name: "Barkback",
        kind: "smith",
        scale: 1.08,
        ready: true,
        role: "Armor sponge. Don't bump-trade.",
        tags: ["humanoid", "armor", "shield"],
        counter: "Programs / wait the soak",
        occupancy: "full tile",
      },
      {
        id: "sapjaw",
        name: "Sapjaw",
        scale: 0.92,
        ready: false,
        role: "Resin spit. Mesh later.",
        tags: ["spitter"],
        counter: "Gap-close",
        occupancy: "full tile",
      },
      {
        id: "scrap-hound",
        name: "Scrap-Hound",
        scale: SMALL_UNIT_SCALE,
        ready: false,
        role: "Quad chaser. Mesh later.",
        tags: ["quad", "chaser"],
        counter: "Cleave / kite",
        occupancy: "¼-grid",
      },
    ],
  },
  {
    id: "ossuary",
    planet: "Ossuary Prime",
    label: "Rubble",
    help: "Placeholder tiles. Ghost / skeleton dummies — not live drop.",
    bg: 0x141018,
    tiles: "paint",
    paint: { floor: 0x3a342c, variant: 0x4a4034, fog: 0x1a1614 },
    roster: [
      {
        id: "ghost",
        name: "Wisp",
        dummy: "ghost",
        scale: SMALL_UNIT_SCALE,
        ready: true,
        role: "Dummy fog. Not a Veldt teach.",
        tags: ["dummy"],
        counter: "—",
        occupancy: "¼-grid",
      },
      {
        id: "skeleton",
        name: "Ossature",
        dummy: "skeleton",
        scale: 0.92,
        ready: true,
        role: "Dummy bone. Not a Veldt teach.",
        tags: ["dummy"],
        counter: "—",
        occupancy: "full tile",
      },
    ],
  },
  {
    id: "brine",
    planet: "Brine-Khar",
    label: "Flood",
    help: "Placeholder tiles. Crawler dummies — not live drop.",
    bg: 0x0c181c,
    tiles: "paint",
    paint: { floor: 0x2a4a48, variant: 0x3a5a52, fog: 0x0c2020 },
    roster: [
      {
        id: "crawler",
        name: "Crawler",
        dummy: "crawler",
        scale: SMALL_UNIT_SCALE,
        ready: true,
        role: "Dummy scuttle. Not a Veldt teach.",
        tags: ["dummy"],
        counter: "—",
        occupancy: "¼-grid",
      },
      {
        id: "vein",
        name: "Vein-heart",
        dummy: "vein",
        scale: 0.92,
        ready: true,
        role: "Dummy lump. Not a Veldt teach.",
        tags: ["dummy"],
        counter: "—",
        occupancy: "full tile",
      },
    ],
  },
];

export function nestOf(id: NestBiome) {
  return NEST_BIOMES.find((b) => b.id === id) ?? NEST_BIOMES[0]!;
}

export const NEST_R = 4;
export const NEST_HUNT = { x: 0, y: 0 };
export const NEST_TICK_MS = 620;

export type NestActor = {
  uid: number;
  specId: string;
  small: boolean;
  x: number;
  y: number;
  sub: number;
  dir: number;
  hp: number;
  max: number;
  dmg: number;
  def: number;
  state: "idle" | "alert" | "hunt" | "attack";
  seen: boolean;
};

export type NestGasketKitId = "starter" | "harvester";

export type NestGasketKit = {
  id: NestGasketKitId;
  name: string;
  help: string;
  scale: number;
};

/** Nest sandbox kits. Starter = Gasket companion. Harvester = optional pilot mannequin (never the companion slot). */
export const NEST_GASKET_KITS: NestGasketKit[] = [
  { id: "starter", name: "Starter", help: "Gasket on the pad", scale: 0.28 },
  { id: "harvester", name: "Harvester", help: "Pilot mannequin off-pad. Gasket stays the companion.", scale: 0.28 },
];

export type NestGasket = {
  kit: NestGasketKitId;
  x: number;
  y: number;
  sub: number;
  dir: number;
  hp: number;
  max: number;
  bolt: number;
  wits: number;
  glowUntil: number;
  cmd: GasketCmd;
  focusId: string | null;
};

export function nestApplyDiff(g: NestGasket, d: Difficulty) {
  const m = runMods(d);
  g.max = m.gasketMax;
  g.bolt = m.gasketBolt;
  g.wits = m.witsStart;
  g.hp = Math.min(g.hp, g.max);
  if (g.hp <= 0) g.hp = g.max;
}

export function makeNestGasket(kit: NestGasketKitId = "starter", d: Difficulty = "default"): NestGasket {
  const m = runMods(d);
  return {
    kit,
    x: 0,
    y: 0,
    sub: 0,
    dir: 0,
    hp: m.gasketMax,
    max: m.gasketMax,
    bolt: m.gasketBolt,
    wits: m.witsStart,
    glowUntil: 0,
    cmd: "follow" as GasketCmd,
    focusId: null,
  };
}

export function nestKitOf(id: NestGasketKitId) {
  return NEST_GASKET_KITS.find((k) => k.id === id) ?? NEST_GASKET_KITS[0]!;
}

export function nestStats(row: NestFoe) {
  const small = !!(row.kind === "small" || row.dummy === "ghost" || row.dummy === "crawler");
  if (small) return { hp: 12, dmg: 5, def: 2, small };
  if (row.kind === "elite") return { hp: 36, dmg: 10, def: 5, small: false };
  return { hp: 28, dmg: 8, def: 4, small: false };
}

export function nestSpawnList(spec: NestSpec): NestFoe[] {
  return spec.roster.filter((row) => row.ready);
}

/** Pack plants. Smalls share a tile (cloud teach). Does not invent HP. */
export function nestPackPlants(row: NestFoe, n: number): { x: number; y: number; sub: number; dir: number }[] {
  let count = Math.max(1, Math.min(8, Math.floor(n)));
  if (row.id === "barkback" || row.kind === "smith") count = Math.min(2, count);
  const small = nestStats(row).small;
  const out: { x: number; y: number; sub: number; dir: number }[] = [];
  if (small) {
    for (let i = 0; i < count; i++) {
      const tile = Math.floor(i / 4);
      out.push({ x: 2 + (tile % 2), y: Math.floor(tile / 2), sub: i % 4, dir: 3 });
    }
    return out;
  }
  const mid = Math.floor((count - 1) / 2);
  for (let i = 0; i < count; i++) out.push({ x: 2, y: i - mid, sub: 0, dir: 3 });
  return out;
}

export function nestInBounds(x: number, y: number) {
  return Math.abs(x) <= NEST_R && Math.abs(y) <= NEST_R;
}

function nestOccBodies(actors: NestActor[], gasket?: NestGasket): OccBody[] {
  const occ: OccBody[] = actors.filter((a) => a.hp > 0).map((a) => ({
    id: a.uid,
    x: a.x,
    y: a.y,
    sub: a.sub,
    small: a.small,
  }));
  if (gasket && gasket.hp > 0) occ.push({ id: "gasket", x: gasket.x, y: gasket.y, sub: gasket.sub, small: true });
  return occ;
}

function nestOcc(actors: NestActor[], gasket?: NestGasket) {
  return nestOccBodies(actors, gasket).map((o) => ({ x: o.x, y: o.y, sub: o.sub, small: o.small }));
}

export function nestWalkable(actors: NestActor[], dest: SmallCell, moverSmall: boolean, gasket?: NestGasket, ignoreId?: number | string) {
  if (!nestInBounds(dest.x, dest.y)) return false;
  const occ = nestOccBodies(actors, gasket);
  if (!moverSmall) return canEnterTile(occ, dest, ignoreId);
  return canEnterQuarter(occ, dest, ignoreId);
}

export function nestEdgeCell(actors: NestActor[], mover: NestActor) {
  for (let t = 0; t < 48; t++) {
    const side = Math.floor(Math.random() * 4);
    const k = -NEST_R + Math.floor(Math.random() * (NEST_R * 2 + 1));
    const p =
      side === 0 ? { x: -NEST_R, y: k } : side === 1 ? { x: NEST_R, y: k } : side === 2 ? { x: k, y: -NEST_R } : { x: k, y: NEST_R };
    const dest = { x: p.x, y: p.y, sub: mover.small ? Math.floor(Math.random() * 4) : 0 };
    if (nestWalkable(actors, dest, mover.small)) return dest;
  }
  return { x: NEST_R, y: 0, sub: mover.small ? 0 : 0 };
}

export function nestRespawn(a: NestActor, actors: NestActor[]) {
  const p = nestEdgeCell(actors, a);
  a.x = p.x;
  a.y = p.y;
  a.sub = a.small ? p.sub : 0;
  a.hp = a.max;
  a.dir = a.x < 0 ? 1 : a.x > 0 ? 3 : a.y < 0 ? 0 : 2;
}

export function nestRespawnGasket(g: NestGasket, now: number) {
  g.x = 0;
  g.y = 0;
  g.sub = 0;
  g.dir = 0;
  g.hp = g.max;
  g.glowUntil = now + 720;
}

export function nestGasketWalkable(actors: NestActor[], dest: SmallCell, g: NestGasket) {
  if (!nestInBounds(dest.x, dest.y)) return false;
  return canEnterQuarter(nestOccBodies(actors), dest, "gasket");
}

export function nestGasketAct(actors: NestActor[], g: NestGasket) {
  const live = actors.filter((a) => a.hp > 0);
  if (!live.length) return;
  const me: SmallCell = { x: g.x, y: g.y, sub: g.sub };
  let best = live[0]!;
  let bestD = 99;
  for (const a of live) {
    const m = a.small ? manhSmall(me, a) : manhToTile(me, a.x, a.y);
    if (m < bestD) {
      bestD = m;
      best = a;
    }
  }
  const nip = (foe: NestActor) => {
    foe.hp -= applyDef(g.bolt, foe.def, 0);
    g.dir = faceDir(g.x, g.y, foe.x, foe.y);
  };
  if (bestD <= 1) {
    nip(best);
    return;
  }
  const target: SmallCell = best.small ? best : { x: best.x, y: best.y, sub: 0 };
  const next = stepSmallToward(me, target);
  if (nestGasketWalkable(actors, next, g)) {
    g.x = next.x;
    g.y = next.y;
    g.sub = next.sub;
    g.dir = next.x !== me.x ? (next.x > me.x ? 1 : 3) : next.y > me.y ? 0 : 2;
  }
}

export function nestGasketStep(actors: NestActor[], g: NestGasket, dx: number, dy: number) {
  const next = stepSmall({ x: g.x, y: g.y, sub: g.sub }, dx, dy);
  const foe = actors.find((a) => a.hp > 0 && a.x === next.x && a.y === next.y && (!a.small || a.sub === next.sub));
  if (foe) {
    foe.hp -= applyDef(g.bolt, foe.def, 0);
    g.dir = faceDir(g.x, g.y, next.x, next.y);
    return;
  }
  const big = actors.find((a) => a.hp > 0 && !a.small && a.x === next.x && a.y === next.y);
  if (big) {
    big.hp -= applyDef(g.bolt, big.def, 0);
    g.dir = faceDir(g.x, g.y, next.x, next.y);
    return;
  }
  if (!nestGasketWalkable(actors, next, g)) return;
  g.x = next.x;
  g.y = next.y;
  g.sub = next.sub;
  g.dir = dx ? (dx > 0 ? 1 : 3) : dy > 0 ? 0 : 2;
}

export function nestAct(actors: NestActor[], huntX = NEST_HUNT.x, huntY = NEST_HUNT.y, gasket?: NestGasket) {
  const hunt: SmallCell = gasket
    ? { x: gasket.x, y: gasket.y, sub: gasket.sub }
    : { x: huntX, y: huntY, sub: 0 };
  let stepped = false;
  for (const e of actors) {
    if (e.hp <= 0) continue;
    const me: SmallCell = { x: e.x, y: e.y, sub: e.sub };
    const man = e.small ? manhSmall(me, hunt) : manhToTile(hunt, e.x, e.y);
    if (man <= 1) {
      e.dir = faceSmall(me, hunt, e.dir);
      if (gasket && gasket.hp > 0) gasket.hp -= applyDef(e.dmg, 0, 0);
      continue;
    }
    if (e.small) {
      const next = stepSmallToward(me, hunt);
      if (nestWalkable(actors, next, true, gasket, e.uid)) {
        e.dir = faceSmall(me, next, e.dir);
        e.x = next.x;
        e.y = next.y;
        e.sub = next.sub;
        stepped = true;
      }
      continue;
    }
    const dx = Math.sign(hunt.x - e.x);
    const dy = Math.sign(hunt.y - e.y);
    const tryX = { x: e.x + dx, y: e.y, sub: 0 };
    const tryY = { x: e.x, y: e.y + dy, sub: 0 };
    if (dx && nestWalkable(actors, tryX, false, gasket, e.uid)) {
      e.x += dx;
      e.dir = dx > 0 ? 1 : 3;
      stepped = true;
    } else if (dy && nestWalkable(actors, tryY, false, gasket, e.uid)) {
      e.y += dy;
      e.dir = dy > 0 ? 0 : 2;
      stepped = true;
    }
  }
  if (stepped) {
    occSmoke(
      actors.map((a) => ({ id: a.uid, x: a.x, y: a.y, sub: a.sub, hp: a.hp, small: a.small })),
      "STEP",
    );
  }
}

/** Wide 3 / same-tile smalls — Harvester scythe teach. Uses Default melee (stur 1). */
export function nestCleave(actors: NestActor[], hx = 0, hy = 0) {
  const melee = derive(1, 1, 1).melee;
  for (const a of actors) {
    if (a.hp <= 0 || !a.small) continue;
    if (Math.abs(a.x - hx) + Math.abs(a.y - hy) > 1) continue;
    a.hp -= applyDef(melee, a.def, 0);
  }
}

/** Dungeon-order round: optional scythe cleave, then shared AI kernel. Dead Gasket → pad. */
export function nestRound(actors: NestActor[], gasket: NestGasket, now: number, cleave = false, hasPilot = false) {
  if (cleave) nestCleave(actors, 0, 0);
  const gActor: AiActor = {
    id: "gasket",
    team: "gasket",
    role: "gasket",
    occ: "quarter",
    x: gasket.x,
    y: gasket.y,
    sub: gasket.sub,
    dir: gasket.dir,
    hp: gasket.hp,
    max: gasket.max,
    state: "hunt",
    seen: true,
  };
  const foes: AiActor[] = actors
    .filter((a) => a.hp > 0)
    .map((a) => ({
      id: String(a.uid),
      team: "foe" as const,
      role: roleOf(a.specId),
      occ: a.small ? ("quarter" as const) : ("tile" as const),
      x: a.x,
      y: a.y,
      sub: a.sub,
      dir: a.dir,
      hp: a.hp,
      max: a.max,
      state: a.state,
      seen: a.seen,
    }));
  const world: AiWorld = {
    open: true,
    visible: () => true,
    inBounds: nestInBounds,
    blocked: (who, dest) => {
      if (!nestInBounds(dest.x, dest.y)) return true;
      const occ = nestOccBodies(actors, who.id === "gasket" ? undefined : gasket).filter((o) => String(o.id) !== who.id);
      if (who.occ === "tile") return !canEnterTile(occ, dest);
      return !canEnterQuarter(occ, dest);
    },
    pilot: hasPilot ? { x: -2, y: 0 } : null,
    gasketCmd: gasket.cmd,
    focusId: gasket.focusId,
    actors: gasket.hp > 0 ? [gActor, ...foes] : foes,
  };
  const before = actors.map((a) => ({ id: a.uid, x: a.x, y: a.y, sub: a.sub }));
  const commits = tickKernel(world);
  for (const c of commits) {
    if (c.id === "gasket") {
      gasket.x = c.x;
      gasket.y = c.y;
      gasket.sub = c.sub;
      gasket.dir = c.dir;
      if (c.action === "attack" && c.targetId) {
        const foe = actors.find((a) => String(a.uid) === c.targetId);
        if (foe && foe.hp > 0) {
          foe.hp -= applyDef(gasket.bolt, foe.def, 0);
          gasket.focusId = c.targetId;
        }
      }
      continue;
    }
    const a = actors.find((n) => String(n.uid) === c.id);
    if (!a) continue;
    a.x = c.x;
    a.y = c.y;
    a.sub = c.sub;
    a.dir = c.dir;
    a.state = c.state;
    a.seen = c.seen;
    if (c.action === "attack" && c.targetId === "gasket" && gasket.hp > 0) {
      gasket.hp -= applyDef(a.dmg, 0, 0);
    }
  }
  if (gasket.hp > 0) {
    const rec = derive(1, 1, gasket.wits).recovery * 0.15;
    gasket.hp = Math.min(gasket.max, gasket.hp + rec);
  }
  if (gasket.hp <= 0) nestRespawnGasket(gasket, now);
  const stepped = actors.some((a) => {
    const b = before.find((n) => n.id === a.uid);
    return b && (b.x !== a.x || b.y !== a.y || b.sub !== a.sub);
  });
  if (stepped) {
    occSmoke(
      actors.map((a) => ({ id: a.uid, x: a.x, y: a.y, sub: a.sub, hp: a.hp, small: a.small })),
      "STEP",
    );
  }
}

function faceDir(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 1 : 3;
  return dy > 0 ? 0 : 2;
}

function sph(r: number, mat: THREE.Material, seg = 8) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg - 2), mat);
}
function box(w: number, h: number, d: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}
function cyl(rt: number, rb: number, h: number, mat: THREE.Material, seg = 6) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
}

function dummyGhost() {
  const g = new THREE.Group();
  const mist = texMat("cream");
  const body = sph(0.1, mist, 8);
  body.scale.set(0.8, 1.3, 0.8);
  body.position.y = 0.22;
  g.add(body);
  const head = sph(0.06, mist, 7);
  head.position.y = 0.38;
  g.add(head);
  return g;
}

function dummySkeleton() {
  const g = new THREE.Group();
  const bone = texMat("cream");
  const soot = texMat("charcoal");
  const ribs = cyl(0.07, 0.05, 0.22, bone, 6);
  ribs.position.y = 0.32;
  g.add(ribs);
  const head = sph(0.07, bone, 7);
  head.position.y = 0.5;
  g.add(head);
  const jaw = box(0.06, 0.02, 0.04, soot);
  jaw.position.set(0, 0.46, 0.05);
  g.add(jaw);
  const leg = cyl(0.02, 0.016, 0.22, bone, 5);
  leg.position.set(0.04, 0.12, 0);
  g.add(leg);
  const legL = cyl(0.02, 0.016, 0.22, bone, 5);
  legL.position.set(-0.04, 0.12, 0);
  g.add(legL);
  return g;
}

function dummyCrawler() {
  const g = new THREE.Group();
  const hide = texMat("dark");
  const ore = texMat("steel");
  const body = sph(0.12, hide, 8);
  body.scale.set(1.4, 0.7, 1.1);
  body.position.y = 0.1;
  g.add(body);
  for (const s of [-1, 1] as const) {
    const leg = cyl(0.012, 0.01, 0.16, hide, 5);
    leg.position.set(s * 0.12, 0.06, 0.04);
    leg.rotation.z = s * 0.9;
    g.add(leg);
  }
  const lump = sph(0.04, ore, 6);
  lump.position.set(0, 0.14, 0.08);
  g.add(lump);
  return g;
}

function dummyVein() {
  const g = new THREE.Group();
  const slag = texMat("steel");
  const dark = texMat("charcoal");
  const core = sph(0.14, slag, 8);
  core.position.y = 0.16;
  g.add(core);
  const rim = cyl(0.16, 0.12, 0.06, dark, 8);
  rim.position.y = 0.08;
  g.add(rim);
  return g;
}

export function buildNestDummy(id: NestFoe["dummy"]): THREE.Group {
  const root = new THREE.Group();
  root.name = `nest_${id ?? "dummy"}`;
  if (id === "ghost") root.add(dummyGhost());
  else if (id === "skeleton") root.add(dummySkeleton());
  else if (id === "crawler") root.add(dummyCrawler());
  else root.add(dummyVein());
  addOutline(root, 1.05);
  return root;
}

export async function loadNestTiles(spec: NestSpec) {
  if (spec.tiles !== "forest") return null;
  const { sliceSheet } = await import("./sprites");
  const [floor, fog] = await Promise.all([
    sliceSheet("/game/tiles/forest.png?v=veldt1", 2, 2),
    sliceSheet("/game/tiles/forest-fog.png?v=hd", 2, 1),
  ]);
  return { floor, fog };
}

export async function loadForestFoe(kind: NonNullable<NestFoe["kind"]>) {
  const { buildFoe } = await import("./foe3d");
  return buildFoe(kind);
}

/** Nest QA stances. Aim/Shoot chrome only on lancer / lancers. */
export type NestStance = "twohand" | "lancer" | "lancers";
export const NEST_STANCES: { id: NestStance; name: string }[] = [
  { id: "twohand", name: "Two-hand" },
  { id: "lancer", name: "Lancer" },
  { id: "lancers", name: "Lancers" },
];

export function nestCanLance(stance: NestStance) {
  return stance === "lancer" || stance === "lancers";
}

export function nestWanzerKit(stance: NestStance) {
  if (stance === "lancer") return { head: 0, body: 0, legs: 0, arms: 0, handR: 3, handL: 2 };
  if (stance === "lancers") return { head: 0, body: 0, legs: 0, arms: 0, handR: 3, handL: 3 };
  return { head: 0, body: 0, legs: 0, arms: 0, handR: 1, handL: 1 };
}

export function nestPilot(stance: NestStance): Pilot {
  const p = newPilot();
  if (stance === "lancer") {
    p.weapon = "lancer";
    p.loadout = { ...p.loadout, handR: "p010", handL: "p007", back: "back_lancer" };
  } else if (stance === "lancers") {
    p.weapon = "lancers";
    p.loadout = { ...p.loadout, handR: "p010", handL: "p010", back: "back_lancers", body: "p020" };
  }
  return p;
}

export type NestLance = {
  stance: NestStance;
  aiming: boolean;
  lastAimId: number;
  aimX: number;
  aimY: number;
  aimSub: number;
  log: string;
};

export function makeNestLance(stance: NestStance = "twohand"): NestLance {
  return { stance, aiming: false, lastAimId: -1, aimX: 0, aimY: 0, aimSub: 0, log: "" };
}

const NEST_OFF = NEST_R;

function nestKind(a: NestActor): Enemy["kind"] {
  if (a.small || a.specId === "stripekin") return "small";
  if (a.specId === "rootwarden") return "elite";
  if (a.specId === "barkback") return "smith";
  return "big";
}

function nestDungeon(actors: NestActor[], g: NestGasket, lance: NestLance): Dungeon {
  const span = NEST_R * 2 + 1;
  const vis = new Uint8Array(span * span);
  vis.fill(1);
  const enemies: Enemy[] = actors
    .filter((a) => a.hp > 0)
    .map((a) => ({
      id: a.uid,
      x: a.x + NEST_OFF,
      y: a.y + NEST_OFF,
      hp: a.hp,
      max: a.max,
      dmg: a.dmg,
      def: a.def,
      dir: a.dir,
      kind: nestKind(a),
      sub: a.sub,
      parry: 0,
      dodge: 0,
      stunned: 0,
      seen: true,
    }));
  return {
    w: span,
    h: span,
    floor: 1,
    biome: "forest",
    tiles: Array(span * span).fill(0),
    vis,
    seen: vis.slice(),
    px: -2 + NEST_OFF,
    py: 0 + NEST_OFF,
    pdir: 1,
    php: 62,
    pmax: 62,
    energy: 24,
    emax: 24,
    cx: g.x + NEST_OFF,
    cy: g.y + NEST_OFF,
    csub: g.sub,
    chp: g.hp,
    cmax: g.max,
    mounted: false,
    gasketMode: g.cmd === "hold" ? "hold" : g.cmd === "focus" ? "focus" : "follow",
    bag: emptyBag(),
    enemies,
    shinies: [],
    anvils: [],
    scrap: 0,
    ore: 0,
    xp: 0,
    xpNeed: 1,
    waitCannon: false,
    flood: 0,
    log: lance.log,
    aiming: lance.aiming,
    lastAimId: lance.lastAimId,
    aimX: lance.aimX + NEST_OFF,
    aimY: lance.aimY + NEST_OFF,
    aimSub: lance.aimSub,
    turn: 0,
    withdraw: 0,
    difficulty: "default",
    walks: 0,
    nextRoamAt: 99,
    nextShipAt: 99,
    shipCalls: 0,
    flags: [],
  };
}

function pullAim(d: Dungeon, lance: NestLance) {
  lance.log = d.log;
  lance.aiming = d.aiming;
  lance.lastAimId = d.lastAimId;
  lance.aimX = d.aimX - NEST_OFF;
  lance.aimY = d.aimY - NEST_OFF;
  lance.aimSub = d.aimSub;
}

function pullLance(d: Dungeon, actors: NestActor[], lance: NestLance) {
  for (const e of d.enemies) {
    const a = actors.find((n) => n.uid === e.id);
    if (a) a.hp = e.hp;
  }
  pullAim(d, lance);
}

/** Aim = lock only. Same enterAim as drop. */
export function nestEnterAim(actors: NestActor[], g: NestGasket, lance: NestLance) {
  const d = nestDungeon(actors, g, lance);
  enterAim(d);
  pullLance(d, actors, lance);
  return lance;
}

export function nestExitAim(actors: NestActor[], g: NestGasket, lance: NestLance) {
  const d = nestDungeon(actors, g, lance);
  exitAim(d);
  pullAim(d, lance);
  return lance;
}

/** Pin Shoot: copy dungeon resolve onto **one** body id, then restore every sibling. */
export function nestShoot(actors: NestActor[], g: NestGasket, lance: NestLance, fx: Fx[]) {
  const before = actors.map((a) => ({ uid: a.uid, hp: a.hp }));
  const d = nestDungeon(actors, g, lance);
  const pilot = nestPilot(lance.stance);
  shootCannon(d, pilot, fx, false);
  pullAim(d, lance);
  const pinIds = [...new Set(lastPinHits)];
  const pinId = pinIds.length === 1 ? pinIds[0]! : pinIds[0] ?? -1;
  for (const s of before) {
    const a = actors.find((n) => n.uid === s.uid);
    if (a) a.hp = s.hp;
  }
  if (pinId >= 0) {
    const e = d.enemies.find((x) => x.id === pinId);
    const a = actors.find((n) => n.uid === pinId);
    if (e && a) a.hp = Math.max(0, e.hp);
  }
  const after = actors.map((a) => ({ uid: a.uid, hp: a.hp }));
  const changed = after.filter((a, i) => a.hp !== before[i]!.hp);
  if (changed.length > 1) {
    const keep = changed[0]!.uid;
    for (const s of before) {
      if (s.uid === keep) continue;
      const a = actors.find((n) => n.uid === s.uid);
      if (a) a.hp = s.hp;
    }
  }
  const alive = actors.filter((a) => a.hp > 0).length;
  const ids = actors.filter((a, i) => a.hp !== before[i]!.hp).map((a) => a.uid);
  if (typeof console !== "undefined") {
    console.log("PIN_BODIES before", before.map((b) => `#${b.uid}:${b.hp}`).join(" "));
    console.log("PIN_BODIES after", actors.map((a) => `#${a.uid}:${a.hp}`).join(" "));
    console.log(`PIN_DMG ids=${ids.join(",") || "none"} class=pin alive=${alive} changed=${ids.length}`);
  }
  if (ids.length === 1 && !lance.log.startsWith("Pin") && !lance.log.includes("down")) {
    lance.log = `Pin · #${ids[0]}`;
  }
  return lance;
}

export function nestPackHp(actors: NestActor[]) {
  return actors.reduce((n, a) => n + Math.max(0, a.hp), 0);
}

export function nestAlive(actors: NestActor[]) {
  return actors.filter((a) => a.hp > 0).length;
}

export function nestBodyHp(actors: NestActor[]) {
  return actors
    .map((a) => `#${a.uid} sub:${a.small ? `${a.x},${a.y},${a.sub}` : `${a.x},${a.y},tile`} hp:${Math.max(0, a.hp)}`)
    .join("  ");
}

/** One Stripekin-class ¼ step. Others stay. Shared stepper + occupancy map. */
export function nestStepFoe(actors: NestActor[], gasket: NestGasket, uid?: number) {
  const live = actors.filter((a) => a.hp > 0 && a.small);
  const a = (uid != null ? live.find((n) => n.uid === uid) : live[0]) ?? null;
  if (!a) {
    occSmoke(
      actors.map((n) => ({ id: n.uid, x: n.x, y: n.y, sub: n.sub, hp: n.hp, small: n.small })),
      "STEP",
    );
    return null;
  }
  const me: SmallCell = { x: a.x, y: a.y, sub: a.sub };
  let next = stepSmallToward(me, { x: gasket.x, y: gasket.y, sub: gasket.sub });
  if (next.x === me.x && next.y === me.y && next.sub === me.sub) next = stepSmall(me, -1, 0);
  if (!nestWalkable(actors, next, true, gasket, a.uid)) {
    next = stepSmall(me, 0, -1);
  }
  if (nestWalkable(actors, next, true, gasket, a.uid) && (next.x !== me.x || next.y !== me.y || next.sub !== me.sub)) {
    a.dir = faceSmall(me, next, a.dir);
    a.x = next.x;
    a.y = next.y;
    a.sub = next.sub;
  }
  occSmoke(
    actors.map((n) => ({ id: n.uid, x: n.x, y: n.y, sub: n.sub, hp: n.hp, small: n.small })),
    "STEP",
  );
  return a;
}
