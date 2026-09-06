import * as THREE from "three";
import { applyDef, derive, runMods, type Difficulty } from "../data";
import { addOutline, mat as texMat } from "./tex";

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
    paint: { floor: 0x3d4a30, variant: 0x4a5a38, fog: 0x142414 },
    roster: [
      {
        id: "stripekin",
        name: "Stripekin",
        kind: "small",
        scale: 0.42,
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
        scale: 0.92,
        ready: true,
        role: "Armor sponge. Don't bump-trade.",
        tags: ["humanoid", "armor"],
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
        scale: 0.42,
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
        scale: 0.42,
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
        scale: 0.42,
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
};

export type NestGasketKitId = "starter" | "harvester";

export type NestGasketKit = {
  id: NestGasketKitId;
  name: string;
  help: string;
  scale: number;
};

/** Nest sandbox kits. Starter = Gasket only. Harvester = scythe wanzer for cleave teach. */
export const NEST_GASKET_KITS: NestGasketKit[] = [
  { id: "starter", name: "Starter", help: "Gasket on the pad", scale: 0.36 },
  { id: "harvester", name: "Harvester", help: "Scythe wanzer · cleave the cloud", scale: 0.36 },
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
  const count = Math.max(1, Math.min(8, Math.floor(n)));
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

function blocked(actors: NestActor[], x: number, y: number, mover: NestActor) {
  const here = actors.filter((a) => a !== mover && a.hp > 0 && a.x === x && a.y === y);
  if (!here.length) return false;
  if (!mover.small) return true;
  if (here.some((a) => !a.small)) return true;
  return here.length >= 4;
}

export function nestWalkable(actors: NestActor[], x: number, y: number, mover: NestActor) {
  if (!nestInBounds(x, y)) return false;
  return !blocked(actors, x, y, mover);
}

export function nestEdgeCell(actors: NestActor[], mover: NestActor) {
  for (let t = 0; t < 48; t++) {
    const side = Math.floor(Math.random() * 4);
    const k = -NEST_R + Math.floor(Math.random() * (NEST_R * 2 + 1));
    const p =
      side === 0 ? { x: -NEST_R, y: k } : side === 1 ? { x: NEST_R, y: k } : side === 2 ? { x: k, y: -NEST_R } : { x: k, y: NEST_R };
    if (nestWalkable(actors, p.x, p.y, mover)) return p;
  }
  return { x: NEST_R, y: 0 };
}

export function nestRespawn(a: NestActor, actors: NestActor[]) {
  const p = nestEdgeCell(actors, a);
  a.x = p.x;
  a.y = p.y;
  a.sub = a.small ? Math.floor(Math.random() * 4) : 0;
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

export function nestGasketWalkable(actors: NestActor[], x: number, y: number) {
  if (!nestInBounds(x, y)) return false;
  return !actors.some((a) => a.hp > 0 && !a.small && a.x === x && a.y === y);
}

export function nestGasketAct(actors: NestActor[], g: NestGasket) {
  const live = actors.filter((a) => a.hp > 0);
  if (!live.length) return;
  let best = live[0]!;
  let bestD = 99;
  for (const a of live) {
    const m = Math.abs(a.x - g.x) + Math.abs(a.y - g.y);
    if (m < bestD) {
      bestD = m;
      best = a;
    }
  }
  const nip = (foe: NestActor) => {
    foe.hp -= applyDef(g.bolt, foe.def, 0);
    g.dir = faceDir(g.x, g.y, foe.x, foe.y);
  };
  if (bestD === 0) {
    nip(best);
    return;
  }
  const dx = Math.sign(best.x - g.x);
  const dy = Math.sign(best.y - g.y);
  const hitAt = (x: number, y: number) => live.find((a) => a.x === x && a.y === y);
  if (dx) {
    const foe = hitAt(g.x + dx, g.y);
    if (foe) {
      nip(foe);
      return;
    }
  }
  if (dy) {
    const foe = hitAt(g.x, g.y + dy);
    if (foe) {
      nip(foe);
      return;
    }
  }
  if (dx && nestGasketWalkable(actors, g.x + dx, g.y)) {
    g.x += dx;
    g.dir = dx > 0 ? 1 : 3;
    return;
  }
  if (dy && nestGasketWalkable(actors, g.x, g.y + dy)) {
    g.y += dy;
    g.dir = dy > 0 ? 0 : 2;
  }
}

export function nestGasketStep(actors: NestActor[], g: NestGasket, dx: number, dy: number) {
  const nx = g.x + dx;
  const ny = g.y + dy;
  const foe = actors.find((a) => a.hp > 0 && a.x === nx && a.y === ny);
  if (foe) {
    foe.hp -= applyDef(g.bolt, foe.def, 0);
    g.dir = faceDir(g.x, g.y, nx, ny);
    return;
  }
  if (!nestGasketWalkable(actors, nx, ny)) return;
  g.x = nx;
  g.y = ny;
  g.dir = dx ? (dx > 0 ? 1 : 3) : dy > 0 ? 0 : 2;
}

export function nestAct(actors: NestActor[], huntX = NEST_HUNT.x, huntY = NEST_HUNT.y, gasket?: NestGasket) {
  for (const e of actors) {
    if (e.hp <= 0) continue;
    const man = Math.abs(e.x - huntX) + Math.abs(e.y - huntY);
    if (man <= 1) {
      e.dir = faceDir(e.x, e.y, huntX, huntY);
      if (gasket && gasket.hp > 0) gasket.hp -= applyDef(e.dmg, 0, 0);
      continue;
    }
    const dx = Math.sign(huntX - e.x);
    const dy = Math.sign(huntY - e.y);
    if (dx && nestWalkable(actors, e.x + dx, e.y, e)) {
      e.x += dx;
      e.dir = dx > 0 ? 1 : 3;
    } else if (dy && nestWalkable(actors, e.x, e.y + dy, e)) {
      e.y += dy;
      e.dir = dy > 0 ? 0 : 2;
    }
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

/** Dungeon-order round: optional scythe cleave, Gasket nips, foes hunt. Dead Gasket → pad. No foe rim-respawn in sandbox. */
export function nestRound(actors: NestActor[], gasket: NestGasket, now: number, cleave = false) {
  if (cleave) nestCleave(actors, 0, 0);
  nestGasketAct(actors, gasket);
  nestAct(actors, gasket.x, gasket.y, gasket);
  if (gasket.hp > 0) {
    const rec = derive(1, 1, gasket.wits).recovery * 0.15;
    gasket.hp = Math.min(gasket.max, gasket.hp + rec);
  }
  if (gasket.hp <= 0) nestRespawnGasket(gasket, now);
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
    sliceSheet("/game/tiles/forest.png?v=hd", 2, 2),
    sliceSheet("/game/tiles/forest-fog.png?v=hd", 2, 1),
  ]);
  return { floor, fog };
}

export async function loadForestFoe(kind: NonNullable<NestFoe["kind"]>) {
  const { buildFoe } = await import("./foe3d");
  return buildFoe(kind);
}
