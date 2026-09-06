---
name: last-harvest-grid
description: >
  Last Harvest occupancy grid. Pilot = full tiles. Gasket + small enemies =
  1/4-square sub-grid. Shared small-unit stepper for move/collision/occupancy/
  pathing. Open last-harvest then last-harvest-makers first. Not crate art.
  Not 3D Bay diamonds (that is last-harvest-3d S58).
---

# Last Harvest — Grid

**Open `last-harvest` then `last-harvest-makers` first.** Then this.

Owns **who occupies which square**. Bay plant/yaw is `last-harvest-3d`. Drop plant is `Drop3D` + `last-harvest-terrain` (2D floor). Gasket *behavior* is `last-harvest-companion`. Foe *mesh* is `last-harvest-foe3d`.

## Lock

| Unit | Occupancy | Stepper |
|------|-----------|---------|
| Pilot / crate | **1 tile** | crate `DIR` |
| Gasket | **¼-square** | **shared small-unit stepper** |
| Small foes (**Stripekin**, later ghost / crawler) | **¼-square** | same stepper |
| Big foes (orc, smith, later skeleton) | almost crate / 1 tile | crate stepper |

Gasket footprint **must not consume a full tile**. Four Gaskets (or goblins) can share one crate tile without blocking the crate the way a second wanzer would.

Move / collision / occupancy / pathing for small units go through **one** stepper. Do not give Gasket a private grid that foes cannot use.

## Occupancy law V1 (2026-09-06)

Full diamond = **4×¼** (2×2). Stripekin-class occupy **exactly one ¼** with own entity id + own HP. Pilot / Barkback occupy the **whole diamond** (blocks all 4). Two smalls cannot share a ¼. Small step = one ¼ (`stepSmall`). Shared map Nest + drop: `canEnterQuarter` / `canEnterTile` / `walkableSmall`. Smoke `OCC_SPAWN` / `OCC_STEP` prints `{entityId, subCell, hp}` plus `uniqueIds===N distinctSubCells===N hpPools===N`. Nest Move stick: Gasket NESW ¼ + **Step ¼** one Stripekin. Pack UI is per-body (sum is derived). Overlay lines = later feed.

**Runtime stepper live** (`src/game/grid.ts`). Nest + drop use `stepSmall` / `walkableSmall`. Gasket follow is ¼-step (`csub`). Small foes ¼-step. Pilot `playerAct` stays full-tile. Do not “fix” Gasket by making him full-tile. Overlay lines = later feed.

## Must

- Small units address sub-cells: tile `(x,y)` + quadrant `0..3` (2×2)
- Crate bump / scythe wide-3 still hits every small unit on those tiles
- Mounted Gasket occupies `gasket_mount`, not a floor tile

## Must not

- Full-tile Gasket or goblin
- A second pathfinder only Gasket understands
- WebGL occupancy
- Changing Bay iso diamonds in this skill (S58)

## Fail

Gasket blocks like a crate. Goblin pathing copied from crate 1:1. Inventing `last-harvest-gasket-grid` as a third skill.
