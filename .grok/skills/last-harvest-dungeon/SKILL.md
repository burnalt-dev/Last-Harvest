---
name: last-harvest-dungeon
description: >
  Last Harvest planets, floors, resources, shinies, fog, flood, elites, room
  events. Use when Ivan asks about biomes, Veldt-9, Ossuary Prime, Brine-Khar,
  ore, shiny spots, three floors, optional elite, iso drop, mines flood.
  Resource catalogs are last-harvest-items. Do not use for hangar parts or programs.
---

# Last Harvest — Dungeon

## Open first

0. **`last-harvest`** then **`last-harvest-makers`** (always) — canon, QA, state  
1. this file  
2. [references/biomes.md](references/biomes.md)  
3. `src/game/data.ts` — planet names + tile/enemy keys  
4. `last-harvest-items` — `r###` / shiny rolls (do not duplicate the catalog here)  
5. `src/game/sim.ts` — generate floors, call `rollShiny`  
6. `src/game/solace3d/Drop3D.tsx` + `iso.ts` — 3D actors on 2D diamonds  

Combat numbers live in `last-harvest-combat`. Loot ids live in `last-harvest-items`. This skill decides **who is on the floor** and **Veldt-9 is the ore planet**.

Chat beats this skill. `last-harvest` beats old dungeon habits. Tile/prop/shiny **art** is `last-harvest-terrain` (**2D**). Foes are `last-harvest-foe3d`. Crate in the drop is the **3D armature**.

**Hybrid:** this skill owns **floor rules** (carve, trees, shinies, withdraw). Draw: 2D textures on occupancy diamonds + 3D actors (`Drop3D`). Occupancy: crate = full tile; Gasket/small foes = ¼-grid (`last-harvest-grid`). Do not WebGL a mesh Veldt (`last-harvest-iso3d` dropped).

## Why Veldt-9

Bloom-ore (`r004`) is dense here. That is why Rend authorizes this drop first. Do not equalize ore rates across biomes.

## Resource ids

Blocks (catalog in items skill): `r001–r009` Veldt, `r011–r019` Ossuary, `r021–r029` Brine, `r080–r089` elite, `r090–r099` scratch. Ivan owns flavor. Energy is not these piles.

## Slice 1 cut (obey last-harvest)

When `last-harvest/references/slice.md` says slice 1:

- **One floor.** Stairs **or successful withdraw** → drop-bay (Rend one-liner). `descend` returns null.
- **Veldt-9 only.** Do not generate Ossuary/Brine. Drop must not fetch those tiles.
- Radar starts at **5** (`derive`).
- Plant trees ~14% room interiors, 4 walkable neighbors.
- Shinies sparkle (`sh001`), grant energy + items-skill Veldt roll (ore-weighted `r004`).
- Enemies frequent (goblin/orc/smith via enemies skill). Adjacent foes **swing** after the player turn (`last-harvest-combat`).
- **Return / withdraw:** 5-turn spool. A **landed** hit on the crate cancels (parry/dodge do not). Launch banks `d.bag` into `pilot.stash`. Death **wipes stash**. Not an `sg###`.
- Tile 1 in forest is **impassable tree**, not a moss cube (render in terrain skill).

Full 3-floor / 3-planet loop is later. Do not “complete the vision” during a slice 1 rebuild.

## Frozen loop (full game, later)

Captain picks biome → **3 floors** → stairs home. Enemies frequent. Floor 3 has an **optional elite** (different sprite, better `r###`). Shinies, not chests. Planets drop **resources**, never `p###` parts.

Load **current biome art only**. Hover legs ignore flood push. Reverse-joint may leap 2 tiles (see `last-harvest`).

## Events

Roam Survival checks are live (`src/game/roam.ts`, hooked from `sim.afterWalk`). Not a VN. Logs + CAST/CLEAR banners. Fail-forward flags; ship-call fail still prints Rend/Halle (not deaf). Cadence 8–12 walks. Talking heads stay ship-side.

## Done means

- Three named planets, three floors, shinies sparkle, elite is skippable  
- Drop session did not fetch the other biomes’ tiles  
- Resource ids are `r###`, not “wood” strings in the HUD
