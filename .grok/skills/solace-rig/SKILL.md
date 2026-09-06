---
name: solace-rig
description: >
  Last Harvest 3D Solace rig. Bare armature sockets, 1-tile scale,
  gasket_mount, harvest swing. Open last-harvest then last-harvest-3d.
  Not Imagine dirs. Not Gasket modular. Not dungeon floor.
---

# Solace Rig (B)

**Open `last-harvest` then `last-harvest-makers` first**, then `last-harvest-3d`. Sit numbers: **`solace-gold`**. Owns `src/game/solace3d/kit.ts` (armature + swing). Do not change GOLD proportions without gold. Part meshes: `solace-parts3d` (`parts3d.ts`) parent onto these sockets.

**Hybrid:** 3D sockets only. Terrain stays 2D. Gasket mesh is `last-harvest-companion` (`gasket.ts`) parented to **`gasket_mount`**. Do not author 3D foes here.

**Bay/play default is the shared skeleton + gunmetal shells** (steel bones, brass joints, **oval hourglass ribs** — cardinal posts, not a corner-box). Play hides bone meshes. Bay **Bones** overlay reveals them. No visor, pack, or Gasket on the naked base. Waist slimmer than shoulders; hips tucked under the waist. Fancy plates (`solace-parts3d`) **swap shells** — **not** p###, **not** a dressed labor mesh as the body.

**Clip timing:** `solace-mech-anim` (`clips.md`). **Play** harvest on these joint names until a mixer exists.

**Bak:** `npm run vault:hot` stamps `solace-rig/assets/kit.ts.bak`. Under 200 lines, vault restores. No empty `old_string` on `kit.ts`.

Gasket mesh is `last-harvest-3d` / companion — parents to **`gasket_mount`**.

## Sockets (exact names)

Spine: `root` → `hips` → `spine_low` → `spine_mid` → `chest` → `neck` → `head`  
Arms L/R: `clavicle_*` → `shoulder_*` → `upper_arm_*` → `elbow_*` → `forearm_*` → `wrist_*` → `gripper_*` (universal, including cannon) → `weapon_mount_*`  
Legs L/R: `hip_*` → `thigh_*` → `knee_*` → `shin_*` → `ankle_*` → `foot_*`  
Utility: `pack_mount` `core_mount` `gasket_mount` `skirt_ring`

Empty slot groups `head` / `body` / `legs` / `arms` / `handR` / `handL` sit on those sockets for the parts dock. KIT_NAMES is **`none` first** on armor. Default kit is **scythe both hands** (one `p018`). Armor stays none. Scythe occupies both UI slots. Cannon either hand. Dual cannons need body `cell`.

Elbow / wrist / knee / ankle brass are **~2×** shoulder / hip / spine nodes (Bones overlay).

## Gold sit

Sliders drive **cage dims** (hip/shoulder/neck Y, chest cage, **upper arm / forearm** length/thick, **thigh/shin/stance**, **shoulderW / hipsW / footSize / torsoLean**, scale) **and** plates / gripper / weapons. **Sit: Heavy labor** = industrial body preset; **Reset gold** = neutral mannequin, hold profiles persist. Part sliders hide while that slot is none.

## Scale

World: **1 tile = 1**. Crate height ~0.9 after bay scale **1.1**. Feet/waist on the home diamond; **a little overlap above the waist** onto neighbors is OK. FM. Giant scythe OK if it can harvest-sweep without eating the camera.

## Harvest scythe

Only when a scythe is equipped. Mesh lives in `parts3d.ts` (not `kit.ts` — Q8). Group `scythe`: **snath + ferrule + weld + blade**. Tang of the knife sits on the ferrule (`x=0.6`). Mild hook, not a letter C, not a farm tube.

Idle: two fists on the snath (wide ~0.72). Grippers clamp the tool on **both** wrists (cannon is a tool in the grip, not a replacement hand). No empty-hand mesh (cannot Board unarmed).  
**Swing:** clip `harvest` in `solace-mech-anim`. Fists stay. Blade trail clones the **blade** mesh.

## Arm bases (same names as look)

| Base | 3D |
|------|-----|
| **B crane** | grey. Fat pauldron, long hinge, visible elbow |
| **C stork** | extra joint, longer, weirder |
| **A ape** | later. Hang, extra elbow, teeter |

Limb baked into the chest = **fail** (`solace-3d-qa`).

## Must not

- Imagine 4-dir / flip / portrait camera
- Modular Gasket
- 3D dungeon floor
- Arms as left/right part ids (runtime instance both sides)

## Fail

Missing upper/forearm. Crate >1 tile. Scythe unusable. Swing doesn’t move fists onto the pole.
