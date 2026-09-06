#!/usr/bin/env python3
"""Pack grey A/B isolates as p011–p017. Merge atlases.ts. South copied to all dirs/poses."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
SKILL = ROOT / ".grok/skills/solace-mech-parts"
SOCK = json.loads((SKILL / "assets/sockets.json").read_text())
B3 = ROOT / "public/game/parts"
SRC = ROOT / "src/game/solace"
VAULT_B1 = ROOT / ".grok/skills/last-harvest/assets/solace/b1"
VAULT_B3 = ROOT / ".grok/skills/last-harvest/assets/solace/b3"
CELL = 384
FOOT = int(SOCK.get("foot_line_y", 352))
DIRS = ("s", "e", "n", "w")
POSES = ("idle", "idle2", "walk", "fire", "grip")
MAX = {"body": 236, "head": 128, "legs": 210, "armR": 190}

NEW = [
    ("p015", "head", "33ece567-85b3-49ed-9ef0-fedca8f60e55.jpg"),
    ("p012", "head", "2ed0886a-aa3e-459e-bbd3-8cb1386eed82.jpg"),
    ("p016", "body", "ef165975-a6c8-4dad-b6ec-0ea6a2bfadb5.jpg"),
    ("p011", "body", "58878caf-d495-40d6-a8de-d0aa18b7e3ad.jpg"),
    ("p017", "legs", "a5b22334-3b07-4fb3-aca1-10db37a34301.jpg"),
    ("p013", "legs", "ea0bede2-e1e7-4f30-8e6e-65c393ffa679.jpg"),
    ("p014", "armR", "d9886e88-22e3-4c02-9961-5b53e41c09ab.jpg"),
]


def key(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    arr = np.asarray(im).copy()
    r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
    corner = arr[2, 2, :3].astype(int)
    dist = np.abs(r - corner[0]) + np.abs(g - corner[1]) + np.abs(b - corner[2])
    rose = (r > 170) & (g < 70) & (b > 60)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 140
    bg = (dist < 95) | rose | mag
    arr[..., 3] = np.where(bg, 0, 255)
    spr = Image.fromarray(arr, "RGBA")
    a = spr.split()[-1].filter(ImageFilter.MinFilter(3))
    spr.putalpha(a)
    box = spr.getbbox()
    if not box:
        raise SystemExit(f"empty {path}")
    spr = spr.crop(box)
    a = np.asarray(spr).copy()
    a[a[..., 3] < 20] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def fit(spr: Image.Image, mx: int) -> Image.Image:
    w, h = spr.size
    s = mx / max(w, h)
    return spr.resize((max(1, int(w * s)), max(1, int(h * s))), Image.Resampling.LANCZOS)


def stamp(spr: Image.Image, d: str, slot: str) -> Image.Image:
    """Join isolate to sockets.json (neck/hip/shoulder/foot)."""
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    sock = SOCK["sockets_by_dir"][d]
    w, h = spr.size
    if slot == "legs":
        x = int(sock["hip"]["x"]) - w // 2
        y = FOOT - h
    elif slot == "body":
        x = int(sock["hip"]["x"]) - w // 2
        y = int(sock["hip"]["y"]) - int(h * 0.42)
    elif slot == "head":
        x = int(sock["neck"]["x"]) - w // 2
        y = int(sock["neck"]["y"]) - h + 28
    else:
        x = int(sock["shoulderR"]["x"]) - int(w * 0.35)
        y = int(sock["shoulderR"]["y"]) - 24
    cell.alpha_composite(spr, (max(-40, min(CELL - 8, int(x))), max(-20, min(CELL - 8, int(y)))))
    return cell


def main() -> None:
    B3.mkdir(parents=True, exist_ok=True)
    VAULT_B3.mkdir(parents=True, exist_ok=True)
    VAULT_B1.mkdir(parents=True, exist_ok=True)
    ncell = len(POSES) * len(DIRS)
    for pid, slot, jpg in NEW:
        spr = fit(key(ART / jpg), MAX[slot])
        spr.save(VAULT_B1 / f"{pid}_{slot}_idle_s.png")
        cells = [stamp(spr, d, slot) for d in DIRS]
        atlas = Image.new("RGBA", (CELL * ncell, CELL), (0, 0, 0, 0))
        frames = []
        i = 0
        for pose in POSES:
            for di, d in enumerate(DIRS):
                atlas.paste(cells[di], (i * CELL, 0))
                frames.append(
                    {
                        "pose": pose,
                        "dir": d,
                        "x": i * CELL,
                        "y": 0,
                        "w": CELL,
                        "h": CELL,
                        "origin": {"x": 0, "y": 0},
                        "sole": FOOT if slot == "legs" else None,
                        "flipX": False,
                        "frame": 1 if pose == "idle2" else 0,
                    }
                )
                i += 1
        atlas.save(B3 / f"{pid}.png")
        meta = {
            "id": pid,
            "slot": "arms" if slot == "armR" else slot,
            "image": f"{pid}.png",
            "cell": {"w": CELL, "h": CELL},
            "frames": frames,
            "placeholder_dirs": True,
        }
        (B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        shutil.copy2(B3 / f"{pid}.png", VAULT_B3 / f"{pid}.png")
        (VAULT_B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        print("packed", pid, spr.size)

    atlases = {}
    for jf in sorted(B3.glob("p*.json")):
        atlases[jf.stem] = json.loads(jf.read_text())
    (SRC / "atlases.ts").write_text("export const ATLASES = " + json.dumps(atlases, indent=2) + " as const;\n")
    print("atlases", sorted(atlases))


if __name__ == "__main__":
    main()
