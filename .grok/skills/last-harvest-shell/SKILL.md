---
name: last-harvest-shell
description: >
  Last Harvest title, ship, HUD, d-pad, boot, SSR, plates, art preload.
  Use when Ivan says the game is not loading, buttons do nothing, visor wait,
  blank preview, dungeon HUD, iso pad, or slice 1 screens. Open last-harvest
  first. Do not author crate parts or forest tiles here.
---

# Last Harvest — Shell

**Open `last-harvest` then `last-harvest-makers` first**, then [references/sustain.md](../last-harvest/references/sustain.md) (S1–S5, S13–S14). Then this file.

Player-facing name is **Wits** (`wits`), never **Perception**. Survival nests under Wits. No Gasket-owned Survival primary on HUD.

**Hybrid:** Title **3D Bay** and dungeon **Drop3D** are lazy `three`. HUD / d-pad / plates are **2D**. Terrain owns tile art. Do not static-import Bay or Drop3D here (S21).

Owns **screens and first paint**. Terrain owns **2D** tiles. Solace owns the **3D** crate. Drop3D plants actors. Title **3D Bay** / **Drop3D** are lazy `three` — do not static-import them here (S21).

## Plates (frozen — S1)

All game chrome uses `src/game/ui/Plate.tsx`. No extra `<button>`. PointerUp + click, 240ms lock, `z-[80]`.

Title / drop-bay:

- SSR **heading only** (`Last Harvest`, `Bloom-ore` / Veldt-9). `data-live=0`.
- After hydrate (`useEffect` → `data-live=1`) mount plates.
- First HTML **must not** contain `data-qa=title-board` or kit qa.
- Difficulty picker (**Story** / **Default**) hydrates with the plates. Copy: "Beefy companion. More health regen. Same world." No Wits / Survival / Perception on that screen.
- Unarmed Board is `disabled`, not a silent click.
- Never `mt-auto` on first-screen actions (preview chrome eats them).

Drop (S4 / S61): **do not await biome** before Board. Drop3D paints solids then streams the **live** biome only. Never preload every biome. Never fetch enemy PNGs (foes are 3D).

## Slice 1 screens

`title` (pick kit) → **dungeon** (Veldt-9). Unarmed crate **cannot** Board. Stairs/withdraw → drop-bay. Kit stays on.

Lance: **Aim** is the slim attack plate. **Shoot!** gun-shaped plate sits **above** the skill/attack row (right side). Shoot repeats last aimed foe or nearest visible.

Audio: **mute** until Ivan asks for sound test (10B). Keep `audio.ts` try/catch so unmute is one flag.

Art biome: also `props/pr003`. No enemy PNGs. No gasket.png on boot.

## First paint (frozen)

| Must | Must not |
|------|----------|
| SSR ON. curl HTML contains `Last Harvest` + `Bloom-ore`. **No** `data-qa=title-board` in first HTML | Dead SSR plates; `ssr: false` empty `<!--$-->` body |
| Title is initial React state | Boot screen “Fitting visor” as a gate |
| `preloadBoot()` in useEffect only | Wait on PNGs before title |
| Plates under the pitch, `data-qa=title-board` | `mt-auto` on the bottom chrome line |
| `setMode` first, audio in try/catch | `new AudioContext()` before navigation |
| Unknown preview path still mounts LastHarvest (`/$`) | `Navigate` loop / Not Found |

Hung PNGs: title still < 1.5s. Same class as visor-wait and blank-body.

## HUD (dungeon)

Only: **broken HP plate**, **energy pie**, **Gasket bar** (green→red). Log line top-left. Iso diamond d-pad bottom-right, above the program plates. Pad buttons sit on the four neighbor tiles (2:1 rhombus), not screen-cardinal.

No live sturdiness/avoidance/wits. Those wait on a status screen (later). Nested under Wits: Survival.

Programs (player word): two plates `sg001` `sg002` from `last-harvest-skillgrams`. Abort returns ship.

## Camera loop

Dungeon view is lazy `Drop3D` (WebGL). HUD / d-pad / plates stay DOM.

- Host `flex-1 min-h-0`. WebGL canvas sized from the host rect, not DPR-multiplied CSS.
- Camera: crate diamond centered, 3/4 from south-east. **Far 8** (default walk, between close and scope), **close 11** (near / old far). Toggle plate under the radar (`qa=drop-cam`). **Scope 5** auto on Aim — ≥3 tiles every DIR, crate-centered, **edge sniper reticle** + `sfxScope` click. Not FPS. Radar slate still owns R5. Aim only fires on a live vis enemy on that square.
- Bay uses the same three sits (`cam.ts`) + reticle on Scope.
- Click/touch: raycast occupancy diamond → one of four DIR steps. D-pad uses the same DIR.

## art.ts (S61 loading lanes)

| Lane | Loads | Must not |
|------|-------|----------|
| **title** | `preloadBoot()` empty | `three`, biome tiles, enemy PNGs, lookdev sheets, `play.ts` |
| **3D Bay / ship** | lazy `Bay3D` + `kit`/`parts3d` (procedural parts) | forest/fog/props, `foe3d`, `/game/enemies`, lookdev |
| **drop** | lazy `Drop3D` + `play` (no `render.ts`) + **current** biome textures inside Drop3D | other biomes, enemy PNGs, waiting 1.4s on tiles |
| **Concepts** | lazy `Lookdev` — roster + sheets **then** | boot / bay |

`loadOne`: `cache.set` on load. On timeout, **delete inflight** so a retry can fetch.

Board: `makeDungeon` immediately. Drop3D streams Veldt tiles/props. Do not call `preloadBiomeOrGo` on the Board click.

## styles

`.plate` chamfered rivet, `touch-action: manipulation` on **html/body** and `.plate`, `z-index` 80 on plates. `.iso-pad` is a **2:1 occupancy diamond** (N up-right, E down-right, S down-left, W up-left — same as `DIR` / floor tiles), not a plus. Drop and 3D Bay share the class. No rounded bootstrap buttons. No Google Fonts.

## Files

`LastHarvest.tsx` `ui/Plate.tsx` `pilot.ts` `play.ts` `art.ts` (`preloadBoot` **empty**, `preloadBiomeOrGo`) `audio.ts` `styles.css` `src/routes/index.tsx` `src/routes/$.tsx`

## Lookdev (concept)

Title **Mech Parts** (`mechparts`) is title-only. Cycles grey A/B (`p011–p017`) + crane `p014`. Does not change dungeon starter loadout. Arrow keys + anim plates. Not Mech Test on the ship.

Title **Concepts** plate → `lookdev` mode. Loads `/game/lookdev/roster.json` **only then**. `last-harvest-concept` owns the sheets. Not Mech Test. Not dungeon JS.

## Fail

Blank first HTML. Visor gate. **SSR clickable plates.** Title buttons under preview chrome. Audio throw eats `setMode`. DPR double-scale. Preload every biome at boot. Gate Board on tiles. Bay fetching forest/foes. Stub LastHarvest. New `<button>` instead of `Plate`.
