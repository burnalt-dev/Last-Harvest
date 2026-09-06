# Occupancy (NS-grey family)

Modular variants **clip** to these maps. Do not mix crate `p000–p010` with this family.

Maps: `public/game/solace/occupancy/{s|e|n|w}_{slot}.png` (allow) and `*_x.png` (exclusive). **S50:** no `h_` portrait maps.

**S52 gold legs:** `{dir}_legs.png` is **p017 plow**. Later legs clip to it. Hip sockets frozen from that bbox. Sole 352.

| Slot | Allow dilate | Notes |
|------|----------------|-------|
| head | 5 | visor band |
| body | 11 | hull+pack |
| legs | 29 | **p017 gold.** Sole 352. Hip from p017. RJ may grow down, not past FOOT |
| armL / armR | 23 | bulky pauldrons; **wrists frozen (45A)** |
| hands | 11 | weapon + grips |
| wrist | 9 | two-hand swing seats here |

Writer: `last-harvest/scripts/occupancy.py` via `pack-maskcut.py`. Variants: `pack-from-isolate.py` clips then L/R from **A** arm maps, not the variant’s centroid.

Turn: occupancy is computed **after** height-match (soles on FOOT, height = south). Battle blit plants legs-x + FOOT y so Q/E does not slide or resize.
