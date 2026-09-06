# Sister skills — Last Harvest

Open **`last-harvest` first**, then **`last-harvest-makers`** (`LAST HARVEST MAKER SKILLS — FOLLOW BEFORE ANY CHANGE`), then exactly one of these. Do not invent a third skill for a job that already has an owner. If you add a skill, register it here and in `SKILL.md`. Dummies exist so the name is reserved.

## This folder

| File | Stores |
|------|--------|
| `SKILL.md` | Always-first, frozen ids, screens, draw, boot backup |
| `../last-harvest-makers/SKILL.md` | **FOLLOW BEFORE ANY CHANGE** |
| `canon.md` | **Pointer** at Notion Canon Hub — not a second bible |
| `build-slice-1.md` | **Rebuild recipe. Open this instead of patching.** |
| `slice.md` | What the slice contains |
| `future.md` | **Pointer** at Notion Slice vs book / Backlog |
| `assets/VAULT.md` | Pixel archive layout |
| `assets/ids.md` | Next-free ids |
| `state.md` | What the tree actually has **now** |
| `sustain.md` | Anti-patterns → owner skill + test. Tighten here when a bug returns |
| `performance.md` | Biome-scoped load, hangar lock, cached composite |
| `rebuild.md` | Wiped `src/game` / dead preview |
| `skills.md` | This map |
| `affixes.md` | **Pointer** at Notion Affixes & paint |

Copy the whole `last-harvest*` **and** `solace-*` folders to `/root/.grok/server-skills/` after editing.

## Hybrid (all sisters)

Solace = **3D** (Bay + Drop3D armature). Terrain/fog/props = **2D iso** textures on occupancy diamonds. Gasket = 3D in bay **and** drop at **¼-grid**. Enemies = **3D** `buildFoe`. Every sister below obeys `last-harvest-makers`. Do not Imagine new crate dirs. Do not WebGL a mesh Veldt floor.

## Gameplay / world / shell

| Skill | Use when | Do not use for |
|-------|----------|----------------|
| `last-harvest-makers` | **Any change.** Lock + routing | Writing meshes |
| `last-harvest-shell` | Title, boot, HUD plates, d-pad, SSR, `art.ts` | Crate meshes, tiles, blip rules |
| `last-harvest-radar` | vis/seen, Manhattan HUD, Map slate, blips | Fog **sprites**, `derive` formula, crate |
| `last-harvest-audio` | Beeps, parry ping, **Gasket mute over ship VO** | Crate, tiles |
| `last-harvest-concept` | **3D** crate refs (`concept:sheet`) + foe/Gasket numbered picks | Packing `p###`, dungeon |
| `last-harvest-companion` | Gasket ¼-grid, follow/hold/mount, `gasket.ts` | Enemy meshes, crate parts |
| `last-harvest-grid` | **¼-square shared stepper** (Gasket + small foes). Pilot = full tile | Bay diamonds, crate art |
| `last-harvest-combat` | `derive`, parry/dodge/shield, bump, Wits/Survival | Floors, `sg###` energy, crate art |
| `last-harvest-items` | `r###` / `i###`, shiny/kill rolls. **No expiration** | Floor gen, `p###`, energy, bag UI |
| `last-harvest-inventory` | Bag, stacks, use-on-drop vs ship | Drop tables, `p###` |
| `last-harvest-dungeon` | Veldt floors, ore bias, **withdraw/haul/death wipe** | Item catalog, crate, gun plate chrome |
| `last-harvest-skillgrams` | `sg###` (player: **Programs**) | Terrain, parts, maker skills |
| `last-harvest-programs` | **redirect** to skillgrams | — |
| `last-harvest-terrain` | **2D** tiles, trees, fog, props, sparkle | Crate meshes, Gasket, enemies, mesh floor |
| `last-harvest-enemies` | Goblin ¼ / orc ~crate look. Meshes in foe3d | Tiles, crate |

## Solace crate

| Skill | Use when | Do not use for |
|-------|----------|----------------|
| `solace-mech-look` | Style kernel + north-star + arm bases. **Enemies and terrain open this** so they do not clash | Packing, ids, drop tables |
| `last-harvest-3d` | **3D Solace.** `solace3d/` Bay + Drop3D. [3d.md](3d.md) | Imagine dirs, mesh floor |
| `solace-rig` | 3D **armature sockets**, harvest swing | Gasket mesh, 2D tiles |
| `solace-gold` | Sit numbers stretch the **cage**. Reset gold | New silhouettes (concept) |
| `solace-3d-qa` | Title no `three`; Bay WebGL; sockets | Visual sit (Ivan) |
| `solace-toon` | **Dummy.** Mats in `tex.ts` | A second renderer |
| `solace-parts3d` | **Live (crude).** Plates parent onto sockets. Armor `none` = shell; scythe both hands | Imagine 4-dir, dressed Labor body |
| `solace-cohesion` | **Parked** PNG 4-dir leftover | New 3D parts |
| `solace-mech-anim` | **3D clips** on joint names. Play in `kit.ts` | 2D B1 frames, Gasket hops |
| `solace-mech-parts` | **Parked** B1 PNG factory | Live dungeon blit of new art |
| `last-harvest-foe3d` | **Live.** `buildFoe` | Modular foes, mesh floor |
| `last-harvest-iso3d` | **Dropped.** No 3D mesh floor | Occupancy diamonds (that's 3d/S59) |

## Runtime files (do not dump logic into LastHarvest.tsx)

| Job | File |
|-----|------|
| Screens / HUD / boot | `src/game/LastHarvest.tsx` + `art.ts` (`last-harvest-shell`) |
| Combat / stats | `src/game/combat.ts` |
| Drop scene | `src/game/solace3d/Drop3D.tsx` (`last-harvest-3d`) |
| Bay scene | `src/game/solace3d/Bay3D.tsx` |
| Armature | `src/game/solace3d/kit.ts` (`solace-rig`) |
| Crude plates | `src/game/solace3d/parts3d.ts` (`solace-parts3d`) |
| Gasket mesh | `src/game/solace3d/gasket.ts` (`last-harvest-companion`) |
| Foe meshes | `src/game/solace3d/foe3d.ts` (`last-harvest-foe3d`) |
| Iso math | `src/game/iso.ts` + `solace3d/sprites.ts` |
| Loadout ids | `src/game/parts.ts` |
| Compose leftover | `src/game/solace/compose.ts` — **not** the drop blit |
| Biomes / derive | `src/game/data.ts` |
| Skillgram catalog | `src/game/skillgrams.ts` |
| Loot catalog | `src/game/items.ts` |
| Bag | `src/game/inventory.ts` |
| ¼-grid stepper | `src/game/sim.ts` occupancy (`last-harvest-grid`) when wired |

## Pack scripts

| Script | Skill |
|--------|-------|
| `pack-maskcut.py` / `pack-from-isolate.py` / `occupancy.py` | solace-mech-parts (384 occupancy) |
| `pack-b3.py` | **dead** (192 leftover) |
| `pack-terrain.py` | last-harvest-terrain |
| `pack-enemies.py` | last-harvest-enemies |
| `qa-slice1.mjs` / `qa-seat.py` | last-harvest. See [commands.md](commands.md) |

## Sandbox (not Last Harvest)

`building-games`, `design-ui`, `controls`, `game-animation-frames`, `generate2dsprite`, `generate2dmap`, `game-tilesets`, `game-asset-core`, `game-character-consistency`, `imagine`, `threejs`, `video2dsprite` are App Builder doctrine. Each has a **Last Harvest override** box pointing at **`last-harvest-makers`**. Last Harvest **wins** where they conflict (Vite + **three.js Bay/Drop3D** + 2D terrain textures; not Phaser; no R3F; no engine swap; no Imagine 4-dir crate).

## 3D (plan)

Owner: `last-harvest-3d`. Terrain stays 2D textures on diamonds. Foe3d live. Iso3d dropped. [3d.md](3d.md).
