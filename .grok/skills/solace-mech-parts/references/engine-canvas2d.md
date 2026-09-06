# Canvas 2D export and performance

Solace draws Labor crate parts with HTML Canvas 2D.

Hot path target — **one** `drawImage` per unit per frame, from a cached composite. Rebuild that cache only when loadout, paint, pose, or facing changes.

## Blit rules

```js
ctx.imageSmoothingEnabled = false;
ctx.drawImage(atlas, sx, sy, sw, sh, dx | 0, dy | 0, sw, sh);
```

- Integer dest only. Subpixel dest blurs the 1px outline and costs extra filtering.
- Whole-canvas zoom is fine at 2× / 3× with smoothing off. Do not scale each part.
- Set `imageSmoothingEnabled = false` once on the game context and on every OffscreenCanvas used to bake.
- No `shadowBlur`, `filter`, `globalAlpha`, or `clip()` on the per-part pass.
- Never `getImageData` / `putImageData` in the loop.

## Runtime load

Load B3 only — `p###.png` + `p###.json`. One Image bitmap per equipped part id.

Do not fetch B1 in play. Do not decode a B2 preview into the compositor.

Preload order:

1. Equipped ids on the active crate
2. Default fallbacks `p000`–`p010` (needed for empty slots)
3. Everything else on demand

Hangar **room** later loads the same 3/4 idle (S50). Do not pack a portrait atlas.

## Composite cache (required)

Key:

```
loadout = p000+p001+p002+p005+p007+p008
key = loadout + paint + pose + dir
```

Value = one 384×384 OffscreenCanvas.

Build when the key misses:

1. Clear the offscreen
2. Blit B3 frames in order — legs, body, head, armL (blade only), armR, held weapons
3. Apply paint once here, not per tick
4. Store. LRU evict (start at 64 entries; raise only if a battle has more unique kits × poses)

Draw:

```js
ctx.drawImage(cache.get(key), x | 0, y | 0);
```

That in-memory canvas is not a B2 file and must not be written back into B1.

Two-hand kits skip the `armL` blit — cheaper bake, no empty column.

## Pack B3 for fewer pixels

When ingesting B1 → B3:

- Strip magenta; store straight alpha
- Trim transparent borders per frame; keep `origin` / `sole` relative to the trimmed frame
- 1 px transparent pad between packed frames so neighbor bleed cannot happen
- Pack **battle** poses only in `p012.png` — `idle`, `grip`, `fire`, later `walk` / `jump`
- **S50:** do not pack a hangar/portrait PNG
- Do not duplicate west if west is a flip of east — store `flipX: true` on the east frame instead of a second copy (blade shield/sword must still author west when flip would swap hands)

Prefer one battle atlas per part id. Do not build a mega-atlas of all `p000`–`p999` — it stalls first load and busts cache when one part changes.

## Recolor

Bake paint into the composite cache entry. Do not tint five layers every frame.

If a pattern is common, a second cache key (`paint=hazard`) is cheaper than a second B3 file. Baked pattern previews are optional B1 suffixes, not extra runtime atlases.

## Budget

| Path | Draw calls / unit / frame | When |
|------|---------------------------|------|
| Cached composite | 1 | idle, walk, fire after bake |
| Cache miss bake | 4–6 (parts) | loadout or pose change |
| Wrong path | 5+ × unit count | restacking B3 every tick — forbidden |

MMX frame counts keep the LRU small. A 12-frame walk would multiply cache keys; do not author that.

## Dungeon moves (leg type)

Grid game. Leg slot decides tiles, not the rest of the kit.

- piston — 1 tile, walk cache keys
- hover skirt — 1 tile, glide + bob. Hem on `hover_plane_y`. No foot sprites
- reverse-joint — 2 tiles, jump cache keys (crouch, airborne, land)

## Sockets

`assets/sockets.json` is in **384×384** cell space. Offset each child by `parentSocket - childLocalSocket` during the bake only. The cached composite already has sockets applied.

HD pack (match terrain/enemies): LANCZOS into the cell. Never BOX-half then NEAREST up. Isolated B1 should be authored large (~1024) then packed; do not ship 32px parts.
