# Slot layers from the lock (mask-cut)

The 4-view concept is the **pixel source**. Do **not** i2i-invent a new head on empty magenta.

For each battle facing:

1. Put that assemble in 384 (soles on `foot_line_y`).
E/N/W slot masks come from **the lock pixels** (visor / wood shaft / yellow stripe / soles). Not i2i chroma. South may still use a clean isolate alpha.
3. Pack `origin 0,0`. Compose is alpha-over. A perfect stack **is** the concept picture.
4. Both arms for **that** facing live on one `pair` layer. No flip. No copied dirs.
5. Scythe/grips stay on the same unit hands on every facing.

Idle / walk frames come **after** a swap of one slot still reads as this wanzer. Idle is a 2-frame squat on **legs** + visor dim on **head** (`solace-mech-anim`). It is not how we debug joints.

Joints are proven by: swap head A/B, turn S-E-N-W, weapons stay on the same hands.

## Must not

- i2i chroma as the color source
- `fit()` + socket stamp
- Flip or copy a facing to make another
- Idle-animate before the stack matches the lock
- Portrait as idle south
