# Routine commands — slice 1

Only these. Scaffold `npm test` / brand-check / auth are **not** this game.

**Before any change:** open `last-harvest` then `last-harvest-makers`.

Vite must be on `:8080` for smoke (`startup.sh`).

## Every playable change

```bash
npx tsc --noEmit
bash .grok/skills/last-harvest/scripts/hot-vault.sh
node .grok/skills/last-harvest/scripts/qa-slice1.mjs
```

Catches: SSR title, dead plates (S1), boot graph (S21), ruins/mines fetch (S13), Veldt canvas, d-pad.

## After packing parts

```bash
python3 .grok/skills/solace-mech-parts/scripts/pack-hd-seat.py
python3 .grok/skills/last-harvest/scripts/qa-seat.py
```

North-star hull: `python3 .grok/skills/last-harvest/scripts/pack-maskcut.py` (assemble RGB × slot mask). Never `pack-ab.py` fit/stamp. Never copy dirs.

## After packing tiles

```bash
python3 .grok/skills/last-harvest-terrain/scripts/pack-terrain.py
```

(Skill copy: `.grok/skills/last-harvest/scripts/pack-terrain.py`.)

## After 3D Bay / kit / gasket edits

```bash
npx tsc --noEmit
npm run vault:hot
node .grok/skills/solace-3d-qa/scripts/qa-3d.mjs
```

Copy `last-harvest*` + `solace-*` skills to `/root/.grok/server-skills/` after editing them (includes makers, grid, dummies).

## Hot vault (same turn as sim / LastHarvest / compose / parts / skillgrams / items)

```bash
npm run vault:hot
```

Restore a 0-byte hot file from `backups/last-harvest/hot/latest/`.

## Boot backup (when preview is actually up)

```bash
stamp=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p /workspace/backups/last-harvest/$stamp
cp -a src/game public/game src/routes src/router.tsx src/styles.css startup.sh \
  /workspace/backups/last-harvest/$stamp/
```

## npm aliases (same paths)

| Script | What |
|--------|------|
| `npm run vault:hot` | stamp hot TS + B3 parts |
| `npm run qa:game` | tsc + seat + slice1 |
| `npm run qa:slice1` | playwright smoke |
| `npm run qa:seat` | B3 hull vs gold south |
| `npm run pack:solace` | HD 384 B1→B3 |
| `npm run pack:terrain` | forest tiles |

## Do not run for Last Harvest

| Command | Why |
|---------|-----|
| `pack-b3.py` | Old 192 packer. Breaks seating |
| `npm test` | Scaffold auth/PWA, not slice 1 |
| `npm run check:auth` | No ship login |
| brand-check / browser-smoke | App-builder chrome |

## When Ivan says “QA pass”

1. `npm run qa:game`  
2. Tick [qa.md](qa.md) + [sustain.md](sustain.md) if a paid-for bug showed  
3. One line in [state.md](state.md)
