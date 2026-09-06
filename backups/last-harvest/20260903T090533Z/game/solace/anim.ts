import { legsKind, type Loadout } from "../parts";

/** Mega Man X idle: 2 frames, 24 ticks @ 60Hz each. */
export const IDLE_TICKS = 24;

export function idleFrame(nowMs: number): 0 | 1 {
  const tick = Math.floor((nowMs / 1000) * 60);
  return Math.floor(tick / IDLE_TICKS) % 2 === 0 ? 0 : 1;
}

export function idlePoseName(frame: 0 | 1) {
  return frame === 1 ? "idle2" : "idle";
}

/** Socket nudge when no authored idle2 exists. Piston squat; hover bob; RJ stiff. */
export function idleBob(loadout: Loadout, frame: 0 | 1) {
  if (frame === 0) return { x: 0, y: 0 };
  const kind = legsKind(loadout.legs);
  if (kind === "hover") return { x: 0, y: -2 };
  if (kind === "rj") return { x: 0, y: 1 };
  return { x: 0, y: 2 };
}
