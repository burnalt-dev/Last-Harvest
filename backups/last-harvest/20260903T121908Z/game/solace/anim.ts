import { legsKind, type Loadout } from "../parts";

/** Mega Man X idle: 2 authored frames, 24 ticks @ 60Hz. No puppet bob. */
export const IDLE_TICKS = 24;

export function idleFrame(nowMs: number): 0 | 1 {
  const tick = Math.floor((nowMs / 1000) * 60);
  return Math.floor(tick / IDLE_TICKS) % 2 === 0 ? 0 : 1;
}

export function idlePoseName(frame: 0 | 1) {
  return frame === 1 ? "idle2" : "idle";
}

/** Option B: motion is in the B1, not a socket nudge. */
export function idleBob(_loadout: Loadout, _frame: 0 | 1) {
  return { x: 0, y: 0 };
}

export function legsMotion(id: string) {
  return legsKind(id);
}
