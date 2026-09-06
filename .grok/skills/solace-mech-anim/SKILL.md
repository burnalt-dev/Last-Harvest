---
name: solace-mech-anim
description: >
  Last Harvest 3D Solace clips. Idle, walk, harvest swing, later RJ/hover.
  Open last-harvest then this before adding or retiming crate motion.
  Timing cards here; play in solace-rig kit.ts (or solace3d/anim.ts mixer).
  Not Imagine frames. Not Gasket. Not 2D B1 atlases.
---

# Solace Mech Anim (3D)

**Open `last-harvest` then `last-harvest-makers` first.** Then this. Sit: `solace-gold`. Groups: `solace-rig`. Scene: `last-harvest-3d`.

**Hybrid:** clips play on **3D joints**. Do not Imagine 4-dir walk cycles. Gasket hops are companion (`gasket.ts` tick).

**Job:** clip **names + timing + must-not**. Do not design new meshes here. Do not mint `p###` for a frame.

**Play:** `src/game/solace3d/kit.ts` today (`tick()` idle on **joints**, `swing()` harvest on spine/arms). 2D PNG idle is leftover. Gasket hops are `last-harvest-companion`, not this.

## Clips (live vs later)

| Clip | Status | Who plays |
|------|--------|-----------|
| `harvest` | Live (back burner) | `kit.swing()` |
| `idle` | **Live** | `kit.tick()` — hang **upper.x ≈ π**. Saw/slab hang. Lance **elbow −π/2**. Scythe hip farmer-cut (upper ~2.2); snath seats through both grippers |
| `walk` | Later | piston 1-tile; crane arms sway |
| `glide` | Later | hover legs only |
| `jump` | Later | RJ 2-tile |
| `aim` | Later | cannon; not harvest |
| `fire-melee` | = `harvest` for scythe | 3-wide front |

Arm bases (crane / stork / later ape) **share clip names**, different timing cards.

## Budget (SNES, not film)

Few keys, lerp, smear only on the cut. 60 Hz ticks.

| Clip | Keys | Dur (ms) | Notes |
|------|------|----------|-------|
| harvest | wind / cut / recover | **880** | yaw ~+1.35 → −1.5; slash stamps the **blade mesh** |
| idle | 2 | **1600** loop | piston settle; visor pulse; feet planted |
| walk | 4 | ~400 / step | later |

## Harvest (locked to gold)

Hands **stay on the snath**. Swing the `swingRig` + coil **body/legs/head**. Do not lerp arms off the pole.

Trail = clones of the **blade** glow, not a ring. Fade in world.

Full card: [references/clips.md](references/clips.md).

## Workflow (every new clip)

1. This file + a card in `clips.md`.  
2. `solace-gold` if sit numbers move.  
3. Play in `kit.ts` (or mixer).  
4. `npm run vault:hot` (kit.bak).  
5. Bay button or dungeon hook — Ivan sees it.

## Must not

- Blade detached from the snath (floating C)  
- Imagine 4-dir walk cycles  
- New part id per frame  
- Puppet FK that drops the scythe  
- 2D B1 atlases for new Solace motion  
- Modular Gasket clips here  

## Fail

Arms flap off the pole. Slash is a disc not the knife. **Blade not on the ferrule.** Idle that changes occupancy. Clip with no card.
