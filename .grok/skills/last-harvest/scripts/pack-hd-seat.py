#!/usr/bin/env python3
"""Seat HD isolated B1 onto 384 sockets. Plant piston soles on foot_line_y.

Rose-key Imagine JPEGs, fit per-slot max, stamp, write B3 + vault + atlases.ts.
"""
from __future__ import annotations

import json
import shutil
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
MAPF = ROOT / "artifacts/b1_hd/map.json"
SKILL = ROOT / ".grok/skills/solace-mech-parts"
SOCK = json.loads((SKILL / "assets/sockets.json").read_text())
EX = SKILL / "assets/examples"
VAULT_B1 = ROOT / ".grok/skills/last-harvest/assets/solace/b1"
VAULT_B3 = ROOT / ".grok/skills/last-harvest/assets/solace/b3"
B3 = ROOT / "public/game/parts"
SRC = ROOT / "src/game/solace"
CELL = 384
FOOT = int(SOCK.get("foot_line_y", 352))
DIRS = ("s", "e", "n", "w")

MAX = {
    "body": 168,
    "head": 56,
    "legs": 136,
    "armR": 104,
    "armL": 104,
    "handL": 80,
    "handR": 96,
    "hands": 150,
}
SOCKN = {
    "legs": "hip",
    "body": "hip",
    "head": "neck",
    "armL": "shoulderL",
    "armR": "shoulderR",
    "handL": "handL",
    "handR": "handR",
    "hands": "handR",
}
SLOT_OF = {
    "p000": "body",
    "p001": "head",
    "p002": "legs",
    "p005": "armR",
    "p006": "armL",
    "p007": "handL",
    "p008": "handR",
    "p009": "hands",
    "p010": "hands",
}


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
    """X from sockets. Y stacked from foot_line so hull sits on pistons."""
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    sock = SOCK["sockets_by_dir"][d]
    w, h = spr.size
    hip_x = int(sock["hip"]["x"])
    # Canonical stack (south calibration): soles at FOOT, then legs, hull, head.
    # Independent of each sprite's internal padding.
    legs_h = MAX["legs"]
    body_h = MAX["body"]
    head_h = MAX["head"]
    legs_y = FOOT - legs_h
    body_y = legs_y - body_h + 52
    head_y = body_y - head_h + 18
    arm_y = body_y + 22
    hand_y = body_y + body_h - 36
    if slot == "legs":
        x, y = hip_x - w // 2, legs_y + (legs_h - h)
    elif slot == "body":
        x, y = hip_x - w // 2, body_y + (body_h - h)
    elif slot == "head":
        x, y = int(sock["neck"]["x"]) - w // 2, head_y + (head_h - h)
    elif slot == "armL":
        x, y = int(sock["shoulderL"]["x"]) - w // 2, arm_y
    elif slot == "armR":
        x, y = int(sock["shoulderR"]["x"]) - w // 2, arm_y
    elif slot == "handL":
        sx = int(sock["shoulderL"]["x"])
        x, y = sx - w // 2 - 10, arm_y + MAX["armL"] - 24
    elif slot == "handR":
        sx = int(sock["shoulderR"]["x"])
        x, y = sx - w // 2 + 10, arm_y + MAX["armR"] - 24
    else:
        lx, rx = int(sock["handL"]["x"]), int(sock["handR"]["x"])
        x, y = (lx + rx) // 2 - w // 2, body_y + 8
    cell.alpha_composite(spr, (int(x), int(y)))
    return cell


def main() -> None:
    mapping = json.loads(MAPF.read_text())
    keyed: dict[str, Image.Image] = {}
    EX.mkdir(parents=True, exist_ok=True)
    VAULT_B1.mkdir(parents=True, exist_ok=True)
    for stem, jpg in mapping.items():
        pid = stem.split("_")[0]
        slot = SLOT_OF[pid]
        spr = fit(key(ART / jpg), MAX[slot])
        spr.save(VAULT_B1 / f"{stem}.png")
        spr.save(EX / f"{stem}.png")
        keyed[stem] = spr
        print(stem, spr.size)

    groups: dict[str, dict[tuple[str, str], Image.Image]] = defaultdict(dict)
    for stem, spr in keyed.items():
        pid, _slot, pose, d = stem.split("_")
        groups[pid][(pose, d)] = spr

    B3.mkdir(parents=True, exist_ok=True)
    VAULT_B3.mkdir(parents=True, exist_ok=True)
    atlases = {}
    for pid, have in groups.items():
        slot = SLOT_OF[pid]
        cells, frames = [], []
        for d in DIRS:
            spr = have.get(("idle", d)) or have.get(("idle", "s"))
            if spr is None:
                continue
            cells.append(stamp(spr, d, slot))
            frames.append(
                {
                    "pose": "idle",
                    "dir": d,
                    "x": 0,
                    "y": 0,
                    "w": CELL,
                    "h": CELL,
                    "origin": {"x": 0, "y": 0},
                    "sole": FOOT if slot == "legs" else None,
                    "flipX": False,
                    "frame": 0,
                }
            )
        atlas = Image.new("RGBA", (CELL * len(cells), CELL), (0, 0, 0, 0))
        for i, cell in enumerate(cells):
            atlas.paste(cell, (i * CELL, 0))
            frames[i]["x"] = i * CELL
        atlas.save(B3 / f"{pid}.png")
        meta = {"id": pid, "slot": slot, "image": f"{pid}.png", "cell": {"w": CELL, "h": CELL}, "frames": frames}
        (B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        shutil.copy2(B3 / f"{pid}.png", VAULT_B3 / f"{pid}.png")
        (VAULT_B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        atlases[pid] = meta
        print("atlas", pid, atlas.size)

    def preview(pose_dir: str, ids: list[str], name: str) -> None:
        d = pose_dir
        out = Image.new("RGBA", (CELL, CELL), (255, 0, 255, 255))
        for pid in ids:
            if pid not in atlases:
                continue
            atlas = Image.open(B3 / f"{pid}.png")
            fr = next(f for f in atlases[pid]["frames"] if f["dir"] == d)
            piece = atlas.crop((fr["x"], 0, fr["x"] + CELL, CELL))
            out.alpha_composite(piece)
        dest = EX / name
        out.save(dest)
        out.save(VAULT_B1.parent / name)
        print("preview", dest)

    hull = ["p002", "p000", "p001", "p006", "p005"]
    blade = hull + ["p007", "p008"]
    preview("s", hull, "preview_idle_s.png")
    preview("s", blade, "preview_blade_s.png")
    preview("e", blade, "preview_blade_e.png")
    preview("n", blade, "preview_blade_n.png")
    preview("w", blade, "preview_blade_w.png")
    preview("s", hull + ["p009"], "preview_scythe_s.png")
    preview("s", hull + ["p010"], "preview_cannon_s.png")
    (SRC / "atlases.ts").write_text("export const ATLASES = " + json.dumps(atlases, indent=2) + " as const;\n")
    shutil.copy2(SKILL / "assets/sockets.json", SRC / "sockets.json")


if __name__ == "__main__":
    main()
