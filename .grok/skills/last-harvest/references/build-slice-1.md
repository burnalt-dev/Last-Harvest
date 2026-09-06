# Build Slice 1 — do this, do not patch the old tree

`src/game` as of 2026-09-03 is **condemned**. Do not fix grey diamonds, boot, or HUD in place. Rebuild from this playbook + sister skills + `last-harvest/assets/` vault.

Chat (Ivan) still wins.

## Slice 1 is only this

Title → **one** Veldt-9 floor → stairs **title**. No Rend.

Visible: dirt, canopy, trees, crate idle2, Gasket ¼ + **mount socket**, goblins/orcs/**smiths + anvils**, shinies + **r004**, HP plate + pie + Gasket + **radar slate**, d-pad, nanobot, charge (mounts first), blade swing (art after HD isolate).

Audio mute. Crate HD-isolate before new B1.

## Open in this order (always)

| Step | Skill | Produces |
|------|--------|----------|
| 0 | **this file** + canon.md + qa.md | cuts, fail list |
| 1 | `solace-mech-parts` | B1 vault → B3 `p000 p001 p002 p005 p006`, sockets, compose |
| 2 | `solace-mech-anim` | idle 2-frame, **no bob**, cache key includes frame |
| 3 | `last-harvest-terrain` | forest 2×2, forest-fog 2×1, pr001/pr002, sh001 |
| 4 | `last-harvest-enemies` | goblin ¼-tile, orc ~crate, 4-dir 2×2 |
| 4b | `last-harvest-companion` | Gasket ¼-tile, follow 1 behind |
| 5 | `last-harvest-dungeon` | **1 floor**, forest only, shinies |
| 5a | `last-harvest-items` | Veldt rolls, `r004` bloom-ore weighted |
| 5b | `last-harvest-combat` | `derive` / strike / banners. Bump melee only |
| 6 | `last-harvest-skillgrams` | `sg001` nanobot, `sg002` charge cap 6 |
| 7 | `last-harvest-shell` | title SSR, plates, HUD, d-pad, art.ts preload, CSS pixels |
| 8 | `last-harvest-audio` | UI / hit / parry beeps, never before setMode |

Before calling playable:

```
python3 .grok/skills/last-harvest/scripts/qa-seat.py
node .grok/skills/last-harvest/scripts/qa-slice1.mjs
```

Seat must PASS (south B3 stack vs `assets/gold/crate-idle-s.png`). Smoke must PASS (SSR title, Rend drop, no ruins/mines, canvas + d-pad).

If a step needs art, use vault `last-harvest/assets/` then pack into `public/game/`. Do not live-link `/workspace/development`.

## Vault → runtime

Copy, do not rewrite pixels, unless a sister skill is authoring a new cell.

```
solace/b3/p00{0,1,2,5,6}.png+.json     → public/game/parts/
solace/sockets.json                    → src/game/solace/sockets.json
terrain/forest.png + forest-fog.png    → public/game/tiles/
terrain/pr001.png pr002.png sh001.png  → public/game/props/
actors/gasket.png                      → public/game/companion/
actors/goblin.png orc.png              → public/game/enemies/
```

Layout: [../assets/VAULT.md](../assets/VAULT.md). Gold shots in `assets/gold/`.

Hands empty (`handL`/`handR` = ""). No `p007`–`p010` in slice 1.

## Files to write (only these)

```
src/game/LastHarvest.tsx   shell screens (title, ship, talk, dungeon, home, dead)
src/game/art.ts            preloadBoot crate+gasket; preloadBiome forest only
src/game/audio.ts          try/catch AudioContext; never before setMode
src/game/iso.ts            TW=156 TH=78; iso / fromIso / DIR
src/game/parts.ts          starter p000–p002, p005, p006
src/game/data.ts           forest planet + derive (radar starts at 5)
src/game/items.ts          r### catalog + rollShiny (last-harvest-items)
src/game/sim.ts            1 floor, plantTrees 14%, stairs = home; calls combat.ts
src/game/render.ts         dirt+tree, canopy fog, no grey-diamond unseen
src/game/skillgrams.ts     sg001 sg002
src/game/inventory.ts     bag stacks (last-harvest-inventory)
src/game/solace/compose.ts cached 384 composite
src/game/solace/anim.ts    idleFrame 0|1, bob = 0
src/styles.css             .plate .iso-pad HUD
src/routes/index.tsx       LastHarvest, SSR ON
src/routes/$.tsx           LastHarvest (preview junk URLs)
```

Do not add radar.ts, hangar, map slate, ruins/mines PATHS.

## Hard rules paid for in QA (copy into the new files)

1. First HTML **contains** “Board the Harvester”. Never `ssr: false`. Never visor gate. Art background.
2. Title plates **under the pitch**, not `mt-auto` bottom. `setMode` then audio.
3. Canvas size = **CSS pixels**. No `devicePixelRatio` × `setTransform`.
4. Unseen forest = **grove fog sheet**, never flat grey diamond.
5. Blocked forest = **dirt floor + pr001 tree**, never moss cube as the read.
6. Radar **5** on slice 1 so a path is visible.
7. `loadOne` must `cache.set` on load; timeout must not poison `inflight`.
8. Drop loads **forest only**.
9. Charge ≤ 6 tiles.
10. Idle: authored squat/visor, **no puppet bob**. Empty hands.

## Done (must all be true)

- curl `/` HTML includes `Board the Harvester`
- Board → Rend → Drop lands on **dirt path + trees + canopy**, crate seated
- Hung `/game/**` still shows title < 1.5s
- Drop network has no `ruins` / `mines`
- Stairs → home
- QA.md weapons rows N/A (no weapons this slice)

After a green boot, snapshot `/workspace/backups/last-harvest/<utc>/` and update `state.md`.
