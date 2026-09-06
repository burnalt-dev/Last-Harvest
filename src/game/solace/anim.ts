/** Mega Man X idle: 2 authored frames, 24 ticks @ 60Hz. No puppet bob. */
export const IDLE_TICKS = 24;

export function idleFrame(nowMs: number): 0 | 1 {
  const tick = Math.floor((nowMs / 1000) * 60);
  return Math.floor(tick / IDLE_TICKS) % 2 === 0 ? 0 : 1;
}

export function idlePoseName(frame: 0 | 1) {
  return frame === 1 ? "idle2" : "idle";
}
