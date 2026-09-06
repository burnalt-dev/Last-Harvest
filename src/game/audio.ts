const MUTE = true;
let ctx: AudioContext | null = null;

function ac() {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beep(freq: number, dur: number, type: OscillatorType = "square", gain = 0.04) {
  if (MUTE) return;
  const c = ac();
  if (!c) return;
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

export function sfxUi() {
  beep(880, 0.05);
}
export function sfxMove() {
  beep(140, 0.04, "square", 0.03);
}
export function sfxHit() {
  beep(90, 0.1, "sawtooth", 0.05);
}
export function sfxParry() {
  beep(1760, 0.12, "square", 0.06);
}
export function sfxDodge() {
  beep(990, 0.08);
}

/** Scope lock. Ivan asked — plays even while slice-1 MUTE is on. */
export function sfxScope() {
  try {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const tick = c.createOscillator();
    const tg = c.createGain();
    tick.type = "square";
    tick.frequency.setValueAtTime(1980, t);
    tick.frequency.exponentialRampToValueAtTime(880, t + 0.028);
    tg.gain.setValueAtTime(0.06, t);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    tick.connect(tg);
    tg.connect(c.destination);
    tick.start(t);
    tick.stop(t + 0.05);

    const clack = c.createOscillator();
    const cg = c.createGain();
    clack.type = "triangle";
    clack.frequency.setValueAtTime(220, t + 0.03);
    clack.frequency.exponentialRampToValueAtTime(68, t + 0.11);
    cg.gain.setValueAtTime(0.09, t + 0.03);
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    clack.connect(cg);
    cg.connect(c.destination);
    clack.start(t + 0.03);
    clack.stop(t + 0.13);

    const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.035), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = c.createBufferSource();
    noise.buffer = buf;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.035, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    noise.connect(ng);
    ng.connect(c.destination);
    noise.start(t);
  } catch {
    /* keep playable */
  }
}

