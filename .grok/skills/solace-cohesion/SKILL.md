---
name: solace-cohesion
description: >
  Same p### must look like the same piece from all cameras. Gold lock is
  p017 plow legs. Author SOUTH then NORTH first; E and W from that pair.
  Use for every Solace modular slot. Open last-harvest then solace-mech-look
  then this, then pack.
---

# Solace cohesion (top priority)

**Open `last-harvest` then `last-harvest-makers` first.** Then `solace-mech-look`. Then **this**.

**Hybrid:** parked. New Solace art is the **3D armature**, not 4-dir PNG cohesion. Terrain stays 2D. Foes are 3D (`foe3d`). Do not run Imagine 4-dir packs for new parts.

**Parked.** New Solace art is the **3D armature**, not 4-dir PNG cohesion. Keep this file as history for leftover B1 / p017 gold stills. Do not run Imagine 4-dir packs for new parts.

**Gold lock (Ivan 2026-09-03):** `p017` plow legs. Coherent 4-dir, one mesh. This is the **end goal for every slot** (head, body, legs, arms, weapons) — not a legs-only trick.

Assets: `solace-mech-look/assets/gold-legs-p017.png` + `gold-legs-p017_{s,e,n,w}.png`. Sheet `gold-legs-sheet.png` (hip + FOOT labeled). Occupancy `public/game/solace/occupancy/{s,e,n,w}_legs.png`. Hip sockets from that bbox.

**How to use the gold**

| Use | File |
|-----|------|
| Generate a new dir | i2i `gold-legs-p017_{dir}.png` — keep mesh, only yaw |
| New legs silhouette (hover/RJ) | i2i `joint-template-legs-s.png` — hit HIP + FOOT, clip occupancy |
| Human QA | Concepts title → gold sheet. Mech Test Turn on `p017` |
| Packer height | match gold bbox top ±12, sole 352 |

## Process (every modular slot)

**S48 compass:** N **up-right**, E down-right, S down-left, W up-left.

1. One **south lock** (down-left), isolated, magenta. Same silhouette language as p017 (rivets, yellow hatch, SNES HD).
2. **North from that file** (up-right). Same mesh. Not top-down. Not a new concept.
3. **S|N contact sheet** — same object in 2 seconds or **stop**.
4. **East / West** from S+N only (`imagine_reference_to_image`). E = down-right, W = up-left.
5. **SENW sheet.** Pack idle S E N W. **S50: no portrait.**
6. Mech Test Turn. If a dir faces the wrong heading (**S49 / S51**): **relabel** the still, generate the hole. Do not redraw the liked still as the wrong dir.

Never four separate text-to-image calls. Never E from north alone. Never pack a dir that is not on the sheet.

## Legs scale (S52)

Later legs (hover, RJ, other grey) **match p017**:

| | p017 gold |
|--|-----------|
| Cell | 384 |
| Sole | `foot_line_y` **352** |
| Hip | sockets `hip` from p017 bbox top (~121–130). Do not invent a new hip |
| Height | bbox top ~103–112, sole 352 (~240 px tall) |
| Occupancy | clip to `{dir}_legs.png` |

**S53 / S55 Body = welded lid in the gold plant.** i2i `gold-legs-p017_{dir}.png` — bolt the chest onto the hip crate as **one machine**. Isolate by cutting pistons (`y > legs_fore_y` 128) only. **Never scale-and-drop** a floating chest onto the legs (that was the gap). Same 384, sole 352, origin 0,0. Fail if a seam/gap at the hip.

## Gate

| | Fail if |
|--|--|
| S vs N | Different machine, N is a top-down hatch |
| E/W | New mesh; ram/profile; second south |
| Legs | Sole ≠ 352, hip off p017, taller/shorter than gold ±12 px |
| Heading | UI letter disagrees with the dungeon canvas |

## Packer

S43 SENW sheet. S42 same paint vs lock. S41 heading after S42. S45 no E/W before SN sheet. S52 occupancy + hip.

## Fail

- Authoring E or W before S+N pass
- Four generates from a concept
- Shipping after a WARN
- Emptying Mech Test before a replacement atlas (**S46**)
- New hip / foot line for a variant
- Portrait / hangar still (**S50**)
