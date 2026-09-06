export type Loadout = {
  legs: string;
  body: string;
  head: string;
  /** One mesh, both shoulders. Runtime mirrors. */
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
    legs: "p002",
    body: "p000",
    head: "p001",
    arms: "p005",
    handL: "",
    handR: "",
    back: "",
    aux1: "",
    aux2: "",
  };
}

export function kitOf(loadout: Loadout) {
  if (loadout.handR === "p010" && loadout.handL === "p010") return "cannon";
  if (loadout.handR === "p009" && loadout.handL === "p009") return "scythe";
  if (loadout.handR === "p008") return "blade";
  if (loadout.handL === "p010") return "offCannon";
  return null;
}

export type MeleeShape = "wide" | "line";

/** Two-hand melee only. One-hand has no Attack plate. */
export function meleeAttack(loadout: Loadout): { shape: MeleeShape; n: number } | null {
  if (loadout.handR === "p009" && loadout.handL === "p009") return { shape: "wide", n: 3 };
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
  if (weapon === "scythe") return { ...loadout, handL: "p009", handR: "p009" };
  if (weapon === "cannon") return { ...loadout, handL: "p010", handR: "p010" };
  return { ...loadout, handL: "p007", handR: "p008" };
}

export function loadoutKey(l: Loadout) {
  return `${l.legs}+${l.body}+${l.head}+${l.arms}+${l.handL}+${l.handR}`;
}

/** Title Mech Parts bay. Grey A/B modular test. Dungeon starter stays p000–p010. */
export const BAY = {
  head: ["p015", "p012"],
  body: ["p016", "p011"],
  legs: ["p017", "p013"],
  arms: ["p014", "p019"],
} as const;

export const BAY_SLOTS = ["head", "body", "legs", "arms", "kit"] as const;
export type BaySlot = (typeof BAY_SLOTS)[number];

export const PART_NAME: Record<string, string> = {
  p015: "Head A",
  p012: "Head B",
  p016: "Body A",
  p011: "Body B",
  p017: "Legs A",
  p013: "Legs B",
  p014: "Arms A",
  p019: "Arms B",
  p018: "NS scythe",
};

export function bayLoadout(head: string, body: string, legs: string, arms: string, kit: "blade" | "scythe" | "cannon"): Loadout {
  const base = { ...starterLoadout(), head, body, legs, arms };
  if (kit === "scythe") return { ...base, handL: "p018", handR: "p018" };
  return equipWeapon(base, kit);
}

export const ANIM_POSES = ["idle", "walk", "fire", "grip"] as const;
export type AnimPose = (typeof ANIM_POSES)[number];

