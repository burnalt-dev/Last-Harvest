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
