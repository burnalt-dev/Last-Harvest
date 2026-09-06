---
name: last-harvest-skillgrams
description: >
  Last Harvest skillgrams (sg###). Dev name for in-universe Programs so they
  are not confused with maker skills or unrelated code programs. Use when
  Ivan asks for nanobot, charge, programs, skillgrams, sg001, energy, weave,
  cooldowns, archetypes combat support exploration, or HUD skill plates.
  Player-facing copy is still "Programs". Open last-harvest first. Not r###,
  not p###, not maker skills.
---

# Last Harvest — Skillgrams

**Open `last-harvest` then `last-harvest-makers` first.** Dev word: **skillgram** / **`sg###`**. Player UI: **Programs**.

**Hybrid:** Programs are data + 2D HUD plates. Back slot grants a skillgram; the crate mesh is 3D Bay (`solace-rig`). Do not paint Programs onto a PNG backpack.

Do not call these “skills” in maker docs (that is this folder). Do not call them “programs” in code (that is TypeScript).

## Open first

0. **`last-harvest`**  
1. this file  
2. [references/catalog.md](references/catalog.md)  
3. `src/game/skillgrams.ts` — ids `sg###` (**never** inline a new sg only inside `LastHarvest.tsx`)  
4. `src/game/sim.ts` — resolve on a turn  
5. HUD plates — player **names** only (Nanobot, Charge). Group label if any: **Programs**

Back slot **grants** a skillgram; mesh still none (`solace-mech-look`). This skill owns what the sg **does**.

## Slice 1

Only `sg001` Nanobot and `sg002` Charge. Charge **caps at 6 tiles** (S12). Charge **always mounts Gasket first**. Costs in `skillgrams.ts`. Two HUD plates. No weaves, no level-up pick.

## Contract

Equip **two** skillgrams. Sources: (1) level-up pick (2) found `sg###` (3) **back slot**. Body resource pack is haul, not skillgrams.

| Field | Meaning |
|-------|---------|
| id | `sg###` forever |
| name | player string |
| archetype | combat / support / exploration |
| energy | shinies + Recovery refill |
| cooldown | `0` = no CD |
| turn | consumes the player turn |
| weave | modifies the **next** weapon attack |
| stance | optional `Stance[]`. Omit = any. Live stances: **Sawboard**, **Sawlance**, **Two-handed**, **Lancer**, **Lancers** |

Slice 1 Nanobot + Charge are **any stance**. Later weaves (Harvest line, Lance cycle) tag `stance`. Use `skillgramOk(sg, stanceOf(loadout))`.

## Stances (Ivan 2026-09-05)

Skillgrams gate on **stance**, not the part id.

| Stance | Id | Hands | Notes |
|--------|----|-------|-------|
| **Sawboard** | `sawboard` | saw `p008` + slab `p007` | Bump only. No Attack plate. |
| **Sawlance** | `sawlance` | saw `p008` + off lance `p010` | Bump + Aim. No Attack plate. |
| **Two-handed** | `twohand` | scythe `p018` both | Attack plate, 3-wide. |
| **Lancer** | `lancer` | one lance (board or empty off is still Lancer) | Aim / Shoot. Lance + slab is **Lancer**, not a sixth stance. Two lances are **Lancers** only (not possible without the pack in play). |
| **Lancers** | `lancers` | both `p010` | Dual volley. Play stamps invisible `p020`. Bay may show both lances without a cell plate. |

Do not invent Gunblade / hybrid / assault.

## Adding a skillgram

1. Spec card in the catalog (`sg###`).  
2. Append `src/game/skillgrams.ts`.  
3. Branch in `sim.ts` only.  
4. HUD shows `name`, never the id.  
5. Flavor stub OK until Ivan writes it.

## Fail

New sg only in `LastHarvest.tsx`. Using `s###` or `PROGRAMS`. Calling a skillgram a maker skill. Player-facing HUD saying “Skillgram”.
