---
name: last-harvest-3d
description: >
  Last Harvest 3D Solace path. three.js Bay armature, FM 3/4 camera,
  cute 3D Gasket, Drop3D actors on 2D terrain diamonds. Open last-harvest
  then last-harvest-makers first. Not Unity. Not Imagine 4-dir packing. Not a 3D mesh floor.
---

# Last Harvest — 3D

**Open `last-harvest` then `last-harvest-makers` first.** Contract: [../last-harvest/references/3d.md](../last-harvest/references/3d.md). Rig: `solace-rig`. Sit: `solace-gold`. Gates: `solace-3d-qa` (`npm run qa:3d`). Look clash: `solace-mech-look` world-style (tiles/foes vs crate).

**Hybrid (2026-09-05):** this skill owns the **3D Bay** and **Drop3D** actor scene. Terrain/fog/props stay **2D iso textures** on occupancy diamonds (`last-harvest-terrain`). Enemies are `last-harvest-foe3d`. Do not WebGL a mesh Veldt floor (`last-harvest-iso3d` dropped).

## Owns

`src/game/solace3d/` — `Bay3D.tsx` `Drop3D.tsx` `Nest3D.tsx` `nest.ts` `cam.ts` `kit.ts` `gasket.ts` `tex.ts` `iso3d.ts` (plant) `sprites.ts` (Drop/Nest tile fetch only; `foe3d.ts` is `last-harvest-foe3d`; `parts3d.ts` is `solace-parts3d`)

Title **3D Bay** and dungeon **Drop3D** are both **lazy** so title boot does not fetch `three` (S21 / Q1).

**Load lanes (S61):** Bay imports `iso3d` + `kit`/`parts3d`/`gasket`. Bay must **not** import `sprites.ts` (Veldt fetchers) or `foe3d`. Ship/hangar same as Bay — every part mesh is procedural, not PNG. Drop imports `foe3d` + `sprites` and streams **one** biome. **Monster Nest** (`Nest3D`, title `qa=title-nest`) is a **drop-side combat sandbox**: empty pad until a planet plate; then **that** biome’s tiles only. Spawn pack / Reset / Fight. Roster chips + detail (role, tags, counter, occupancy). Story|Default uses `runMods` on Gasket only — **same enemy HP**. Harvester = one scythe wanzer snapshot (`GOLD_GREY`), not the parts catalog. Sapjaw / Scrap-Hound grey until meshes. Dispose pack + wanzer on exit. Title/Bay never fetch Nest.

**Default mesh:** shared armature + **gunmetal shells**. No labor dress. Parts dock cycles **`none` first** (restores shell). Fancy plates swap that shell. Play hides gold rods (`setBonesVisible` false). 3D Bay **Bones** overlay (`qa=bay3d-bones`, default OFF). Gasket uses `gasket_mount`.

**Drop3D:** same plant as Bay. 13×13 occupancy diamonds with forest/fog **2D** textures. Trees/anvils/shinies = standing 2D sprites (terrain). Wanzer / Gasket / foes = meshes. `data-qa=drop3d`. Three sits: **far 8** (walk, between close and scope), **close 11** (near / old far), **scope 5** (Aim — ≥3 tiles every DIR on portrait, crate-centered). Radar slate owns R5. Raycast tiles → `onTile`. Lance shot is a **pulse-rifle energy orb** from the muzzle (`pulse.ts`), not a laser line. Aim = muzzle glow + lock orb on the target.

**FM3 plant + move (S58):** Diamond pack `isoCell = ((tx-ty)*0.5, (tx+ty)*0.5)`. Wanzer on the **center**, **faces the neighbor** (`ISO_YAW` ±45°, visor = local +Z). Cam 3/4 from south-east (`+Z` heavy). Pad: N up-right, E down-right, S down-left, W up-left — Veldt `DIR`.

**S59 deck:** occupancy XZ diamonds sharing those vertices; 2:1 iso **texture**. Not `THREE.Sprite` for the floor.

**Cam zoom** bar sits **directly under** the bay canvas. **Far / Close / Scope** plates share Drop sits (`cam.ts`: far 8 / close 11 / **scope 5**). Scope draws the edge reticle + lock click. Slider still nudges zoom. View is **78dvh**; docks scroll below. Deck is **11×11** (`BAY=5`). Not crate `GOLD_SIT.scale`.

**Docks (below zoom):** default **move/anim → parts → gold**. Edge ▲ on each window **swaps that dock with the top** (top ▲ rotates it to the bottom). Zoom stays glued to the canvas.

| Slot group | Notes |
|------------|--------|
| armature | `root`…`foot_*` sockets. Bay default = **shells + scythe** (Bones overlay off) |
| parts dock | armor `none` = shell, then crude `bucket` / `can`/`cell` / `piston` / `crane`. Hands skip `none` (`scythe`/`saw`/`cannon` / `shield`) |
| Gasket | cute `gasket.ts` (charcoal chibi, cyan optic, peg-rollers). Socket `gasket_mount`. ¼ tile, not modular |

## Must

- FM height: crate on **one** iso diamond
- Bay floor tessellates (S59); not billboards
- Pixel toon + outline; **no** 3D shadows
- Harvest swing: reach grip → low wide cut → idle grip
- Crane arms: pauldron, thick upper, elbow, forearm, fist toward camera
- `qa="title-bay3d"` plate; `qa="title-nest"` Monster Nest; three.js not on title graph

## Must not

- Rewrite Veldt to a **3D mesh** floor (`last-harvest-iso3d` dropped)
- Billboard hanger **or drop** deck (`THREE.Sprite`) — S59
- Imagine 4-dir for new Solace parts
- Modular Gasket

## Fail

Arms missing (only hands + shoulders). Crate bigger than one tile. Scythe unusable. Title fetching `three`.
