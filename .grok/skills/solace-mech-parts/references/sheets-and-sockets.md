# Sheets, cells, sockets

## Background

Authoring / preview cells use magenta `#FF00FF`. That color is chroma-key, never armor.

Runtime files for Canvas 2D are straight-alpha PNG, same cell box, magenta stripped.

## Cell rules

- The entire figure, including weapons, stays inside the cell with margin.
- Overlap onto neighboring tiles at *draw time* is allowed.
- A hard cut on the cell edge is a fail — regenerate with a larger cell or tuck the weapon.
- Same crate scale on south, east, north, west.
- Shared foot line — heels sit on the same Y across the four facings.

Suggested canvases (HD-pixel, assembled ~160 px tall):

| Use | Canvas | Notes |
|-----|--------|--------|
| Battle cell | 384 x 384 | One facing, idle |
| Isolated head | 384 x 384 | Neck at join |
| Isolated body | 384 x 384 | |
| Isolated arm | 384 x 384 | Shoulder at join |
| Isolated legs | 384 x 384 | Hip at join, sole on FOOT |

Adjust together if the user names a tile size. Do not mix scales inside one kit.

## Socket map

Coordinates are in assembled 192 x 192 battle-cell space, origin top-left, south idle. East/north/west sockets are the same attachments after the facing transform — do not invent a second skeleton.

See [assets/sockets.json](../assets/sockets.json).

| Socket | Parent | Child |
|--------|--------|-------|
| neck | body top-center | head |
| shoulderL | body upper-left | armL |
| shoulderR | body upper-right | armR |
| hip | body bottom-center | legs |
| handL | armL distal | held weapon / shield |
| companion_mount | body rear hull | Gasket (not a part id) |

Two layers only — shoulder then wrist. No elbow. Integrated arms skip the wrist child. Two-hand weapons put `gripR` / `gripL` on the weapon frame.

When generating a *single part*, put a 1-px marker-free join. Do not draw a visible crosshair on shipped art. Keep a 2-px clear overlap pad at each socket so swaps do not gap. Wrist pixels must match across every manipulator arm.

## File names

B1 source:

```
p012_{slot}_{variant}_{pose}_{dir}.png
```

B3 runtime:

```
p012.png
p012.json
```

- `p012` is the part id. Same id on every pose and facing.
- `slot` — `head`, `body`, `arml`, `armr`, `legs`, `weapon`
- `pose` — `idle`, `grip`, `fire`
- `dir` — `s`, `e`, `n`, `w`

B2 preview composites (`preview_kit_blade_idle_s.png`) are look-dev. Not a part id. Not an atlas source.

Grip and fire cells use the same canvas as idle. Weapons may need extra margin; enlarge the B1 cell rather than cropping the blade.

## Draw order (south)

legs → body → head → armL (blade kit only) → armR → weapon(s)

North may draw weapons behind the crate. East draws the far arm first.
