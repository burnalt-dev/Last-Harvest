import { BIOMES, applyDef, derive, type BiomeId, type WeaponId } from "./data";
import { DIR, faceTo } from "./iso";
import { starterLoadout, meleeAttack, type Loadout } from "./parts";
import { add, emptyBag, type Bag } from "./inventory";
import { rollKill, rollShiny } from "./items";
import { SKILLGRAMS } from "./skillgrams";
import { type Pilot } from "./pilot";
export type { Pilot };

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
  kind: "small" | "big" | "elite" | "smith";
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
  gasketMode: "follow" | "hold" | "mount";
  bag: Bag;
  enemies: Enemy[];
  shinies: { x: number; y: number; taken: boolean }[];
  anvils: { x: number; y: number }[];
  scrap: number;
  ore: number;
  xp: number;
  xpNeed: number;
  waitCannon: boolean;
  flood: number;
  log: string;
  aiming: boolean;
  lastAimId: number;
  turn: number;
  withdraw: number;
};

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
    gasketMode: "follow",
    bag: emptyBag(),
    enemies: [],
    shinies: [],
    anvils: [],
    scrap: 0,
    ore: 0,
    xp: 0,
    xpNeed: 90 + pilot.level * 40,
    waitCannon: false,
    flood: 0,
    log: `${BIOMES[biome].planet} · deck ${floor}`,
    aiming: false,
    lastAimId: -1,
    turn: 0,
    withdraw: 0,
  };
  const stair = carve(d, rng);
  if (d.biome === "forest") {
    let a = 0;
    let attries = 0;
    while (a < 3 && attries++ < 200) {
      const x = 1 + Math.floor(rng() * (d.w - 2));
      const y = 1 + Math.floor(rng() * (d.h - 2));
      if (at(d, x, y) !== 0) continue;
      if (Math.abs(x - d.px) + Math.abs(y - d.py) < (a === 0 ? 2 : 4)) continue;
      if (d.anvils.some((p) => p.x === x && p.y === y)) continue;
      d.anvils.push({ x, y });
      a++;
    }
  }
  const dens = 8 + floor * 3;
  let n = 0;
  for (const an of d.anvils) {
    d.enemies.push({
      id: n++,
      x: an.x,
      y: an.y,
      hp: 28 + floor * 6,
      max: 28 + floor * 6,
      dmg: 8 + floor * 2,
      def: 4,
      dir: Math.floor(rng() * 4),
      kind: "smith",
      parry: 0,
      dodge: 0,
      stunned: 0,
    });
  }
  let tries = 0;
  while (n < dens && tries++ < 400) {
    const x = 1 + Math.floor(rng() * (d.w - 2));
    const y = 1 + Math.floor(rng() * (d.h - 2));
    if (at(d, x, y) !== 0) continue;
    if (Math.abs(x - d.px) + Math.abs(y - d.py) < 3) continue;
    if (d.anvils.some((p) => p.x === x && p.y === y)) continue;
    if (d.enemies.some((e) => e.x === x && e.y === y)) continue;
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

function interruptWithdraw(d: Dungeon, fx: Fx[]) {
  if (d.withdraw <= 0) return;
  d.withdraw = 0;
  d.log = "Withdraw broken — a hit landed.";
  fx.push({ k: "banner", text: "BROKEN", good: false, t: 0.7 });
}

function hitPlayer(d: Dungeon, pilot: Pilot, foe: Enemy, fx: Fx[]) {
  const st = derive(pilot.stur, pilot.avo, pilot.per);
  if (Math.random() < st.parry) {
    fx.push({ k: "banner", text: "PARRY", good: true, t: 0.6 });
    d.log = "Parry.";
    return;
  }
  if (Math.random() < st.dodge) {
    foe.stunned = 1;
    fx.push({ k: "banner", text: "DODGE", good: true, t: 0.6 });
    d.log = "Dodge.";
    return;
  }
  const dmg = applyDef(foe.dmg, st.def, st.shield);
  d.php -= dmg;
  interruptWithdraw(d, fx);
  fx.push({ k: "banner", text: `-${dmg}`, good: false, t: 0.4 });
  d.log = `Took ${dmg}`;
}

function enemiesAct(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  for (const e of d.enemies) {
    if (e.hp <= 0) continue;
    if (e.stunned > 0) {
      e.stunned--;
      continue;
    }
    const man = Math.abs(e.x - d.px) + Math.abs(e.y - d.py);
    if (man === 1) {
      hitPlayer(d, pilot, e, fx);
      continue;
    }
    const dx = Math.sign(d.px - e.x);
    const dy = Math.sign(d.py - e.y);
    const tryX = e.x + dx;
    const tryY = e.y + dy;
    if (dx && walkable(d, tryX, e.y, e) && !(tryX === d.px && e.y === d.py)) e.x = tryX;
    else if (dy && walkable(d, e.x, tryY, e) && !(e.x === d.px && tryY === d.py)) e.y = tryY;
  }
}

function gasketBolt(d: Dungeon, fx: Fx[]) {
  if (!d.mounted || d.chp <= 0) return;
  const foe = nearestVisibleFoe(d);
  if (!foe) return;
  const dmg = applyDef(3, foe.def, 0);
  foe.hp -= dmg;
  fx.push({ k: "bolt", x0: d.px, y0: d.py, x1: foe.x, y1: foe.y, t: 0.2 });
  d.log = `Gasket nipped ${dmg}`;
}

export function tickRound(d: Dungeon, pilot: Pilot, fx: Fx[], keepCannon = false): "ok" | "dead" | "withdraw" {
  bumpTurn(d, pilot, keepCannon);
  gasketBolt(d, fx);
  enemiesAct(d, pilot, fx);
  if (d.php <= 0) return "dead";
  if (d.withdraw > 0) {
    d.withdraw--;
    if (d.withdraw <= 0) {
      d.log = "Launch.";
      return "withdraw";
    }
    d.log = `Withdraw ${d.withdraw}`;
  }
  return "ok";
}

export function startWithdraw(d: Dungeon) {
  d.withdraw = 5;
  d.log = "Withdraw spooling · 5";
}

export function abortWithdraw(d: Dungeon) {
  d.withdraw = 0;
  d.log = "Withdraw aborted.";
}

export function bankHaul(pilot: Pilot, d: Dungeon) {
  for (const [id, n] of Object.entries(d.bag)) add(pilot.stash, id, n);
}

function bumpTurn(d: Dungeon, pilot: Pilot, keepCannon = false) {
  if (!keepCannon) d.waitCannon = false;
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
): "ok" | "dead" | "stairs" | "withdraw" {
  if (d.aiming) return "ok";
  const nx = d.px + dx;
  const ny = d.py + dy;
  d.pdir = faceTo(d.px, d.py, nx, ny);
  const foe = occEnemy(d, nx, ny);
  if (foe) {
    strike(d, pilot, foe, fx);
  } else if (walkable(d, nx, ny)) {
    const leap = pilot.loadout.legs === "p004" ? 2 : 1;
    let tx = nx;
    let ty = ny;
    if (leap === 2 && walkable(d, nx + dx, ny + dy) && !occEnemy(d, nx + dx, ny + dy)) {
      tx = nx + dx;
      ty = ny + dy;
    }
    d.px = tx;
    d.py = ty;
    if (d.gasketMode === "mount" || d.mounted) {
      d.cx = d.px;
      d.cy = d.py;
    } else if (d.gasketMode === "follow") {
      const cx = d.cx + Math.sign(d.px - d.cx);
      const cy = d.cy + Math.sign(d.py - d.cy);
      if (walkable(d, cx, d.cy) || cx === d.px) d.cx = cx;
      if (walkable(d, d.cx, cy) || cy === d.py) d.cy = cy;
    }
    const sh = d.shinies.find((s) => !s.taken && s.x === d.px && s.y === d.py);
    if (sh) {
      sh.taken = true;
      const loot = rollShiny(d.biome);
      d.energy = Math.min(d.emax, d.energy + loot.energy);
      add(d.bag, loot.id);
      d.ore = d.bag.r004 ?? 0;
      d.scrap = d.bag.r001 ?? 0;
      d.log = loot.id === "r004" ? "Shiny · bloom-ore" : "Shiny · splinter";
    }
  }
  if (at(d, d.px, d.py) === 2) return "stairs";
  return tickRound(d, pilot, fx);
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
  d.log = `Hit ${dmg}`;
  if (foe.hp <= 0) {
    const drop = rollKill(foe.kind);
    if (drop) {
      add(d.bag, drop);
      d.ore = d.bag.r004 ?? 0;
      d.scrap = d.bag.r001 ?? 0;
    }
    d.log = drop === "r004" ? "Down · bloom-ore" : drop === "r001" ? "Down · splinter" : "Down.";
  }
}

export function descend(_d: Dungeon, _pilot: Pilot) {
  return null;
}

export function skillNanobot(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  const p = SKILLGRAMS.sg001!;
  if (d.energy < p.energy) {
    d.log = "No energy.";
    return "ok" as const;
  }
  d.energy -= p.energy;
  d.php = Math.min(d.pmax, d.php + 8);
  d.chp = Math.min(d.cmax, d.chp + 6);
  d.log = "Nanobots. Inefficient.";
  return tickRound(d, pilot, fx);
}

export function setGasketMode(d: Dungeon, mode: Dungeon["gasketMode"]) {
  d.gasketMode = mode;
  d.mounted = mode === "mount";
  if (d.mounted) {
    d.cx = d.px;
    d.cy = d.py;
  }
  d.log = mode === "mount" ? "Gasket locked to rear plate." : mode === "hold" ? "Gasket hold." : "Gasket follow.";
}

function tilesAhead(d: Dungeon, n: number) {
  const dir = DIR[d.pdir]!;
  const out: { x: number; y: number }[] = [];
  for (let i = 1; i <= n; i++) out.push({ x: d.px + dir.x * i, y: d.py + dir.y * i });
  return out;
}

function meleeTiles(d: Dungeon, shape: "wide" | "line", n: number) {
  const f = DIR[d.pdir]!;
  if (shape === "line") return tilesAhead(d, n);
  const side = { x: -f.y, y: f.x };
  const ax = d.px + f.x;
  const ay = d.py + f.y;
  const out = [{ x: ax, y: ay }];
  for (let i = 1; i <= Math.floor((n - 1) / 2); i++) {
    out.push({ x: ax + side.x * i, y: ay + side.y * i });
    out.push({ x: ax - side.x * i, y: ay - side.y * i });
  }
  return out;
}

function hitTile(d: Dungeon, pilot: Pilot, x: number, y: number, fx: Fx[], scythe = false) {
  const foe = occEnemy(d, x, y);
  if (foe) strike(d, pilot, foe, fx);
  if (scythe && d.cx === x && d.cy === y && !d.mounted) {
    d.chp = Math.max(0, d.chp - 6);
    fx.push({ k: "banner", text: "GASKET", good: false, t: 0.5 });
    d.log = "Scythe clipped Gasket.";
  }
}

export function swingBlade(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  const [t] = tilesAhead(d, 1);
  if (t) hitTile(d, pilot, t.x, t.y, fx);
  return tickRound(d, pilot, fx);
}

export function swingAttack(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  const pat = meleeAttack(pilot.loadout);
  if (!pat) {
    d.log = "No two-hand melee.";
    return "ok" as const;
  }
  for (const t of meleeTiles(d, pat.shape, pat.n)) hitTile(d, pilot, t.x, t.y, fx, true);
  return tickRound(d, pilot, fx);
}

export function swingScythe(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  return swingAttack(d, pilot, fx);
}

export function fireCannon(d: Dungeon, pilot: Pilot, tx: number, ty: number, fx: Fx[]) {
  if (d.waitCannon) {
    d.log = "Lance cycling.";
    d.aiming = false;
    return tickRound(d, pilot, fx);
  }
  d.aiming = false;
  d.waitCannon = true;
  const foe = occEnemy(d, tx, ty);
  if (foe) d.lastAimId = foe.id;
  fx.push({ k: "bolt", x0: d.px, y0: d.py, x1: tx, y1: ty, t: 0.35 });
  const acc = derive(pilot.stur, pilot.avo, pilot.per).acc;
  if (foe && Math.random() > acc) {
    d.log = "Lance wide.";
    fx.push({ k: "banner", text: "MISS", good: false, t: 0.45 });
  } else if (foe) strike(d, pilot, foe, fx);
  else d.log = "Lance into dirt.";
  return tickRound(d, pilot, fx, true);
}

function seenAt(d: Dungeon, x: number, y: number) {
  return x >= 0 && y >= 0 && x < d.w && y < d.h && d.vis[y * d.w + x] === 1;
}

function nearestVisibleFoe(d: Dungeon) {
  let best: Enemy | null = null;
  let bestD = 99;
  for (const e of d.enemies) {
    if (e.hp <= 0 || !seenAt(d, e.x, e.y)) continue;
    const m = Math.abs(e.x - d.px) + Math.abs(e.y - d.py);
    if (m < bestD) {
      bestD = m;
      best = e;
    }
  }
  return best;
}

export function shootRepeat(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  const last = d.enemies.find((e) => e.id === d.lastAimId && e.hp > 0);
  const locked = last && seenAt(d, last.x, last.y) ? last : null;
  const foe = locked ?? nearestVisibleFoe(d);
  if (!foe) {
    d.log = "No target.";
    d.aiming = false;
    return "ok" as const;
  }
  d.lastAimId = foe.id;
  return fireCannon(d, pilot, foe.x, foe.y, fx);
}

export function skillCharge(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  const p = SKILLGRAMS.sg002!;
  if (d.energy < p.energy) {
    d.log = "No energy.";
    return "ok" as const;
  }
  setGasketMode(d, "mount");
  d.energy -= p.energy;
  const dir = DIR[d.pdir]!;
  const path: { x: number; y: number }[] = [];
  let x = d.px;
  let y = d.py;
  for (let i = 0; i < 6; i++) {
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
  if (d.mounted) {
    d.cx = d.px;
    d.cy = d.py;
  }
  return tickRound(d, pilot, fx);
}

export { DIR };
