# Rebuild / backups

Use when `src/game` is gone, preview is blank, or Ivan says the build needs to come back.

## Live tree

```
src/game/LastHarvest.tsx   screens
src/game/sim.ts            dungeon + combat
src/game/render.ts         iso draw
src/game/iso.ts            TW/TH, dirs
src/game/parts.ts          loadout, p000–p010
src/game/solace/           compose, registry, sockets
src/game/data.ts           biomes, derive stats
src/game/art.ts            /game/... preload
src/game/audio.ts
src/routes/index.tsx       mounts LastHarvest
src/routes/__root.tsx
src/router.tsx
src/styles.css             plates + iso-pad
startup.sh
public/game/mech/{blade,cannon,scythe}.png
public/game/companion/gasket.png
public/game/enemies/…
public/game/tiles/{forest,ruins,mines}.png
public/game/portraits/{captain,liaison}.jpg
public/game/parts/         real B3 when it exists
```

Do not recreate `vite.config.ts`. Keep PreviewHostBridge, grok PWA, no auth unless asked.

## Restore order

1. If a **hot** file is empty/missing: copy from `/workspace/backups/last-harvest/hot/latest/` (map `game/` → `src/game/`, `parts/` → `public/game/parts/`).
2. If `/workspace/backups/last-harvest/` has a **full** snapshot newer than the wipe, copy it back (`src/game`, `public/game`, routes, CSS, startup).
3. Else rebuild from this skill’s sister Solace skills + Notion Hub locks. BUILD_FEED paste this session wins on design.
4. Write `startup.sh`, `npm run dev` on `:8080`.
5. When boot succeeds, full snapshot again. `npm run vault:hot` as well.

## Hot vault (after editing a hot file)

`bash .grok/skills/last-harvest/scripts/hot-vault.sh`

See last-harvest SKILL. Do not skip because a boot stamp exists — boot stamps have been only `sim.ts`.

## Backup (after a successful boot)

Destination: `/workspace/backups/last-harvest/<UTC-stamp>/`

Copy: `src/game`, `public/game`, `src/routes`, `src/router.tsx`, `src/styles.css`, `startup.sh`.

Keep the last several stamps. Do not copy `node_modules`, `.grok`, or `/workspace/development`.

`startup.sh` should:

1. Stop stale `:8081`
2. Start `:8080` if needed
3. When curl to `:8080` succeeds, write the snapshot (even if the server was already up — once per stamp is enough; skip if a snapshot was written in the last few minutes)
