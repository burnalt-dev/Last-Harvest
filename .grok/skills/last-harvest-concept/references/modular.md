# Solace concept — 3D groups or don’t draw it

Concept art for the frame must be **feasible as a `solace-rig` group**. Pretty fused bots fail. Imagine 4-dir PNG isolates are **parked**.

## Slots (3D)

| Slot | One id? | On the sheet |
|------|---------|--------------|
| head | yes | Entire head |
| body | yes | Hull + resource pack + mount |
| legs | yes | Pair, one tile |
| arms | yes | Crane chain both sides, fists on the weapon |
| weapon | yes | Includes grip. Two-hand = one id |
| back | no mesh | Do not draw |

## Feasibility (before calling it a concept)

1. Can we hide every other group and still read this slot?
2. SENW is the **same mesh**, yaw only?
3. Swap changes silhouette?
4. Limb not buried in the chest?
5. Feet inside one diamond?

If any no: change the **rig**, don’t “fix it in pack.”

## Arm bases

B crane (grey) / C stork / A ape later.

## Teaching sheets

1. **Slots** — assembled 2×2 SENW.
2. **Isolate** — one group, 4 yaws.
3. Optional **harvest** — swing mid-frame if weapon.

Produced by `export-ref-sheet.mjs`, not a new Imagine painting.
