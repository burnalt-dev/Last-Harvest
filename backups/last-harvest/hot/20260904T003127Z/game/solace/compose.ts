import { img } from "../art";
import { loadoutKey, type Loadout } from "../parts";
import { ATLASES } from "./atlases";
import sockets from "./sockets.json";
import { idleFrame, idlePoseName } from "./anim";

const CELL = 384;
const FOOT = 352;
const cache = new Map<string, { canvas: HTMLCanvasElement; cx: number; foot: number }>();

export function clearCompositeCache() {
  cache.clear();
}
const DIR_LETTER = ["s", "w", "e", "n"] as const;
type Dir = "s" | "e" | "n" | "w";

const BLIT_ORDER: {
  slot: string;
  socket: "hip" | "neck" | "shoulderL" | "shoulderR" | "handL" | "handR";
  from: keyof Loadout;
  side?: "L" | "R";
}[] = [
  { slot: "legs", socket: "hip", from: "legs" },
  { slot: "body", socket: "hip", from: "body" },
  { slot: "head", socket: "neck", from: "head" },
  { slot: "arms", socket: "shoulderL", from: "arms", side: "L" },
  { slot: "arms", socket: "shoulderR", from: "arms", side: "R" },
  { slot: "handL", socket: "handL", from: "handL" },
  { slot: "handR", socket: "handR", from: "handR" },
];

function partsOf(loadout: Loadout) {
  return [loadout.legs, loadout.body, loadout.head, loadout.arms, loadout.handL, loadout.handR].filter(Boolean);
}

function loadoutReady(loadout: Loadout) {
  return partsOf(loadout).every((id) => img(`parts/${id}`));
}

function letter(dir: number): Dir {
  return DIR_LETTER[dir] ?? "s";
}

function stackSockets(dest: CanvasRenderingContext2D, loadout: Loadout, dir: Dir, pose: string) {
  dest.imageSmoothingEnabled = false;
  dest.clearRect(0, 0, CELL, CELL);
  const sock = sockets.sockets_by_dir[dir];
  let n = 0;
  const seenHands = new Set<string>();
  for (const step of BLIT_ORDER) {
    const id = loadout[step.from];
    if (!id) continue;
    if ((step.socket === "handL" || step.socket === "handR") && seenHands.has(id)) continue;
    const meta = ATLASES[id as keyof typeof ATLASES];
    const bitmap = img(`parts/${id}`);
    if (!meta || !bitmap) continue;
    const frames = meta.frames as readonly {
      pose: string;
      dir: string;
      side?: string;
      x: number;
      y: number;
      w: number;
      h: number;
      origin: { x: number; y: number };
    }[];
    const fr =
      frames.find((f) => f.pose === pose && f.dir === dir && (step.side ? f.side === step.side : !f.side)) ??
      frames.find((f) => f.pose === "idle" && f.dir === dir && (step.side ? f.side === step.side : !f.side)) ??
      (!step.side ? frames.find((f) => f.pose === pose && f.dir === dir) : undefined);
    if (!fr) continue;
    if (step.socket === "handL" || step.socket === "handR") seenHands.add(id);
    const seated = fr.w === CELL && fr.h === CELL && fr.origin.x === 0 && fr.origin.y === 0;
    const dx = seated ? 0 : (sock[step.socket].x - fr.origin.x) | 0;
    const dy = seated ? 0 : (sock[step.socket].y - fr.origin.y) | 0;
    dest.drawImage(bitmap, fr.x, fr.y, fr.w, fr.h, dx, dy, fr.w, fr.h);
    n++;
  }
  return n >= 3;
}

function measurePlant(canvas: HTMLCanvasElement): { cx: number; foot: number } {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cx: CELL / 2, foot: FOOT };
  const data = ctx.getImageData(0, 0, CELL, CELL).data;
  let sx = 0;
  let n = 0;
  let foot = 0;
  const y0 = FOOT - 180;
  for (let y = y0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      if (data[(y * CELL + x) * 4 + 3] > 40) {
        sx += x;
        n++;
        if (y > foot) foot = y;
      }
    }
  }
  if (n < 12) {
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL; x++) {
        if (data[(y * CELL + x) * 4 + 3] > 40) {
          sx += x;
          n++;
          if (y > foot) foot = y;
        }
      }
    }
  }
  return { cx: n ? sx / n : CELL / 2, foot: foot || FOOT };
}

export function compositeOf(loadout: Loadout, dir: number, pose = "idle", now = 0) {
  const frame = idleFrame(now);
  const poseName = pose === "idle" ? idlePoseName(frame) : pose;
  const d = letter(dir);
  const ready = loadoutReady(loadout);
  const key = `${loadoutKey(loadout)}|${poseName}|${d}|${frame}`;
  const hit = cache.get(key);
  if (hit && ready) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = CELL;
  canvas.height = CELL;
  const ctx = canvas.getContext("2d");
  const empty = { canvas, cx: CELL / 2, foot: FOOT };
  if (!ctx) return empty;
  ctx.imageSmoothingEnabled = false;
  stackSockets(ctx, loadout, d, poseName);
  const plant = measurePlant(canvas);
  const rec = { canvas, ...plant };
  if (ready) {
    cache.set(key, rec);
    if (cache.size > 64) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }
  }
  return rec;
}

function destOf(x: number, y: number, span: number, cx: number, foot: number) {
  const dw = (span * 156) | 0;
  const dh = dw;
  return {
    dw,
    dh,
    x0: (x - (cx / CELL) * dw) | 0,
    y0: (y - (foot / CELL) * dh) | 0,
  };
}

export function drawComposite(
  ctx: CanvasRenderingContext2D,
  loadout: Loadout,
  dir: number,
  x: number,
  y: number,
  span: number,
  pose = "idle",
  now = 0,
) {
  const rec = compositeOf(loadout, dir, pose, now);
  const { dw, dh, x0, y0 } = destOf(x, y, span, rec.cx, rec.foot);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(rec.canvas, 0, 0, CELL, CELL, x0, y0, dw, dh);
}

export function companionMountXY(dir: number, x: number, y: number, span: number, loadout?: Loadout) {
  const d = letter(dir);
  const sock = sockets.sockets_by_dir[d].companion_mount;
  const rec = loadout ? compositeOf(loadout, dir, "idle", 0) : { cx: CELL / 2, foot: FOOT };
  const { dw, dh, x0, y0 } = destOf(x, y, span, rec.cx, rec.foot);
  return {
    x: (x0 + (sock.x / CELL) * dw) | 0,
    y: (y0 + (sock.y / CELL) * dh) | 0,
  };
}
