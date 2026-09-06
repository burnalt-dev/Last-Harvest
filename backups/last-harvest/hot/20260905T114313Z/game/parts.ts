import type { Stance } from "./data";

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
    body: "",
    head: "",
    arms: "",
    handL: "",
    handR: "",
    back: "",
    aux1: "",
    aux2: "",
  };
}

export function kitOf(loadout: Loadout): Stance | null {
  const r = loadout.handR;
  const l = loadout.handL;
  if (r === "p018" || (r === "p009" && l === "p009")) return "twohand";
  if (r === "p010" && l === "p010") return "lancers";
  if (r === "p008" && l === "p010") return "sawlance";
  if (r === "p010" || l === "p010") return "lancer";
  if (r === "p008") return "sawboard";
  return null;
}

export const stanceOf = kitOf;

/** Dual-draw backpack. Lore: power bus. Not a visible mesh. Stamped when both hands are lances. */
export function hasCellPack(loadout: Loadout) {
  return loadout.body === "p020" || (loadout.handR === "p010" && loadout.handL === "p010");
}

export function cannonHands(loadout: Loadout) {
  const r = loadout.handR === "p010";
  const l = loadout.handL === "p010";
  return { r, l, dual: r && l };
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
  return loadout.handR === "p010" || loadout.handL === "p010";
}

export function isArmed(loadout: Loadout) {
  return kitOf(loadout) !== null;
}

export function equipWeapon(loadout: Loadout, stance: Stance): Loadout {
  const body = loadout.body === "p020" ? "" : loadout.body;
  if (stance === "twohand") return { ...loadout, body, handL: "p018", handR: "p018" };
  if (stance === "lancer") return { ...loadout, body, handL: "p007", handR: "p010" };
  if (stance === "lancers") return { ...loadout, handL: "p010", handR: "p010", body: "p020" };
  if (stance === "sawlance") return { ...loadout, body, handL: "p010", handR: "p008" };
  return { ...loadout, body, handL: "p007", handR: "p008" };
}

export function loadoutKey(l: Loadout) {
  return `${l.legs}+${l.body}+${l.head}+${l.arms}+${l.handL}+${l.handR}`;
}

export const BAY_SLOTS = ["head", "body", "legs", "arms", "weapon"] as const;
export type BaySlot = (typeof BAY_SLOTS)[number];

/** Piece-by-piece bay. Only isolates that passed occupancy. */
export const BAY: Record<BaySlot, readonly string[]> = {
  head: [],
  body: [],
  legs: ["p017"],
  arms: [],
  weapon: [],
};

export const PIECE_LABEL: Record<BaySlot, string> = {
  head: "Head",
  body: "Body",
  legs: "Legs",
  arms: "Arms",
  weapon: "Weapon",
};

export const PART_NAME: Record<string, string> = {
  p015: "p015",
  p012: "p012",
  p016: "p016",
  p017: "p017",
  p014: "p014",
  p018: "p018",
  p007: "slab",
  p008: "saw",
  p010: "cannon",
  p020: "cell pack",
};

export function bayLoadout(head: string, body: string, legs: string, arms: string, weapon: string): Loadout {
  return {
    head,
    body,
    legs,
    arms,
    handL: weapon,
    handR: weapon,
    back: "",
    aux1: "",
    aux2: "",
  };
}

export const ANIM_POSES = ["idle", "walk", "fire", "grip"] as const;
export type AnimPose = (typeof ANIM_POSES)[number];

