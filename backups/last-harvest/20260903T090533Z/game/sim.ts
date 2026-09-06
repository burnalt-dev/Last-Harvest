import { BIOMES, applyDef, derive, type BiomeId, type WeaponId } from "./data";
import { DIR, faceTo } from "./iso";
import { starterLoadout, type Loadout, legsKind } from "./parts";

export type Tile = 0 | 1 | 2 | 3;
export type Enemy = {
  id: number;
  x: number;
  y: number;
  hp: number;
  max: number;
  dmg: number;
  def: number;
  dir: number;
  kind: "small" | "big" | "elite";
  parry: number;
  dodge: number;
  stunned: number;
};

export type Dungeon = {
  w: number;
  h: number;
  floor: number;
  biome: BiomeId;
  tiles: Tile[];
  vis: Uint8Array;
  seen: Uint8Array;
  px: number;
  py: number;
  pdir: number;
  php: number;
  pmax: number;
  energy: number;
  emax: number;
  cx: number;
  cy: number;
  chp: number;
  cmax: number;
  mounted: boolean;
  enemies: Enemy[];
  shinies: { x: number; y: number; taken: boolean }[];
  scrap: number;
  ore: number;
  xp: number;
  xpNeed: number;
  waitCannon: boolean;
  flood: number;
  log: string;
  aiming: boolean;
  turn: number;
};

export type Pilot = {
  level: number;
  stur: number;
  avo: number;
  per: number;
  hp: number;
  max: number;
  weapon: WeaponId;
  loadout: Loadout;
  programs: [string, string];
  earthScrip: number;
  name: string;
};

export function newPilot(): Pilot {
  const st = derive(1, 1, 1);
  return {
    level: 1,
    stur: 1,
    avo: 1,
    per: 1,
    hp: st.hp,
    max: st.hp,
    weapon: "blade",
    loadout: starterLoadout(),
    programs: ["nanobot", "charge"],
    earthScrip: 0,
    name: "Solace",
  };
}

function idx(d: Dungeon, x: number, y: number) {
  return y * d.w + x;
}
export function at(d: Dungeon, x: number, y: number) {
  if (x < 0 || y < 0 || x >= d.w || y >= d.h) return 1 as Tile;
  return d.tiles[idx(d, x, y)]!;
}
export function walkable(d: Dungeon, x: number, y: number, ignore?: Enemy) {
  const t = at(d, x, y);
  if (t === 1) return false;
  if (d.enemies.some((e) => e !== ignore && e.hp > 0 && e.x === x && e.y === y)) return false;
  if (d.px === x && d.py === y) return false;
  return true;
}

function plantTrees(d: Dungeon, rng: () => number, stair: { x: number; y: number }) {
  for (let y = 1; y < d.h - 1; y++) {
    for (let x = 1; x < d.w - 1; x++) {
      if (d.tiles[idx(d, x, y)] !== 0) continue;
      if (x === d.px && y === d.py) continue;
      if (x === stair.x && y === stair.y) continue;
      if (Math.abs(x - d.px) + Math.abs(y - d.py) < 2) continue;
      let n = 0;
      if (d.tiles[idx(d, x - 1, y)] !== 1) n++;
      if (d.tiles[idx(d, x + 1, y)] !== 1) n++;
      if (d.tiles[idx(d, x, y - 1)] !== 1) n++;
      if (d.tiles[idx(d, x, y + 1)] !== 1) n++;
      if (n < 4) continue;
      if (rng() < 0.14) d.tiles[idx(d, x, y)] = 1;
    }
  }
}

function carve(d: Dungeon, rng: () => number) {
  const { w, h } = d;
  d.tiles.fill(1);
  const rooms: { x: number; y: number; rw: number; rh: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const rw = 3 + Math.floor(rng() * 4);
    const rh = 3 + Math.floor(rng() * 4);
    const x = 1 + Math.floor(rng() * (w - rw - 2));
    const y = 1 + Math.floor(rng() * (h - rh - 2));
    rooms.push({ x, y, rw, rh });
    for (let yy = y; yy < y + rh; yy++)
      for (let xx = x; xx < x + rw; xx++) d.tiles[idx(d, xx, yy)] = rng() < 0.08 ? 3 : 0;
  }
  const centers = rooms.map((r) => ({ x: (r.x + r.rw / 2) | 0, y: (r.y + r.rh / 2) | 0 }));
  for (let i = 1; i < centers.length; i++) {
    let { x, y } = centers[i - 1]!;
    const t = centers[i]!;
    while (x !== t.x) {
      x += Math.sign(t.x - x);
      d.tiles[idx(d, x, y)] = 0;
    }
    while (y !== t.y) {
      y += Math.sign(t.y - y);
      d.tiles[idx(d, x, y)] = 0;
    }
  }
  const last = centers[centers.length - 1]!;
  d.tiles[idx(d, last.x, last.y)] = 2;
  d.px = centers[0]!.x;
  d.py = centers[0]!.y;
  d.cx = d.px;
  d.cy = d.py;
  if (d.biome === "forest") plantTrees(d, rng, last);
  return last;
}

export function makeDungeon(biome: BiomeId, floor: number, pilot: Pilot, seed = Date.now()): Dungeon {
  let s = seed >>> 0;
  const rng = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const stats = derive(pilot.stur, pilot.avo, pilot.per);
  const d: Dungeon = {
    w: 13,
    h: 13,
    floor,
    biome,
    tiles: new Array(13 * 13).fill(1),
    vis: new Uint8Array(13 * 13),
    seen: new Uint8Array(13 * 13),
    px: 1,
    py: 1,
    pdir: 0,
    php: pilot.hp,
    pmax: stats.hp,
    energy: 24,
    emax: 24,
    cx: 1,
    cy: 1,
    chp: 22,
    cmax: 22,
    mounted: false,
    enemies: [],
    shinies: [],
    scrap: 0,
    ore: 0,
    xp: 0,
    xpNeed: 90 + pilot.level * 40,
    waitCannon: false,
    flood: 0,
    log: `${BIOMES[biome].planet} · deck ${floor}`,
    aiming: false,
    turn: 0,
  };
  const stair = carve(d, rng);
  const dens = 8 + floor * 3;
  let n = 0;
  let tries = 0;
  while (n < dens && tries++ < 400) {
    const x = 1 + Math.floor(rng() * (d.w - 2));
    const y = 1 + Math.floor(rng() * (d.h - 2));
    if (at(d, x, y) !== 0) continue;
    if (Math.abs(x - d.px) + Math.abs(y - d.py) < 3) continue;
    const elite = floor === 3 && n === 0;
    const big = elite || rng() < 0.28;
    const hp = elite ? 55 + floor * 10 : big ? 28 + floor * 6 : 12 + floor * 4;
    d.enemies.push({
      id: n,
      x,
      y,
      hp,
      max: hp,
      dmg: elite ? 12 + floor * 3 : big ? 8 + floor * 2 : 5 + floor,
      def: elite ? 6 : big ? 4 : 2,
      dir: Math.floor(rng() * 4),
      kind: elite ? "elite" : big ? "big" : "small",
      parry: elite ? 0.12 : 0,
      dodge: elite ? 0.1 : 0,
      stunned: 0,
    });
    n++;
  }
  for (let i = 0; i < 7; i++) {
    const x = 1 + Math.floor(rng() * (d.w - 2));
    const y = 1 + Math.floor(rng() * (d.h - 2));
    if (at(d, x, y) === 0) d.shinies.push({ x, y, taken: false });
  }
  reveal(d, pilot);
  return d;
}

export function reveal(d: Dungeon, pilot: Pilot) {
  const r = derive(pilot.stur, pilot.avo, pilot.per).radar;
  d.vis.fill(0);
  for (let y = 0; y < d.h; y++)
    for (let x = 0; x < d.w; x++) {
      if (Math.abs(x - d.px) + Math.abs(y - d.py) <= r) {
        d.vis[idx(d, x, y)] = 1;
        d.seen[idx(d, x, y)] = 1;
      }
    }
}

export type Fx =
  | { k: "slash"; x: number; y: number; t: number }
  | { k: "bolt"; x0: number; y0: number; x1: number; y1: number; t: number }
  | { k: "banner"; text: string; good: boolean; t: number }
  | { k: "charge"; path: { x: number; y: number }[]; t: number };

function occEnemy(d: Dungeon, x: number, y: number) {
  return d.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
}

function bumpTurn(d: Dungeon, pilot: Pilot) {
  d.turn++;
  const rec = derive(pilot.stur, pilot.avo, pilot.per).recovery;
  d.energy = Math.min(d.emax, d.energy + rec);
  d.php = Math.min(d.pmax, d.php + rec * 0.15);
  reveal(d, pilot);
}

export function playerAct(
  d: Dungeon,
  pilot: Pilot,
  dx: number,
  dy: number,
  fx: Fx[],
): "ok" | "dead" | "stairs" {
  if (d.aiming) return "ok";
  const nx = d.px + dx;
  const ny = d.py + dy;
  d.pdir = faceTo(d.px, d.py, nx, ny);
  const foe = occEnemy(d, nx, ny);
  if (foe) {
    strike(d, pilot, foe, fx);
  } else if (walkable(d, nx, ny)) {
    const leap = legsKind(pilot.loadout.legs) === "rj" ? 2 : 1;
    let tx = nx;
    let ty = ny;
    if (leap === 2 && walkable(d, nx + dx, ny + dy) && !occEnemy(d, nx + dx, ny + dy)) {
      tx = nx + dx;
      ty = ny + dy;
    }
    d.px = tx;
    d.py = ty;
    if (!d.mounted) {
      const cx = d.cx + Math.sign(d.px - d.cx);
      const cy = d.cy + Math.sign(d.py - d.cy);
      if (walkable(d, cx, d.cy) || cx === d.px) d.cx = cx;
      if (walkable(d, d.cx, cy) || cy === d.py) d.cy = cy;
    } else {
      d.cx = d.px;
      d.cy = d.py;
    }
    const sh = d.shinies.find((s) => !s.taken && s.x === d.px && s.y === d.py);
    if (sh) {
      sh.taken = true;
      d.energy = Math.min(d.emax, d.energy + 6);
      d.ore++;
      d.log = "Shiny · energy + ore";
    }
  }
  if (at(d, d.px, d.py) === 2) return "stairs";
  bumpTurn(d, pilot);
  if (d.php <= 0) return "dead";
  return "ok";
}

function strike(d: Dungeon, pilot: Pilot, foe: Enemy, fx: Fx[]) {
  const st = derive(pilot.stur, pilot.avo, pilot.per);
  if (Math.random() < foe.dodge) {
    fx.push({ k: "banner", text: "DODGE", good: false, t: 0.6 });
    d.log = "They slipped.";
    return;
  }
  if (Math.random() < foe.parry) {
    fx.push({ k: "banner", text: "PARRY", good: false, t: 0.6 });
    d.log = "Caught on bone.";
    return;
  }
  const dmg = applyDef(st.melee, foe.def, 0);
  foe.hp -= dmg;
  fx.push({ k: "slash", x: foe.x, y: foe.y, t: 0.25 });
  d.xp += foe.kind === "elite" ? 24 : foe.kind === "big" ? 12 : 6;
  d.log = `Hit ${dmg}`;
  if (foe.hp <= 0) d.log = "Down.";
}

export function descend(d: Dungeon, pilot: Pilot) {
  if (d.floor >= 3) return null;
  return makeDungeon(d.biome, d.floor + 1, { ...pilot, hp: d.php });
}

export function skillNanobot(d: Dungeon) {
  if (d.energy < 8) {
    d.log = "No energy.";
    return;
  }
  d.energy -= 8;
  d.php = Math.min(d.pmax, d.php + 8);
  d.chp = Math.min(d.cmax, d.chp + 6);
  d.log = "Nanobots. Inefficient.";
}

export function skillCharge(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  if (d.energy < 5) {
    d.log = "No energy.";
    return;
  }
  d.energy -= 5;
  const dir = DIR[d.pdir]!;
  const path: { x: number; y: number }[] = [];
  let x = d.px;
  let y = d.py;
  for (let i = 0; i < 8; i++) {
    const nx = x + dir.x;
    const ny = y + dir.y;
    const foe = occEnemy(d, nx, ny);
    if (foe) {
      strike(d, pilot, foe, fx);
      path.push({ x: nx, y: ny });
      d.px = nx;
      d.py = ny;
      break;
    }
    if (at(d, nx, ny) === 1) break;
    x = nx;
    y = ny;
    path.push({ x, y });
    d.px = x;
    d.py = y;
  }
  fx.push({ k: "charge", path, t: 0.4 });
  reveal(d, pilot);
}

export { DIR };
