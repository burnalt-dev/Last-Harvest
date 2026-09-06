---
name: last-harvest-concept
description: >
  Last Harvest concept picks. Solace parts use the 3D rig (not Imagine
  4-dir). Exports SENW + isolate reference sheets. Foes/Gasket are 3D
  (`foe3d` / `gasket.ts`). Open last-harvest first. Not packing, not
  live dungeon.
---

# Last Harvest — Concept

**Open `last-harvest` then `last-harvest-makers` first.** Then **this.** Solace: `last-harvest-3d` + `solace-rig` + `solace-mech-look`. Do **not** Imagine four dirs of a fused wanzer.

**Hybrid:** crate concepts are **3D groups on the armature**. Terrain is not this skill. Foes are **3D** (`foe3d`); numbered 2D sheets are look refs. Gasket concepts feed `gasket.ts` (one cute mesh).

Picks: Solace → `solace-rig` (3D group). Foes → `last-harvest-enemies`. Gasket → companion / 3D `gasket.ts`.

## Always in chat

Ivan must **see** the sheet. `view_image` is agent QA only.

1. Build or swap the **3D kit** (or numbered 3D foe/Gasket look refs).
2. Export a **reference sheet** (`npm run concept:sheet` or Bay **Ref sheet**).
3. Final message: **`render_file`** each PNG + numbered list.
4. **Title → Concepts** (current `roster.json` only) and **3D Bay** for the live kit.

```
1  short name — slot it swaps
2  short name — slot it swaps
…
Include: reply with numbers (e.g. 1 3). Skip: 0
```

## Three tracks

| Track | Modular? | How to concept | After pick |
|-------|----------|----------------|------------|
| **Solace** | **Yes, 3D groups** | Same `kit.ts` slots. Sheet = SENW assembled + isolate of that slot | `solace-rig` mesh, not B1 PNG |
| **Enemies** | **No** | Whole 3/4 figure (3D `buildFoe`; PNG roster is look ref) | `foe3d` |
| **Gasket** | **No** | Cute one mesh (3D default in bay **and** drop) | `gasket.ts` / `g###` |

Do not mix tracks unless he asked for a scale lineup (crate + Gasket + goblin).

## Solace (3D)

If it cannot swap as a **group** (`head` `body` `legs` `arms` `weapon`), it is not a concept. Fail fused pretty bots.

Required on the sheet or the numbered list:

- **head** whole
- **body+pack** + `gasket_mount`
- **legs** one pair, 1 tile
- **arms** crane (grey) / stork — **whole limb** visible
- **weapon** includes grip; scythe is two-hand harvest

Reference sheet (every new part):

| Panel | What |
|-------|------|
| 2×2 | S E N W of the **assembled** crate |
| Row | **Solo** that slot (other groups hidden) × 4 dirs |
| Note | Height vs one forest diamond; scythe clearance if weapon |

How: `node .grok/skills/last-harvest-concept/scripts/export-ref-sheet.mjs` → `last-harvest-concept/assets/lookdev/` + `artifacts/lookdev/`. Preview `:8080`.

## Enemies / Gasket

Unchanged: numbered whole designs. No visor/hatch/pack on foes. Gasket not modular.

## Where files go

`last-harvest-concept/assets/lookdev/` and `/workspace/artifacts/lookdev/`. Never mint `p###.png` from this pass.

## Fail

- Imagine 4-dir factory for a new crate part
- Fused concept with no isolate row
- Packing `p###` in the same turn
- Options with no numbered list / no `render_file`
- Pointing Ivan at **Mech Test** (removed). Old lookdev sheets on the title.

## Done means

Numbered list + sheets Ivan can open. 3D Bay shows the live kit. No dungeon pack unless he asked.
