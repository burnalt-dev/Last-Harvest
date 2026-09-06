/** last-harvest-programs — slice 1 live costs. Catalog may retune later. */

export type Archetype = "combat" | "support" | "exploration";

export type Program = {
  id: string;
  name: string;
  arch: Archetype;
  energy: number;
  cd: number;
  turn: boolean;
  weave: boolean;
};

export const PROGRAMS: Record<string, Program> = {
  s001: { id: "s001", name: "Nanobot", arch: "support", energy: 8, cd: 0, turn: true, weave: false },
  s002: { id: "s002", name: "Charge", arch: "combat", energy: 5, cd: 1, turn: true, weave: false },
};

export function program(id: string) {
  return PROGRAMS[id];
}
