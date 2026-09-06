import { statsOf, type Difficulty } from "./data";
import type { Pilot } from "./pilot";
import type { Dungeon, Fx } from "./sim";

/** Default success at Wits 1, bonus 0. `base = band - 0.04` so +0.04*survival lands on the band. */
export const BAND = {
  soft: 0.7,
  standard: 0.55,
  pressure: 0.4,
  ship: 0.5,
  dungeon: 0.35,
} as const;
export type Band = keyof typeof BAND;

export function effectiveSurvival(pilot: Pilot) {
  const survival = statsOf(pilot).survival;
  return survival + (pilot.survivalBonus ?? 0);
}

/** clamp 5–95% of base + 0.04*(survival+bonus) + tags − threat. Story only pads soft/standard. */
export function survivalChance(
  band: Band,
  survival: number,
  survivalBonus = 0,
  tags = 0,
  threat = 0,
  difficulty: Difficulty = "default",
) {
  const base = BAND[band] - 0.04;
  let p = base + 0.04 * (survival + survivalBonus) + tags - threat;
  if (difficulty === "story" && (band === "soft" || band === "standard")) p += 0.12;
  return Math.min(0.95, Math.max(0.05, p));
}

export function rollSurvival(
  band: Band,
  pilot: Pilot,
  extra?: { tags?: number; threat?: number },
) {
  const p = survivalChance(
    band,
    statsOf(pilot).survival,
    pilot.survivalBonus ?? 0,
    extra?.tags ?? 0,
    extra?.threat ?? 0,
    pilot.difficulty,
  );
  return { ok: Math.random() < p, p };
}

type Cast = {
  id: string;
  band: Band;
  kind: "roam" | "ship" | "dungeon" | "primer";
  ok: string;
  fail: string;
  flag?: string;
  /** Fail-forward only. Never 0 energy lock. */
  failEnergy?: number;
  okEnergy?: number;
};

const PRIMER: Cast = {
  id: "debris_primer",
  band: "soft",
  kind: "primer",
  ok: "Debris Primer. Scrap in the roots — Gasket marks it.",
  fail: "Debris Primer. You kick past it. Gasket files the miss. Keep walking.",
  flag: "primer_miss",
};

const ROAM: Cast[] = [
  {
    id: "snag_roots",
    band: "standard",
    kind: "roam",
    ok: "Roots part. Path holds.",
    fail: "Snagged. Crate yanks free — next step costs a sip of energy.",
    flag: "snag",
    failEnergy: 0,
  },
  {
    id: "canopy_drip",
    band: "standard",
    kind: "roam",
    ok: "Drip reads clean. +2 energy.",
    fail: "Sap on the visor. Cast smears. You wipe and go.",
    flag: "smear",
    okEnergy: 2,
  },
  {
    id: "bloom_fume",
    band: "pressure",
    kind: "roam",
    ok: "Fume sheet. Filters hold.",
    fail: "Fume bite. Energy cough, still moving.",
    failEnergy: 4,
    flag: "fume",
  },
];

const SHIP: Cast[] = [
  {
    id: "rend_copy",
    band: "ship",
    kind: "ship",
    ok: "Rend: copy. Stay on Bloom.",
    fail: "Rend: you're breaking up. Keep the crate walking — we'll try again.",
  },
  {
    id: "halle_weather",
    band: "ship",
    kind: "ship",
    ok: "Halle: canopy's loud. Your filter's doing the work.",
    fail: "Halle: static. Not deaf, just ugly. Ping us when you crest.",
  },
];

const DUNGEON: Cast = {
  id: "cold_anvil",
  band: "dungeon",
  kind: "dungeon",
  ok: "Anvil still warm. Splinter in the scale.",
  fail: "Cold anvil. Nothing for the crate. You move on.",
};

function wait(n: number) {
  return n + 8 + Math.floor(Math.random() * 5);
}

export function bootRoam(d: Dungeon) {
  d.walks = 0;
  d.nextRoamAt = 8 + Math.floor(Math.random() * 5);
  d.nextShipAt = 12 + Math.floor(Math.random() * 5);
  d.shipCalls = 0;
  d.flags = d.flags ?? [];
}

function resolve(d: Dungeon, pilot: Pilot, fx: Fx[], cast: Cast, threat = 0) {
  const roll = rollSurvival(cast.band, pilot, { threat });
  if (roll.ok) {
    if (cast.okEnergy) d.energy = Math.min(d.emax, d.energy + cast.okEnergy);
    d.log = cast.ok;
    fx.push({ k: "banner", text: "CLEAR", good: true, t: 0.45 });
  } else {
    if (cast.failEnergy) d.energy = Math.max(0, d.energy - cast.failEnergy);
    if (cast.flag && !d.flags.includes(cast.flag)) d.flags.push(cast.flag);
    d.log = cast.fail;
    fx.push({ k: "banner", text: "CAST", good: false, t: 0.45 });
  }
  return roll.ok;
}

/** After a walk. ≤1 roam / 8–12 moves. ≤2 ship-calls per sortie. Fail-forward only. */
export function afterWalk(d: Dungeon, pilot: Pilot, fx: Fx[]) {
  d.walks = (d.walks ?? 0) + 1;
  if (d.flags.includes("snag")) {
    d.energy = Math.max(0, d.energy - 1);
    d.flags = d.flags.filter((f) => f !== "snag");
    d.log = "Snag tax. Still moving.";
  }

  const anvil = d.anvils.find((a) => a.x === d.px && a.y === d.py);
  const anvilKey = anvil ? `anvil:${anvil.x}:${anvil.y}` : "";
  if (anvil && !d.flags.includes(anvilKey)) {
    d.flags.push(anvilKey);
    resolve(d, pilot, fx, DUNGEON, d.flags.includes("fume") ? 0.05 : 0);
    return;
  }

  if (d.walks >= (d.nextRoamAt ?? 8)) {
    d.nextRoamAt = wait(d.walks);
    if (!pilot.primerDone) {
      pilot.primerDone = true;
      resolve(d, pilot, fx, PRIMER);
      return;
    }
    const pool = ROAM;
    const cast = pool[Math.floor(Math.random() * pool.length)]!;
    const threat = (d.flags.includes("fume") ? 0.05 : 0) + (d.flags.includes("smear") ? 0.04 : 0);
    resolve(d, pilot, fx, cast, threat);
    return;
  }

  if (d.shipCalls < 2 && d.walks >= (d.nextShipAt ?? 12)) {
    d.shipCalls += 1;
    d.nextShipAt = wait(d.walks + 4);
    const cast = SHIP[d.shipCalls % SHIP.length]!;
    resolve(d, pilot, fx, cast);
  }
}
