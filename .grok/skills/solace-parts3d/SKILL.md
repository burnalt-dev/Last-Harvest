---
name: solace-parts3d
description: >
  Last Harvest 3D part meshes. Crude head/body/legs/arms/weapon plates
  parent onto solace-rig sockets. Default kit is gunmetal shells + scythe.
  Not Imagine 4-dir. Not dressed Labor as the body. Open last-harvest
  then last-harvest-makers first.
---

# Solace Parts 3D

**Open `last-harvest` then `last-harvest-makers` first.** Then `solace-rig`. Sit: `solace-gold`. Look: `solace-mech-look`.

**Live, crude.** Owns `src/game/solace3d/parts3d.ts`. Bay/play default is **gunmetal shells + scythe** (`GOLD_GREY` armor `none` = shells, both hands the one `p018`). `none` restores the **shell**, not raw bones, not dressed Solace. Fancy `bucket` / `can`/`cell` / `piston` / `crane` **swap** that slot’s shell. Play hides bone cylinders + joint spheres (`setBonesVisible`). 3D Bay **Bones** overlay (default OFF) shows gold rods with shells still on. Hands skip `none` when cycling. Leaving scythe puts **both** slots on the next real parts (saw + slab). Hitting scythe on either hand re-locks both to the one `p018`.

PNG B1 factory (`solace-mech-parts`) stays **parked**. No Imagine 4-dir.

| Slot | none | first mesh | Parents to |
|------|------|------------|------------|
| head | `none` | `bucket` | `head` |
| body | `none` | `can` then `cell` (dual-cannon bus on `pack_mount`) | `body` + pack on `pack_mount` |
| legs | `none` | `piston` | `thigh_*` / `shin_*` / `foot_*` |
| arms | `none` | `crane` | `shoulder_*` / `upper_arm_*` / `forearm_*` (no fist — grippers own the wrists) |
| handR | `none` | `scythe` then `saw` then `cannon` | `weapon` on `weapon_mount_R` |
| handL | `none` | `scythe` (same `p018`, 2H lock) then `shield` then `cannon` | `weapon_L` on `weapon_mount_L` (no second scythe mesh) |

Idle holds (Ivan 2026-09-05 sheets in `assets/stances/`):

| Stance | Idle |
|--------|------|
| **Two-handed** | Farmer-cut: snath **across the hips**, both fists on the pole, crescent out. Attack still 3-wide. |
| **Sawboard** | Combat ready. Right fist at the hip, saw **blade up**. Slab raised as a door covering the left flank. |
| **Lancer** | Lance present at the chest, muzzle at the camera. Off-hand ready (slab up if equipped). |
| **Sawlance** | Saw guard + off-hand lance present. |
| **Lancers** | Both lances present at chest. Pack is not a mesh. |

Do not raise a ready-guard idle for saw/lance. Scythe idle is **two-hand across**, not staff-carry.

**Grippers:** universal clamp on both `weapon_mount_*`. Tools identity-parent to `tool_seat` (grip-point origin). `applyHold` then uses `sit.hold` (seat/pitch/roll/yaw per kind+hand). Global `gripScale` `gripWidth` `fingerLen` `holdAngle` `weaponSeat` still nudge the assembly. Bay shows `tool_seat_gizmo`; play hides it. Arm plates stop before the wrist. Cannon is a **tool** in the grip. No empty-hand mesh. Not a kit slot.

## Must not

- Imagine 4-dir isolates
- Skin-swap on top of a dressed Labor body
- Left/right arm as two part ids (one `arms` part, instance both sides)
- Modular Gasket
- Shipping a part that fuses to the chest (wrap-elbow fail)
- Making any **armor** plate the default (scythe on both hands is the weapon default)

Ids still come from `last-harvest` (`p###`, next free **p021**). Do not renumber. `p020` = cell pack.
