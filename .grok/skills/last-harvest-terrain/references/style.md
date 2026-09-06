# Style lock

Canon look: `assets/examples/concept-labor-forest.png` (the goblin / orc / crate collage).

**Hybrid:** tiles stay **2D iso**. The live crate is **3D toon** in the Bay — do not paint a wanzer onto a floor cell. Foes are **3D** (`foe3d`); do not blit enemy PNGs onto the drop.

Keep:

- SNES HD pixels, dark 1px outline, limited palette
- A little **cartoony** — round bushes, readable moss clumps, dirt path like a SNES RPG, not photo-real
- Forest: moss green, packed dirt, chunky tree columns, warm light from upper-left
- Same outline weight as the labor crate (so the mech sits in the world)

Change:

- Camera is **Front Mission 3/4**, not the concept’s 3/4-from-above square tiles
- Ground reads as a **2:1 diamond**, not a flat square
- No actors on tile art (the collage had goblins and the crate — those are `last-harvest-enemies` / Solace)

## Per biome (same outline language)

| Biome | Floor feel | Wall / prop | Hazard | Fog |
|-------|------------|-------------|--------|-----|
| Veldt-9 forest | moss + dirt diamond | tree trunk / canopy cube | thorn pit or root hole | grove that **parts** |
| Ossuary Prime | cracked bone-stone | giant rib / ruin cube | black pit | rubble that **cracks into a path** |
| Brine-Khar | wet plank / ore diamond | timber shaft cube | flood water | black water that **recedes into a shaft** |

Do not jump to a new paint language per planet. Recolor + silhouette, same pixel weight.

## Fail

- Top-down square tiles “like the collage”
- Photoreal Unreal forest
- Chests, loot beams, UI labels
- Mech or enemies painted into the floor
- Fog as a flat green/grey diamond (forest fog is trees)
