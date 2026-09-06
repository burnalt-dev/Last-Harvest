---
name: last-harvest-combat
description: >
  Last Harvest combat and the three main stats. Use when Ivan asks about
  sturdiness, avoidance, wits, parry, dodge, defense, shield, radar,
  recovery, survival, bump attack, banners, ranged crosshair, or enemy Damage/Defense.
  Open last-harvest first. Not skillgrams (sg###), not floors, not crate art.
---

# Last Harvest — Combat

**Open `last-harvest` then `last-harvest-makers` first**, then this file. Owns **how a hit resolves** and **derive()**. Floors stay `last-harvest-dungeon` (**2D**). Buttons that spend energy stay `last-harvest-skillgrams`. Crate **art** is 3D Bay / `solace-rig` — this skill does not draw meshes.

**Hybrid:** combat is numbers + DOM banners on the drop. Bay has no combat. Enemies are 3D meshes (`foe3d`).

Yes, this skill is how the stat system survives a rebuild. Without it, `sim.ts` invents numbers.

## Three mains

Each main influences all of its subs. Gear can also stamp a sub (later). One point per level (status screen later). Companion does not level.

| Main | Substats |
|------|----------|
| **Sturdiness** | melee damage, HP total, **Parry%** |
| **Avoidance** | **Dodge%**, Defense (flat), **Shield%** |
| **Wits** (`wits`) | ranged accuracy, **Radar**, **Recovery**, **Survival** (event checks) |

### Frozen formulas (level 1 mains = 1)

Copy into `src/game/data.ts` as `derive(stur, avo, wits)`:

```
hp      = 48 + stur * 14
melee   = 8 + stur * 3
parry   = min(0.28, stur * 0.035)
dodge   = min(0.18, avo * 0.025)      # hard to stack
def     = 2 + avo * 2
shield  = min(0.90, avo * 0.07)       # 90% cap, hard
acc     = 0.55 + wits * 0.06          # range is much worse than melee
radar   = 5 + (wits - 1)              # each Wits point = +1 Manhattan; HUD + fog + Shoot vis
recovery= 1 + wits * 0.35
survival= wits                        # Wits substat; event checks. Tune later
```

Event check: `effectiveSurvival = survival + survivalBonus`. Bonus only from Gasket / parts / exploration Programs. Not a fourth primary.

Roam (`src/game/roam.ts`): `survivalChance` = clamp 5–95% of `(band - 0.04) + 0.04*(survival+bonus) + tags − threat`. Default @ Wits 1: Soft **0.70** · Standard **0.55** · Pressure **0.40** · Ship-call **0.50** · Dungeon **0.35**. Cadence ≤1 roam / 8–12 walks, ≤2 ship-calls per sortie, Debris Primer once. Fail-forward (flags + CAST banner), never softlock. Story pads **soft/standard only** (+0.12); Pressure/Dungeon still bite. Picker never says Wits/Survival.

Incoming player damage:

```
afterDef = max(raw * 0.10, raw - def)     # always at least 10%
final    = max(1, round(afterDef * (1 - shield)))
```

Example: 20 vs 20 def → 2; then 50% shield → 1.

## Difficulty (Story)

`pilot.difficulty`: `"story"` | `"default"`. **Default numbers above do not change.** Story mods via `runMods()` in `data.ts` (`STORY` vs `DEFAULT_RUN`).

| | Default | Story |
|--|---------|--------|
| Gasket HP | 22 | **44** |
| Mounted bolt | 3 raw | **8** raw |
| Pilot Wits | **1** | **9** (real start, same `derive`) |
| Recovery → HP / turn | `recovery * 0.15` | same formula (higher because Wits is 9) |

Story does **not** flatten enemy HP, skip telegraphs, auto-win events, or give Gasket a second turn / VO. No hidden Wits overlay. Picker lock: **"Beefy companion. More health regen. Same world."** Optional extra: "Gasket hits harder and keeps you patched up." Never Wits / Survival / Perception on that screen.

No Hard. No Story buffs when `difficulty !== "story"`. Mid-run change is **title or drop-bay** (`qa=diff-story`) — applies on next Board (`makeDungeon`), never mid-fight. Drop-bay copies: “Applies next drop. Not mid-fight.” `applyDifficulty` snaps Wits to that table’s start so Default never keeps Story 9.

## Parry / dodge (feel)

| Proc | Effect | VFX |
|------|--------|-----|
| **Parry** (player) | Negates **all** that hit | Unique shiny glimmer + satisfying sound |
| **Dodge** (player) | Avoid + **stun** foe 1 turn | Distinct from parry |
| Either, on **you** from an enemy | Same rules | Screen-wide stylish text that looks **bad** (rust, not cyan) |
| Either, **you** proc | Screen-wide stylish text that looks **good** (cyan) |

Do not skip the banner. `fx: { k: "banner", text, good }`.

## Enemies

Simple: **Damage + Defense**. Elites (later) may have parry/dodge chances. Slice 1 small: **Stripekin** (legacy kind `small` / `for_skitter`).

## Slice 1 cut (Ivan 2026-09-03)

- **Bump melee** — **Sawboard** and **Sawlance** (one-hand saw). **No Attack plate**. Sawlance still Aims from the off lance.
- **Attack plate** — **Two-handed** only (`twohand`, scythe). Shape is per weapon (`meleeAttack` in `parts.ts`). Slice 1: scythe `p018` = **wide 3**. Can hit Gasket.
- Two-hand cannon does not exist. **Lancer** / **Lancers** / **Sawlance**: Aim / Shoot. **No Attack**.
- Cannon is **either hand** (`p010`). Dual = **Lancers** (both hands). Play loadout stamps invisible cell pack `p020` (power bus, no mesh). Two lances without the pack are not a loadout. 3D Bay may show Lancers without a cell plate.
- Lance + slab is **Lancer**, not a sixth stance.
- Dual volley: **four** alternating half-power pellets (`melee * 0.5`). Per-pellet acc. Damage `max(0, round(raw - def))` — **no 10% floor, no min-1**. Good vs low Defense, zeros vs high. Lasers stagger L/R.
- Empty-hand deploy is forbidden (S17).
- Charge (`sg002`) mounts Gasket then crash-strike, cap 6. Nanobot (`sg001`) works.
- Gasket **mounted: no melee**. Ranged + skillgrams OK.
- Player parry/dodge/shield apply. Enemy: damage+def only.
- Adjacent foes **swing** after the player turn. A landed hit **breaks withdraw**.

Ranged: **Aim = full tile**. **Shoot = Pin** one occupant (`pin`). Each Stripekin has **own HP**; pack bar is **sum of living bodies**. Never a shared pool one Pin can empty. Sticky on Aimed tile, else closest occupant. Empty tile → `No target.` No-Aim = closest global, still one body. Nest plates (one tab, no console): `data-qa="nest-pin-before"` / `"nest-pin-after"` / `"nest-pin-hit"` (`dmg=<n> id=<id>`). Log `Hit N` = damage to that one body. Melee Sweep still multi-hits. Nest Aim/Shoot on Lancer (Fight not required). Gasket does not fire.

Aim pick: **only a live enemy on that square, and vis**. Empty / fog / dead = `No target.` / `Not on scope.` Stay in Aim. Do not spend the lance, do not tick the round. No “Lance into dirt.”

## Files

`src/game/data.ts` — `derive`, `applyDef`, `effectiveSurvival`  
`src/game/pilot.ts` — `stur` / `avo` / `wits`  
`src/game/save.ts` — persist + one-shot `per` → `wits` migrate  
`src/game/sim.ts` — calls derive; does not inline formulas  
`src/game/render.ts` — draws banner fx only

## Fail

- Formulas living only in `LastHarvest.tsx`
- Damage going to 0 (must keep 10% then min 1)
- Shield above 90%
- Dodge that does not stun
- Parry that only reduces instead of negate
- Enemy procs using the player’s “good” cyan banner
- Inventing a fourth main stat (Survival is **under Wits**)
- Showing Survival as a Gasket primary
- Label Perception or reintroducing field `per` (live key is **Wits** / `wits`)
- Slice 1 `d.xp +=` (S20). No XP this slice.
- Aim spending the lance on empty/fog tiles (S60). Live vis enemy on that square only.
- Shoot with vis foes existing requiring tile-pick / Aim first (no-Aim Shoot must closest).
