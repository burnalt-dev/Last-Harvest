---
name: solace-toon
description: >
  Last Harvest 3D toon mats — DUMMY. Pixel canvas mats + outline live in
  solace3d/tex.ts until messy. Open last-harvest then last-harvest-makers.
  Not a second renderer. Not realtime shadows.
---

# Solace Toon (dummy)

**Open `last-harvest` then `last-harvest-makers` first.** Then `last-harvest-3d`.

**DUMMY.** Toon lives in `src/game/solace3d/tex.ts` (pixel mats, cyan visor, yellow hatch, dark outline). Do not split a materials skill until Ivan says the file is messy.

## When live

Owns ramps, outline shell, visor/hatch keywords. Still no realtime shadows (they clash with 2D tiles).

## Must not

- A second renderer
- PBR / environment maps as the crate look
- 3D shadows + 2D sprites
- Imagine 4-dir to “fix” toon
