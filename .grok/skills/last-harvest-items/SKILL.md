---
name: last-harvest-items
description: >
  Last Harvest pickups, shinies, resources r###, usable items i###, drop
  tables, ore. Use when Ivan asks about loot, ironwood, bloom-ore, salvage,
  consumables, shiny spots contents, or flavor text for items. Open
  last-harvest first. Not mech parts p###, not skillgrams sg###, not floor gen.
---

# Last Harvest — Items

**Open `last-harvest` then `last-harvest-makers` first.** Then this file + [references/catalog.md](references/catalog.md).

**No expiration systems** — no rot, no timed charges, no “use by floor”. `i###` stay until used or hauled.

**Hybrid:** loot ids are data. Shinies/props are **2D** (`last-harvest-terrain`). Do not drop `p###` on a planet. Crate art is 3D. Foes that carry bloom-ore are 3D meshes.

Owns **what you pick up**. Dungeon owns **where it spawns**. Enemies own **who is holding the weird weapon**. Parts `p###` stay Solace. Skillgrams `sg###` stay `last-harvest-skillgrams` (player: Programs). Ivan owns names and flavor; do not overwrite a name he set.

## Three piles (do not mix)

| Id | Pile | Goes |
|----|------|------|
| `r###` | **Resource** — trade scrap | Ship vendor / Halle. No combat use. |
| `i###` | **Item** — usable / key / unique salvage | Inventory, later dialogue keys |
| `p###` | Part | Hangar only. **Never** a planet drop. |

Energy is not an item. Shinies refill energy **and** grant one `r###` (sometimes `i###` later).

## Why Veldt-9 (frozen)

The forest was chosen because **Bloom-ore (`r004`)** veins are dense here. Tribal smiths work it on **warped living anvils**. That ore makes crude weapons that **can actually bite a labor crate** — otherwise goblins would not be a drop target.

Other planets have less of this ore (or none in slice 1). Do not invent a second “anti-mech metal” id.

## Slice 1

Shinies (`sh001`): energy + one roll on Veldt table (ore weighted high). No `i###` yet. Next free item **i001**.

Bump-kills may drop the same table (orc/blacksmith slightly more `r004`).

HUD: inventory counts (ore / splinter), not a “wood” string. Bag logic is `last-harvest-inventory`.

## Files

`src/game/items.ts` — catalogs + `rollShiny(biome)` + `rollKill(kind)`  
`src/game/sim.ts` — calls roll, does not inline names (S16)

## Fail

- Parts dropping on the planet
- Energy as `r###`
- Chests
- Overwriting Ivan’s flavor
- Putting drop tables only inside `LastHarvest.tsx`
- A new ore id per biome that is the same fiction
- Item expiration / rot / timed charges
