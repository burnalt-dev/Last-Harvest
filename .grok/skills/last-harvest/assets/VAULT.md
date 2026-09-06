# Vault — Last Harvest source of truth for pixels

This folder is the **archive**. Runtime is always `public/game/`. Sisters author here (or their own `assets/examples`), then pack/copy into public.

Never live-link this path from the game. Never point `<img src>` at `.grok/skills`.

## Layout

```
assets/
  VAULT.md                 this file
  ids.md                   p### i### r### sg### next-free
  gold/                    pictures a rebuild must match or beat
    crate-idle-s.png       seated south (qa-seat.py)
    crate-idle2-s.png
    title.png              Board under the pitch
    ship.png               Drop bay + Rend
    veldt-9.png            dirt path + trees + crate (minimum readable)
  solace/
    sockets.json           modular contract
    b1/                    isolated slot PNGs
    b3/                    packed atlases p000–p006
  terrain/
    forest.png             2×2 floor sheet
    forest-fog.png         2×1 closed / opening
    pr001.png pr002.png    blocking trees
    pr003.png              living anvil (does not move)
    concept-labor-forest.png  art north star (goblin/orc collage)
  actors/
    gasket.png             ¼ tile
    goblin.png             ¼ tile 2×2 — bloom-ore sickle
    orc.png                ~crate 2×2 — slag axe
    blacksmith.png         ~crate 2×2 — living anvil
```

## Runtime copy (slice 1)

| Vault | `public/game/` |
|-------|----------------|
| `solace/b3/p00{0,1,2,5,6}.png+.json` | `parts/` |
| `solace/sockets.json` | `src/game/solace/sockets.json` |
| `terrain/forest.png` `forest-fog.png` | `tiles/` |
| `terrain/pr001.png` `pr002.png` `sh001.png` | `props/` |
| `actors/gasket.png` | `companion/` |
| `actors/goblin.png` `orc.png` | `enemies/` |

`solace-mech-parts/assets/examples` may match `solace/b1`. If they disagree, **vault wins** after Ivan’s last keep; then copy back to the sister examples.

## Checks

```
python3 .grok/skills/last-harvest/scripts/qa-seat.py   # gold/crate-idle-s.png
node .grok/skills/last-harvest/scripts/qa-slice1.mjs
```

After a good rebuild, replace `gold/title.png` `ship.png` `veldt-9.png` with the new shots. Do not replace `crate-idle-s.png` unless seating actually changed.
