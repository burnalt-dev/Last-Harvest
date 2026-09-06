# Iso tiles

`src/game/iso.ts` is the camera. Do not invent a second projection.

**Hybrid:** these are **2D** diamonds for the drop. Never WebGL the Veldt floor. Bay hanger diamonds are `last-harvest-3d` occupancy meshes, not this packer.

```
screenX = ox + (tx - ty) * (TW/2)
screenY = oy + (tx + ty) * (TH/2)
TW = 156, TH = 78
```

## Starter 2×2 — `public/game/tiles/<biome>.png`

| Cell | Id (forest) | Game tile |
|------|-------------|-----------|
| TL | t001 floor | walkable 0 |
| TR | t002 wall cube | blocked 1 (draw pr001 on top in forest) |
| BL | t003 floor-b | walkable / stairs 2 |
| BR | t004 hazard | pit/flood 3 |

## Fog sheets — `public/game/tiles/<biome>-fog.png` (2×1)

| Cell | Forest | Ruins | Mines | Use |
|------|--------|-------|-------|-----|
| TL closed | t005 | t015 | t025 | `!seen` |
| TR opening | t006 | t016 | t026 | `seen && !vis` + Radar fringe |

See [fog.md](fog.md). Image-to-image examples, then `python3 scripts/pack-terrain.py`.

Walls must read as raised mass. Forest walls get a **tree prop**. Do not copy that prop to ruins/mines.

## Load

Drop preloads `tiles/<biome>`, `tiles/<biome>-fog` if present, biome props, `sh001`. Not the other planets. Not hangar parts.

## Prompt scraps

Diamond fill, 3/4 high Front Mission, cartoony SNES HD, dark 1px outline, no character, no crate, no chest. Magenta unused. Fog matches the biome (grove / rubble / flood), never a copy of another planet.
