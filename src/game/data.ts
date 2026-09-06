export type Difficulty = "story" | "default";

export const DIFFICULTY: Record<Difficulty, { label: string; help: string; extra?: string }> = {
  story: {
    label: "Story",
    help: "Beefy companion. More health regen. Same world.",
    extra: "Gasket hits harder and keeps you patched up.",
  },
  default: { label: "Default", help: "Fairly hard. Scarcity matters." },
};

/** Default run. Combat formulas and enemy stats never read Story. */
export const DEFAULT_RUN = {
  gasketMax: 22,
  gasketBolt: 3,
  witsStart: 1,
} as const;

/** Story-only. Default `derive()` formulas stay frozen. */
export const STORY = {
  gasketMax: 44,
  gasketBolt: 8,
  /** Real starting Wits on the pilot. Not a hidden combat overlay. */
  witsStart: 9,
} as const;

export function runMods(d: Difficulty) {
  return d === "story" ? STORY : DEFAULT_RUN;
}

export function statsOf(pilot: { stur: number; avo: number; wits: number }) {
  return derive(pilot.stur, pilot.avo, pilot.wits);
}

export type BiomeId = "forest";

/** Weapon stance. Skillgrams gate on this. */
export const STANCES = ["sawboard", "sawlance", "twohand", "lancer", "lancers"] as const;
export type Stance = (typeof STANCES)[number];
/** @deprecated use Stance */
export type WeaponId = Stance;

export const STANCE_LABEL: Record<Stance, string> = {
  sawboard: "Sawboard",
  sawlance: "Sawlance",
  twohand: "Harvest",
  lancer: "Lancer",
  lancers: "Lancers",
};

/** New Game Hub cards. Back bus is invisible; still equipped as a gate. */
export const HUB_STANCES: Stance[] = ["twohand", "sawboard", "sawlance", "lancer", "lancers"];

export const STANCE_HUB: Record<
  Stance,
  { name: string; line: string; hands: string; back: string; bonus: string }
> = {
  twohand: { name: "Harvest", line: "Fill PACK. Wide harvest.", hands: "Scythe both", back: "back_twohand", bonus: "small regen" },
  sawboard: { name: "Sawboard", line: "Bump board. No Attack plate.", hands: "Saw + shield", back: "back_sawboard", bonus: "small regen" },
  sawlance: { name: "Sawlance", line: "Bump + Aim from the lance.", hands: "Saw + cannon", back: "back_sawlance", bonus: "accuracy" },
  lancer: { name: "Lancer", line: "Aim/Shoot only.", hands: "Cannon + shield", back: "back_lancer", bonus: "accuracy" },
  lancers: { name: "Lancers", line: "Four half-power pellets.", hands: "Dual cannon", back: "back_lancers", bonus: "energy/recovery" },
};

export type EnemyKind = "small" | "big" | "elite" | "smith";
export const FOE_NAME: Record<EnemyKind, string> = {
  small: "Stripekin",
  big: "Antlerkin",
  elite: "Rootwarden",
  smith: "Barkback",
};

/** Drop inspect. No DPS sheet. Counter ≤ ~14 words. */
export const FOE_TEACH: Record<EnemyKind, { tags: string; counter: string }> = {
  small: { tags: "humanoid · swarm-ish · ¼-grid", counter: "Cleave chaff; don't 1v1 the cloud." },
  big: { tags: "humanoid · brute", counter: "Don't trade the maul. Charge or gap-close." },
  elite: { tags: "humanoid · reach", counter: "Pickaxe poke. Step in or eat reach." },
  smith: { tags: "humanoid · armor", counter: "Armor sponge. Don't bump-trade." },
};

export const BIOMES: Record<BiomeId, { planet: string; title: string; blurb: string; small: string; big: string }> = {
  forest: {
    planet: "Veldt-9",
    title: "Canopy tribes",
    blurb: "Bloom-ore tribes. Crude weapons that can actually bite a crate.",
    small: "stripekin",
    big: "enemies/orc",
  },
};

export function derive(stur: number, avo: number, wits: number) {
  const hp = 48 + stur * 14;
  const melee = 8 + stur * 3;
  const parry = Math.min(0.28, stur * 0.035);
  const dodge = Math.min(0.18, avo * 0.025);
  const def = 2 + avo * 2;
  const shield = Math.min(0.9, avo * 0.07);
  const acc = 0.55 + wits * 0.06;
  const radar = 5 + Math.max(0, wits - 1);
  const recovery = 1 + wits * 0.35;
  /** Wits substat. Event checks. Tune later. */
  const survival = wits;
  return { hp, melee, parry, dodge, def, shield, acc, radar, recovery, survival };
}

export function effectiveSurvival(wits: number, survivalBonus = 0) {
  return derive(1, 1, wits).survival + survivalBonus;
}

export function applyDef(raw: number, def: number, shield: number) {
  const after = Math.max(raw * 0.1, raw - def);
  return Math.max(1, Math.round(after * (1 - Math.min(0.9, shield))));
}
