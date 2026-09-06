---
name: last-harvest-radar
description: >
  Last Harvest radar HUD, floor map slate, vis/seen, Manhattan range.
  Use when Ivan asks about radar, minimap, deck slate, fog of war range,
  red dots, shiny blips, Wits radar. Open last-harvest first.
  Fog *art* (canopy, rubble, flood) is last-harvest-terrain. derive().radar
  is last-harvest-combat. Do not use for crate parts or loot.
---

# Last Harvest — Radar

**Open `last-harvest` then `last-harvest-makers` first.** Owns **what the crate knows** and **the two slates**. Terrain owns the **look** of unseen tiles. Combat owns the **number** `derive().radar`.

**Hybrid:** HUD is 2D plates over **Drop3D**. Do not WebGL the radar. Actors are 3D; blips stay 2D tokens on the slate.

## Split

| Who | Owns |
|-----|------|
| this | `vis[]` / `seen[]`, Manhattan diamond HUD, full-floor Map plate, blips |
| `last-harvest-terrain` | closed vs opening fog **sprites** per biome |
| `last-harvest-combat` | `radar = 5 + (wits - 1)` (slice 1 floor **5**) |
| `last-harvest-shell` | Map / scope **plates** only — no blip rules |
| `last-harvest-companion` | later: Ranger extra reveal |

## Range (Ivan)

`derive().radar` is the **only** radius.

- HUD diamond size  
- `reveal()` → `vis` (current ping) and `seen` (fog stays open)  
- Shoot! “visible”

Slice 1: Wits 1 → **R5**. Each later Wits point is **+1 tile**. Same number on the scope (`R5`). No XP this slice, so you will not see it grow until a stat point or gear stamp.

Drop 3D cam does **not** match R5 as a walk sit. Far **11** ≈ walk; close **16** ≈ melee ring; **scope 5** ≈ Aim overwatch (≥3 tiles every DIR, crate-centered). The slate is still how you see the rest of the ping. Aim only fires on a **live vis enemy on that square**.

## Later

Ossuary / Brine keep **this** HUD. Only the fog sprites change. Ranger Gasket may extend `vis`. Do not add a second minimap style per planet.

## Files

`src/game/radar.ts` — `drawRadar`, `drawFloorMap`  
`src/game/sim.ts` — `reveal()` fills vis/seen  
`LastHarvest.tsx` — wires plates only

## Fail

- Grey multiply fog
- Euclidean circle
- Radar fetching ruins/mines art
- Blip logic copied into `LastHarvest.tsx`
- Fog canopy drawn in this skill
