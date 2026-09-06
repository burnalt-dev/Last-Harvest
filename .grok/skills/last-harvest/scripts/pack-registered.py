#!/usr/bin/env python3
"""Registered isolates per facing. NEVER copy south→e/n/w. NEVER flip."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
B3 = ROOT / "public/game/parts"
SRC = ROOT / "src/game/solace"
VAULT = ROOT / ".grok/skills/last-harvest/assets/solace/b3"
CELL = 384
DIRS = ("s", "e", "n", "w")
POSES = ("idle", "idle2", "walk", "fire", "grip")

# pid -> dir -> jpeg  (every dir must be listed; no fallback)
LAYERS = {
    "p015": {  # head
        "s": "0dd3387a-78fd-464b-ba47-151c8231f518.jpg",
        "e": "c2987c99-0386-438a-b58a-f31135296230.jpg",
        "n": "2dded2bf-03c8-4751-9b41-cc6f4e22d649.jpg",
        "w": "da486a8e-07df-414b-8872-e72e996dce5a.jpg",
    },
    "p016": {  # body
        "s": "7e89d49b-4172-4993-82f5-e953915e667c.jpg",
        "e": "ca8e4198-6acc-40d8-9be6-b70737ff1991.jpg",
        "n": "6d4207d7-c752-44d8-93f9-e6e41f364087.jpg",
        "w": "ca012b50-c175-49f8-b7e2-fae5d2241775.jpg",
    },
    "p017": {  # legs
        "s": "f13d7e02-f7bc-4661-9f51-731f6355dfa0.jpg",
        "e": "f2f83800-4ab0-4749-b37c-ded94f173dac.jpg",
        "n": "b01c7f0c-7fb0-42da-bdda-c70eec045b24.jpg",
        "w": "dc4d151d-695a-48d9-a746-b640254756f4.jpg",
    },
    "p014": {  # arms pair
        "s": "25e89c6a-5823-4bf8-817d-dfc40242b30d.jpg",
        "e": "51fe037f-acc7-4129-892b-eed5a23cd31c.jpg",
        "n": "871c5f16-1f52-4c22-916c-c16432973cfd.jpg",
        "w": "6f4f85d3-fe40-4107-afb3-65bece11ca7d.jpg",
    },
    "p018": {  # scythe + grips
        "s": "d049de3c-8206-4e24-b67d-5ecb0ab523d6.jpg",
        "e": "14f08bea-41c5-4395-a997-1eed84e4583b.jpg",
        "n": "cf590bac-7b1a-4ae3-8113-ffa4fb1bd6aa.jpg",
        "w": "085fe7c7-715e-4b22-b4e4-8faee4c46ba4.jpg",
    },
}
SLOT = {"p015": "head", "p016": "body", "p017": "legs", "p014": "arms", "p018": "hands"}
PAIR = {"p014"}


def key384(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA").resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(im).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 160
    rose = (r > 160) & (g < 90) & (b > 40)
    a[..., 3] = np.where(mag | rose, 0, 255)
    a[a[..., 3] < 30] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def main() -> None:
    B3.mkdir(parents=True, exist_ok=True)
    VAULT.mkdir(parents=True, exist_ok=True)
    n = len(POSES) * len(DIRS)
    for pid, dirs in LAYERS.items():
        if any(d not in dirs for d in DIRS):
            raise SystemExit(f"{pid} missing a facing — refuse to copy")
        cells = {d: key384(ART / dirs[d]) for d in DIRS}
        atlas = Image.new("RGBA", (CELL * n, CELL), (0, 0, 0, 0))
        frames = []
        i = 0
        for pose in POSES:
            for d in DIRS:
                atlas.paste(cells[d], (i * CELL, 0))
                frames.append(
                    {
                        "pose": pose,
                        "dir": d,
                        "x": i * CELL,
                        "y": 0,
                        "w": CELL,
                        "h": CELL,
                        "origin": {"x": 0, "y": 0},
                        "sole": 352 if SLOT[pid] == "legs" else None,
                        "flipX": False,
                        "frame": 1 if pose == "idle2" else 0,
                    }
                )
                i += 1
        atlas.save(B3 / f"{pid}.png")
        meta = {
            "id": pid,
            "slot": SLOT[pid],
            "image": f"{pid}.png",
            "cell": {"w": CELL, "h": CELL},
            "frames": frames,
            "pair": pid in PAIR,
            "registered": True,
            "no_mirror": True,
        }
        (B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        shutil.copy2(B3 / f"{pid}.png", VAULT / f"{pid}.png")
        (VAULT / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        print("packed", pid, {d: cells[d].getbbox() for d in DIRS})

    atlases = {jf.stem: json.loads(jf.read_text()) for jf in sorted(B3.glob("p*.json"))}
    (SRC / "atlases.ts").write_text("export const ATLASES = " + json.dumps(atlases, indent=2) + " as const;\n")

    # QA assemble each facing (no flip)
    preview = ROOT / "artifacts/lookdev"
    order = ["p017", "p016", "p015", "p014", "p018"]
    for di, d in enumerate(DIRS):
        out = Image.new("RGBA", (CELL, CELL), (255, 0, 255, 255))
        for pid in order:
            im = Image.open(B3 / f"{pid}.png")
            # idle row: pose 0, dir index
            x = di * CELL
            out.alpha_composite(im.crop((x, 0, x + CELL, CELL)))
        out.save(preview / f"ns-assemble-{d}.png")
        print("preview", d)


if __name__ == "__main__":
    main()
