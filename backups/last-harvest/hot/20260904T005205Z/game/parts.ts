export type Loadout = {
  legs: string;
  body: string;
  head: string;
  /** One loadout id. Two isolates (L and R). Never mirrored. No weapons. */
  arms: string;
  /** Off hand — shield or support cannon. Two-hand copies the main id here. */
  handL: string;
  /** Main hand. */
  handR: string;
  back: string;
  aux1: string;
  aux2: string;
};

export function starterLoadout(): Loadout {
  return {
    legs: "p017",
    body: "p016",
    head: "p015",
    arms: "p014",
    handL: "p018",
    handR: "p018",
    back: "",
    aux1: "",
    aux2: "",
  };
}

export function kitOf(loadout: Loadout) {
  if (loadout.handR === "p010" && loadout.handL === "p010") return "cannon";
  if (loadout.handR === "p018" || (loadout.handR === "p009" && loadout.handL === "p009")) return "scythe";
  if (loadout.handR === "p008") return "blade";
  if (loadout.handL === "p010") return "offCannon";
  return null;
}

export type MeleeShape = "wide" | "line";

/** Two-hand melee only. One-hand has no Attack plate. */
export function meleeAttack(loadout: Loadout): { shape: MeleeShape; n: number } | null {
  if (loadout.handR === "p018" || (loadout.handR === "p009" && loadout.handL === "p009")) return { shape: "wide", n: 3 };
  return null;
}

export function hasTwoHandMelee(loadout: Loadout) {
  return meleeAttack(loadout) !== null;
}

export function isRanged(loadout: Loadout) {
  const k = kitOf(loadout);
  return k === "cannon" || k === "offCannon";
}

export function isArmed(loadout: Loadout) {
  return kitOf(loadout) !== null;
}

export function equipWeapon(loadout: Loadout, weapon: "blade" | "scythe" | "cannon"): Loadout {
  if (weapon === "scythe") return { ...loadout, handL: "p018", handR: "p018" };
  if (weapon === "cannon") return { ...loadout, handL: "p010", handR: "p010" };
  return { ...loadout, handL: "p007", handR: "p008" };
}

export function loadoutKey(l: Loadout) {
  return `${l.legs}+${l.body}+${l.head}+${l.arms}+${l.handL}+${l.handR}`;
}

/** Appearance bay — must match solace-mech-parts/references/bay.md */
export const BAY = {
  head: ["p015", "p012"],
  body: ["p016"],
  legs: ["p017"],
  arms: ["p014"],
} as const;

export const BAY_SLOTS = ["head", "body", "legs", "arms"] as const;
export type BaySlot = (typeof BAY_SLOTS)[number];

export const PIECE_LABEL: Record<BaySlot, string> = {
  head: "Head",
  body: "Body",
  legs: "Legs",
  arms: "Arms",
};

export const PART_NAME: Record<string, string> = {
  p015: "p015",
  p012: "p012",
  p016: "p016",
  p017: "p017",
  p014: "p014",
  p018: "p018",
};

export function bayLoadout(head: string, body: string, legs: string, arms: string, kit: "blade" | "scythe" | "cannon"): Loadout {
  const base = { ...starterLoadout(), head, body, legs, arms };
  if (kit === "scythe") return { ...base, handL: "p018", handR: "p018" };
  return equipWeapon(base, kit);
}

export const ANIM_POSES = ["idle", "walk", "fire", "grip"] as const;
export type AnimPose = (typeof ANIM_POSES)[number];

