# Slots, kits, and leg types

## Head

Sits on the crate lid (neck socket). Swapping head must change the top silhouette — visor shape, antenna, sensor box, slat count, cheek armor.

Keep the cyan slit language unless the variant is a blinded / sensor-dome head, in which case replace the slit with another cyan optic, do not delete the glow color.

## Body

Crate hull. Carries the yellow stripe on the chest and the rear plate. Rear plate is part of the body paint, not a backpack mesh.

Swapping body must change hull mass — scout crate (narrower), tank crate (thicker, extra rivets), labor crate (default).

## Arms and weapons (two socket layers only)

Keep **shoulder → arm** and **wrist → weapon-with-grip** separate. Do not add elbow, finger, or barrel sockets. At this scale extra joints will not read.

| Kind | Slot | Mesh | Child? |
|------|------|------|--------|
| Shoulder / upper arm | `armL` / `armR` | pauldron + upper arm, ends at an **open wrist ring** | yes — a weapon that includes the hand |
| Integrated gun-arm / pile / claw | `armL` / `armR` | shoulder through tool | no — the arm *is* the weapon |
| Left weapon | `handL` | **grip + tool** (the hand lives here) | n/a |
| Right weapon | `handR` | **grip + tool** | n/a |
| Two-hand item | `hands` | both grips on one tool | occupies both hand slots |

Hands are not a free slot. Weapons bring the grip they need (slab strap, saw pistol-grip, scythe pole, cannon stock). Deploy is always armed.

**Arm bases (anim families).** Every later arm picks one base and keeps that idle/walk/attack language. Shoulder+upper still; weapon still owns the grip.

| Base | Idle | Move | Notes |
|------|------|------|--------|
| **A Ape** | knuckles almost drag, extra elbow | windmill / over-reach | grey default candidate |
| **B Crane** | boom folded | unfold then strike | blue+ / weird-stat |
| **C Stork** | pipes stuck out, chest teeters | tilt, almost fall | weird-stat |

D wrap / E accordion / F noodle / G outrigger are extra bases — not locked until Ivan picks.

Do not draw fingers on the arm slot. Do not draw an empty palm on the weapon slot.

Blade kit: `handL` = shield (`p007`), `handR` = sword (`p008`).  
Two-hand kits: one id in both `handL` and `handR`. Keep `armL` and `armR`. Neither hand is free.

Do not put a held sword on the same side as an integrated gun-arm. Do not mirror a weapon arm to make the other arm.

Every manipulator arm must plant `handL` / `handR` on the same pixel convention so `p008` sword seats on `p005` and on a later arm without a gap. If a new arm cannot hit that wrist pixel, it is not modular yet.

## Legs

All three types share the **hip** socket. They do **not** all share a planted foot line.

### piston (`p002` and later piston variants)

Default walker. Stacked hydraulic blocks, forward knee, heavy boot. Heels sit on `foot_line_y`. Dungeon move — **one** grid square. Walk is a humanoid stomp (anim skill).

### hover skirt (`p003` and later hover variants)

Minimum tier **blue**. No grey hover. No white store hover.

Skirt / ring / petal thruster under the hips. **No feet. Nothing touches the ground.** The hem or thruster lip hangs above the tile on `hover_plane_y` (above `foot_line_y`). Idle and move both float.

Do not draw humanoid boots that plant. A thin support stalk is allowed only if it does not reach the floor. Cyan glow under the skirt is fine.

Dungeon move — **one** grid square, a glide. Bob is two frames later.

### reverse-joint (`p004` and later RJ variants)

Digitigrade leap legs. Knee behind the hip, long shin, landing pistons. Idle plants both feet on `foot_line_y`.

Dungeon move — **two** grid squares. That move is a jump, not a walk. Author idle planted + jump stretch (crouch, airborne, land). Airborne still keeps the hip socket so the crate does not detach.

Do not turn RJ into hover. If it never touches the floor it is the wrong type.

## Dungeon grid

Solace combat is mysterious-dungeon / grid.

| Legs | Tiles per move | Motion |
|------|----------------|--------|
| piston | 1 | walk |
| hover skirt | 1 | glide, no contact |
| reverse-joint | 2 | jump |

Other slots do not change tile count. A gold head on piston legs still walks one square.

## Complete assemble

B1 can be one part. The living unit cannot.

Fallback if a slot was not specified:

| Slot | Default |
|------|---------|
| head | `p001` visor-slit |
| body | `p000` labor-crate |
| legs | `p002` piston unless the request is hover or RJ |
| armR | `p005` manipulator, or integrated arm if that is the part |
| armL | `p006` manipulator |
| armR | `p005` manipulator |
| handL | `p007` slab on blade; empty only if two-hand part occupies it |
| handR | `p008` sword on blade; two-hand part occupies both hands |

Hover skirt replaces legs only. Arms still exist above the skirt.

## Starter kits (complete 4-dir sets)

Treat a kit as a locked loadout, not four independent weapons.

### blade

- LEFT — one door-slab shield (viewport slit + yellow warning triangle)
- RIGHT — one short **chainsaw blade** (toothed bar + housing, not a clean sword)
- Never two shields, never two saws

Blade weapon by tier (same slot, new mesh when usable — do not recolor a grey saw into gold):

- grey / white — industrial chainsaw. Riveted housing, steel teeth, scavenged or factory bar.
- blue — craft saw. Beveled housing, hotter teeth, biome material optional.
- purple / gold — laser or fancy-material saw. Photon / plasma tooth line, glass-ceramic or heat-glass bar, still a one-hand tool on `handR`. Not a beam sword from the wrist.

### scythe

- ONE two-hand scythe
- South / north — pole vertical in the right hand
- East / west — full sweep, shaft across the torso
- Left and right hands both on the shaft (`gripL`, `gripR`). Never a second blade. Keep armL.

### cannon

- ONE two-hand cannon
- South — barrel toward camera on the right
- East / west — barrel along the facing
- North — barrel visible past the right side, not a second cannon
- Never a mirrored off-hand gun
- Both hands on the cannon. Keep armL.

## Grip and fire (every graphic slot)

Design the part so it still sockets when the crate chambers and fires.

- Two-hand kits (scythe, cannon) — both hands on the one weapon. Grip tucks the stock or shaft. Fire extends barrel or blade along the facing.
- Blade kit — left hand stays on the slab, right hand chambers then extends the chainsaw. Not two-hand on the saw unless the user drops the shield.
- Head / body — visor and crate lid stay locked to neck/hip; they tilt only a little in fire (recoil cue), they do not detach.
- Legs — piston and reverse-joint keep heels on the foot line in grip. Hover skirt never grows feet. Fire may shift weight but does not change tile count or leg type.

## What a part swap must do

If the user cannot tell the new piece from the default crate at thumbnail size, the part failed. Change mass, joint count, or outline. Recolor alone is a paint, not a part. A south-only drawing is not a finished part.
