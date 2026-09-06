---
name: solace-3d-qa
description: >
  Last Harvest 3D QA. Title must not fetch three.js. 3D Bay opens. Crate
  one tile, crane limb visible, harvest swing exists, Gasket not modular.
  Open last-harvest first. Run npm run qa:3d or qa-3d.mjs.
---

# Solace 3D QA (F)

**Open `last-harvest` then `last-harvest-makers` first.** Then this. Patches go in `last-harvest-3d` / `solace-rig`, not a third renderer.

**Hybrid:** Q1–Q12 gate the **3D Bay**. Drop actors are also WebGL (`Drop3D`); title still must not fetch `three` (Q1 / S21). Floor textures stay 2D. Gasket Q6 is the cute default (`eye`), not modular. Default kit is all `none` (Q8 / Q10).

## Run

```
node .grok/skills/solace-3d-qa/scripts/qa-3d.mjs
# npm run qa:3d
```

Needs preview on `:8080`.

## Gates (fail the script)

| Id | Check |
|----|--------|
| **Q1** | Title hydrate: **no** request for `three` / `solace3d` / `Bay3D` |
| **Q2** | `[data-qa=title-bay3d]` exists and is clickable |
| **Q3** | After click, a `canvas` (WebGL) is in the bay |
| **Q4** | `kit.ts` armature sockets (`hips` `chest` `gasket_mount` `weapon_mount_`) |
| **Q6** | `gasket.ts` cute default (`buildGasket`, named `eye`). Not modular, no `p###` |
| **Q7** | `GOLD_SIT` chest **0.38×0.22×0.18**, thigh **0.19** / shin **0.14** / stance **0.12**, **scale 1.1** (1-tile plant, upper overlap OK), oval hourglass `ribs` |
| **Q8** | No `makeScythe` / visor mats in `kit.ts` — dressed labor is not the base |
| **Q10** | Parts dock `none` **first**; crude `bucket`/`can`/`cell`/`piston`/`crane`/`scythe`/`saw`/`cannon`/`shield`; `rLimb` brass; `GOLD_GREY` all 0 (`handR`/`handL`, not a single `weapon`) |

Visual (Ivan, not the script): limb not chest-clipped, crate on one diamond, harvest cut low.

## Paid-for (same loop as last-harvest)

Arms missing, title pulling `three`, crate two tiles tall → qa.md + this list + the script.

## Must not

Screenshot-only QA with no script. Skipping Q1 to “make the bay faster to boot.”
