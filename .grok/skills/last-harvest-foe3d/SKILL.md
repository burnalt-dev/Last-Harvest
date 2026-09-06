---
name: last-harvest-foe3d
description: >
  Last Harvest 3D enemies. Forest beastmen toon meshes on the drop
  (stripekin, antlerkin, rootwarden, barkback). Same primitive/toon
  language as Solace, not wanzer parts. Open last-harvest then
  last-harvest-makers first. Terrain stays 2D.
---

# Last Harvest — Foe 3D

**Open `last-harvest` then `last-harvest-makers` first.** Then `solace-mech-look/references/world-style.md`.

**LIVE.** Owns `src/game/solace3d/foe3d.ts` → `buildFoe(kind)`. Planted by `Drop3D.tsx`. Concepts: `assets/forest-beastmen/`.

Same **construction** as the crate (toon mats, outline, clustered primitives). Different **materials** (moss hide, bark, antler, cream belly). Cyan = bloom-ore spark only.

| Kind | Mesh (concept) | Scale |
|------|----------------|-------|
| small | **Stripekin** spear chaff. Stripes on **face / mane / tail / ankle**. Torso = tan pelt + **~30–40% scrap** (one pauldron, straps, belt, one bracer). No cuirass. Stone-tip spear. Faces ¼-step / attack / aggro via `faceSmall`; `tickFoe` idle. | 0.24 (¼-grid) |
| big | **antlerkin** stag + ore maul | 0.92 (almost crate) |
| elite | **rootwarden** + pickaxe (NOT scythe) | 0.92 |
| smith | **Barkback** taller walking bunker (~head over Solace): bark+scrap shell, **hollow-trunk shield + oversized scrap mace**. Shield sponge / soak — not Antlerkin maul, not squat chibi. Full-tile. Nest **≤2**. Concept bunker-v5 (`assets/forest-beastmen/barkback-bunker-v5.png`). | 1.08 |

Parked in the pack (no live kind yet): `scrap-hound` (quad), `sapjaw` (resin spit).

## Must

- Geometric / toon mats (`tex.ts`). Outline. **No** visor bar, **no** yellow hatch, **no** resource pack
- Small foes ¼-grid occupancy (`last-harvest-grid`)
- Bloom-ore cyan on eyes + wrong tools (same family as visor cyan, never a slit)
- Anvils stay floor props (`pr003`). Never parent the anvil
- Rootwarden weapon is a **pickaxe**, never a harvest scythe

## Must not

- Modular foe parts / `p###` sockets
- Photoreal fur / painted cards as the live mesh
- Imagine 4-dir foe atlases as the live drop blit
- WebGL a 3D mesh Veldt floor
- Dress Labor as the foe body

## Fail

PNG `drawSheet` of goblin/orc/blacksmith **or** these concept sheets in the live drop. Foes parented onto Solace sockets. Yellow caution tape on a beast.