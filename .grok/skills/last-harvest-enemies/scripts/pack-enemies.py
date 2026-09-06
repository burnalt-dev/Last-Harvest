#!/usr/bin/env python3
"""Pack Veldt-9 enemy 2x2 sheets. Dirs: S (0,0) E (1,0) N (0,1) W (1,1)."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
VAULT = ROOT / ".grok/skills/last-harvest/assets/actors"
PUB = ROOT / "public/game/enemies"

# south, east, north, west
SHEETS = {
    "goblin": {
        "cell": (192, 240),
        "ids": [
            "8f0948a0-434a-4d33-9268-f500397e4463",
            "1d433308-0196-4566-b871-9e60d9cd02dd",
            "a51b3e03-8dbf-43a1-8f2c-4930cd06665b",
            "0b6ec0ba-a8a5-4d01-84fe-88a402ada7ea",
        ],
    },
    "orc": {
        "cell": (384, 512),
        "ids": [
            "758cdc53-3fea-4a1a-9a0e-36e6914e9e09",
            "7097670a-dc81-45b2-b9ee-4d48cf2ee85c",
            "2c35f417-4d5a-4e21-9b52-c10fc18bbb51",
            "03c0b703-4d33-49a7-a113-67603ff23d57",
        ],
    },
    "blacksmith": {
        "cell": (384, 512),
        "ids": [
            "28059691-e0b2-4e2e-a0b8-e9b8e56cbbd2",
            "f294c646-089b-4817-94e9-e8c9d8373cff",
            "9bd03af0-6c39-4f0f-b987-f749d392d0b1",
            "a53cf985-da5a-4bbc-a924-3ead10594d0e",
        ],
    },
}


def key_bg(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    arr = np.asarray(im).copy()
    r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 200
    rose = (r > 140) & (g < 55) & (b > 60) & (b < 170) & (r > g + 80)
    arr[..., 3] = np.where(mag | rose, 0, 255)
    spr = Image.fromarray(arr, "RGBA")
    a = spr.split()[-1].filter(ImageFilter.MinFilter(3))
    spr.putalpha(a)
    box = spr.getbbox()
    if not box:
        raise SystemExit(f"empty {path}")
    spr = spr.crop(box)
    a = np.asarray(spr).copy()
    a[a[..., 3] < 16] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def hd_fit(spr: Image.Image, w: int, h: int) -> Image.Image:
    scale = min((w - 6) / spr.width, (h - 6) / spr.height)
    nw, nh = max(8, int(spr.width * scale)), max(8, int(spr.height * scale))
    mid = spr.resize((nw, nh), Image.Resampling.LANCZOS)
    cell = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = (w - nw) // 2
    y = h - 3 - nh
    cell.alpha_composite(mid, (max(0, x), max(0, y)))
    a = np.asarray(cell).copy()
    a[a[..., 3] < 16] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def pack(name: str) -> None:
    spec = SHEETS[name]
    cw, ch = spec["cell"]
    sheet = Image.new("RGBA", (cw * 2, ch * 2), (0, 0, 0, 0))
    # S E N W → cells (0,0) (1,0) (0,1) (1,1)
    slots = [(0, 0), (1, 0), (0, 1), (1, 1)]
    for uid, (col, row) in zip(spec["ids"], slots):
        spr = hd_fit(key_bg(ART / f"{uid}.jpg"), cw, ch)
        sheet.alpha_composite(spr, (col * cw, row * ch))
    VAULT.mkdir(parents=True, exist_ok=True)
    PUB.mkdir(parents=True, exist_ok=True)
    sheet.save(VAULT / f"{name}.png")
    sheet.save(PUB / f"{name}.png")
    print(name, sheet.size)


def pack_anvil() -> None:
    spr = hd_fit(key_bg(ART / "8fc2277b-9f57-4181-8c27-5592ab1ea442.jpg"), 192, 192)
    props = ROOT / "public/game/props"
    terrain = ROOT / ".grok/skills/last-harvest/assets/terrain"
    props.mkdir(parents=True, exist_ok=True)
    terrain.mkdir(parents=True, exist_ok=True)
    spr.save(props / "pr003.png")
    spr.save(terrain / "pr003.png")
    print("pr003", spr.size)


def main() -> None:
    for n in SHEETS:
        pack(n)
    pack_anvil()


if __name__ == "__main__":
    main()
