---
name: solace-mech-look
description: >
  Last Harvest ART STYLE kernel for Solace parts, Veldt enemies, and terrain
  so they do not clash. Open last-harvest first. Use for wanzer look, resource
  backpack on body, arm bases ape/crane/stork, cyan visor, yellow stripe,
  Front Mission 3/4, world-style coherence, bloom-ore cyan rhyme, tool-chest
  scrap, Ivan 4-dir north-star. Not packing, not ids, not drop tables.
---

# Solace Mech Look

**Open `last-harvest` then `last-harvest-makers` first.** Then this file. Then the **owner** (`solace-parts3d` crude plates / `solace-mech-parts` parked, `last-harvest-foe3d`, `last-harvest-terrain`, or `last-harvest-companion`).

**49A:** no extra look/socket skills. Battle is always 3/4. N = 3/4 back, never top-down. **S50: no portrait camera.** **No flip** — all four dirs authored.

**World coherence:** [references/world-style.md](references/world-style.md). Direction **options** live in `last-harvest-concept` (numbered picks). This skill is the **lock** after Ivan picks.

**Hybrid:** Solace look is **3D toon** (pixel mats + outline). Terrain stays **2D iso** using this same kernel (3/4, 1px, cyan rhyme). Gasket and foes are **3D meshes** on the drop (`gasket.ts` / `foe3d`). Do not Imagine 4-dir crate parts.

## North star (Ivan 2026-09-03)

[assets/north-star-4dir.jpg](assets/north-star-4dir.jpg) — **four battle 3/4** views. No portrait. [views.md](references/views.md).

**Tool-chest / Type C is scrapped.** Do not generate stacked drawers as the hull.

Language:

- Chunky industrial **humanoid wanzer** (Front Mission read). Grey riveted plates, blocky shoulders, piston legs, bucket/block head, **cyan visor bar**, **caution-yellow** hatch on pauldrons.
- Not Gundam skirts. Not Master Chief / MJOLNIR / Halo visor. Not a cube-on-legs. Not a standing toolbox.
- Every **body** includes a **resource backpack** (haul). That pack is **locked to the body mesh** — swapping body swaps the pack. Not a slot. Not animated separately.
- **Back slot** is **skillgrams + stats only**. No silhouette. Extra equipped Programs besides level-up picks and found `sg###`.
- `companion_mount` PNG leftover sits on the **body rear**. Live 3D perch is **`gasket_mount`** (`last-harvest-companion`). Gasket is not a backpack mesh.

## Modular vs not (frozen)

| | Modular? | Author as |
|--|----------|-----------|
| Solace frame | **yes** | **3D sockets** on the armature. Yaw, not 4 PNG dirs. Default **none**; crude plates parent on |
| Gasket | **no** | One cute 3D mesh (`gasket.ts`) in Bay **and** drop. PNG is look ref only |
| Enemies | **no** | 3D `buildFoe` on the drop. Packed PNG sheets are look refs |
| Terrain / anvil | **no** | **2D** tiles and props on occupancy diamonds |

Arms are **not** left/right ids. Weapons are the only L/R: right main, left off. Head is the **entire head**, never a hat-only swap.

Every `armL`/`armR` id declares a **base**. Anim differs per base (`solace-mech-anim`). Hands stay on the weapon.

| Base | Idle | Motion |
|------|------|--------|
| **A ape** | long thin pistons, extra elbow, knuckles hang | teeter / almost-tip comic |
| **B crane** | boom hinges, folds around girth | fold-out reach |
| **C stork** | telescoping pipes, elbows way out | sway, counterweight lean |

Grey starter arms: **B crane**. Ape / stork = later (not slice 1 grey). Flamboyant extras sit **on** a base.

Wrap-elbow (old D) is not a base — pipes must not hug the chest (that fuses to body).

## Prompt lock (paste)

Front Mission 3/4 isometric, SNES HD pixel, dark 1px outline, grey riveted steel, cyan visor slit, yellow caution hatch. Humanoid wanzer, resource pack **on the body**, magenta `#FF00FF` void, no floor. Isolated **one slot** unless look-dev sheet. Open wrist on arms. Weapon includes grip. No dual scythes/shields/guns. No toolbox drawers. No Halo gold visor.

Prompt lock: **3D toon** (pixel canvas mats, cyan visor, yellow hatch, crane limb). Do not Imagine-isolate new dirs. North-star JPG is silhouette only.

## Who does what

| | Owns |
|--|------|
| **this** | North-star, prompt lock, arm bases, backpack-on-body, **world-style kernel** |
| `solace-mech-parts` | B1, ids, sockets, pack. **Reads this before pixels** |
| `last-harvest-foe3d` | Foe meshes. **Reads world-style** so they do not look like mini-wanzers |
| `last-harvest-terrain` | Tiles/fog/props. Same camera + outline |
| `last-harvest-companion` | Gasket cute, **same outline/iso** |
| `last-harvest-3d` | Runtime crate / Gasket 3D. **Reads this** |

## Fail

- Toolbox / stacked-drawer hull
- Backpack as its own animated part or `p###` back mesh
- Skills painted onto the backpack
- Arm that does not name a base
- Wrap-elbow fused to drawers
- Master Chief / Gundam skirt / dual kit
- Using `solace-mech-parts/references/prompts.md` crate-bucket copy instead of this lock
- Enemy with visor bar / yellow hatch / resource pack
- Wanzer with root-haft tribal weapons as grey stock
- Isolating Gasket or enemy limbs as if they were `p###`
- Fusing a full wanzer when the ask was one slot

## Live tree

**3D path (Ivan 2026-09-03):** new Solace art is `last-harvest-3d` slot meshes, not Imagine isolates. North-star sheet is still the silhouette to hit. PNG B1 leftover is Mech Test only.

**RJ family (later, two-tile jump):** 5 heavy · 10 jump-jack · 11 frog · 12 grasshopper · 13 armored springs. **14 squat scrapped.** Hover parked.
