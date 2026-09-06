# Facing QA

Run this after every 4-dir drop. Fail = do not ship, do not pack B3.

**S50:** there is no portrait still. QA is idle S E N W only.

## Set shape

| File | Role |
|------|------|
| `*_idle_s` | Battle south 3/4. **Down-left.** |
| `*_idle_e` | Battle east 3/4. **Down-right.** |
| `*_idle_n` | Battle north 3/4. **Up-right.** Rear vent. |
| `*_idle_w` | Battle west 3/4. **Up-left.** |

Exactly one of each. Screenshot dungeon canvas is heading truth (S49).

## Tests

1. **No portrait** — If a frame is straight-on / left-right symmetric, it failed 3/4. Discard it.
2. **Visor compass**
   - idle_s: bar visible but off-center
   - idle_e / idle_w: sliver or side of visor only
   - idle_n: **no** visor bar. Rear vent + helmet back
3. **Four headings** — Point at each battle frame and say the direction the feet / chest aim. You must get S, E, N, W once each. Two frames aiming the same way = fail.
4. **No flat turns** — Left-right symmetry on a battle frame = fail.
5. **Hands stay on the unit**
   Blade kit: unit-right = chainsaw. unit-left = shield. Camera orbit does not swap items.
6. **Grip** — Blade off the shins. Overlap onto hull is OK.
7. **Swap test** — seat the new part on stock. If it only works as a fused set, fail.
8. **Same mesh** — All four battle frames are one crate. New silhouette while turning = fail.
9. **Solid isolate (S39)** — One connected blob. **Zero** leftover magenta RGB.

## Pass line

```
QA: S3/4 E3/4 N-back W3/4 | visor S=bar E/W=sliver N=none | hands L-shield R-chainsaw | swap-on-stock | same-mesh | no-portrait
```
