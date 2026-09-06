/** Shared ¼-square stepper. Gasket + small foes. Pilot stays full-tile. */

export const SUB_AXIS = 2;
export const SUBS = SUB_AXIS * SUB_AXIS;

export type SmallCell = { x: number; y: number; sub: number };

export function clampSub(sub: number) {
  return ((sub % SUBS) + SUBS) % SUBS;
}

export function subXY(sub: number) {
  const s = clampSub(sub);
  return { sx: s % SUB_AXIS, sy: Math.floor(s / SUB_AXIS) };
}

export function packSub(sx: number, sy: number) {
  return (sx & 1) | ((sy & 1) << 1);
}

export function toQuarter(p: SmallCell) {
  const { sx, sy } = subXY(p.sub);
  return { qx: p.x * SUB_AXIS + sx, qy: p.y * SUB_AXIS + sy };
}

export function fromQuarter(qx: number, qy: number): SmallCell {
  const x = Math.floor(qx / SUB_AXIS);
  const y = Math.floor(qy / SUB_AXIS);
  const sx = ((qx % SUB_AXIS) + SUB_AXIS) % SUB_AXIS;
  const sy = ((qy % SUB_AXIS) + SUB_AXIS) % SUB_AXIS;
  return { x, y, sub: packSub(sx, sy) };
}

export function stepSmall(p: SmallCell, dx: number, dy: number): SmallCell {
  const q = toQuarter(p);
  return fromQuarter(q.qx + Math.sign(dx), q.qy + Math.sign(dy));
}

export function faceSmall(from: SmallCell, to: SmallCell, keep = 0) {
  const A = toQuarter(from);
  const B = toQuarter(to);
  const dx = B.qx - A.qx;
  const dy = B.qy - A.qy;
  if (dx === 0 && dy === 0) return keep;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 1 : 3;
  return dy > 0 ? 0 : 2;
}

export function manhSmall(a: SmallCell, b: SmallCell) {
  const A = toQuarter(a);
  const B = toQuarter(b);
  return Math.abs(A.qx - B.qx) + Math.abs(A.qy - B.qy);
}

/** Distance from a ¼-cell to a full tile (crate occupies all four subs). */
export function manhToTile(p: SmallCell, tx: number, ty: number) {
  let best = 99;
  for (let s = 0; s < SUBS; s++) {
    const m = manhSmall(p, { x: tx, y: ty, sub: s });
    if (m < best) best = m;
  }
  return best;
}

export type LanceFoe = { id: number; x: number; y: number; sub: number; hp: number; small: boolean };

/**
 * One Lancer-family primary on a full tile.
 * Closest ¼ to the pilot; tie → greatest map +Y, then least |ΔX| to pilot, then least X.
 */
export function pickLanceOnTile(foes: LanceFoe[], tx: number, ty: number, px: number, py: number): LanceFoe | null {
  const pack = foes.filter((e) => e.hp > 0 && e.x === tx && e.y === ty);
  if (!pack.length) return null;
  const score = (e: LanceFoe) => {
    const cell: SmallCell = { x: e.x, y: e.y, sub: e.small ? e.sub : 0 };
    const dist = e.small ? manhToTile(cell, px, py) : Math.abs(e.x - px) + Math.abs(e.y - py);
    const q = toQuarter(cell);
    const dx0 = Math.abs(q.qx - px * SUB_AXIS);
    const dx1 = Math.abs(q.qx - (px * SUB_AXIS + 1));
    const absdx = Math.min(dx0, dx1);
    return { e, dist, qy: q.qy, absdx, qx: q.qx };
  };
  const ranked = pack.map(score);
  ranked.sort((a, b) => a.dist - b.dist || b.qy - a.qy || a.absdx - b.absdx || a.qx - b.qx);
  return ranked[0]!.e;
}

export function stepSmallToward(from: SmallCell, to: SmallCell): SmallCell {
  const A = toQuarter(from);
  const B = toQuarter(to);
  const dx = Math.sign(B.qx - A.qx);
  const dy = Math.sign(B.qy - A.qy);
  if (dx) return fromQuarter(A.qx + dx, A.qy);
  if (dy) return fromQuarter(A.qx, A.qy + dy);
  return { ...from, sub: clampSub(from.sub) };
}

export type SmallOcc = { x: number; y: number; sub: number; small: boolean };

/** Occupancy law V1. Full diamond = 4×¼. Small = one ¼ + own id. */
export type OccBody = {
  id: number | string;
  x: number;
  y: number;
  sub: number;
  small: boolean;
};

export function occKey(x: number, y: number, sub: number) {
  return `${x}:${y}:${clampSub(sub)}`;
}

/** Small → one key. Full-tile / Barkback / pilot → all 4 ¼ keys. */
export function keysOf(body: OccBody): string[] {
  if (body.small) return [occKey(body.x, body.y, body.sub)];
  return [0, 1, 2, 3].map((s) => occKey(body.x, body.y, s));
}

/** Small step into dest ¼. Full-tile on that diamond blocks all 4. Two smalls cannot share a ¼. */
export function canEnterQuarter(occ: OccBody[], dest: SmallCell, ignoreId?: number | string) {
  for (const o of occ) {
    if (ignoreId !== undefined && String(o.id) === String(ignoreId)) continue;
    if (o.x !== dest.x || o.y !== dest.y) continue;
    if (!o.small) return false;
    if (o.sub === dest.sub) return false;
  }
  return true;
}

/** Full-tile step. Any occupant (small or full) on the diamond blocks. */
export function canEnterTile(occ: OccBody[], dest: { x: number; y: number }, ignoreId?: number | string) {
  for (const o of occ) {
    if (ignoreId !== undefined && String(o.id) === String(ignoreId)) continue;
    if (o.x === dest.x && o.y === dest.y) return false;
  }
  return true;
}

export function occSmoke(
  bodies: { id: number | string; x: number; y: number; sub: number; hp: number; small: boolean }[],
  tag: "SPAWN" | "STEP",
) {
  const smalls = bodies.filter((b) => b.small);
  const uniqueIds = new Set(smalls.map((b) => String(b.id))).size;
  const distinctSubCells = new Set(smalls.map((b) => `${b.x},${b.y},${b.sub}`)).size;
  const hpPools = smalls.length;
  const rows = smalls
    .map((b) => `{entityId:${b.id}, subCell:${b.x},${b.y},${b.sub}, hp:${b.hp}}`)
    .join(" ");
  const assert = `uniqueIds===${uniqueIds} distinctSubCells===${distinctSubCells} hpPools===${hpPools}`;
  const line = `OCC_${tag} ${assert} ${rows}`;
  if (typeof console !== "undefined") console.log(line);
  return { line, uniqueIds, distinctSubCells, hpPools, rows };
}

/** Same ¼-cell is blocked. Full-tile units occupy every sub on their tile. */
export function smallCellTaken(occ: SmallOcc[], dest: SmallCell, ignore?: SmallOcc) {
  const bodies: OccBody[] = occ.map((o, i) => ({
    id: o === ignore ? "__ignore__" : i,
    x: o.x,
    y: o.y,
    sub: o.sub,
    small: o.small,
  }));
  return !canEnterQuarter(bodies, dest, "__ignore__");
}
