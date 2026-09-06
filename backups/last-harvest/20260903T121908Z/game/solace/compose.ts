import { img } from "../art";
import { kitOf, loadoutKey, type Loadout } from "../parts";
import { sheetCell } from "../iso";
import { ATLASES } from "./atlases";
import sockets from "./sockets.json";
import { idleBob, idleFrame, idlePoseName } from "./anim";

const CELL = 384;
const cache = new Map<string, HTMLCanvasElement>();
const DIR_LETTER = ["s", "w", "e", "n"] as const;
type Dir = "s" | "e" | "n" | "w";

const BLIT_ORDER: { slot: string; socket: "hip" | "neck" | "shoulderL" | "shoulderR" | "handL" | "handR"; from: keyof Loadout }[] = [
  { slot: "legs", socket: "hip", from: "legs" },
  { slot: "body", socket: "hip", from: "body" },
  { slot: "head", socket: "neck", from: "head" },
  { slot: "armL", socket: "shoulderL", from: "armL" },
  { slot: "armR", socket: "shoulderR", from: "armR" },
  { slot: "handL", socket: "handL", from: "handL" },
  { slot: "handR", socket: "handR", from: "handR" },
];

function kitSeed(loadout: Loadout) {
  const kit = kitOf(loadout);
  return kit ? img(`mech/${kit}`) : null;
}

function blitKitCell(sheet: HTMLImageElement, dir: number, dest: CanvasRenderingContext2D) {
  const [col, row] = sheetCell(dir);
  const cw = sheet.width / 2;
  const ch = sheet.height / 2;
  dest.imageSmoothingEnabled = false;
  dest.clearRect(0, 0, CELL, CELL);
  dest.drawImage(sheet, col * cw, row * ch, cw, ch, 0, 0, CELL, CELL);
}

function letter(dir: number): Dir {
  return DIR_LETTER[dir] ?? "s";
}

function stackSockets(dest: CanvasRenderingContext2D, loadout: Loadout, dir: Dir, pose: string, _bobY: number) {
  dest.imageSmoothingEnabled = false;
  dest.clearRect(0, 0, CELL, CELL);
  const sock = sockets.sockets_by_dir[dir];
  let n = 0;
  const seen = new Set<string>();
  for (const step of BLIT_ORDER) {
    const id = loadout[step.from];
    if (!id || seen.has(id)) continue;
    const meta = ATLASES[id as keyof typeof ATLASES];
    const bitmap = img(`parts/${id}`);
    if (!meta || !bitmap) continue;
    const frames = meta.frames as readonly {
      pose: string;
      dir: string;
      x: number;
      y: number;
      w: number;
      h: number;
      origin: { x: number; y: number };
    }[];
    const fr = frames.find((f) => f.pose === pose && f.dir === dir) ?? frames.find((f) => f.pose === "idle" && f.dir === dir);
    if (!fr) continue;
    seen.add(id);
    // 384 HD cells are pre-seated on sockets.json. Origin 0,0 → draw at 0,0.
    // Cropped atlases still use socket - origin.
    const seated = fr.w === CELL && fr.h === CELL && fr.origin.x === 0 && fr.origin.y === 0;
    const dx = seated ? 0 : (sock[step.socket].x - fr.origin.x) | 0;
    const dy = seated ? 0 : (sock[step.socket].y - fr.origin.y) | 0;
    dest.drawImage(bitmap, fr.x, fr.y, fr.w, fr.h, dx, dy, fr.w, fr.h);
    n++;
  }
  return n >= 3;
}

export function compositeOf(loadout: Loadout, dir: number, pose = "idle", now = 0) {
  const frame = pose === "hangar" ? 0 : idleFrame(now);
  const poseName = pose === "hangar" ? "idle" : idlePoseName(frame);
  const d = pose === "hangar" ? "s" : letter(dir);
  const key = `${loadoutKey(loadout)}|${poseName}|${d}|${frame}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = CELL;
  canvas.height = CELL;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  const bob = pose === "hangar" ? { x: 0, y: 0 } : idleBob(loadout, frame);
  const stacked = stackSockets(ctx, loadout, d, poseName, bob.y);
  if (!stacked) {
    const sheet = kitSeed(loadout);
    if (sheet) blitKitCell(sheet, dir, ctx);
  }
  cache.set(key, canvas);
  if (cache.size > 64) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return canvas;
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
  const frame = compositeOf(loadout, dir, pose, now);
  const dw = (span * 156) | 0;
  const dh = dw;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(frame, 0, 0, CELL, CELL, (x - dw / 2) | 0, (y - dh * 0.78) | 0, dw, dh);
}

export function companionMountXY(dir: number, x: number, y: number, span: number) {
  const d = letter(dir);
  const sock = sockets.sockets_by_dir[d].companion_mount;
  const dw = (span * 156) | 0;
  const dh = dw;
  const x0 = (x - dw / 2) | 0;
  const y0 = (y - dh * 0.78) | 0;
  return {
    x: (x0 + (sock.x / CELL) * dw) | 0,
    y: (y0 + (sock.y / CELL) * dh) | 0,
  };
}
