# Character design prompts

Edit the south lock. Do not blank-prompt a new crate. One prompt = one file. Never ask a model for 4-dir in one image.

## Shared lock (paste first)

Labor crate wanzer. Riveted boxy steel. Bucket helmet. Cyan visor slit. Caution-yellow shoulder stripes. Dark 1px outline. Chunky SNES HD-pixel, high density (author large, pack to 384). Squat Front Mission proportions, not a tall hero shot. Complete unit: head, crate body, piston legs (or named hover/RJ), both arms unless two-hand kit. Flat magenta `#FF00FF`. No warehouse, floor grid, forest. No backpack crate on the lid. Backpack is stats only. Grey cracks and rust OK. Not a patchwork quilt. Same mesh as the south lock. Orbit the camera. Do not invent a second body. **S50: no front portrait.**

Blade kit hands (unit space, never screen space):

- Unit-right arm = short industrial chainsaw (toothed bar + housing). Grey/white steel teeth. Blue+ hotter, laser, or fancy-material bar. Not a knight sword.
- Unit-left arm = door-slab shield
- Items stay on those arms when the camera orbits

## Battle south — `pXXX_idle_s`

3/4 high, offset. Unit heading **down-left**. Lid + chest + nearer shoulder larger. Not symmetric. Visor bar visible but off-center. Shield viewer's left. Sword viewer's right. Blade off the shins. Overlap onto hull OK.

## Battle east — `pXXX_idle_e`

3/4 high. Unit heading right. Lid + right flank. Visor sliver only. Sword stays unit-right (near / viewer's right). Shield stays unit-left (far / viewer's left). Not a flat profile. Not another south.

## Battle north — `pXXX_idle_n`

3/4 high back. Unit heading **up-right**. Lid + rear vent + back of bucket. **No cyan visor bar.**

## Battle west — `pXXX_idle_w`

3/4 high. Author from north. Unit heading left. Lid + left flank. Visor sliver only — not a full front bar, not a vent-only second north. Keep the **same arms** as north: the arm that held the sword on the left of the north PNG still holds the sword.

## Isolated B1 part (default when changing pieces)

This is the real product. One slot, one pose, one facing. Magenta field. Show the socket edge so it snaps onto a stock crate. Name the id. Same mesh for idle / grip / fire.

If the user said only change the legs, head, or one arm, generate that slot’s B1 set and composite onto defaults for a B2 check. Do not redraw the other slots.

No full-body unless they asked for a unit preview.

## Grip / fire

Edit the matching idle facing. Grip = short chamber. Fire = hit or muzzle toward that heading. Same id. Same hands. No second gun.

## Recolor

Edit only. Name the pattern. Visor stays cyan. Rivets stay. Same id.

## Forbidden wording to drop in

Do not put these in a prompt unless you want the model to invent them: warehouse, hangar bay, factory floor, forest, backpack crate, dual swords, dual shields, heroic low angle, front portrait, Master Chief, Spartan, MJOLNIR, space marine, Gundam.

## Four-file pack order (S50)

1. idle_s south lock
2. idle_n from south (cohesion)
3. idle_e / idle_w interpolate S+N
4. Run `references/qa.md` before packing B3. No hangar file.


## Example-first (Last Harvest)

Do not start from a full crate. Image-to-image the matching **isolated example** for that slot.

Examples live in `assets/examples/` (copied from the grey starter that actually isolated):

| Slot | Example |
|------|---------|
| head | `p001_head_idle_s.png` |
| body | `p000_body_idle_s.png` |
| legs | `p002_legs_idle_s.png` |
| armR / saw | `p005_armR_idle_s.png` |
| armL / slab | `p006_armL_idle_s.png` |

One prompt = one file = one pose × one facing. Never a 2x2 of a full wanzer.

1. Edit the example of **that slot only**. Keep magenta. Keep the socket edge. Change silhouette if this is a new id.
2. For other facings, orbit **this isolated part**, not the assembled kit. East from south, north from east (no visor on heads), west from north (or flipX if symmetric — never flip blade hands).
3. Pack with `scripts/pack-b3.py` (384 cell, LANCZOS, **no** BOX crunch). Origins: head/body hip-or-neck at bottom-center, legs hip at top-center, arms shoulder at top-center.
4. Game compositor (`src/game/solace/compose.ts`) snaps `origin` to `sockets.json`. If a dir has no frame, it falls back to the kit seed — it must not blit south while facing east.

QA still runs. A pretty full-body from an “isolated” prompt is a fail — delete it, do not pack it.
