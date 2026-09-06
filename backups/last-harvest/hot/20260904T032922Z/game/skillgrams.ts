/** last-harvest-skillgrams — slice 1. Player-facing name is still "Programs". */

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
};

export const SKILLGRAMS: Record<string, Skillgram> = {
  sg001: { id: "sg001", name: "Nanobot", arch: "support", energy: 8, cd: 0, turn: true, weave: false },
  sg002: { id: "sg002", name: "Charge", arch: "combat", energy: 5, cd: 1, turn: true, weave: false },
};

export function skillgram(id: string): Skillgram | undefined {
  return SKILLGRAMS[id];
}
