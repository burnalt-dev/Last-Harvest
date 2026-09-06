#!/usr/bin/env python3
"""Pack biome fog sheets + optional forest trees.

Example-first. Keys magenta and rose JPEG. Zeros RGB on alpha 0.
Usage: python3 scripts/pack-terrain.py
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path("/workspace")
EX = ROOT / ".grok/skills/last-harvest-terrain/assets/examples"
TILES = ROOT / "public/game/tiles"
PROPS = ROOT / "public/game/props"
CELL = 128

FOG = {
    "forest": {
        "closed": ROOT / "artifacts/imagine_images/122b3ad6-72cf-4516-853b-d25be75c593a.jpg",
        "open": ROOT / "artifacts/imagine_images/e8f013ed-b582-4bb8-88a5-181ddc5755bc.jpg",
        "ex_closed": "forest-fog-closed.png",
        "ex_open": "forest-fog-open.png",
    },
    "ruins": {
        "closed": ROOT / "artifacts/imagine_images/fac4ab98-eb84-44ee-b6b9-14d91b6431f4.jpg",
        "open": ROOT / "artifacts/imagine_images/66bfcbf2-a463-4268-adac-dcb57a2edbe4.jpg",
        "ex_closed": "ruins-fog-closed.png",
        "ex_open": "ruins-fog-open.png",
    },
    "mines": {
        "closed": ROOT / "artifacts/imagine_images/50e004e2-6814-4b7f-8506-6994a8a7f765.jpg",
        "open": ROOT / "artifacts/imagine_images/32789f67-6f60-4979-b5e5-6b46b097de59.jpg",
        "ex_closed": "mines-fog-closed.png",
        "ex_open": "mines-fog-open.png",
    },
}

TREE = ROOT / "artifacts/imagine_images/029bb626-96a9-46fa-95ce-3d880c54a4cd.jpg"


def key_bg(path: Path, erode: int = 2) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    arr = np.asarray(im).copy()
    r = arr[..., 0].astype(np.int16)
    g = arr[..., 1].astype(np.int16)
    b = arr[..., 2].astype(np.int16)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 180
    rose = (r > 140) & (g < 55) & (b > 60) & (b < 170) & (r > g + 80)
    c = arr[2, 2, :3].astype(np.int16)
    dist = np.abs(r - c[0]) + np.abs(g - c[1]) + np.abs(b - c[2])
    near_corner = dist < 80
    arr[..., 3] = np.where(mag | rose | near_corner, 0, 255)
    spr = Image.fromarray(arr, "RGBA")
    alpha = spr.split()[-1]
    for _ in range(erode):
        alpha = alpha.filter(ImageFilter.MinFilter(3))
    spr.putalpha(alpha)
    box = spr.getbbox()
    if not box:
        raise SystemExit(f"empty {path}")
    spr = spr.crop(box)
    a = np.asarray(spr).copy()
    a[a[..., 3] < 16] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def chunky_fit(spr: Image.Image, w: int, h: int, bottom: bool = True) -> Image.Image:
    scale = min((w - 4) / spr.width, (h - 4) / spr.height)
    nw, nh = max(8, int(spr.width * scale)), max(8, int(spr.height * scale))
    mid = spr.resize((max(4, nw // 2), max(4, nh // 2)), Image.Resampling.BOX)
    mid = mid.resize((nw, nh), Image.Resampling.NEAREST)
    cell = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = (w - nw) // 2
    y = h - 2 - nh if bottom else (h - nh) // 2
    cell.alpha_composite(mid, (max(0, x), max(0, y)))
    a = np.asarray(cell).copy()
    a[a[..., 3] < 16] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def pack_fog(biome: str, spec: dict) -> None:
    closed_src = spec["closed"]
    open_src = spec["open"]
    if not Path(closed_src).exists():
        closed_src = EX / spec["ex_closed"]
    if not Path(open_src).exists():
        open_src = EX / spec["ex_open"]
    if not Path(closed_src).exists() or not Path(open_src).exists():
        print("skip fog", biome)
        return
    closed = chunky_fit(key_bg(Path(closed_src), 2), CELL, CELL, bottom=True)
    opened = chunky_fit(key_bg(Path(open_src), 2), CELL, CELL, bottom=True)
    closed.save(EX / spec["ex_closed"])
    opened.save(EX / spec["ex_open"])
    fog = Image.new("RGBA", (CELL * 2, CELL), (0, 0, 0, 0))
    fog.paste(closed, (0, 0), closed)
    fog.paste(opened, (CELL, 0), opened)
    out = TILES / f"{biome}-fog.png"
    fog.save(out)
    print(biome, "fog", out, fog.size)


def main() -> None:
    TILES.mkdir(parents=True, exist_ok=True)
    PROPS.mkdir(parents=True, exist_ok=True)
    EX.mkdir(parents=True, exist_ok=True)
    if TREE.exists() and not (PROPS / "pr001.png").exists():
        tree = chunky_fit(key_bg(TREE, 3), 96, 128, bottom=True)
        tree.save(PROPS / "pr001.png")
        tree.save(EX / "pr001.png")
        ImageOps.mirror(tree).save(PROPS / "pr002.png")
        ImageOps.mirror(tree).save(EX / "pr002.png")
    for biome, spec in FOG.items():
        pack_fog(biome, spec)


if __name__ == "__main__":
    main()
