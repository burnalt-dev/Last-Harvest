---
name: last-harvest-enemies
description: >
  Last Harvest biome enemies (goblins, orcs, skeletons, ghosts, mine crawlers,
  floor-3 elites). **3D meshes on the drop** (`last-harvest-foe3d`). Open
  last-harvest then solace-mech-look (world-style) so foes match the wanzer
  camera/outline without looking like mini-mechs. Terrain and shinies belong
  to last-harvest-terrain. Crate is 3D, not this skill.
---

# Last Harvest — Enemies

## Open first

0. **`last-harvest`** then **`last-harvest-makers`** (always) + slice / build-slice-1  
1. **`solace-mech-look`** → [world-style.md](../solace-mech-look/references/world-style.md) (camera, outline, cyan rhyme — **required** before pixels)  
2. this file  
3. `last-harvest-terrain` iso scale  
4. `src/game/data.ts` enemy keys  
5. `src/game/solace3d/foe3d.ts` `buildFoe` — **live drop meshes**  
6. vault `assets/actors/` PNG sheets are **look refs only** (do not blit)  

Chat beats this. Do not draw floors here. **Foes are not modular** — never isolate an orc/goblin limb into `p###`.

**Hybrid:** dungeon foes are **3D** (`buildFoe` in `solace3d/foe3d.ts`). Packed PNG sheets are look refs only — do not blit them on the drop. Bay has no combat.

## Slice 1 (build this, only this)

Veldt-9. Runtime: `buildFoe` in `Drop3D`. Vault `assets/actors/goblin.png` `orc.png` `blacksmith.png` are look refs — **not** the drop blit.

| Kind | Mesh | Occupies | Scale | Stats |
|------|------|----------|-------|-------|
| Stripekin | `buildFoe("small")` | **¼-grid** (`last-harvest-grid`) | `0.42` | scrap spear (stone tip). HP band 12+floor*4. Packs share a tile. |
| orc | `buildFoe("big")` | almost crate | `0.92` | slag-bloom axe |
| smith | `buildFoe("smith")` | almost crate | `1.08` | Barkback taller bunker (hollow-trunk shield, oversized scrap mace). Not Antlerkin maul. Nest ≤2. |

Pack leftover: `scripts/pack-enemies.py` → vault only. Do not `drawSheet` those PNGs on the drop.

## Veldt-9 look (frozen)

They can hurt the crate because of **Bloom-ore**, not tech. Show that on the **mesh**. Forest pack: `last-harvest-foe3d/assets/forest-beastmen/` (stripekin / antlerkin / rootwarden / barkback / scrap-hound / sapjaw). 3D translation is **toon primitives**, not painted fur.

- Weapons are **wrong**: bent bloom-ore, root-hafted **pickaxe** (elite), maul, spear. Not a Solace scythe, not guns.
- Palette: moss hide, bark, antler, cream belly, **ore-cyan spark**. **No** visor bar, **no** yellow hatch, **no** resource backpack — those are Solace.

Slice 1 sheets stay as look refs. Next pass only if Ivan rejects a facing. `pr003` anvil prop still later.

Why the drop exists: `last-harvest-dungeon` + `last-harvest-items` (`r004`). Do not write drop tables here.

**Never** blit goblin/orc/blacksmith PNG on the drop (`last-harvest-foe3d`). Missing mesh is a QA fail — not a green diamond.

Later biomes (not slice 1): Ossuary ghost/skeleton, Brine crawler, floor-3 elites with parry/dodge banners.

## Locked catalog

| Biome | Small (¼ tile) | Big (almost crate) | Elite floor 3 |
|-------|----------------|--------------------|---------------|
| Veldt-9 | goblin tribe | orc | chieftain, different mass |
| Ossuary | ghost | giant skeleton | crowned ossuary |
| Brine-Khar | mineral crawler | larger crawler | flood-heart glow |
