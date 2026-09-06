# Fog of war — one **sprite** per biome

**Range / vis / HUD slates** = `last-harvest-radar`. This file is only the **picture** of unseen tiles.

Radar swap is a **sprite swap**, not a grey multiply and not CSS fade on actors.

Every biome ships `public/game/tiles/<biome>-fog.png` (2×1): **TL closed**, **TR opening**. Image-to-image the example, then `python3 scripts/pack-terrain.py`.

Shared states (all biomes):

| State | Draw |
|-------|------|
| never seen | closed cell |
| seen, not in Radar | opening cell |
| in Radar, walkable | real floor; fringe neighbors may keep a thin opening overlay |
| in Radar, blocked | real wall/prop |

Never reuse forest trees on a later planet. Ossuary rubble fog and Brine water fog: [future.md](../../last-harvest/references/future.md). Do not pack those sheets until Ivan asks.

## Veldt-9 — canopy opens (slice 1)

Closed **t005**: dense grove, no path.  
Opening **t006**: trunks part, dirt/moss diamond shows through.  
Visible walls: **pr001/pr002** trees, block movement.  
Plant only ~14% of **room interiors** (4 open neighbors). Never spawn, stairs, corridors.

## Fail

- Flat green/grey diamond for unseen forest  
- Mist overlay instead of trees  
- Chests, actors, crate on fog cells  
- Shipping ruins/mines fog PNGs before those planets are the task
  
