# Sustain — paid-for bugs that must not return

| Id | Symptom | Owner | Must | Must not | Test |
|----|---------|-------|------|----------|------|
| S25 | Head includes pauldron | solace-mech-parts | Exclusive owners; visor-band head | Head dilate into shoulders | Packer S25 |
| S26 | Body/legs steal visor/hatch | solace-mech-parts | Unique art on its slot; hip overlap only | Leftover → body | Swap body doesn’t leave a visor |
| S27 | Head variant off the neck | solace-mech-parts | Isolate-from-isolate; visor stays | Recenter a variant | Mix head still plants |
| S28 | Arms PNG is the whole hull | solace-mech-parts | Arms = L+R limbs, no weapon | Pair mesh / flip | Body swap visible |
| S29 | Variant from a second full lock | solace-mech-parts | Isolate-from-isolate, same 384 | B-lock mask-cut | One-slot mix plants |
| S30 | Linked/mirrored arms or guns on arms | solace-mech-parts | Battle L/R unique. Hangar R = flip-draft + unique-pass. One `arms` slot | Runtime `flipX`; E from W | Both arms draw |
| S31 | Two-hand swing detaches grips | solace-mech-anim | General fire pose; weapons seat on frozen wrists | Puppet; cannon on this clip | Scythe grips on p014 fire wrists |
| S33 | Battle model slides on the tile when turning | solace-mech-parts | Plant by legs-band cx; y = FOOT | Center the 384 cell; scythe bbox as x | Mech Test Q/E stays on diamond |
| S36 | Battle dir uses front portrait | solace-mech-look | 3/4 only; E/W visor sliver; N no visor | Pack i2i that straightened to front | visor_width E/W ≤ 52; N visor ≈ 0 |
| S41 | East still facing south | parts packer | `ur_frac(E) ≥ ur_frac(S)+0.05`; stagger L-high R-low; **fail** not warn | NCC/warn; 90° profile | Mech Test E heads up-right |
| S56 | Scythe blade floats off the pole | solace-rig / gold | Tang + weld on ferrule `x=0.6`; mild hook | Arc centered off snath | `qa:3d` Q8 |
| S57 | Bay hanger tiles not 3/4 (top-down plates / south-tip plant) | last-harvest-3d | Occupancy **XZ diamonds** + 2:1 iso **texture**, plant `isoCell` at diamond **center** | Top-down plates; `THREE.Sprite` deck (S59) | `qa:3d` Q11 |
| S58 | Bay walk/face not FM3 (crab / faces between diamonds) | last-harvest-3d | Diamond `isoCell` `(tx-ty, tx+ty)*0.5`; `ISO_YAW` ±45° so visor faces the neighbor; cam 3/4 from +Z not a second 45° XZ | Axis `{x:tx,z:ty}` + 3/4 sprites; yaw 0/90/180/270 on diamond grid | `qa:3d` Q12 |
| S59 | Hanger tiles messy / don’t line up | last-harvest-3d | Occupancy **XZ diamonds** sharing `isoCell` vertices; 2:1 iso **texture** | `THREE.Sprite` deck (billboards can’t tessellate) | `qa:3d` Q11 |
| S61 | Title/bay slow: every biome, foe PNGs, 1.4s tile gate | last-harvest-shell / 3d | Lanes: title empty; Bay `iso3d`+parts only; Drop streams **one** biome | `preloadBiomeOrGo` on Board; Bay import `sprites`/`foe3d`; all-biome boot | `qa-slice1` no enemy PNG / other biome; `qa-3d` Q11 bay no forest/foe |
| S62 | No-Aim Shoot dead-ends on “Lance: pick a tile” | last-harvest-combat | Shoot = sticky else closest vis; Aim = lock only | Shoot sets `aiming` or requires tile-pick when vis foes exist | `qa-slice1` shootCannon no `d.aiming=true`; drop-log not `aiming ? pick a tile` |

## Never regress (makers lock — not paid-for yet)

Owner of the lock: `last-harvest-makers`. If a change would violate these, stop and ask.

| Id | Must not | Owner |
|----|----------|--------|
| M1 | Full-tile Gasket or small-foe occupancy | `last-harvest-grid` |
| M2 | Dressed Labor as Bay default | `solace-rig` |
| M3 | UI label **Perception** (it is **Wits** / `wits`) | `last-harvest-shell` / combat |
| M4 | Item expiration / rot / timed charges | `last-harvest-items` |
| M5 | Gasket VO over ship dialogue | `last-harvest-audio` |
| M6 | Survival as a fourth primary or Gasket-owned Survival | `last-harvest-combat` |
| M7 | WebGL Veldt **mesh** floor / Imagine 4-dir crate | `last-harvest-makers` |
| M8 | PNG blit of crate / Gasket / enemies on the drop | `last-harvest-3d` |
