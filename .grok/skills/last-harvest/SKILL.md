---
name: last-harvest
description: >
  ALWAYS OPEN THIS FIRST for Last Harvest / Solace crate / this game. Canon,
  current game state, QA log, performance, rebuild, and the map of sister
  skills. Use on every gameplay, UI, dungeon, ship, hangar, stats, combat,
  biome, companion, audio, parts, animation, tiles, fog, radar, boot, or
  rebuild change. Triggers on Last Harvest, Solace, labor crate, hangar,
  drop, biome, mech test, Gasket, Capt Rend, Liaison Halle, iso dungeon,
  p000 parts, shiny spots, nanobot, charge, forest tiles, fog of war,
  idle anim, Veldt-9, Ossuary, Brine-Khar, radar scope, deck slate,
  3D bay, three.js, harvest scythe.
---

# Last Harvest — always first

**Notion Canon Hub is design truth.** [Hub](https://app.notion.com/p/3d2b6682d92e8101a021cb8c43aeae7d?pvs=204). If chat or a BUILD_FEED changes a lock, **write the Hub the same turn as the code** — Ivan does not have to say “bible.” Do not invent pages. Do not dump feeds. Session start: Hub → Locks once. This skill owns vault / QA / sister map / rebuild.

**PASS** only when the feed’s done-when is 100% met (live proof). If unsure, do not stamp — leave it for GasketDev.

**GasketDev** = Ivan’s outside design/QA assistant (BUILD_FEED pastes). **Gasket** = in-game companion. Never mix them.

**Always start here.** Every turn that touches this game opens this file before sister skills or writing code.

**Before any change:** open [`last-harvest-makers`](../last-harvest-makers/SKILL.md) — **LAST HARVEST MAKER SKILLS — FOLLOW BEFORE ANY CHANGE**. Conflict: BUILD_FEED paste → Notion locks → ask Ivan. If a change would violate that lock, stop and ask. You do **not** mark QA PASS.

**31A (2026-09-03): this `src/game` is slice 1.** Patch in place. Do not wipe. Do not stub LastHarvest. Playbook is history unless Ivan asks for a rebuild.

## Open first

1. **this file** (vault / QA / routing)  
2. [`../last-harvest-makers/SKILL.md`](../last-harvest-makers/SKILL.md) — **FOLLOW BEFORE ANY CHANGE**  
3. **Notion Canon Hub** — design bible. Write it when a lock changes. [canon.md](references/canon.md) is a pointer. Open Hub → Locks at session start.  
4. [references/slice.md](references/slice.md) — what slice 1 **code** is  
5. [references/future.md](references/future.md) — pointer at Notion backlog. **No code, no art until asked**  
5b. [references/3d.md](references/3d.md) — **3D is the Solace plan.** Bay now, dungeon later.  
6. [references/skills.md](references/skills.md) — sister map  
7. [references/qa.md](references/qa.md) — paid-for bugs  
8. [references/sustain.md](references/sustain.md) — rules that **block** those bugs  
9. [references/commands.md](references/commands.md) — what to actually run  
10. Then **one** sister skill  

Do **not** replace the game with a stub. Do not “fix” a paid-for bug a new way.

## Sister skills (owned jobs)

Full map: [references/skills.md](references/skills.md). Short:

| Skill | Owns |
|-------|------|
| **last-harvest** (this) | Canon, QA, rebuild playbook, skill map, vault |
| **`last-harvest-makers`** | **FOLLOW BEFORE ANY CHANGE.** Hybrid, stats, ¼-grid, Bay skeleton, never-regress |
| `last-harvest-shell` | Title, SSR, plates, HUD, d-pad, art.ts, CSS pixels |
| `last-harvest-radar` | vis/seen, Manhattan HUD, floor Map, blips |
| `last-harvest-audio` | Beeps; Gasket mute over ship VO; never before setMode |
| `last-harvest-companion` | Gasket ¼-grid, **one core**, follow/hold/mount |
| `last-harvest-grid` | Shared ¼-square stepper (Gasket + small foes). Pilot = full tile |
| `last-harvest-combat` | Stats, parry/dodge/shield, bump strike, banners |
| `last-harvest-skillgrams` | Equipped `sg###` (player: Programs) |
| `last-harvest-inventory` | Bag stacks (`r###` / `i###`) |
| `last-harvest-items` | Pickups, `r###` / `i###`, Veldt bloom-ore. **No expiration** |
| `last-harvest-dungeon` | Floors; Veldt is the ore planet (slice 1 = 1 floor) |
| `last-harvest-terrain` | Iso tiles, trees, fog, props (**2D** textures) |
| `last-harvest-enemies` | Foe kinds / bloom-ore look |
| `solace-mech-look` | Art style, north-star sheet, arm bases, backpack-on-body |
| `last-harvest-3d` | **3D Solace path.** Bay + Drop3D, toon, lazy `three` |
| `solace-rig` | 3D sockets, crane/stork, harvest swing |
| `solace-gold` | **Labor 1 sit numbers.** Don’t drift marine / tiny scythe |
| `solace-3d-qa` | `npm run qa:3d` — title must not fetch `three` |
| `last-harvest-concept` | 3D ref sheets + numbered foe/Gasket picks |
| `solace-cohesion` | **Parked for new crate art.** PNG 4-dir leftover / Mech Test only |
| `solace-mech-anim` | **3D clips** (harvest / later walk). Timing cards; `kit.ts` plays |
| `solace-toon` | **Dummy.** Mats in `tex.ts` |
| `solace-parts3d` | **Live (crude).** Plates parent onto sockets. Armor `none` = shell; scythe both hands |
| `last-harvest-foe3d` | **Live.** `buildFoe` on the drop |
| `last-harvest-iso3d` | **Dropped.** No 3D mesh floor |

Every sister skill must say: open `last-harvest` first, then `last-harvest-makers`.

## Stack (frozen)

TanStack Start + React 19 + Vite. Preview `:8080`. `startup.sh` required. No Unity. No Phaser.

**Hybrid (Ivan 2026-09-05):**

| Layer | What | Skill |
|-------|------|--------|
| **Solace** | 3D armature in **3D Bay** and the **drop** (`three.js`). Parts parent onto sockets. Not Imagine 4-dir | `last-harvest-3d` + `solace-rig` |
| **Terrain / dungeon** | HD **2D** iso textures on occupancy diamonds. Fog, props, shinies | `last-harvest-terrain` + `last-harvest-dungeon` |
| **Gasket** | Cute **3D** (`gasket.ts`) Bay + drop. **¼-grid**. Not modular. Socket `gasket_mount` | `last-harvest-companion` + `last-harvest-grid` |
| **Enemies** | **3D** `buildFoe` on the drop | `last-harvest-foe3d` + `last-harvest-enemies` |

Do not WebGL a **mesh** Veldt floor. Occupancy diamonds with 2D tile textures are the drop floor (S59). Do not pack new Solace PNG dirs.

`/workspace/development` is reference-only unless Ivan asks. Never live-link it as runtime.

## Screens

**Slice 1 (now):** `title` (pick kit) → Veldt-9 **one floor** → drop-bay (Rend). Unarmed cannot Board.

Everything else: [references/future.md](references/future.md). Do not stub it.

No character generator. Classless. One stat point per level.

## Loadout (frozen ids)

Do **not** renumber. Next free crate part is **p021**. Gasket cores `g###` (next **g001**). Items `i###`. Resources `r###`. Skillgrams `sg###` (player: Programs). Legendary UI color is **orange**.

| Id | Slot |
|----|------|
| p000 | body wanzer + resource pack (locked to body) |
| p001 | **whole head** |
| p002 | legs piston (1 tile) |
| p014 | crane arms L+R (grey) |
| p015 / p012 | head stock / variant (NS occupancy) |
| p016 / p011 | body stock / variant |
| p017 / p013 | piston / RJ (same occupancy family) |
| p018 | scythe two-hand. **One id occupies both hand slots.** Not two items |
| p019 | bulky arms, **45A same wrists as p014** |
| p007 / p008 | off slab+grip (shield) / main saw+grip |
| p009 | scythe two-hand (Attack 3-wide) |
| p010 | cannon **either hand** (Aim/Shoot). Both hands = **Lancers** (stamps `p020`) |
| p020 | cell pack (dual-cannon power bus). **Not a mesh.** Body slot data only. |

**Stances** (skillgrams): `sawboard` `sawlance` `twohand` `lancer` `lancers`. Lance + slab is still **Lancer**.

`p003` hover / `p004` reverse-joint: **ids reserved**, no mesh, no leap code. [future.md](references/future.md).

Parts and companion cosmetics change **only in hangar**. Never on a planet.

## Draw

**3D Bay:** shells + scythe, yaw, FM 3/4 camera. Crude plates parent onto sockets (armor `none` = shell). Sockets in `solace-rig`. Gasket is `gasket.ts`. [3d.md](references/3d.md).

**Dungeon:** 3D actors (`Drop3D`: wanzer + Gasket + `buildFoe`) on **2D** iso tile/fog/prop textures mapped to occupancy diamonds. Drop **streams the live biome** — do not wait on `preloadBiomeOrGo`. No portrait camera. No 3D mesh floor.

Do not Imagine-pack new Solace dirs. Idle/harvest in 3D is `last-harvest-3d`.

## Hot vault (every edit to these files)

These get **overwritten to empty** or lost on wipe. Stamp them **in the same turn you edit them**, not only after boot.

```
src/game/sim.ts
src/game/LastHarvest.tsx
src/game/play.ts
src/game/parts.ts
src/game/pilot.ts
src/game/save.ts
src/game/skillgrams.ts
src/game/items.ts
src/game/solace/compose.ts
src/game/solace3d/
public/game/parts/
```

`kit.ts` also stamps `solace-rig/assets/kit.ts.bak`. Under 200 lines = wipe; `vault:hot` restores the bak.

```bash
bash .grok/skills/last-harvest/scripts/hot-vault.sh
# or: npm run vault:hot
```

Writes `/workspace/backups/last-harvest/hot/<utc>/` and updates `hot/latest`.

**Must not:** `StrReplace` / write a hot file with an **empty** `old_string` (that truncates the file). Restore from `hot/latest` if a hot file is 0 bytes.

Full tree snapshot still happens after boot ([rebuild.md](references/rebuild.md)).

## After every boot

When preview is actually up, snapshot:

`/workspace/backups/last-harvest/<utc>/` ← `src/game`, `public/game`, `src/routes`, `src/router.tsx`, `src/styles.css`, `startup.sh`

If the tree was wiped, restore from the newest stamp, then this skill. See [references/rebuild.md](references/rebuild.md).

After a playable change, **update** [references/state.md](references/state.md) and tick [references/qa.md](references/qa.md). That is how this skill stores the game.

## Paid-for bugs (always)

When Ivan reports a bug — **especially one we already shipped** — do all of this in the **same turn**. Do not only patch `src/game`.

1. **this file** still first.  
2. Add or tick a row in [references/qa.md](references/qa.md) (symptom → cause we hit → fix).  
3. Add or tighten a rule in [references/sustain.md](references/sustain.md) (owner skill, must / must not, **test that fails** on regress).  
4. Put the same must/must-not in the **owner sister skill**.  
5. Extend `scripts/qa-slice1.mjs` or `scripts/qa-seat.py` if the bug can come back.  
6. Patch the live tree (31A). Do not wipe.

If the rule was too weak, **strengthen last-harvest** (qa + sustain) — that is the main skill — then the sister. BUILD_FEED paste this session, then Notion locks; this loop wins on not repeating boot/button/fog/mirror failures.

New bugs become paid-for the moment we fix them. Next time, apply the rule; do not invent a third fix.

## Done means

- Title pick kit → Board; unarmed cannot drop; Rend is **after** the run (drop-bay) 
- Drop session does not fetch ruins/mines  
- Crate seats; HUD is plate + pie + Gasket bar; d-pad works  
- Stairs return home  
- QA list checked; `slice.md` / `state.md` match reality  
- No console errors on the path you touched  
