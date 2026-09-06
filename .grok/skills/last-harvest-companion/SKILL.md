---
name: last-harvest-companion
description: >
  Last Harvest companion Gasket. Cute **3D default** (`gasket.ts`,
  gasket_mount) in the Bay **and** the drop. Use when Ivan asks about the
  small robot, 1/4 tile, mount, follow, bruiser ranger prototype classes, or
  companion HP bar. Open last-harvest first. Not crate parts. Not enemy sheets.
  Not modular.
---

# Last Harvest — Companion

**Name:** in-game companion is **Gasket**. **GasketDev** is Ivan’s outside assistant — never an in-world character, never this mesh’s VO.

**Open `last-harvest` then `last-harvest-makers` first.** Then `solace-mech-look` [world-style](../solace-mech-look/references/world-style.md) for 3/4 + 1px. Owns Gasket’s **scale, follow, HP bar**. Occupancy: `last-harvest-grid` (¼-square, shared stepper). **S18:** one core, not a modular crate. Cute, not a wanzer. Same outline as the frame. **Mute during ship VO.**

**Hybrid:** Bay, drop, and **Monster Nest** use `src/game/solace3d/gasket.ts` (cute default, **not** modular). Socket **`gasket_mount`** on the armature (left shoulder perch). Nest: Gasket is the fighter (¼-grid, dungeon nip/step, pad respawn + glow). **Gasket sit** in Nest is authoring only (`GASKET_SIT` / `GASKET_SIT_YARD`); play/drop stay **scale 0.36** until Ivan promotes a yardstick. Occupancy stays ¼-square even when sit scale changes. Kit dock: Starter + Harvester. Do not blit `gasket.png` on the drop.

## Slice 1 (Ivan 2026-09-03)

| Rule | Value |
|------|--------|
| Name | Gasket |
| Occupies | **¼-square** (`last-harvest-grid`). Must not consume a full tile |
| Sprite | 3D `gasket.ts` (concept `assets/gasket-concept.png`) |
| Mount socket | Solace **`gasket_mount`** (armature). Drop parents onto that socket. |
| Default | Follow 1 tile behind, **or** mounted — player command |
| Charge | **Always mounts first**, then the crate charges. Non-negotiable. |
| On back | **No melee.** Ranged shots + programs **allowed**. |
| Off back | Melee OK (bruiser later). Follow. |
| HP | own bar, green→red |
| Level | does not level. May grant `survivalBonus` only (Wits substat). Never owns Survival as a primary. |
| Mounted draw | On **`gasket_mount`** (left shoulder perch). Scale ~0.32 mounted / ~0.36 follow. Not a fake offset. |
| Cover fire | While mounted, Gasket may fire a **weak rear bolt** (23B). Energy from crate Recovery, tiny dmg. **Story:** Gasket HP 44 + stronger nip. Pilot starts at Wits 9. Default 22 / 3 / Wits 1. |
| XP | None (20A). |
| XP | None (20A). |

`compose.companionMountXY` / `gasket.png` blit is leftover. Drop uses the **3D** socket. Do not bake Gasket into a B1 part. Do not blit `gasket.png` on the drop.

Packer leftover still lists `companion_mount` on PNG bodies. Live 3D perch is **`gasket_mount`**. If a new body hull moves the rear plate, Gasket still parents to `gasket_mount`.

Follow: after the crate moves, if unmounted and not on the same tile, Gasket steps toward it.

Commands (HUD, later if unset): mount / dismount. Charge is not a “maybe mount.”


## Later — one slot only (Ivan)

Gasket is **not** a modular crate. **One** equipped core. That id is look **and** class **and** skills **and** default behavior. No head/arms/legs/hands. Recolor/eye OK on that mesh.

| Class | Core does |
|-------|-----------|
| Bruiser | melee peel, stay close |
| Ranger | fog help, weak cannon, repair |
| Prototype | wildcard, regen, can backfire, comic line, endgame |

Behavior matches the class (bruiser does not snipe; ranger does not body-block as a job). Player Follow/Hold/Mount still work on top.

Cores get `g###` when authored. Do not reuse `p###`. Slice 1 is one unnamed default core (`gasket.ts`), no swap.

## Who draws Gasket (no new skill)

| | Owns |
|--|------|
| **this skill** | `g###` core (look+class+skills+behavior). Follow / mount **motion**. Cute **3D** mesh. |
| **solace-rig** | `gasket_mount` socket. Never a Gasket mesh. Never a backpack part. |
| **solace-mech-anim** | Crate idle/walk only. Not Gasket hops. |

Jump on back: Gasket plays a short hop (later; slice 1 **teleports** to the socket). Perched pose sits on `gasket_mount`. Charge still mounts first, then the crate moves.

3D: `solace3d/gasket.ts` is the **cute pocket-industrial default**. North-star: [assets/gasket-concept.png](assets/gasket-concept.png) (Ivan 2026-09-05). Not cream. Not walking legs. Not modular. Bay and drop both use this mesh.

## Look (locked — concept)

Replace / define the mesh (follow / hold / mount on `gasket_mount`) with this starter. Hanger palette: **dark steel, brass, cyan eye, yellow stripe**.

**Silhouette**

- Chibi: big head, short body, stubby limbs
- Single oversized **cyan glowing optic** in a **brass rim** (not a visor slit)
- One floppy antenna with a tiny brass bead
- Visible **gasket collar** at the neck (dark rubber ring — his namesake)
- Short arms, simple **three-prong brass claws** (readable small)
- **Pegs ending in tiny tread rollers** — cute + practical. **No walking legs**
- Small circular brass chest port

**Materials**

- Body: matte dark charcoal steel; light scuffs OK
- Accents: aged brass joints/caps
- One worn yellow/ochre warning stripe around the upper torso
- Eye: emissive cyan matching bay UI (`#5ee0d0`)
- No plush fur, no anime face panel, no Earth propaganda decals, no cream toy body

**Behavior hooks**

- Mounts to `gasket_mount`
- Idle: antenna wobble + optic blink
- Follow / hold / mount unchanged
- Mute during ship VO

**Non-goals:** not as large as the pilot; no weapon hardpoints yet; do not overshadow modular pilot bones.

**Accept:** reads cute and on-theme from bay camera. Clearly a companion, not a second mech.

## Files

`src/game/sim.ts` follow. `solace3d/gasket.ts` + `Drop3D.tsx` plant. No new part ids.

## Fail

Full-tile Gasket. Extra Gasket slots (head/arms). Companion XP. Drawing Gasket on terrain tiles. Crate `p###` used as a Gasket core. Gasket talking over ship VO. Survival as a Gasket primary. Walking legs / cream toy body (concept is peg-rollers + charcoal steel). Renaming Gasket to GasketDev / mixing assistant voice into companion VO.
