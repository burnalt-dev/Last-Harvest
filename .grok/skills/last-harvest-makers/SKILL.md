---
name: last-harvest-makers
description: >
  LAST HARVEST MAKER SKILLS — FOLLOW BEFORE ANY CHANGE. Code lock for Last
  Harvest: hybrid 3D/2D, stats, 1/4-grid, Bay skeleton, Gasket, never-regress,
  GasketDev loop. Open last-harvest first, then this, then the owner sister.
  BUILD_FEED paste this session, then Notion locks. Triggers on Last Harvest,
  maker skills, canon, Wits, Survival, 1/4 grid, gasket_mount, follow before any change.
---

# LAST HARVEST MAKER SKILLS — FOLLOW BEFORE ANY CHANGE

**Open `last-harvest` first.** Then **this file**. Then **one** owner sister from the feed `Owner:` header.

If a change would violate this lock, **stop and ask** — or adjust to comply.

Do not wipe `src/game`. Do not stub LastHarvest. Do not WebGL a **mesh** Veldt floor (`last-harvest-iso3d` stays dropped).

---

## Names (do not confuse)

| Name | Who |
|------|-----|
| **GasketDev** | Ivan’s outside design/QA assistant. Writes BUILD_FEED pastes, stamps **PASS**, Linear. **Not** in the game |
| **Gasket** | In-game companion robot (¼-square, snarky VO, `survivalBonus` only, Story “beefy companion”) |
| **Ivan** | Builder. Reports plate evidence. Does not stamp PASS |
| **Balancer** | Feel / Nest smoke in one game tab (no console) |
| **Researcher** | CLEAR + canon |

Never attribute GasketDev instructions to the companion. Never rename/reskin in-game Gasket into “GasketDev.”

---

## Feed + QA (2026-09-06 — never-regress)

Every BUILD_FEED. Caused extra pastes when ignored.

**Header required:** `LAST HARVEST — <TOPIC>` / `Owner: last-harvest-<skill>` / `bible: <topic>|no` / `One-topic feed.`

- Open makers lock + **that one** sister only. Not three full skills for a short patch.
- `bible: no` = do **not** rewrite Hub Locks / Notion this paste. `bible: <topic>` only when that slice is in scope.
- **Proof on the plate, not console.** `OCC_*` / `PIN_DMG` console.log is invisible to Balancer. QA asserts go on `data-qa` in **this** feed.
- **QA numbers match live math.** No “1 dead / 2 alive” when Pin dmg 9 vs HP 12. Prefer: exactly one body HP changes; sum drops by that hit.
- Kill untestable leftover UI copy **in the same feed**.
- Serial one-topic. No visibility-retry FIX chains.
- Ivan reports evidence. **GasketDev stamps PASS.** Do not ask Ivan to PASS unless plate text is in the paste and readable in one tab.
- Researcher CLEAR (when Balancer verifies) names the `data-qa` — no CLEAR without it.

**Linear / GitHub:** work tracking only — never a second bible. Do not dump feeds into Linear or Hub.

---

## GasketDev loop (standing)

**Notion Canon Hub is design truth** when `bible:` is a topic. If `bible: no`, **do not** rewrite Hub Locks this paste.

Feeds change the game. Notion describes the game. **PASS** = GasketDev after Ivan plate evidence. If unsure, do not stamp.

Hub: https://app.notion.com/p/3d2b6682d92e8101a021cb8c43aeae7d  
Session start: open Hub → **Locks** once when `bible:` is a topic. Do not re-crawl the whole Hub before every tiny edit.

### Conflict hierarchy

1. **Explicit BUILD_FEED paste** = what to change THIS session.
2. **Notion locks** = hard constraints a paste may not violate without asking Ivan.
3. If Hub is missing a page you need: **ASK Ivan** — do not invent from chat memory, Linear, or prior chat.
4. Linear / chat are work tracking + conversation — **never a second bible.**

When Ivan pastes MAKER_SKILLS / Never-regress, **that paste governs bay work**. Notion Locks do not replace maker skills for modular sessions. Do **not** invent new socket laws or remount tools to “match” vague Hub wording — modular truth is shipped grips + hold-profile pastes.

### Must-not (GasketDev)

- No Hard difficulty / Perception UI / Gasket Survival primary / Twitchkin·Wirefox
- No dumping feeds into Notion; no treating Linear or prior chat as a second bible
- Live Wits key is `wits`. Rename paste landed. Do not reintroduce `per` or Perception.
- No invented socket laws / remounts from vague Hub text
- No self-declared QA PASS
- No mixing GasketDev voice into companion VO

---

## Lock (paste)

**Stats:** stur / avo / Wits (player word). Live key in **this** tree: `wits`. Survival = substat of Wits only; Gasket/parts may add `survivalBonus` only. No GASKET-owned Survival primary. No item expiration systems.

**Difficulty:** Story | Default only (no Hard). Exact Story picker: “Beefy companion. More health regen. Same world.” Picker never says Wits, Survival, Perception, or “bonus stats.” Same world: enemies/planets unchanged unless a paste says otherwise.

**Grid:** Pilot = full tiles. Gasket + small enemies = **1/4-square sub-grid** for move/collision/occupancy/pathing. **Shared small-unit stepper.** Gasket footprint must not consume a full tile.

**3D Bay:** Default base = **shared humanoid skeleton + default gunmetal shells** with named sockets (spine, L/R arms & legs, `pack_mount`, `core_mount`, `gasket_mount`, `skirt_ring`). Fancy parts **swap** the shell on that slot. `none` restores the **shell**, not raw bones, not dressed Solace. Sit sliders still reshape the skeleton. **Bones overlay** in 3D Bay only (default OFF). Play hides bone cylinders + joint spheres. **Plates, gripper, and weapons** have sit keys too. Elbow/wrist/knee/ankle brass read larger than spine nodes. KIT_NAMES is **`none` first** on armor (= shell); **scythe is the default weapon** (`p018` on **both** hand slots, one id, one mesh). Crude plates parent on: head `bucket`, body `can`/`cell`, legs `piston`, arms `crane`, handR `scythe`/`saw`/`cannon`, handL `scythe`/`shield`/`cannon`. Two-hand scythe occupies both UI slots and both loadout hands. Cycling off scythe lands **both** hands on the next real parts (saw + slab); hands skip `none`. Never ship empty hands. Stances: **Sawboard**, **Sawlance**, **Two-handed**, **Lancer**, **Lancers**. Lance + slab is Lancer. Play **Lancers** stamps invisible `p020` (no mesh). Bay may show two lances without a cell plate. **Gripper** is a **universal default shell** on both `weapon_mount_L/R`. Weapons are **tools** that identity-parent to `tool_seat` (handle origin). **Hold profiles** (`sit.hold`) then pitch/roll/yaw/seat per kind+hand. Arm shells stop before the grip. Cannon is a tool, not a replacement hand. No empty-hand pose.

**Drop:** 3D actors (`Drop3D`: wanzer + Gasket + `buildFoe`) on **2D** iso textures / occupancy diamonds. No PNG blit of crate, Gasket, or enemies. No 3D mesh floor.

**Gasket:** Cute pocket-industrial companion — charcoal steel, brass, **one** cyan optic, gasket collar, floppy antenna, yellow torso stripe, **peg-rollers (no walking legs)**; 1/4-grid scale; follow/hold/mount on `gasket_mount`; **mute during ship VO**. Concept: `last-harvest-companion/assets/gasket-concept.png`.

**Load:** Title = empty boot. Bay/ship = 3D parts only (`kit`/`parts3d`), no planet tiles, no foes. Drop = current biome only, streamed (do not await `preloadBiomeOrGo`). Never all biomes. Never enemy PNGs. Concepts lazy.

**Never regress:** 1/4-grid for small units+Gasket; no dressed-Solace default once skeleton ships; no Perception UI rename back; no expiration; Gasket silent over ship dialogue; no 2D actor sheets on the drop; no boot/bay fetching every biome or foe sheets.

---

## Hybrid (Ivan 2026-09-05 — 3D actors dated)

| Layer | What | Owner |
|-------|------|--------|
| **Solace** | 3D armature in **3D Bay** and the **drop**. Parts parent onto sockets. Not Imagine 4-dir | `last-harvest-3d` + `solace-rig` |
| **Terrain / dungeon** | HD **2D** iso textures on occupancy **XZ diamonds** (S59). Fog, props, shinies. Not a mesh floor | `last-harvest-terrain` + `last-harvest-dungeon` |
| **Gasket** | Cute **3D** (`gasket.ts`) in Bay **and** drop. ¼-grid. Not modular | `last-harvest-companion` |
| **Small units** | Gasket + Stripekin: **¼-grid** shared stepper | `last-harvest-grid` |
| **Enemies** | **3D** `buildFoe` on the drop (`last-harvest-foe3d`) | `last-harvest-enemies` + `last-harvest-foe3d` |
| **Chrome** | Rivet plates, not shadcn | `last-harvest-shell` |

Do not WebGL a **mesh** Veldt floor (`last-harvest-iso3d` is **dropped**). Occupancy diamonds with 2D tile textures are the drop floor — same pattern as the Bay hanger. Do not pack new Solace PNG dirs.

---

## Stats (canon)

Three mains. Code keys `stur` / `avo` / `wits`. Player name is **Wits**. Do not put **Perception** on a plate.

| Main | Subs |
|------|------|
| **Sturdiness** | melee dmg, HP, Parry% (negate all, shiny + sound) |
| **Avoidance** | Dodge% (hard; success **stuns** 1 turn), Defense (flat; dmg always ≥ **10%**), Shield% (cap **90%**, after def) |
| **Wits** (`wits`) | ranged acc, Radar, Recovery, **Survival** (biome/event checks) |

`effectiveSurvival = survival + survivalBonus`. Bonus only from Gasket / parts / exploration Programs. Check is never a fourth primary. Gasket UI may show `Survival +2 (filters)`, never a Gasket-owned Survival stat.

Companion does **not** level. Classless. One stat point a level.

Owner: `last-harvest-combat` (`derive`). Fail: fourth main; Perception label; Gasket Survival primary.

---

## Grid (canon + Ivan)

Owner: **`last-harvest-grid`**. Dungeon blit: `last-harvest-dungeon`. Bay plant: `last-harvest-3d` (S58 diamonds).

| Unit | Occupancy | Step |
|------|-----------|------|
| Pilot / crate | **full tile** | `DIR` iso |
| Gasket | **¼-square** | shared small-unit stepper |
| Small foes (goblin, ghost, crawler) | **¼-square** | same stepper |
| Big foes (orc, smith, skeleton) | almost crate / full | crate stepper |

Gasket + smalls share **one** stepper for move / collision / occupancy / pathing. Gasket must not eat a full tile (follow, mount, peel, bump). Camera is Front Mission **3/4 iso diamonds**. Pad = Veldt `DIR` as a **2:1 occupancy diamond** (N up-right · E down-right · S down-left · W up-left), not a plus. Bay yaw = `ISO_YAW` ±45°.

Runtime stepper may still be parked — **do not ship a full-tile Gasket** as a “fix”.

---

## 3D Bay (canon + armature)

Owner: `last-harvest-3d` + `solace-rig` + `solace-gold`. Toon mats: dummy `solace-toon` (`tex.ts` until messy). Part meshes: **`solace-parts3d`** (crude plates; armor `none` = shell, weapons default scythe).

Default = **shells + scythe**. Bones overlay in Bay (default off). Play never shows gold rods. No visor/pack/Gasket on the naked base. Empty hands do not ship.

**Sockets (exact names):**

- Spine: `root` → `hips` → `spine_low` → `spine_mid` → `chest` → `neck` → `head`
- Arms L/R: `clavicle_*` → `shoulder_*` → `upper_arm_*` → `elbow_*` → `forearm_*` → `wrist_*` → `gripper_*` (universal, including cannon) → `weapon_mount_*`
- Legs L/R: `hip_*` → `thigh_*` → `knee_*` → `shin_*` → `ankle_*` → `foot_*`
- Utility: `pack_mount` `core_mount` `gasket_mount` `skirt_ring`

Armor dock cycles **`none` first** (= default shell). Hands skip `none`. Fancy plates swap that shell (`bucket` / `can`/`cell` / `piston` / `crane` / `scythe`/`saw`/`cannon` / `shield`). Sit sliders stretch the **cage**, not armor. Reset gold = `GOLD_SIT`. Harvest / walk tick those joint names (`solace-mech-anim`).

Look: civilian Front Mission **labor**. Industrial **plates** later, humanoid **taper** now. Not marine, not Halo, not a toolbox.

---

## Gasket (canon)

Owner: `last-harvest-companion`. Occupancy: `last-harvest-grid`. Socket: `gasket_mount`. 3D mesh in Bay and drop.

Cute pocket-industrial: charcoal steel, brass, one cyan optic, gasket collar, floppy antenna, yellow stripe, **peg-rollers (no walking legs)**. **¼-grid**. Follow / hold / mount. Charge **always mounts first**. Mounted = no melee; ranged + programs OK. One core `g###` (look+class+skills+behavior). Not modular. No `p###`. Does not level. May grant `survivalBonus` only. Concept: `last-harvest-companion/assets/gasket-concept.png`.

**Mute during ship VO.** Gasket stays silent over Rend / Halle / crew dialogue (`last-harvest-audio`).

---

## Frame (canon)

Slots that change look: **head, body, legs, arms, handR, handL**. Back = Programs + stats, **no mesh**. Pack is **locked to body**. Arms = one part both sides (grey = **crane**). Right main, left off. Two-hand occupies both. Hangar-only cosmetics.

Grey starter. Tool-chest **scrapped**. `p003`/`p004` ids reserved, no mesh yet.

---

## Dungeon / world (canon)

Slice 1: title → Veldt-9 **one floor** → drop-bay. Unarmed cannot Board. Shinies not chests. Planets drop `r###` / later `i###`, **never** `p###`. Fog biome-distinct. Low-tier book: Veldt-9, Ossuary Prime, Brine-Khar — only Veldt is live.

HUD: broken HP plate + energy pie + Gasket bar. No live stur/avo/wits on the drop (status screen later). Nested under Wits: Survival (Pack sheet). Gasket may show `Survival +N (filters)` only.

Difficulty: **Story** | **Default**. Default combat / enemy numbers frozen. Story = beefy Gasket HP + pilot **starts at Wits 9** (same `derive`). Roam: Story pads soft/standard Survival only. Picker never says Wits.

---

## Economy / items

`r###` trade scrap. `i###` usables. **No expiration systems** (no rot, no timed charges, no “use by floor”). Owner: `last-harvest-items`.

---

## Never regress

| Must not | Owner |
|----------|--------|
| Full-tile Gasket or small-foe occupancy | `last-harvest-grid` |
| Dressed Labor as Bay default once skeleton shipped | `solace-rig` |
| UI label **Perception** (it is **Wits**) | `last-harvest-shell` / combat |
| Item expiration | `last-harvest-items` |
| Gasket VO over ship dialogue | `last-harvest-audio` |
| Survival as a fourth primary or Gasket-owned Survival | `last-harvest-combat` |
| Imagine 4-dir crate / WebGL Veldt **mesh** floor | this file |
| PNG blit of crate / Gasket / enemies on the drop | `last-harvest-3d` / `Drop3D` |
| Boot/bay fetching every biome, foe PNGs, or `foe3d` | `last-harvest-shell` / `last-harvest-3d` |
| Wipe `src/game` / empty `kit.ts` | `last-harvest` vault |

---

## Maker map

Open **this**, then exactly one owner. Do not invent a third skill. Dummies exist so the name is reserved.

### Live sisters

| Skill | Job |
|-------|-----|
| `last-harvest` | Always first. Vault, QA, ids |
| **`last-harvest-makers` (this)** | **Follow before any change** |
| `last-harvest-shell` | Title, SSR, plates, HUD, d-pad |
| `last-harvest-radar` | vis/seen, Manhattan HUD |
| `last-harvest-audio` | Beeps; Gasket mute over ship VO |
| `last-harvest-companion` | Gasket **3D** mesh, follow/mount, ¼-grid |
| `last-harvest-grid` | **¼-grid shared stepper** |
| `last-harvest-combat` | derive, parry/dodge/shield, bump |
| `last-harvest-items` | `r###` / `i###`, no expiration |
| `last-harvest-inventory` | Bag stacks |
| `last-harvest-dungeon` | Veldt floors (2D textures on diamonds) |
| `last-harvest-terrain` | 2D iso tiles/fog/props |
| `last-harvest-enemies` | Foe kinds / bloom-ore look |
| `last-harvest-skillgrams` | Programs `sg###` |
| `last-harvest-programs` | redirect → skillgrams |
| `last-harvest-concept` | 3D crate refs + numbered picks |
| `solace-mech-look` | Style kernel |
| `last-harvest-3d` | Bay + **Drop3D** scene |
| `solace-rig` | Sockets, bare armature |
| `solace-gold` | Sit numbers, Reset gold |
| `solace-3d-qa` | `qa-3d` |
| `solace-mech-anim` | 3D clips on joint names |
| `solace-parts3d` | **Live (crude).** Plates parent onto sockets. Armor default `none`; scythe both hands |
| `last-harvest-foe3d` | **Live.** `buildFoe` meshes |

### Dummies / parked / dropped

| Skill | Status | Job when live |
|-------|--------|----------------|
| `solace-toon` | **dummy** — mats in `tex.ts` | Pixel toon if it gets messy |
| `solace-mech-parts` | **parked** PNG B1 | Do not pack new dirs |
| `solace-cohesion` | **parked** | PNG leftover / Mech Test only |
| `last-harvest-iso3d` | **dropped** | No 3D **mesh** floor. Diamonds + 2D tex = `last-harvest-3d` |

### App Builder makers (Last Harvest wins)

Each has an override box. **This lock beats them.**

`building-games` `threejs` `imagine` `generate2dsprite` `generate2dmap` `game-tilesets` `game-asset-core` `game-animation-frames` `game-character-consistency` `video2dsprite` `design-ui` `controls`

Vite + 3D drop/Bay (raw three.js) + 2D terrain textures. No Phaser, no R3F, no Unity, no FPS strafe, no Imagine 4-dir wanzer.

---

## Commands (after a makers or game change)

```
npx tsc --noEmit
npm run vault:hot          # if src/game or public/game changed
node .grok/skills/last-harvest/scripts/qa-slice1.mjs
node .grok/skills/solace-3d-qa/scripts/qa-3d.mjs   # if Bay / kit / gasket
```

Copy `last-harvest*` + `solace-*` to `/root/.grok/server-skills/` after editing skills.

---

## Fail

- Changing Last Harvest without opening this file
- Full-tile Gasket “because pathing is easier”
- Dressing the Bay default in Labor 1
- Perception on a plate
- Hard difficulty
- Editing Notion Hub from Build / dumping feeds into Hub
- Marking QA PASS (GasketDev stamps; Ivan reports plate evidence)
- Console-only smoke as Done proof
- Rewriting Hub Locks on `bible: no`
- Calling the companion GasketDev
- Rotting items / timed charges
- Gasket talking over Halle or Rend
- PNG blit of crate / Gasket / foes on the drop
- Boot/bay fetching every biome or foe sheets
