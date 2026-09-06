# Part ids

One id = one part forever. Not one facing. Not one pose. Not one paint. Not a second mesh.

Never give two different parts the same number. `p012` is that head (or that arm, or those legs) for idle, grip, fire, walk, jump, and every paint. A new silhouette takes the next free id.

Do not recycle. If a part is scrapped, its id stays retired in the registry. If `p999` is taken, stop and ask Ivan — do not wrap to `p000` or reuse a dead slot.

Format — `p` + three digits, `p000` through `p999`. Always lowercase `p`. Always three digits.

```
p012_head_sensor_idle_s.png
p012_head_sensor_idle_e.png
p012_head_sensor_grip_s.png
p012_head_sensor_fire_w.png
```

All of those are **p012**.

## What gets an id

| Gets its own id | Does not get a new id |
|-----------------|------------------------|
| A new head, body, arm, legs, or weapon mesh | A facing of an existing part |
| A new integrated arm weapon | A grip or fire pose of an existing part |
| A distinct silhouette swap | A crop of south idle |
| | A recolor / paint pattern of an existing part |
| | An animation in-between |

Paint is a layer or suffix, not an id. If needed — `p012_head_sensor_idle_s_hazard.png` — still p012.

## Assignment

Do not issue an id until the part is usable — B1 exists for the slot, sockets hit the contract, and it can swap onto stock crate pieces.

Look-dev, B2 previews, and “show me a grey mech” stay unlabeled or use a working tag like `wip-legs`. They do not consume `p011`.

When a part is actually usable:

1. Read [assets/part-registry.json](../assets/part-registry.json).
2. Reuse the id only when revising **that same part** (more frames, paint, QA fix).
3. A different mesh takes the next free id. Never the last part’s number.
4. Write the new row on the spec card and append the registry.
5. If `next_free` would pass `p999`, stop. Talk to Ivan before changing the scheme.

Do not skip around for flavor. Do not use `p12` or `P012`.

## Reserved blocks

| Block | Use |
|-------|-----|
| p000–p019 | Default Labor crate + starter weapons |
| p020–p099 | Official crate family (more heads, hulls, legs, arms) |
| p100–p299 | Player / drop parts |
| p300–p499 | Integrated arm weapons and odd slots |
| p500–p799 | Reserved |
| p800–p899 | Tests / scratch |
| p900–p999 | Do not ship |

Starter ids (already claimed):

| Id | Slot | Variant |
|----|------|---------|
| p000 | body | labor-crate |
| p001 | head | visor-slit |
| p002 | legs | piston |
| p003 | legs | hover |
| p004 | legs | reverse-joint |
| p005 | armR | manipulator |
| p006 | armL | manipulator |
| p007 | handL | door-slab-shield |
| p008 | handR | short-sword |
| p009 | hands | scythe (handL+handR) |
| p010 | hands | cannon (handL+handR) |

Next free official id is **p011**.

## Pose files under one id

Required design coverage:

- `idle_s` `idle_e` `idle_n` `idle_w`
- `grip_s` `grip_e` `grip_n` `grip_w`
- `fire_s` `fire_e` `fire_n` `fire_w`

Grip — both hands on the two-hand weapon, or shield planted + sword chambered for blade. Short pose, not a full swing.

Fire — muzzle kick / blade extended / scythe through the cut. Still one weapon. No second gun.

A part that only exists as `idle_s` is unfinished.
