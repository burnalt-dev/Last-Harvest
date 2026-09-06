let ctx: AudioContext | null = null;

function ac() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq: number, dur: number, type: OscillatorType = "square", gain = 0.04) {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(c.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.stop(c.currentTime + dur);
}

export function unlockAudio() {
  ac();
}
export function startTheme() {
  beep(220, 0.12, "square", 0.03);
}
export function sfxUi() {
  beep(880, 0.05);
}
export function sfxMove() {
  beep(140, 0.04, "square", 0.03);
}
export function sfxHit() {
  beep(90, 0.1, "sawtooth", 0.05);
}
export function sfxLaser() {
  beep(1320, 0.08, "square", 0.04);
}
export function sfxParry() {
  beep(1760, 0.12, "square", 0.06);
}
export function sfxDodge() {
  beep(990, 0.08);
}
export function sfxLevel() {
  beep(523, 0.2);
}
