# Last Harvest — public prototype

Playable Grok Build tree. Chat is not a backup.

## Do commit
- `src/game/`, `public/game/` (tiles, props, Concepts/`lookdev` roster)
- `src/routes/`, router, styles, `package.json`, skill **text** (`.md` + scripts under `.grok`)
- `.gitignore`, `PUBLIC.md`, and other shell when those change

## Do not commit
- `.grok/skills/**/*.png` (beastmen/lookdev archives)
- enemy blit sheets, `node_modules`, Grok chrome
- `backups/`, `attachments/`, `screenshots/`, `artifacts/`, `public/art/`

## Live-tree cull (keep Concepts roster)
Delete if present: `public/art/`, root `public/lookdev/`, `public/game/enemies/`, `public/game/companion/gasket.png`.
Keep: Veldt tiles/props, `public/game/lookdev/` roster.

Private design vault: [`burnalt-dev/lastharvest`](https://github.com/burnalt-dev/lastharvest).
