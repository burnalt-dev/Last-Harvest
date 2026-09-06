# Paint (crate)

**Open `last-harvest` first.** Hangar **painter NPC** later → then `last-harvest-paint`. Pattern **affixes** live in [last-harvest affixes.md](../../last-harvest/references/affixes.md). Do not glaze PNGs.

## Split

| | |
|--|--|
| **Tier** | Mesh. Grey default → fancier silhouette as rank climbs. Never “gold by recolor.” |
| **Main color** | Hull. Default **grey**. |
| **Sub color** | Pattern fill. Author as **white** on the grey hull (subcolor region). |
| **Pattern affix** | Blue/purple only. One random pattern. Same `p###`. |
| **Orange** | Unique mesh + unique gameplay affix. **No** pattern layer. |

Starter `p000–p010` are grey, no pattern version.

## Layers (core, not a multiply)

| Layer | Recolor? | Lock |
|-------|----------|------|
| hull (main) | yes | weathered grey |
| pattern (sub) | yes | authored white; painter tints this |
| stripe / caution | yes | yellow hatch on unpatterned grey |
| joints / pistons | lightly | near-black cavities stay dark |
| visor | **no** | cyan slit forever |

Magenta is chroma only. Never armor.

## Pattern version (per piece, when that part is blue/purple)

Same sockets, same silhouette. Extra B1 or mask: white = subcolor pixels, grey = main. Visor/joints not in the mask. Packer can tint sub at instance time.

Do not author pattern B1 for slice 1 grey.

## Paint job screen (later)

NPC: pick **main color** and **sub color**. Owned blue/purple with a pattern only. Not on a planet. Not on orange/grey/white.

## Slice 1

Grey factory only. No painter. No `+`.

## Fail

- Recolor glaze over the whole PNG
- Grey part “promoted” to purple by turning it purple
- Visor painted
- Pattern on orange
- Painter on Veldt-9
