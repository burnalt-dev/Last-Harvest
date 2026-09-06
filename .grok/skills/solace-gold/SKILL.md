---
name: solace-gold
description: >
  Last Harvest 3D GOLD sit. Labor 1 look + farmer-cut build. Numeric lock
  for kit.ts so the crate cannot drift marine, cube, or tiny-scythe. Open
  last-harvest then this before changing solace3d/kit.ts proportions.
---

# Solace Gold (G)

**Bible numbers:** [Gold sit & arm bases](https://app.notion.com/p/3d2b6682d92e81cca32be13cb2e416a8?pvs=204). This skill still owns `GOLD_SIT` in `kit.ts` so sit cannot drift without a code change.

**Open `last-harvest` then `last-harvest-makers` first.** Then this. Mesh groups: `solace-rig`. Scene: `last-harvest-3d`. Sheet: `solace-mech-look/assets/gold-labor-1.jpg` (Concepts **1 Labor**).

**Hybrid:** sit numbers stretch the **3D cage**. Terrain stays 2D. Do not Imagine a 4-dir atlas to “fix” sit. Dungeon blit leftover is not this lock.

If Ivan locks sit, **edit the numbers here in the same turn** as `kit.ts` `GOLD_SIT`.

**Bay sit sliders** (3D Bay, not title) override `GOLD_SIT` live. They stretch the **armature cage**, **plates**, **universal grips**, and **weapon tools**. Hand sit (`gripScale` `gripWidth` `fingerLen` + **global** `holdAngle` `weaponSeat`) is always on — hands are always armed. **Hold profiles** (`sit.hold.<kind><R|L>`: `hold_seat` / `hold_pitch` / `hold_roll` / `hold_yaw`) are the per-tool rest on `tool_seat` (layer 2). Globals nudge the grip assembly (layer 3) — they do **not** replace profiles. Gold dock lists **all eight** profiles live; Copy sit dumps them. L is authored, never negate-R. Tool *size* knobs hide while that weapon is not equipped. **Reset gold** restores `GOLD_SIT` **globals only** — live hold profiles persist. **Reset profiles** restores `HOLD_PROFILES`. `GOLD_REV` bump reapplies globals the same way. When Ivan says **lock**, copy slider dump into this table + `GOLD_SIT`.

**Dressed Labor 1** is the **cycled plates**, never the default. Opening 3D Bay shows **shells + scythe** (`GOLD_GREY` armor none, both hands `p018`, Bones overlay off). Empty hands do not ship.

## Lock

| | |
|--|--|
| Look | Civilian Front Mission **labor**. Cyan **slit** visor, rivets, yellow hatch, **pack on body**. Hull/feet are **plump cans**, not crate slabs. Torso **hourglass** (wide shoulders, pinched waist, oval ribs) — industrial **plates** later, not a cube frame. Not marine, not Halo |
| Build | Farmer-cut: **two fists on the snath**, pole **across** the hips, crescent **out** |
| Kit | Armor `none`. Weapon default **scythe** (`p018` both hands, one id). Cycle `bucket` · `can` · `piston` · `crane` · `saw`/`cannon`/`shield` |
| Scale | `root.scale = 1.1`. One iso tile. Feet/waist on the diamond. A little **overlap above the waist** onto neighbors is OK. Hundreds-scale later — not now. |

Local units below are **before** that 1.1.

## Must not change without Ivan

| | Local | After 1.1 | Fail if |
|--|--|--|--|
| Chest W × D × H | **0.38** × **0.22** × **0.18** | ~0.42 tile pecs | cube torso / marine slab |
| Hip Y / shoulder Y / neck Y | **0.36 / 0.62 / 0.74** | height ~0.9 tile | head floating, lanky |
| Crane upper / fore / thick | 0.22 / 0.24 / 0.062 | whole limb visible | only fists + shoulders |
| Shoulder W / hips W / foot / lean | **0.16 / 0.12 / 0.07 / 0** | industrial width sit | stick-figure / marine slab |
| Thigh / shin / stance W | **0.19 / 0.14 / 0.12** | feet **inside** diamond | stance wider than the tile |
| Snath / grip / crescent | **1.28 / 0.42 / 0.46** | 3-wide harvest | stick / dagger scythe |
| Saw len | **0.5** | hip-to-ankle hang | toothpick / two-tile blade |
| Lance len / bore | **0.4 / 0.07** | forearm tube at chest | pistol / drainpipe / hanging pipe |
| Slab H × W | **0.56 × 0.22** | door covering the left flank | postage stamp / wall |
| Gripper scale / width / finger | **1 / 1 / 1** | universal clamp both wrists | missing fists / boxing gloves |
| Hold angle / weapon seat | **0.12 / 0.04** | tool snaps into the grip | tool floating / buried in the palm |
| Hold profiles | `sit.hold` per kind+hand (`hold_seat` / `hold_pitch` / `hold_roll` / `hold_yaw`). scytheR pitch **0.22** yaw **−0.48**; **scytheL authored** seat **0.01** pitch **0.16** roll **0.06** yaw **−0.22** (not negate-R); sawR pitch **1.12**; cannonR seat **0.02** pitch **0.12**; shieldL yaw **−0.9**. Globals `holdAngle` / `weaponSeat` nudge the grip on top. | blade/bore/door read in the clamp | identity rest / mirrored L |
| Helm / pack / pauldron / boot | **0.09 / 0.14 / 0.08 / 0.12** | plates on sockets | |
| Blade | mild hook, **tang on ferrule**, **horizontal** mowing plane (crescent out) | | standing sickle / letter C / into the hips |
| Pole idle | hang + **negative** elbow curl, fists on snath at the hips, elbows back | | overhead / hyperextended hinge / staff-carry |
| Bay scale | **1.1** | 8-foot on 1 diamond | tiny crate / two-tile plant |
| Plant | `plantY(sit)` lifts so soles rest **on** the diamond | | feet through the floor |

Bay slider **ranges** (tile envelope, not hundreds): scale 0.35–1.35; chestW to 1.15; limbs to ~1; stance ≤0.42 (feet stay home). Labels: **upper arm** / **forearm** (keys still `upperLen` / `faLen`). **Sit: Heavy labor** stamps body/global sit only (`SIT_HEAVY`) — wider chest, planted stance, squat limbs, thicker arms. Reset gold returns the **neutral mannequin** and never clears hold profiles. Upper-body overlap onto neighbors is allowed. Multi-tile hulls later.

Harvest **swing:** wind right → **wide** yaw across the three spaces in front (~+1.35 to −1.5) → recover. Hands stay on the snath. Cyan **slash** ring is the 3-wide tell.

## Style (labor, not marine)

- Head is a **small bucket** + cyan **bar**, not a helmet visor
- Pack is a **hopper box** on the back, not a rucksack
- Yellow is **hatch tape**, not rank stripes
- No ammo pouches, no tactical webbing, no gold visor

## When you edit `kit.ts`

1. This file first.  
2. If a number moves, update the table.  
3. `solace-3d-qa` still has to pass (title no `three`, groups named).  
4. Do not Imagine a new 4-dir atlas to “fix” sit.

## Fail

- Shrinking the snath to fit the camera  
- Floating blade (arc centered off the pole)  
- Space-marine chest  
- **Cube / crate-box torso** (waist must be narrower than shoulders; no 4-corner posts)  
- Arms disappearing into the torso  
- One-hand reaper idle (gold is **two-hand across**)  
- Second gold without Ivan
