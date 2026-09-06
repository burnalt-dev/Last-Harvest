# Current tree

**Makers lock (Ivan 2026-09-05):** `last-harvest-makers` — FOLLOW BEFORE ANY CHANGE. Stats stur/avo/Wits; Survival under Wits; ¼-grid shared stepper (skill live, runtime may still be parked); Bay = bare sockets; Gasket mute over ship VO; no expiration; no Perception label.

**Hybrid (Ivan 2026-09-05):** Solace = **3D** armature in Bay **and** drop (`Drop3D`). Terrain = **2D iso** textures on occupancy diamonds. Gasket = 3D mesh both places. Enemies = `buildFoe`. Dual renderer dated. Do not Imagine new crate dirs.

**Load (S61):** Title empty boot. Bay/ship = 3D parts only (no forest, no foes). Drop streams the live biome — Board does not wait 1.4s. Concepts lazy. No enemy PNGs.

**Bay parts (crude):** armor default `none`. Weapon default **scythe** — one `p018` on **both** hand slots (UI + engine). Cycle onto `bucket` / `can`/`cell` / `piston` / `crane` / `saw`/`cannon`/`shield`. Dual cannons need body `cell` (`p020`). Plates parent to sockets, armature stays. Empty hands do not ship.

**Stances (skillgrams):** Sawboard (`p008`+`p007`, bump) · Sawlance (`p008`+`p010`, bump + Aim) · Two-handed (`p018`, Attack 3-wide) · Lancer (one `p010`; slab does not change it) · Lancers (both `p010`; play stamps invisible `p020`). Two lances without the pack are not a play loadout. Bay may show Lancers with no cell mesh. Title plates use those names. `stanceOf` / `kitOf`. Drop plants that loadout (no `kit.ts` import on title — S21).

**Dual volley:** 4 half-power pellets, per-pellet acc, `max(0, round(raw-def))` no 10% floor. Cyan lasers stagger L/R. Two cannons without the cell pack fire one bus.

**Mains:** Stur / Avo / **Wits** (`wits`). Wits sub: acc, radar, recovery, **Survival** (`survival + survivalBonus`). Not a fourth primary.

| Pick | Lock |
|------|------|
| 31A | **this tree is slice 1** |
| 32 | Gasket **one core** (`g###`): look+class+skills+behavior. Not modular |
| S21 | Title does not static-import dungeon. BOOT empty (no gasket.png) |

Live 3D perch is **`gasket_mount`**. PNG leftover `companion_mount` is on `sockets.json` only. Affixes/paint catalogs exist; no `+` in slice 1.

Boot: `import("./play")` after Board. `qa-slice1` asserts no sim/play/forest/p00 on title.

Grey hull **look** is Ivan’s 4-dir wanzer (`solace-mech-look`). Tool-chest **scrapped**. Live B1 is still the old drawers until a hull rebuild is asked. Backpack-on-body; back slot = skillgrams/stats only.

Grey arms locked to **crane**. Title Concepts = current pass only; ABC lineup archived.

**Gasket mesh:** charcoal pocket-industrial (concept `gasket-concept.png`). Peg-rollers, one cyan optic. No walking legs, no cream toy.

**Idle holds (Ivan 2026-09-05):** farmer-cut scythe (two fists on the snath, pole across the hips) · hanging saw + door slab · forearm lance presented. Sheets in `solace-parts3d/assets/stances/` (saw/lance). Scythe gold overrides the staff-carry sheet.
