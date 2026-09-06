import { BIOMES, FOE_NAME, applyDef, runMods, statsOf, type BiomeId, type Difficulty } from "./data";
import { afterWalk, bootRoam } from "./roam";
import { DIR, faceTo } from "./iso";
import { manhToTile, pickLanceOnTile, stepSmallToward, toQuarter, type SmallCell } from "./grid";
import { roleOf, tickKernel, type AiActor, type AiWorld, type GasketCmd } from "./ai";
import { starterLoadout, meleeAttack, cannonHands, type Loadout } from "./parts";
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
  /** ¼-square quadrant 0..3. Small foes only. */
  sub: number;
  parry: number;
  dodge: number;
  stunned: number;
  ai?: "idle" | "alert" | "hunt" | "attack";
  seen?: boolean;
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
  /** ¼-square quadrant. Floor occupancy while unmounted. */
  csub: number;
  chp: number;
  cmax: number;
  mounted: boolean;
  gasketMode: "follow" | "hold" | "mount" | "focus";
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
  aimX: number;
  aimY: number;
  aimSub: number;
  turn: number;
  withdraw: number;
  difficulty: Difficulty;
  walks: number;
  nextRoamAt: number;
  nextShipAt: number;
  shipCalls: number;
  flags: string[];
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
  if (d.enemies.some((e) => e !== ignore && e.hp > 0 && e.x === x && e.y === y && e.kind !== "small")) return false;
  if (d.px === x && d.py === y) return false;
  return true;
}

/** ¼-cell walk for Gasket + Stripekin. Full-tile units occupy every sub. */
export function walkableSmall(d: Dungeon, dest: SmallCell, ignore?: Enemy, skipGasket = false) {
  if (at(d, dest.x, dest.y) === 1) return false;
  for (const e of d.enemies) {
    if (e === ignore || e.hp <= 0) continue;
    if (e.x !== dest.x || e.y !== dest.y) continue;
    if (e.kind !== "small") return false;
    if (e.sub === dest.sub) return false;
  }
  if (!skipGasket && d.gasketMode !== "mount" && d.chp > 0 && d.cx === dest.x && d.cy === dest.y && d.csub === dest.sub) return false;
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
  const stats = statsOf(pilot);
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
    csub: 1,
    chp: runMods(pilot.difficulty ?? "default").gasketMax,
    cmax: runMods(pilot.difficulty ?? "default").gasketMax,
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
    aimX: -1,
    aimY: -1,
    aimSub: -1,
    turn: 0,
    withdraw: 0,
    difficulty: pilot.difficulty ?? "default",
    walks: 0,
    nextRoamAt: 8,
    nextShipAt: 12,
    shipCalls: 0,
    flags: [],
  };
  bootRoam(d);
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
  const smallHp = 12 + floor * 4;
  const smallDmg = 5 + floor;
  const pushSmall = (x: number, y: number, sub: number) => {
    d.enemies.push({
      id: n++,
      x,
      y,
      hp: smallHp,
      max: smallHp,
      dmg: smallDmg,
      def: 2,
      dir: Math.floor(rng() * 4),
      kind: "small",
      sub,
      parry: 0,
      dodge: 0,
      stunned: 0,
    });
  };
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
      sub: 0,
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
    const here = d.enemies.filter((e) => e.x === x && e.y === y && e.hp > 0);
    if (here.some((e) => e.kind !== "small")) continue;
    const used = new Set(here.filter((e) => e.kind === "small").map((e) => e.sub));
    if (used.size >= 4) continue;
    if (used.size > 0 && rng() > 0.7) continue;
    const elite = floor === 3 && n === 0;
    const big = elite || rng() < 0.28;
    if (big && used.size) continue;
    if (!big) {
      let sub = 0;
      while (used.has(sub) && sub < 4) sub++;
      pushSmall(x, y, sub);
      if (rng() < 0.55 && n < dens) {
        let s2 = sub + 1;
        while (used.has(s2) && s2 < 4) s2++;
        if (s2 < 4) pushSmall(x, y, s2);
      }
      continue;
    }
    const hp = elite ? 55 + floor * 10 : 28 + floor * 6;
    d.enemies.push({
      id: n++,
      x,
      y,
      hp,
      max: hp,
      dmg: elite ? 12 + floor * 3 : 8 + floor * 2,
      def: elite ? 6 : 4,
      dir: Math.floor(rng() * 4),
      kind: elite ? "elite" : "big",
      sub: 0,
      parry: elite ? 0.12 : 0,
      dodge: elite ? 0.1 : 0,
      stunned: 0,
    });
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
  const r = statsOf(pilot).radar;
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
  | { k: "bolt"; x0: number; y0: number; x1: number; y1: number; t: number; side?: number }
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
  const st = statsOf(pilot);
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
  const sh = Math.min(0.9, st.shield + (pilot.loadout.handL === "p007" || pilot.loadout.handR === "p007" ? 0.08 : 0));
  const dmg = applyDef(foe.dmg, st.def, sh);
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
    if (e.kind === "small") {
      const me: SmallCell = { x: e.x, y: e.y, sub: e.sub };
      if (manhToTile(me, d.px, d.py) <= 1) {
        hitPlayer(d, pilot, e, fx);
        continue;
      }
      const next = stepSmallToward(me, { x: d.px, y: d.py, sub: 0 });
      if (walkableSmall(d, next, e)) {
        e.dir = faceTo(e.x, e.y, next.x === e.x ? d.px : next.x, next.y === e.y ? d.py : next.y);
        e.x = next.x;
        e.y = next.y;
        e.sub = next.sub;
      }
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
  let foe: Enemy | null = null;
  let best = 99;
  for (const e of d.enemies) {
    if (e.hp <= 0 || !seenAt(d, e.x, e.y)) continue;
    const m = Math.abs(e.x - d.px) + Math.abs(e.y - d.py);
    if (m < best) {
      best = m;
      foe = e;
    }
  }
  if (!foe) return;
  const raw = runMods(d.difficulty).gasketBolt;
  const dmg = applyDef(raw, foe.def, 0);
  foe.hp -= dmg;
  fx.push({ k: "bolt", x0: d.px, y0: d.py, x1: foe.x, y1: foe.y, t: 0.2 });
  d.log = `Gasket nipped ${dmg}`;
}

function runDungeonAi(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  const gasketLive = d.chp > 0 && d.gasketMode !== "mount" && !d.mounted;
  const gActor: AiActor | null = gasketLive
    ? {
        id: "gasket",
        team: "gasket",
        role: "gasket",
        occ: "quarter",
        x: d.cx,
        y: d.cy,
        sub: d.csub,
        dir: 0,
        hp: d.chp,
        max: d.cmax,
        state: "hunt",
        seen: true,
      }
    : null;
  const foes: AiActor[] = d.enemies
    .filter((e) => e.hp > 0)
    .map((e) => ({
      id: String(e.id),
      team: "foe" as const,
      role: roleOf(e.kind),
      occ: e.kind === "small" ? ("quarter" as const) : ("tile" as const),
      x: e.x,
      y: e.y,
      sub: e.sub,
      dir: e.dir,
      hp: e.hp,
      max: e.max,
      state: e.ai ?? "idle",
      seen: !!e.seen,
    }));
  const cmd: GasketCmd = d.gasketMode === "hold" ? "hold" : d.gasketMode === "focus" ? "focus" : "follow";
  const world: AiWorld = {
    open: false,
    visible: (x, y) => seenAt(d, x, y),
    inBounds: (x, y) => at(d, x, y) !== 1,
    blocked: (who, dest) => {
      if (at(d, dest.x, dest.y) === 1) return true;
      if (who.occ === "tile") {
        if (dest.x === d.px && dest.y === d.py) return true;
        const ignore = d.enemies.find((e) => String(e.id) === who.id);
        return !walkable(d, dest.x, dest.y, ignore);
      }
      return !walkableSmall(
        d,
        dest,
        who.team === "foe" ? d.enemies.find((e) => String(e.id) === who.id) : undefined,
        who.id === "gasket",
      );
    },
    pilot: { x: d.px, y: d.py },
    gasketCmd: cmd,
    focusId: d.lastAimId >= 0 ? String(d.lastAimId) : null,
    actors: gActor ? [gActor, ...foes] : foes,
  };
  const commits = tickKernel(world);
  for (const c of commits) {
    if (c.id === "gasket") {
      d.cx = c.x;
      d.cy = c.y;
      d.csub = c.sub;
      if (c.action === "attack" && c.targetId) {
        const foe = d.enemies.find((e) => String(e.id) === c.targetId);
        if (foe && foe.hp > 0) {
          const raw = runMods(d.difficulty).gasketBolt;
          const dmg = applyDef(raw, foe.def, 0);
          foe.hp -= dmg;
          foe.seen = true;
          foe.ai = "alert";
          fx.push({ k: "bolt", x0: d.cx, y0: d.cy, x1: foe.x, y1: foe.y, t: 0.2 });
          d.log = `Gasket nipped ${dmg}`;
        }
      }
      continue;
    }
    const e = d.enemies.find((n) => String(n.id) === c.id);
    if (!e) continue;
    e.x = c.x;
    e.y = c.y;
    e.sub = c.sub;
    e.dir = c.dir;
    e.ai = c.state;
    e.seen = c.seen;
    if (c.action === "attack") {
      if (c.targetId === "gasket" && d.chp > 0 && !d.mounted) {
        d.chp = Math.max(0, d.chp - applyDef(e.dmg, 0, 0));
        fx.push({ k: "banner", text: "GASKET", good: false, t: 0.4 });
      } else {
        hitPlayer(d, pilot, e, fx);
      }
    }
  }
}

export function tickRound(d: Dungeon, pilot: Pilot, fx: Fx[], keepCannon = false): "ok" | "dead" | "withdraw" {
  bumpTurn(d, pilot, keepCannon);
  if (d.mounted) gasketBolt(d, fx);
  runDungeonAi(d, pilot, fx);
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

export function waitTurn(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  d.log = "Wait.";
  return tickRound(d, pilot, fx);
}

/** Adjacent shiny only. No new loot tables / HP invent. Empty harvest does not spend the turn. */
export function harvestHere(d: Dungeon, pilot: Pilot, fx: Fx[]): "ok" | "dead" | "withdraw" {
  const near = d.shinies.find((s) => !s.taken && Math.abs(s.x - d.px) + Math.abs(s.y - d.py) <= 1);
  if (!near) {
    d.log = "Nothing to harvest.";
    return "ok";
  }
  near.taken = true;
  const loot = rollShiny(d.biome);
  d.energy = Math.min(d.emax, d.energy + loot.energy);
  add(d.bag, loot.id);
  d.ore = d.bag.r004 ?? 0;
  d.scrap = d.bag.r001 ?? 0;
  d.log = loot.id === "r004" ? "Harvest · bloom-ore" : "Harvest · splinter";
  fx.push({ k: "banner", text: "HAUL", good: true, t: 0.4 });
  return tickRound(d, pilot, fx);
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
  const rec = statsOf(pilot).recovery;
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
    afterWalk(d, pilot, fx);
  }
  if (at(d, d.px, d.py) === 2) return "stairs";
  return tickRound(d, pilot, fx);
}

function strike(d: Dungeon, pilot: Pilot, foe: Enemy, fx: Fx[]) {
  const st = statsOf(pilot);
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
  foe.seen = true;
  foe.ai = "alert";
  d.lastAimId = foe.id;
  fx.push({ k: "slash", x: foe.x, y: foe.y, t: 0.25 });
  d.log = `Hit ${dmg}`;
  if (foe.hp <= 0) {
    const drop = rollKill(foe.kind);
    if (drop) {
      add(d.bag, drop);
      d.ore = d.bag.r004 ?? 0;
      d.scrap = d.bag.r001 ?? 0;
    }
    d.log = drop === "r004" ? `${FOE_NAME[foe.kind]} down · bloom-ore` : drop === "r001" ? `${FOE_NAME[foe.kind]} down · splinter` : `${FOE_NAME[foe.kind]} down.`;
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
  d.log =
    mode === "mount"
      ? "Gasket locked to rear plate."
      : mode === "hold"
        ? "Gasket hold."
        : mode === "focus"
          ? "Gasket focus."
          : "Gasket follow.";
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
  const pack = scythe
    ? d.enemies.filter((e) => e.hp > 0 && e.x === x && e.y === y)
    : (() => {
        const one = occEnemy(d, x, y);
        return one ? [one] : [];
      })();
  for (const foe of pack) strike(d, pilot, foe, fx);
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

function seenAt(d: Dungeon, x: number, y: number) {
  return x >= 0 && y >= 0 && x < d.w && y < d.h && d.vis[y * d.w + x] === 1;
}

function lancePack(d: Dungeon) {
  return d.enemies.map((e) => ({
    id: e.id,
    x: e.x,
    y: e.y,
    sub: e.sub,
    hp: e.hp,
    small: e.kind === "small",
  }));
}

export function lockAim(d: Dungeon, tx: number, ty: number) {
  if (!seenAt(d, tx, ty)) {
    d.log = "Not on scope.";
    return;
  }
  const pick = pickLanceOnTile(lancePack(d), tx, ty, d.px, d.py);
  if (!pick) {
    d.log = "No target.";
    d.lastAimId = -1;
    d.aimX = tx;
    d.aimY = ty;
    d.aimSub = 0;
    return;
  }
  d.lastAimId = pick.id;
  d.aimX = pick.x;
  d.aimY = pick.y;
  d.aimSub = pick.small ? pick.sub : 0;
  const foe = d.enemies.find((e) => e.id === pick.id);
  d.log = foe ? `Lock · ${FOE_NAME[foe.kind]}` : "Lock.";
}

export function fireCannon(d: Dungeon, pilot: Pilot, tx: number, ty: number, fx: Fx[]) {
  if (d.waitCannon) {
    d.log = "Lance cycling.";
    return "ok" as const;
  }
  const sticky = stickyLance(d);
  const onTile = sticky && sticky.x === tx && sticky.y === ty ? sticky : null;
  const pick = onTile ?? (() => {
    const p = pickLanceOnTile(lancePack(d), tx, ty, d.px, d.py);
    return p ? d.enemies.find((e) => e.id === p.id && e.hp > 0) : undefined;
  })();
  const foe = pick;
  if (!foe) {
    d.log = "No target.";
    return "ok" as const;
  }
  if (!seenAt(d, foe.x, foe.y)) {
    d.log = "Not on scope.";
    return "ok" as const;
  }
  const guns = cannonHands(pilot.loadout);
  if (!guns.r && !guns.l) {
    d.log = "No cannon.";
    return "ok" as const;
  }
  d.waitCannon = true;
  stampAim(d, foe);
  const st = statsOf(pilot);
  const dual = guns.dual;
  if (dual) {
    let total = 0;
    let hits = 0;
    const raw = st.melee * 0.5;
    for (let i = 0; i < 4; i++) {
      fx.push({ k: "bolt", x0: d.px, y0: d.py, x1: tx, y1: ty, t: 0.16 + i * 0.07, side: i % 2 === 0 ? 1 : -1 });
      if (Math.random() > st.acc) continue;
      hits += 1;
      const dmg = Math.max(0, Math.round(raw - foe.def));
      total += dmg;
      foe.hp -= dmg;
    }
    if (hits === 0) {
      d.log = "Volley wide.";
      fx.push({ k: "banner", text: "MISS", good: false, t: 0.45 });
    } else {
      fx.push({ k: "banner", text: `VOLLEY ${total}`, good: total > 0, t: 0.5 });
      d.log = total > 0 ? `Volley ${total}` : "Volley ate the armor.";
      if (foe.hp <= 0) {
        const drop = rollKill(foe.kind);
        if (drop) {
          add(d.bag, drop);
          d.ore = d.bag.r004 ?? 0;
          d.scrap = d.bag.r001 ?? 0;
        }
        d.log = drop === "r004" ? `${FOE_NAME[foe.kind]} down · bloom-ore` : drop === "r001" ? `${FOE_NAME[foe.kind]} down · splinter` : `${FOE_NAME[foe.kind]} down.`;
      }
    }
    return tickRound(d, pilot, fx, true);
  }
  const miss = Math.random() > st.acc;
  fx.push({ k: "bolt", x0: d.px, y0: d.py, x1: tx, y1: ty, t: 0.35, side: guns.l && !guns.r ? -1 : 1 });
  if (miss) {
    d.log = "Lance wide.";
    fx.push({ k: "banner", text: "MISS", good: false, t: 0.45 });
  } else strike(d, pilot, foe, fx);
  return tickRound(d, pilot, fx, true);
}

function closestLanceFoe(d: Dungeon): Enemy | null {
  const live = d.enemies.filter((e) => e.hp > 0 && seenAt(d, e.x, e.y));
  if (!live.length) return null;
  const score = (e: Enemy) => {
    const cell = { x: e.x, y: e.y, sub: e.kind === "small" ? e.sub : 0 };
    const dist = e.kind === "small" ? manhToTile(cell, d.px, d.py) : Math.abs(e.x - d.px) + Math.abs(e.y - d.py);
    const q = toQuarter(cell);
    const absdx = Math.min(Math.abs(q.qx - d.px * 2), Math.abs(q.qx - d.px * 2 - 1));
    return { e, dist, qy: q.qy, absdx, qx: q.qx };
  };
  const ranked = live.map(score);
  ranked.sort((a, b) => a.dist - b.dist || b.qy - a.qy || a.absdx - b.absdx || a.qx - b.qx);
  return ranked[0]!.e;
}

function stickyLance(d: Dungeon): Enemy | null {
  const last = d.enemies.find((e) => e.id === d.lastAimId && e.hp > 0);
  if (last && seenAt(d, last.x, last.y)) return last;
  return null;
}

function stampAim(d: Dungeon, foe: Enemy) {
  d.lastAimId = foe.id;
  d.aimX = foe.x;
  d.aimY = foe.y;
  d.aimSub = foe.kind === "small" ? foe.sub : 0;
}

export function shootRepeat(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  return shootCannon(d, pilot, fx);
}

/** Sticky lastAim if valid; else closest; empty = notice no-op (no tick). */
export function shootCannon(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  if (d.waitCannon) {
    d.log = "Lance cycling.";
    return "ok" as const;
  }
  const foe = stickyLance(d) ?? closestLanceFoe(d);
  if (!foe) {
    d.log = "No target.";
    fx.push({ k: "banner", text: "NO TARGET", good: false, t: 0.45 });
    return "ok" as const;
  }
  stampAim(d, foe);
  d.aiming = true;
  return fireCannon(d, pilot, foe.x, foe.y, fx);
}

export function fireSkillgram(d: Dungeon, pilot: Pilot, fx: Fx[], slot: 0 | 1) {
  const id = pilot.skillgrams[slot];
  if (!id) {
    d.log = "Empty slot.";
    return "ok" as const;
  }
  if (id === "sg001") return skillNanobot(d, pilot, fx);
  if (id === "sg002") return skillCharge(d, pilot, fx);
  d.log = "Unknown program.";
  return "ok" as const;
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
