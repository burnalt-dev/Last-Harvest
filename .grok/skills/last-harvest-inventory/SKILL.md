---
name: last-harvest-inventory
description: >
  Last Harvest bag UI, stacks of r### and i###, what you can use on a drop
  vs on the ship. Use when Ivan asks about inventory, bag, ore count, using
  an item, unique salvage in the pack. Open last-harvest first. Drop tables
  stay last-harvest-items. Parts p### stay hangar. Energy is not inventory.
---

# Last Harvest — Inventory

**Open `last-harvest` then `last-harvest-makers` first.** Then `last-harvest-items` for *what* a shiny rolled. This skill owns **the bag**. No expiration on stacks.

**Hybrid:** bag UI is 2D plates (`last-harvest-shell`). No 3D stash. `p###` never lands in the bag.

We did **not** have an inventory. Dungeon state had `scrap`/`ore` ints. That is not a bag.

## Piles in the bag

| Id | Stacks? | Use where |
|----|---------|-----------|
| `r###` | yes | Ship vendor (Halle later). No combat use. |
| `i###` | usually 1 | Drop and/or ship, per item spec |
| `p###` | never here | Hangar only |
| energy | never here | Skillgrams (player: Programs) |

Ivan owns flavor. This skill does not rename `r004`.

## Slice 1 (Ivan 2026-09-03)

Bag exists as **data** (`src/game/inventory.ts`): stacks of Veldt `r001` / `r004` (and any other Veldt rolls). No `i###` yet. HUD: count of bloom-ore + splinter (shell). Full bag plate **later** unless Ivan picks UI now.

Kills and shinies call `inventory.add(id, n)` after `last-harvest-items` rolls.

## Files

`src/game/inventory.ts` — `Bag`, `add`, `count`, `spend`  
`LastHarvest.tsx` — optional bag plate (shell wires only)

## Fail

- `p###` in the bag
- Energy as a stack
- Chests
- Drop tables duplicated here
