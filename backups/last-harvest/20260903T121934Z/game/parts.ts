export type Loadout = {
  legs: string;
  body: string;
  head: string;
  armL: string;
  armR: string;
  handL: string;
  handR: string;
  back: string;
  aux1: string;
  aux2: string;
};

export const SLOT_ORDER: (keyof Loadout)[] = [
  "head",
  "body",
  "armL",
  "armR",
  "legs",
  "handL",
  "handR",
  "back",
  "aux1",
  "aux2",
];

const PARTS: Record<string, { name: string; slot: string }> = {
  p000: { name: "Labor crate hull", slot: "body" },
  p001: { name: "Visor slit", slot: "head" },
  p002: { name: "Piston walkers", slot: "legs" },
  p003: { name: "Hover skirt", slot: "legs" },
  p004: { name: "Reverse-joint", slot: "legs" },
  p005: { name: "Manipulator R", slot: "armR" },
  p006: { name: "Manipulator L", slot: "armL" },
  p007: { name: "Door slab", slot: "handL" },
  p008: { name: "Chainsaw", slot: "handR" },
  p009: { name: "Harvest scythe", slot: "hands" },
  p010: { name: "Prototype lance", slot: "handR" },
};

export function partById(id: string) {
  return PARTS[id] ?? null;
}

export function starterLoadout(): Loadout {
  return {
    legs: "p002",
    body: "p000",
    head: "p001",
    armL: "p006",
    armR: "p005",
    handL: "",
    handR: "",
    back: "",
    aux1: "",
    aux2: "",
  };
}

export function kitOf(loadout: Loadout) {
  if (loadout.handR === "p010" || loadout.handL === "p010") return "cannon";
  if (loadout.handR === "p009" || loadout.handL === "p009") return "scythe";
  if (loadout.handL === "p007" || loadout.handR === "p008") return "blade";
  return null;
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
  return `${l.legs}+${l.body}+${l.head}+${l.armL}+${l.armR}+${l.handL}+${l.handR}`;
}

export function legsKind(id: string): "piston" | "hover" | "rj" {
  if (id === "p003") return "hover";
  if (id === "p004") return "rj";
  return "piston";
}
