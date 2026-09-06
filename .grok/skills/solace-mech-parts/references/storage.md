# Storage pipeline

Rule: draw and QA in B1. The game only sees B3. B2 never feeds the compositor.

## B1 — source of truth

Isolated slot files. One limb, one pose, one facing.

```
p012_head_idle_s.png
p012_head_idle_e.png
p012_head_grip_s.png
p012_head_fire_w.png
```

Variant may sit in the filename after the slot (`p012_head_sensor_idle_s.png`) but the id is still `p012`.

Why B1 exists:

- Stops a second scythe, a chopped blade, or an empty strike column
- Easy recolor, QA, and swap
- Two-hand kits occupy both hand sockets. Keep armL and armR.

Edit and generate art as B1. Never slice a full-body to make B1.

## B3 — runtime

One atlas + JSON per part id. Ingest B1. Do not keep 32 HTTP fetches per plate.

```
p012.png
p012.json
```

JSON frames carry `slot`, `pose` (clip), `dir`, `origin`, `sole` (foot line / plant). Schema in [assets/atlas-schema.json](../assets/atlas-schema.json).

Canvas loads `p012.png` once. Game loop should `drawImage` a **cached composite**, not restack every part each tick. Same pixels as B1.

Battle atlas contents — `idle`, `grip`, `fire`, and later walk/jump frames. **S50:** no portrait atlas.

Pack trimmed frames + 1 px pad. West may be `flipX` of east when the part is symmetric.

## B2 — preview only

A south (or 2x2) full-body composite is look-dev. It is not a part. It does not ship. It does not feed the compositor.

Slicing B2 is how mirrored guns and leftover shields appear. If a composite is wrong, fix B1 and rebuild B3.

Kit preview names (optional, not runtime):

```
preview_kit_blade_idle_s.png
```
