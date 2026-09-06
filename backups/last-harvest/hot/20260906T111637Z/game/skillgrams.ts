/** last-harvest-skillgrams — slice 1. Player-facing name is still "Programs". */

import type { Stance } from "./data";

export type Archetype = "combat" | "support" | "exploration";

/** Dev type. Do not name this Program in new code. */
export type Skillgram = {
  id: string;
  /** Player UI string. */
  name: string;
  arch: Archetype;
  energy: number;
  cd: number;
  turn: boolean;
  weave: boolean;
  /** Omit / empty = any stance. */
  stance?: readonly Stance[];
};

export const SKILLGRAMS: Record<string, Skillgram> = {
  sg001: { id: "sg001", name: "Nanobot", arch: "support", energy: 8, cd: 0, turn: true, weave: false },
  sg002: { id: "sg002", name: "Charge", arch: "combat", energy: 5, cd: 1, turn: true, weave: false },
};

export function skillgram(id: string): Skillgram | undefined {
  return SKILLGRAMS[id];
}

export function skillgramOk(sg: Skillgram, stance: Stance | null) {
  if (!sg.stance || sg.stance.length === 0) return true;
  if (!stance) return false;
  return sg.stance.includes(stance);
}