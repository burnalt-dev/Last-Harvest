#!/usr/bin/env python3
"""South idle B3 hull stack vs vault preview_idle_s.png (384 cell).

  python3 .grok/skills/last-harvest/scripts/qa-seat.py
  npm run qa:seat
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace")
VAULT = ROOT / ".grok/skills/last-harvest/assets"
B3_DIRS = [ROOT / "public/game/parts", VAULT / "solace/b3"]
GOLD = VAULT / "solace/preview_idle_s.png"
CELL = 384
# same blit order as src/game/solace/compose.ts
ORDER = ("p002", "p000", "p001", "p006", "p005")


def b3_dir() -> Path:
    for d in B3_DIRS:
        if (d / "p000.png").exists():
            return d
    raise SystemExit("no B3 p000.png in public/game/parts or vault")


def cell_idle_s(folder: Path, pid: str) -> Image.Image:
    meta = json.loads((folder / f"{pid}.json").read_text())
    im = Image.open(folder / f"{pid}.png").convert("RGBA")
    fr = next(f for f in meta["frames"] if f["pose"] == "idle" and f["dir"] == "s")
    return im.crop((fr["x"], fr["y"], fr["x"] + fr["w"], fr["y"] + fr["h"]))


def assemble(folder: Path) -> Image.Image:
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    for pid in ORDER:
        spr = cell_idle_s(folder, pid)
        if spr.size != (CELL, CELL):
            raise SystemExit(f"{pid} idle_s is {spr.size}, need {CELL} seated cell")
        out.alpha_composite(spr, (0, 0))
    return out


def keyed(im: Image.Image) -> Image.Image:
    arr = np.asarray(im.convert("RGBA")).copy()
    r, g, b, a = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int), arr[..., 3]
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 180
    arr[..., 3] = np.where(mag, 0, a)
    arr[arr[..., 3] < 16] = [0, 0, 0, 0]
    return Image.fromarray(arr, "RGBA")


def score(a: Image.Image, b: Image.Image) -> float:
    aa = np.asarray(keyed(a).resize((CELL, CELL), Image.Resampling.NEAREST))
    bb = np.asarray(keyed(b).resize((CELL, CELL), Image.Resampling.NEAREST))
    mask = (aa[..., 3] > 16) & (bb[..., 3] > 16)
    if mask.sum() < 200:
        return 999.0
    return float(np.abs(aa[mask, :3].astype(int) - bb[mask, :3].astype(int)).mean())


def main() -> int:
    if not GOLD.exists():
        print("FAIL no gold", GOLD)
        return 1
    folder = b3_dir()
    got = assemble(folder)
    gold = Image.open(GOLD).convert("RGBA")
    err = score(got, gold)
    out = VAULT / "gold/qa_seat_s.png"
    got.save(out)
    ok = err < 48
    print(("PASS" if ok else "FAIL"), f"mean_err={err:.1f} from {folder} (need < 48)")
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
