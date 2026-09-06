---
name: last-harvest-terrain
description: >
  ALWAYS use this skill when making Last Harvest terrain, tiles, map props,
  trees, fog of war, shinies, Veldt-9 forest, Ossuary Prime ruins, Brine-Khar
  mines, iso diamonds, canopy, rubble fog, flood fog, or dungeon scenery.
  **2D iso only — never WebGL the floor.** Do not draw the labor crate, Gasket,
  or enemies. Example-first: image-to-image assets/examples, pack with
  scripts/pack-terrain.py into public/game.
---

# Last Harvest — Terrain

**Always.** Any floor, wall, tree, fog, prop, or shiny goes through this skill.

## Open first

0. **`last-harvest` then `last-harvest-makers`** (always) — canon, QA, state  
1. **`solace-mech-look`** → [world-style.md](../solace-mech-look/references/world-style.md) (same 3/4 + 1px as the wanzer)  
2. this file  
2. [references/fog.md](references/fog.md) — **required** if the task touches uncover / unseen tiles  
3. [references/style.md](references/style.md)  
4. [references/iso-tiles.md](references/iso-tiles.md)  
5. [references/props-and-shinies.md](references/props-and-shinies.md)  
6. Matching example in `assets/examples/`  
7. `scripts/pack-terrain.py` → `public/game/tiles/<biome>.png` + `<biome>-fog.png`  
8. `src/game/solace3d/Drop3D.tsx` plants those textures on occupancy diamonds · `src/game/sim.ts` plant density  

Chat beats this. Dungeon rules: `last-harvest-dungeon`. Foes: `last-harvest-foe3d`. Crate: **3D** `solace-rig`. Do **not** draw Solace, Gasket, or enemies on tiles.

**Hybrid:** this skill is **2D iso art**. Drop plants those textures on occupancy XZ diamonds (`Drop3D`, S59) — not a 3D mesh floor. Bay hanger diamonds are `last-harvest-3d`. Never extrude/voxel the Veldt (`last-harvest-iso3d` dropped).

## Example-first

One prompt = one cell. Image-to-image the example. Key magenta **and** rose JPEG (~180,10,110). Zero RGB on alpha 0.

| Want | Example | Runtime |
|------|---------|---------|
| forest t001–t004 | `last-harvest/assets/terrain/forest.png` | `tiles/forest.png` 2×2 |
| forest fog t005/t006 | `forest-fog-closed.png` / `open` | `tiles/forest-fog.png` |
| tree pr001 | `pr001.png` | `props/pr001.png` |
| sparkle sh001 | `sh001.png` | `props/sh001.png` |

Ossuary / Brine sheets: [future.md](../last-harvest/references/future.md). Not in `public/game`.

## Fog (slice 1)

Veldt-9: closed grove / opening canopy. Other biomes wait.

## Slice 1 draw contract (Veldt-9)

Rebuilds failed when unseen tiles were **flat grey diamonds** and blocked tiles were **moss cubes**.

| State | Draw |
|-------|------|
| never seen | `tiles/forest-fog` cell 0 (closed grove). Not a grey diamond. |
| seen, not Radar | fog cell 1 (canopy opening). |
| vis walkable | `tiles/forest` floor (dirt/grass). Faint diamond corners. |
| vis blocked | **same dirt floor** + `props/pr001` (or pr002) tree. Tree blocks. Not the wall cube as the read. |
| stairs | forest stairs cell + cyan marker OK |
| shiny | `props/sh001` sparkle, not a chest |

Radar 5 so the starting path is a battlefield. Background fill `#0c1810`. CSS-pixel canvas (shell skill).

Pack with `scripts/pack-terrain.py`. Vault copies live in `last-harvest/assets/tiles` and `props`.

## Forest density

Trees are fine; **count is low**. Plant ~14% of room interiors (4 walkable neighbors). Keep corridors. Next free forest tile **t007**.

## Fail

Fog as multiply or **fill-diamond** (S6). Same uncover art on every planet. Chests. Actors on tiles. Skipping this skill. Plant >20% interiors (S7). Pack with BOX/nearest crunch. Magenta left opaque (S9).

## Done means

Each biome’s unseen map is its own material. Forest is walkable, not a thicket. Pack script wrote the fog sheet the drop actually loads.
