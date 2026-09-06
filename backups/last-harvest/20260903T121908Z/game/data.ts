export type BiomeId = "forest" | "ruins" | "mines";
export type WeaponId = "blade" | "scythe" | "cannon";

export const BIOMES: Record<
  BiomeId,
  { planet: string; title: string; blurb: string; small: string; big: string; elite: number }
> = {
  forest: {
    planet: "Veldt-9",
    title: "Canopy tribes",
    blurb: "Bloom-ore tribes. Crude weapons that can actually bite a crate.",
    small: "enemies/goblin",
    big: "enemies/orc",
    elite: 0,
  },
  ruins: {
    planet: "Ossuary Prime",
    title: "Dead architecture",
    blurb: "Skeletons of something that used to match your height. They still walk.",
    small: "enemies/ghost",
    big: "enemies/skeleton",
    elite: 1,
  },
  mines: {
    planet: "Brine-Khar",
    title: "Drowned shafts",
    blurb: "The only walkable path is the mine. When it floods, everything moves.",
    small: "enemies/crawler",
    big: "enemies/crawler",
    elite: 2,
  },
};

export const WEAPONS: Record<
  WeaponId,
  { name: string; twoHand: boolean; melee: boolean; scythe: boolean; cannon: boolean }
> = {
  blade: { name: "Door Slab & Short Edge", twoHand: false, melee: true, scythe: false, cannon: false },
  scythe: { name: "Harvest Arc", twoHand: true, melee: true, scythe: true, cannon: false },
  cannon: { name: "Prototype Lance", twoHand: true, melee: false, scythe: false, cannon: true },
};

export function derive(stur: number, avo: number, per: number) {
  const hp = 48 + stur * 14;
  const melee = 8 + stur * 3;
  const parry = Math.min(0.28, stur * 0.035);
  const dodge = Math.min(0.18, avo * 0.025);
  const def = 2 + avo * 2;
  const shield = Math.min(0.9, avo * 0.07);
  const acc = 0.55 + per * 0.06;
  const radar = 5 + Math.max(0, per - 1);
  const recovery = 1 + per * 0.35;
  return { hp, melee, parry, dodge, def, shield, acc, radar, recovery };
}

export function applyDef(raw: number, def: number, shield: number) {
  const after = Math.max(raw * 0.1, raw - def);
  return Math.max(1, Math.round(after * (1 - Math.min(0.9, shield))));
}
