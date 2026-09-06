# QA — problems we already paid for

**Always** (last-harvest SKILL): tick this file **and** [sustain.md](sustain.md) **and** the owner sister skill in the **same turn** as the code fix. A patch without a rule is how the title plates died twice.

Run this on any part drop, compositor change, dungeon draw, or “it’s broken again” pass. Bundle with [performance.md](performance.md). **Commands:** [commands.md](commands.md) (`npm run qa:game`). After a pass, leave a one-line note in [state.md](state.md).

## Veldt-9 looks like grey diamonds, not a game (2026-09-03)

- [x] Unseen was flat diamond fill (terrain fail). Closed fog = grove sheet `tiles/forest-fog`.
- [x] Blocked forest tiles were moss cubes. Now **dirt + pr001 tree**.
- [x] Radar 3 hid the battlefield. Slice 1 radar starts at **5**.
- [x] `devicePixelRatio` * setTransform threw the camera off on phones. Canvas is CSS pixels.
- [x] `loadOne` timeout could resolve without caching and never retry.
- [x] Faint diamond corners on visible floors.
- [ ] Enemies still placeholder-ish vs concept orc/goblin collage — later via `last-harvest-enemies`.

- [ ] Blade: **one** shield unit-left, **one** chainsaw unit-right. No dual shields. No dual saws.
- [ ] Scythe: **one** weapon. N/S = vertical pole in the **right** hand, not a mirrored pair, not a leftover shield.
- [ ] Cannon: **one** barrel. N/S actually change facing; fire/laser follows facing. No second gun.
- [ ] Two-hand kits occupy **both** hands; armL mesh stays; no free shield hand.
- [ ] Hands do not swap after a camera orbit (shield stays unit-left).
- [ ] Generator never “fixes” a mirror by cropping half the west/east scythe.
- [ ] Up/down frames are not chart leftovers. Shield matches other angles.

## Facings / scale

- [ ] Four battle dirs are real 3/4: S visor bar, E/W visor sliver, **N no visor**. Two visor-forward frames = missing north.
- [ ] West is not a duplicate south or a visorless north.
- [ ] Same crate **height** all dirs. Feet / soles on the same line (piston + RJ). Hover has **no** planted feet.
- [x] **S50** No hangar/portrait still. Mech Test is one 3/4 canvas. Status has no mech pic.
- [ ] Mech Test is **title only**, never on the ship.
- [ ] Idle squat does not lift soles off `foot_line_y`.

## Clipping / pairing

- [ ] No hard crop at cell edge. Overlap onto neighbors is OK.
- [ ] No missing arms / heads when pairing modular parts (overlap OK, absence not).
- [ ] No magenta / pink fringes in game (`#FF00FF` is authoring only).
- [ ] Do not slice a full-body composite into fake B1.
- [ ] Forest is walkable, not a thicket (~14% interior trees).

## Ids / load

- [ ] Registry ids match `p000` body, `p001` head, `p002` piston — not the old inverted map.
- [ ] Game does not fetch `/workspace/development`.
- [ ] Drop loads **this biome only**. Hangar/parts atlases stay unloaded in the dungeon.
- [ ] Compositor draws **one** cached canvas per unit per tick (idle frame is part of the cache key).
- [ ] `src/game` exists; if missing, restore from `/workspace/backups/last-harvest/` before inventing a new game.

## Feel checks

- [ ] Parry / dodge: screen-wide stylish text. Enemy procs look bad for the player.
- [x] Ranged: crosshair + click-to-tile (touch OK). **Aim only fires if a live vis enemy is on that square** (2026-09-05). Laser is visible, not a teleport hit.
- [x] **Shoot no-Aim** hits closest vis foe (same ¼ tiebreak). Does **not** open “Lance: pick a tile”. Empty field → `No target.` (2026-09-06).
- [ ] Scythe 3-tile can hurt Gasket if they share a square in the arc.
- [ ] Companion is ¼ tile; mech may span/overlap.
- [ ] Iso d-pad present on dungeon; camera is close (crate fills the tile).
- [ ] Scope is vis-only Manhattan; slate shows seen terrain + vis tokens.

## Anim (current)

- [x] Idle: Mega Man X **2 frames / 24 ticks**. No puppet bob. Body/arms idle.
- [x] B3 cells are **384**, packed `pack-hd-seat.py` only. `pack-b3.py` is dead.
- [ ] Walk / jump / hover bob not started (`solace-mech-anim` after greenlight).
- [ ] Live B1 is still tool-chest; look north-star is Ivan wanzer sheet — hull rebuild when asked.

Do not author walk/jump until Ivan greenlights.

## Title buttons (2026-09-03)

Dead title plates: **never SSR the clickable plates** (Grok shows HTML before hydrate). SSR heading only. Plates mount after `data-live=1`. Never `mt-auto` the title/bay actions under preview chrome. Never run `AudioContext` before `setMode`. Drop must not wait forever on tiles (1.4s fallback).

- [x] Title actions sit under the pitch, **not** the bottom edge. `z-[80]`. Canvas is `pointer-events-none`.
- [x] One `[data-qa=title-board]` instance **after hydrate**. `ssr: true` heading; plates client-only.
- [x] Unknown preview paths (`/preview-junk`) still mount the game via splat.
- [x] `setMode` first; audio is try/catch and can fail.
- [x] Click kit → Board → Veldt. PointerUp + click (touch). Unarmed Board is `disabled`.

**Check when Ivan says buttons do nothing:** curl first HTML must **not** include `data-qa=title-board`. After hydrate `data-live=1`, hit-test is the `Plate`, `boardY < vh-80`. If SSR still has kit/board buttons, S1 regressed. Unarmed Board is `disabled`. See [sustain.md](sustain.md).

## Boot / load (2026-09-03)

- [x] Title must not wait on all biomes. Boot = **empty** (no gasket.png). Kit pick does not fetch `p###`. Drop tiles/props. Dungeon JS via `import("./play")` (S21). Drop3D lazy.
- [x] Image load has a timeout (3.5s boot / 5s biome). Never stuck on “Fitting visor…” if one PNG hangs.
- [x] Boot fallback 2.8s → title even if preload is slow.
- [x] **Round 3 (slice 1):** `ssr: false` made curl/Grok first HTML empty (`<!--$-->` only). Same “nothing on screen” class as visor-wait. **SSR title back on.** Art still background. Buttons stay under the pitch; setMode still first.
- [x] Do not assign `canvas.width`/`height` every rAF
- [x] Do not block first paint on Google Fonts.
- [x] Router `defaultNotFoundComponent` redirects home
- [ ] Network: dungeon session does not request other biomes’ tiles/enemies
- [ ] Cache: moving does not rebuild the composite (idle frame is part of the cache key — only 2 canvases)

**Boot QA (run when Ivan says boot is slow):** title heading < 1.5s. Must not show “Fitting visor”. Title phase must **not** request `sim.ts`, `play.ts`, forest tiles, or `p00*.png`. Kit pick loads that loadout. Drop loads forest only.

## Log (do not repeat)

| Symptom | Cause we already hit | Fix |
|---------|----------------------|-----|
| Dual shields / dual scythes N/S | Mirrored two-hand blit | One weapon mesh; N/S vertical pole in right hand |
| Crate taller on south than east | Per-dir scale drift | Same cell, `foot_line_y` |
| Pink behind crate | Magenta left in opaque pixels | Zero RGB on alpha 0 |
| Sprite clipped at tile edge | Hard clip to diamond | Allow overlap |
| Forest unwalkable | 40% tree plant | ~14% interiors, 4 neighbors |
| Preview empty / no `src/game` | Workspace wipe, no backup | Rebuild from this skill + latest stamp |
| Charge hitch | Unbounded loop / restack | Cap steps, cached composite |
| Fog is a green diamond | Missing biome fog sheet | `tiles/<biome>-fog.png` sprite swap |
| Every biome looks like forest | Copied grove fog | rubble / water uncover |
| Title never / “Fitting visor” forever | `preloadArt()` waited on **every** biome + enemies; one hung Image | `preloadBoot` + timeout + 2.8s fallback |
| Game feels frozen after drop | rAF set `canvas.width` every frame | Resize only on size change |
| Preview shows “Not Found” | `__root__` notFound, no component | `Navigate` to `/` |
| Boot waits on web fonts | Google Fonts in `__root__` | System stack only |
| Blank preview / “isn’t loading anything” | `ssr: false` streamed an empty body; Grok shows that HTML | SSR the title. Art still loads in background. Do not gate first paint on JS. |
| Long title / 143 Vite scripts | LastHarvest static-imported sim/render/compose + 10 part PNGs | `import("./play")` after Board; `pilot.ts`; BOOT = gasket only (S21) |
