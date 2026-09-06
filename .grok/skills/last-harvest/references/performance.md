# Performance — already opted in

Target: SNES-smooth iso on phone, short boot, no hitch on Charge.

## Load only the current area

| Screen | Load |
|--------|------|
| Title / boot | **Gasket only.** No part atlases. No biome. Dungeon JS is `import("./play")` after Board |
| Kit pick | `preloadLoadout` for that kit’s `p###` |
| Drop / dungeon | **that biome’s** tiles + enemies + equipped kit. Not the other two biomes |
| Ship | gasket. No enemy/biome tiles |
| Hangar | equipped B3. No dungeon tiles |

Never preload every part because a shiny *might* drop a cosmetic. Cosmetics are hangar-only; shinies give **resources**.

## Hangar lock

`pilot.loadout` cannot change on a planet. Dungeon never opens a parts picker. That is what keeps the composite cache tiny (one kit × 4 dirs, not every grey part).

## Draw

- One `drawImage` of the cached **384** composite per crate per frame (`solace/compose.ts`).
- Rebuild cache only on loadout / paint / pose / dir / **idle frame** (2 canvases, not per tick).
- `imageSmoothingEnabled = false`. Integer dest.
- **Never** assign `canvas.width`/`height` inside rAF unless the CSS rect changed (clears the bitmap).
- No per-tick `getImageData`, filters, or restacking five PNGs.
- Charge: cap steps (≤6), no unbounded loop, no per-pixel work.

## Boot

Title is the **first paint**. Do not mount a visor/boot screen that waits on PNGs. `preloadBoot()` = gasket only. `preloadLoadout` on kit pick. `import("./play")` + `preloadBiome` on Board. No Google Fonts. Intro stays cut.

**Check:** hung `/game/**` still shows “Board the Harvester” in < 1.5s.

## Audio

Unlock on first gesture. Do not decode long samples at boot. Theme may loop after title confirm.

## Checklist (with QA)

- [ ] Network: dungeon session does not request other biomes’ tiles/enemies
- [ ] Network: dungeon session does not request unused kit sheets
- [ ] Cache: moving does not rebuild the composite
- [ ] Charge does not drop FPS off a cliff
- [ ] Boot does not generate or fetch the intro cinematic
