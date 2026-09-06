import { derive, type WeaponId } from "./data";
import { emptyBag, type Bag } from "./inventory";
import { starterLoadout, type Loadout } from "./parts";

export type Pilot = {
  level: number;
  stur: number;
  avo: number;
  /** Wits (`per`). Player name is Wits, not Perception. */
  per: number;
  /** Bonus Survival from Gasket / parts / exploration Programs. Not a fourth primary. */
  survivalBonus: number;
  hp: number;
  max: number;
  weapon: WeaponId;
  loadout: Loadout;
  /** Equipped skillgram ids. Player UI: Programs. */
  skillgrams: [string, string];
  name: string;
  stash: Bag;
};

export function newPilot(): Pilot {
  const st = derive(1, 1, 1);
  return {
    level: 1,
    stur: 1,
    avo: 1,
    per: 1,
    survivalBonus: 0,
    hp: st.hp,
    max: st.hp,
    weapon: "blade",
    loadout: starterLoadout(),
    skillgrams: ["sg001", "sg002"],
    name: "Solace",
    stash: emptyBag(),
  };
}
