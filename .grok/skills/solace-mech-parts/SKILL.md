---
name: solace-mech-parts
description: Modular-first Solace Labor crate part design. Priority is always swappable slots and isolated B1 files over full-body previews. Use when Ivan asks for Solace parts, swap only one slot, labor crate, wanzer modules, heads, bodies, left or right arms, legs, blade kit, scythe, cannon, hover skirt legs, reverse-joint leap legs, two-tile jump, 4-dir compass sprites S E N W (3/4 only, no portrait), facing QA, unit-right chainsaw unit-left shield, part ids p000 through p999, two-hand grip, fire pose, or rarity tiers grey white blue purple gold.
---

# Solace Mech Parts

**Open `last-harvest` then `last-harvest-makers` first** (canon, QA, frozen ids). Then **`solace-mech-look`**. Then this file. New meshes: **`solace-parts3d`** (crude plates; default `none`).

**Hybrid:** new Solace art is **3D meshes on sockets** (`solace-rig` / `solace-parts3d`). This skill is **parked** for B1 PNG leftover / occupancy history. Do not Imagine-pack 4-dirs for new parts. Terrain stays 2D. Foes are 3D.

**Parked for new Solace art.** Live crate is the **3D armature** (`solace-rig` sockets + `parts3d` plates). Do not Imagine-pack B1 4-dirs for new parts. This skill keeps ids / rarity / occupancy history. New meshes parent onto bones. Dungeon PNG blit of old parts is leftover — Drop3D does not use it.

**Cohesion:** open `solace-cohesion` before packing dirs. Same `p###` = one mesh.

This skill authors swappable Labor crate slots for Solace. Each swap must change silhouette. Quality bar is Front Mission SNES HD at the same pack as terrain: **384×384** seated cells, LANCZOS, **no** BOX/2 nearest crunch. Assembled figure ~256–384 px tall.

If a choice is pretty but fuses two slots, pick the modular one. Overlap is fine. Sockets stay public.

Tiers — grey junk, white store, blue craft/biome, purple rare unique, gold legendary BIS (Last Harvest UI calls this rank **orange**). See [references/rarity.md](references/rarity.md). Tier is mesh, not a recolor.

Canon sources, in order:

1. User-attached `PARTS-SPEC.txt` and Labor crate art (this conversation / `labor-crate-art.zip`)
2. Bundled [references/identity.md](references/identity.md), [references/rarity.md](references/rarity.md), [references/slots-and-kits.md](references/slots-and-kits.md), [references/part-ids.md](references/part-ids.md), [references/storage.md](references/storage.md), [references/sheets-and-sockets.md](references/sheets-and-sockets.md), [references/engine-canvas2d.md](references/engine-canvas2d.md), [references/prompts.md](references/prompts.md)
3. [assets/sockets.json](assets/sockets.json), [assets/part-registry.json](assets/part-registry.json)

If the user attaches new concept art, it overrides bundled defaults for look. It does not override slot rules or sheet rules unless they say so.

## Modular rule

This skill authors **slots**, not finished robots.

A part is one id on one slot: **head** (whole), **body**, **legs**, **arms** (one mesh, mirrored to both shoulders), **handL**, **handR**. A two-hand part occupies both hands under the same id.

B1 isolated files are the source of truth. Draw `p012_head_idle_s.png`, not a fused wanzer. Pack B3 from B1. B2 4-dir composites are look-dev only — S E N W. Never slice a B2 to invent parts. Never ship a B2 as the part.

When the user asks to change “only the legs” (or head, or one arm), edit that slot’s B1 set and composite it onto stock pieces. Do not redraw the whole crate.

Do not issue an id until the part is usable. Look-dev has no number. When it is usable, it gets **one** unused id `p000`–`p999` for every frame it will ever have. Do not reuse a number on a different part. Do not mint a number per facing. If the registry hits `p999`, stop and ask. See [references/part-ids.md](references/part-ids.md).

## Views and poses (all required in the design)

Author every part with this pose set in mind. Do not ship a part that only works on south idle.

| Pose | Facings | Purpose |
|------|---------|---------|
| idle | s e n w | Battle stand. Piston and reverse-joint plant on the foot line. Hover skirt floats; no feet. |
| grip | s e n w | Short two-hand grab / chamber pose before the swing or shot |
| fire | s e n w | Attack contact / muzzle flash pose |

Battle set is four frames: S E N W, all 3/4. **N = up-right, E = down-right, S = down-left, W = up-left.** **S50: no hangar/portrait still.**

Visor test: S shows the cyan bar, E/W show a sliver, N shows **none**. If two frames both show a full visor, one of them is a duplicate south — replace it with a back.

Author north by yaw from south/west. A visor-forward frame is south, never west.

If a battle frame is left-right symmetric, it is wrong. Label every file `s` `e` `n` `w`. Overlap is fine. Hands stay on sockets; weapons do not swap sides.

Minimum **part** drop — B1 for that id: idle × 4 dirs as isolated slot files, plus sockets.

Minimum **unit preview** (B2 only, not storage) — four images: `idle_s` `idle_e` `idle_n` `idle_w`. Do not ship three souths and call it a compass. Grip + fire stills are extra.

West is authored, never a flip of east. Blade kit is not symmetric. Two-hand grip and fire are not a pair of mirrored guns.

Grip / fire are construction poses for later animation, not walk cycles. Full timing stays in `solace-mech-anim`.

## Slots that get graphics

| Slot | Changes look | Notes |
|------|----------------|-------|
| head | yes | **Whole head**. Hat OK if painted on |
| body | yes | Hull + pack + **short faulds** over p017 hip. No holes. Not Gundam skirt |
| legs | yes | One pair. piston / hover / RJ |
| arms | yes | **L + R isolates**, one loadout `arms` id. Battle L/R unique. **No runtime flip.** No weapons/grips. |
| handR | yes | **Main**. Weapon includes grip |
| handL | yes | **Off**. Shield or support cannon + grip. Two-hand copies main id |

**companion_mount** — not a part id. Rear hull socket for Gasket. Packer must expose `sockets_by_dir[dir].companion_mount`. Do not hide it. Do not make a backpack mesh. **Do not author Gasket art here** (`last-harvest-companion`).

**HD isolate:** idle 4-dir `p000–p002`, `p005–p010`. Pack with `scripts/pack-hd-seat.py` (soles on `foot_line_y`, stack hull on pistons). Tiny B1 in `b1_tiny`. Idle2/grip/fire after slice 1.

## Complete unit

**Mech Test piece-pass** may show **one live slot** (now `p012` head). Do not glue archived lock-cut stock back on to look “complete.”

A **drop / dungeon** crate still needs every graphic slot before it boards. Isolated B1 may be one limb. Battle assemble for a **playable** loadout:

- head · body + pack · legs · arms (one id, L+R) · weapon hands

Do not ship a fused full-body as one `p###`.

## Show a generated mech

When Ivan says show a mech, show **what the game draws** (B3 assemble), then label the data. Do not stop at a pretty B2.

Order:

1. **IN GAME (B3)** — one assembled frame per requested idle S E N W. Magenta field. This is the cached composite the Canvas loop would blit.
2. **LOADOUT** — table of slot → part id → variant.
3. **SOCKETS** — copy the dir’s points from [assets/sockets.json](assets/sockets.json). Every new part must hit these numbers. Do not invent a private socket map.
4. **B3 JSON** — atlas snippet for each id in the loadout (`id`, `slot`, frames with `pose`, `dir`, `origin`, `sole`).
5. **B1 list** — filenames that packed that atlas.

Sockets are the **joints**. See [references/joints.md](references/joints.md). No separate joint skill.

## Workflow

When the user asks for a part, kit, or sheet:

0. Name the **slot** being changed. If they did not name one, ask or default to a single slot. Do not start from a fused full-body.
1. If this is look-dev, skip the registry. If the part is usable, assign the next free id. Reuse a number only when revising **that same part**. Never mint an id per frame. If `p999` is taken, stop and ask.
2. Read the matching reference file if the request is more than a small tweak.
3. Emit a **spec card** first (see template below). Include the socket points from `assets/sockets.json` for the dirs you will author.
4. Emit image-gen prompts from [references/prompts.md](references/prompts.md). Shared lock plus one facing block per file. Do not improvise a new character sheet.
5. Generate or edit images only if they asked for art, or if a picture is the only way to check the swap.
6. Run [references/qa.md](references/qa.md). Swap test first, then facing. A pretty 4-dir that cannot mix with stock parts has failed.

Do not invent a second gun, a second shield, a second scythe, or a backpack crate. Do not draw hangar rooms or warehouse floors behind battle frames. Do not drop the cyan visor or the yellow caution language unless the user is authoring a new paint.

## Spec card template

```
ID: p012
SLOT: head | body | armL | armR | legs | handL | handR | hands
UNIT: Labor crate
VARIANT: ...
KIT: blade | scythe | cannon | none
POSES: idle s/e/n/w | grip s/e/n/w | fire s/e/n/w
LEGS: piston (grey+) | hover (blue+) | reverse-joint
TIER: grey | white | blue | purple | gold
PAINT: steel + cyan visor + yellow stripe (+ optional pattern name)
SOCKETS: neck / shoulderL / shoulderR / hip / handL / handR
MUST CHANGE: one-line silhouette delta vs default crate
MUST NOT: Gundam skirts, Halo helmet, dual guns, dual shields, cropped weapons, new id per frame, reuse an id on a different part
```

## Fail list

Reject or regenerate if any of these are true:

- Not modular — fused full-body, sockets hidden, or cannot swap onto stock crate parts
- Looks like Gundam, Halo, MJOLNIR, a space marine, or sleek anime mecha. Gold candy armor on a humanoid athlete body is a fail even if the caption says Labor crate.
- Missing cyan visor slit or the yellow caution stripe language
- Soft painterly edges / no dark 1px outline
- Hard crop of body or weapon at the cell edge
- Scale drift across facings (crate taller on south than east) — **S34** match south height; soles on FOOT
- Battle model slides or resizes when turning — plant legs-x + FOOT y (S33/S34)
- Foot line jumps between facings on piston or reverse-joint
- Hover skirt with planted boots or any foot on the floor
- Hover skirt authored as grey or white (hover starts at blue)
- Reverse-joint that never plants and has no two-tile jump pose
- Preview or assemble missing head, body, legs, or required arms
- Weapon fused into the hull because arms were omitted
- Generator never “fixes” a mirror by **cropping half** the west/east scythe or shield (S8)
- Dual guns / dual shields / dual scythes
- Packer other than `scripts/pack-hd-seat.py` for HD B1
- Recolor glaze instead of hull/subcolor layers ([paint.md](references/paint.md))
- Backpack drawn as a second animated mesh
- Magenta used as armor paint (magenta is chroma only)
- Missing part id, a new id minted for a facing/frame/paint, or an old id reused on a different part
- Part designed for south only with no 4-dir plan
- Part that cannot attach in two-hand grip or fire (fused to idle pose, no wrist/hip/neck play)
- Runtime fed from a B2 full-body composite or from 32 loose B1 fetches
- Two-hand kit that drops armL or leaves a free hand for a shield
- Battle frame that is straight-on / left-right symmetric (failed 3/4)
- Any battle frame that is a front portrait (S50 — no portrait camera)
- QA in references/qa.md not run or pass line missing on the spec card
- Two visor-forward frames and no visorless back (duplicate south, missing north)
- Battle N that still shows the cyan visor bar
- Battle W that is visor-forward (duplicate south) or vent-only with no left heading (duplicate north)
- Facings unlabeled or swapped (shield jumps to the right hand)
- Blade leaves unit-right or shield leaves unit-left after a camera orbit
- Sword or scythe stabbed through a shin for a "nice silhouette"
- New crate mesh invented when orbiting the camera
- Part that only works as a fused full-body and cannot swap onto stock crate slots
- B2 composite treated as the part file or sliced into fake B1

## Animation handoff

This skill owns idle, **grip**, and **fire** stills per part id. Walk, jump, hover bob, in-betweens, and frame timing belong in `solace-mech-anim`. Those extra frames keep the same part id.

Animation language is Mega Man X scale — few frames, hard poses, smear only if a swing needs it, snappy attack. Not 20-frame film. Figure size stays the Labor crate HD-pixel cell (~160 px), not X’s 32 px body. Canvas 2D can hold that if frame counts stay low and assembled kits are cached per facing instead of restacking five PNGs every tick.

Keep joints readable. Do not fuse a weapon to the torso. Do not hide the hip or wrist sockets. Grip is a brief two-hand chamber. Fire is the hit / shot pose. One-hand blade still uses those pose names — left stays on the shield, right drives the chainsaw; do not grow a second weapon.

## Engine / export

Engine is **Canvas 2D** (HTML5 `canvas` / `drawImage`). See [references/engine-canvas2d.md](references/engine-canvas2d.md). Last Harvest is the live consumer.

## Last Harvest runtime

Keep skill assets and the game in lockstep:

| Skill | Game |
|-------|------|
| `assets/part-registry.json` | `src/game/solace/registry.json` |
| `assets/sockets.json` | `src/game/solace/sockets.json` |
| packed B3 `p###.png` + `p###.json` | `public/game/parts/p###.png` + `.json` |

Compositor: `src/game/solace/compose.ts`. One cached **384×384** composite per loadout+pose+dir. Dungeon blits that cache with integer dest onto Front Mission 3/4 diamonds. **S50:** no portrait blit.

Starter loadout (piece-pass): **`p017` plow legs**. Head/body next.

Aux/back are stats-only. No backpack mesh.

Storage pipeline (see [references/storage.md](references/storage.md)):

- **B1 source** — isolated slot files `p012_{slot}_{variant}_{pose}_{dir}.png`. Draw and QA here.
- **B3 runtime** — one `p012.png` + `p012.json` atlas ingested from B1. The game only loads B3.
- **B2 preview** — full-body composite for look-dev only. Never ship. Never slice into parts. Never feed the compositor.

Also:

- Straight-alpha PNG in B3 (magenta is authoring only)
- Integer dest x/y — no subpixel `drawImage`
- JSON sockets from `assets/sockets.json`; atlas frames add `origin` and `sole`
- Two-hand kits occupy `handL` and `handR`; keep both arm meshes
- Part number does not change across poses or facings

Performance (required):

- Game loop draws **one cached composite** per unit
- Rebuild cache only on loadout / paint / pose / dir change
- Battle atlas is idle S E N W only (S50)
- No per-tick filters, shadows, or `getImageData`
- Preload equipped ids + `p000`–`p010` only

## Recolor

Armor is recolor-friendly. Keep four conceptual layers even when flattened — hull, accent/stripe, metal-joints, visor. Paint patterns live on hull + stripe, never on the visor glass. See identity.md for pattern names.

## Additional resources

- [references/occupancy.md](references/occupancy.md) — NS-grey clip maps. Variants stay in family.
