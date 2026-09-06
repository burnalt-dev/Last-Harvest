import { faceSmall, manhSmall, manhToTile, stepSmallToward, type SmallCell } from "./grid";

export type AiState = "idle" | "alert" | "hunt" | "attack";
export type AiAction = "move" | "attack" | "wait";
export type GasketCmd = "follow" | "hold" | "focus";
export type Occupancy = "quarter" | "tile";
export type AiRole = "stripekin" | "barkback" | "sapjaw" | "antlerkin" | "rootwarden" | "gasket" | "dummy";

export type AiActor = {
  id: string;
  team: "foe" | "gasket";
  role: AiRole;
  occ: Occupancy;
  x: number;
  y: number;
  sub: number;
  dir: number;
  hp: number;
  max: number;
  state: AiState;
  seen: boolean;
};

export type AiPilot = { x: number; y: number } | null;

export type AiWorld = {
  open: boolean;
  visible: (x: number, y: number) => boolean;
  inBounds: (x: number, y: number) => boolean;
  blocked: (who: AiActor, dest: SmallCell) => boolean;
  pilot: AiPilot;
  gasketCmd: GasketCmd;
  focusId: string | null;
  actors: AiActor[];
};

export type AiCommit = {
  id: string;
  action: AiAction;
  x: number;
  y: number;
  sub: number;
  dir: number;
  targetId: string | null;
  state: AiState;
  seen: boolean;
};

export function roleOf(kind: string): AiRole {
  if (kind === "small" || kind === "stripekin") return "stripekin";
  if (kind === "smith" || kind === "barkback") return "barkback";
  if (kind === "sapjaw") return "sapjaw";
  if (kind === "elite" || kind === "rootwarden") return "rootwarden";
  if (kind === "big" || kind === "antlerkin") return "antlerkin";
  if (kind === "gasket") return "gasket";
  return "dummy";
}

function cellOf(a: Pick<AiActor, "x" | "y" | "sub">): SmallCell {
  return { x: a.x, y: a.y, sub: a.sub };
}

export function aiDist(a: Pick<AiActor, "x" | "y" | "sub" | "occ">, b: Pick<AiActor, "x" | "y" | "sub" | "occ">) {
  if (a.occ === "quarter" && b.occ === "quarter") return manhSmall(cellOf(a), cellOf(b));
  if (a.occ === "quarter") return manhToTile(cellOf(a), b.x, b.y);
  if (b.occ === "quarter") return manhToTile(cellOf(b), a.x, a.y);
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function face(from: SmallCell, to: { x: number; y: number; sub?: number }, keep = 0) {
  return faceSmall(from, { x: to.x, y: to.y, sub: to.sub ?? 0 }, keep);
}

function sees(world: AiWorld, a: AiActor, t: { x: number; y: number }) {
  if (world.open) return aiDist(a, { x: t.x, y: t.y, sub: 0, occ: "tile" }) <= 10;
  return world.visible(a.x, a.y);
}

function hostiles(world: AiWorld, a: AiActor) {
  return world.actors.filter((o) => o.hp > 0 && o.team !== a.team);
}

function pickFoe(world: AiWorld, a: AiActor): AiActor | null {
  const live = hostiles(world, a);
  if (!live.length) return null;
  if (a.role === "gasket" && world.gasketCmd === "focus" && world.focusId) {
    const marked = live.find((o) => o.id === world.focusId);
    if (marked) return marked;
  }
  live.sort((p, q) => aiDist(a, p) - aiDist(a, q));
  if (a.role === "stripekin") {
    const packHit = live.find((o) =>
      world.actors.some((m) => m !== a && m.role === "stripekin" && m.hp > 0 && aiDist(m, o) <= 1),
    );
    if (packHit && aiDist(a, packHit) <= 4) return packHit;
  }
  return live[0] ?? null;
}

function tryMove(world: AiWorld, a: AiActor, to: { x: number; y: number; sub: number }): AiCommit {
  const me = cellOf(a);
  const dest = a.occ === "quarter" ? stepSmallToward(me, to) : { x: me.x + Math.sign(to.x - me.x), y: me.y + Math.sign(to.y - me.y), sub: 0 };
  const alt =
    a.occ === "quarter" && dest.x === me.x && dest.y === me.y && dest.sub === me.sub
      ? dest
      : dest;
  let step = alt;
  if (a.occ === "tile") {
    const dx = Math.sign(to.x - a.x);
    const dy = Math.sign(to.y - a.y);
    const xFirst = { x: a.x + dx, y: a.y, sub: 0 };
    const yFirst = { x: a.x, y: a.y + dy, sub: 0 };
    if (dx && world.inBounds(xFirst.x, xFirst.y) && !world.blocked(a, xFirst)) step = xFirst;
    else if (dy && world.inBounds(yFirst.x, yFirst.y) && !world.blocked(a, yFirst)) step = yFirst;
    else return wait(a, a.state, to);
  } else if (!world.inBounds(step.x, step.y) || world.blocked(a, step)) {
    const q = stepSmallToward(me, { x: to.x, y: to.y, sub: (to.sub + 1) % 4 });
    if (!world.inBounds(q.x, q.y) || world.blocked(a, q)) return wait(a, a.state, to);
    step = q;
  }
  return {
    id: a.id,
    action: "move",
    x: step.x,
    y: step.y,
    sub: a.occ === "quarter" ? step.sub : 0,
    dir: face(me, step, a.dir),
    targetId: null,
    state: "hunt",
    seen: true,
  };
}

function wait(a: AiActor, state: AiState = a.state, look?: { x: number; y: number; sub?: number }): AiCommit {
  return {
    id: a.id,
    action: "wait",
    x: a.x,
    y: a.y,
    sub: a.sub,
    dir: look ? face(cellOf(a), look, a.dir) : a.dir,
    targetId: null,
    state,
    seen: a.seen,
  };
}

function strike(a: AiActor, t: AiActor): AiCommit {
  return {
    id: a.id,
    action: "attack",
    x: a.x,
    y: a.y,
    sub: a.sub,
    dir: face(cellOf(a), t, a.dir),
    targetId: t.id,
    state: "attack",
    seen: true,
  };
}

function foePolicy(world: AiWorld, a: AiActor, t: AiActor): AiCommit {
  const d = aiDist(a, t);
  if (a.role === "barkback") {
    if (d <= 1) return strike(a, t);
    if (d > 4) return wait(a, "alert", t);
    return tryMove(world, a, t);
  }
  if (a.role === "sapjaw") {
    if (d <= 1 && a.hp / a.max < 0.4) return strike(a, t);
    if (d > 3) return tryMove(world, a, t);
    return wait(a, "hunt", t);
  }
  if (d <= 1) return strike(a, t);
  return tryMove(world, a, t);
}

function gasketPolicy(world: AiWorld, a: AiActor): AiCommit {
  const cmd = world.gasketCmd;
  const t = pickFoe(world, a);
  const threatened = t && aiDist(a, t) <= 1;
  if (cmd === "hold") {
    if (threatened && t) return strike(a, t);
    return wait(a, "idle");
  }
  if (cmd === "focus" && t) {
    if (aiDist(a, t) <= 1) return strike(a, t);
    return tryMove(world, a, t);
  }
  const pilot = world.pilot;
  if (pilot) {
    const onPilot = hostiles(world, a).filter((o) => aiDist({ ...o, occ: o.occ }, { x: pilot.x, y: pilot.y, sub: 0, occ: "tile" }) <= 1);
    const near = onPilot[0];
    if (near && aiDist(a, near) <= 1) return strike(a, near);
    const home = manhToTile(cellOf(a), pilot.x, pilot.y);
    if (home > 2) return tryMove(world, a, { x: pilot.x, y: pilot.y, sub: 0 });
    if (threatened && t) return strike(a, t);
    return wait(a, "idle");
  }
  if (t) {
    if (aiDist(a, t) <= 1) return strike(a, t);
    return tryMove(world, a, t);
  }
  return wait(a, "idle");
}

export function think(world: AiWorld, a: AiActor): AiCommit {
  if (a.hp <= 0) return wait(a, "idle");
  if (a.role === "gasket") return gasketPolicy(world, a);
  const t = pickFoe(world, a);
  const awake = a.seen || (t ? sees(world, a, t) : false) || (world.pilot ? sees(world, a, world.pilot) : false);
  if (!awake || !t) return wait(a, "idle");
  a.seen = true;
  if (a.state === "idle") return wait({ ...a, seen: true }, "alert", t);
  return foePolicy(world, { ...a, seen: true, state: aiDist(a, t) <= 1 ? "attack" : "hunt" }, t);
}

/** Sequential turns. Gasket first, then foes. Commits mutate world.actors in place. */
export function tickKernel(world: AiWorld): AiCommit[] {
  const order = [
    ...world.actors.filter((a) => a.team === "gasket" && a.hp > 0),
    ...world.actors.filter((a) => a.team === "foe" && a.hp > 0),
  ];
  const out: AiCommit[] = [];
  for (const a of order) {
    const live = world.actors.find((o) => o.id === a.id);
    if (!live || live.hp <= 0) continue;
    const c = think(world, live);
    live.x = c.x;
    live.y = c.y;
    live.sub = c.sub;
    live.dir = c.dir;
    live.state = c.state;
    live.seen = c.seen;
    out.push(c);
  }
  return out;
}
