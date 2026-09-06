# How to produce a modular piece

**Modular is always first.** If a method looks better but fuses slots, throw it out.

## Flow (only this)

1. **Lock** — one 384 assemble per facing (soles on `foot_line_y`). Magenta void. No flip.
2. **Occupancy** — exclusive + allow maps (`occupancy.py`). Wrist band frozen (**45A**).
3. **Stock isolates** — mask-cut lock RGB × occupancy. Pack `origin 0,0`.
4. **New part** — **one slot**. i2i the stock slot PNG in that 384. Clip to occupancy. Never a second full robot. Never crop/recenter. Prompt: only those pixels, magenta else, visor/soles/wrists stay put.
5. **Mech Test** — swap **that one** id onto stock. Fail if hole, visor-on-body, blade-on-arms, whole bot in one PNG, or turn slides/resizes (S33/S34).
6. **Stop for Ivan QA.** Next slot only after that mix is boring. Do not author 4 dirs × 5 slots × 2 in one turn.
7. Motion later: legs walk → arm sway → two-hand fire pose seating weapons on wrists.

**Before Solace generates anything new:** stock Mech Test Q/E must already plant (same diamond, same height, same wanzer). If not, fix lock/plant, not a new mesh.

**Ids:** Mech Test shows `p###`, never A/B labels. Reuse `p012` head / `p011` body / `p013` legs / `p019` arms only as **revisions of those slots**. Mint `p020+` only when those are taken.

**46A next:** `p012` head from `p015`. Then stop (47A).

**Family:** NS-grey stock `p015 p016 p017 p014 p018`. Crate `p000–p010` and failed variants (`p012` whole-bot head, etc.) are **scrapped from mix**. Do not load them in Mech Test.

## Cameras

**S52:** Legs occupancy + hip from **p017 gold**. Sole 352. Later legs (hover/RJ/grey) match that plant. Body uses the same `hip` sockets.

## Source (only this)

**A (stock)** — one lock assemble per facing in a 384 cell (soles on `foot_line_y`). Mask-cut into **isolates** (head, body, legs, arms, hands). Pack `origin 0,0`.

**Stock ids:** `p015` head · `p016` body · `p017` legs · `p014` arms L+R · `p018` scythe+grips.

Variants (p012 head, p011 body, p013 RJ, p019 bulky) are **out of Mech Test** until they pass occupancy (no whole-bot PNG).

**Arms:** L and R isolates, no weapons. One loadout `arms` id. Hangar R = flip-draft + unique-pass. No runtime flip.

**Two-hand swing:** general fire pose; weapons seat on frozen wrists (45A). Cannon is aim, not this pose.

**Occupancy:** [occupancy.md](occupancy.md).

Script: `pack-maskcut.py` then `pack-from-isolate.py` (clip to occupancy).

## Turn (battle)

Soles on `foot_line_y` (352) **every** facing. Visor-to-sole height matches south (packer S34).  
Blit **plants** on the tile: legs-band **x**, sole **y** = FOOT. Scythe width does not pull x. Turning must not slide, grow, or shrink. Same wanzer looks (visor rules, no new mesh).

Mech Test (title) is the QA: Q/E on the diamond.

## Fail

- Second full-body lock for a variant
- `fit()` + socket stamp
- Flip east→west
- Variant cropped/recentered (unseats the mix)
- Arms PNG that is the whole robot
- Battle frame that is a front portrait — **S50**. Discard.

Magenta key is **chroma `#FF00FF` only**. Do not rose-key the hull (S39). Body isolate **keeps arm overlap**; do not subtract arms (holes).
