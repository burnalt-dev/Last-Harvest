# Props and shinies

Props are **not** baked into the floor. Isolated magenta PNG, y-sorted with actors, may overlap neighbor diamonds.

## Props (`pr###`)

| Id | Biome | What | Blocks? |
|----|-------|------|---------|
| pr001 | forest | chunky round-canopy tree | yes (`tile===1`) |
| pr002 | forest | taller/lopsided tree (or flip of pr001) | yes |
| pr003 | forest | warped living **anvil** (bloom-ore ironwood) | **no** — smiths spawn on it, walk off; anvil stays |
| pr011 | ruins | giant rib shard | later |
| pr021 | mines | timber post + lamp | later |

Companion is ¼ tile. Forest trees are about crate height. Leave corridor diamonds walkable — do not tree every tile.

Plant density (forest): after carve, convert **~14%** of room interiors (4 walkable neighbors) to trees. Never spawn, stairs, or 1-tile corridors. Dense thicket is a fail.

## Shinies (`sh001`)

Sparkle on the diamond. **Not a chest.** Pickup = energy + `last-harvest-items` roll (Veldt: bloom-ore weighted).

## Enemy handoff

`last-harvest-enemies` uses this palette and scale. Do not draw goblins on the tiles.
