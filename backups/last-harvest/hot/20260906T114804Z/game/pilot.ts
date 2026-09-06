import { derive, runMods, type Difficulty, type Stance } from "./data";
import { emptyBag, type Bag } from "./inventory";
import { starterLoadout, type Loadout } from "./parts";

export type Pilot = {
  level: number;
  stur: number;
  avo: number;
  /** Wits. Survival is a substat of this, not a fourth primary. */
  wits: number;
  /** Bonus Survival from Gasket / parts / exploration Programs. Not a fourth primary. */
  survivalBonus: number;
  hp: number;
  max: number;
  weapon: Stance;
  loadout: Loadout;
  /** Equipped skillgram ids. Player UI: Programs. */
  skillgrams: [string, string];
  name: string;
  stash: Bag;
  /** Story | Default. Default combat numbers never see Story buffs. */
  difficulty: Difficulty;
  /** Debris Primer fired once per pilot. */
  primerDone: boolean;
};

/** Story | Default. Snap start Wits to that table so Default never keeps Story 9. Next Board / makeDungeon reads this — never mutate a live fight. */
export function applyDifficulty(pilot: Pilot, difficulty: Difficulty): Pilot {
  const mods = runMods(difficulty);
  const next: Pilot = { ...pilot, difficulty, wits: mods.witsStart };
  const st = derive(next.stur, next.avo, next.wits);
  next.max = st.hp;
  next.hp = Math.min(next.hp, st.hp);
  return next;
}

export function newPilot(): Pilot {
  const st = derive(1, 1, 1);
  return {
    level: 1,
    stur: 1,
    avo: 1,
    wits: 1,
    survivalBonus: 0,
    hp: st.hp,
    max: st.hp,
    weapon: "twohand",
    loadout: starterLoadout(),
    skillgrams: ["sg001", "sg002"],
    name: "Solace",
    stash: emptyBag(),
    difficulty: "default",
    primerDone: false,
  };
}
