#!/usr/bin/env python3
"""NS-grey family occupancy. Variants clip to these maps. 45A: wrists frozen."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
OCC = ROOT / "public/game/solace/occupancy"
GOLD = ROOT / "artifacts/lookdev"
CELL = 384
DIRS = ("s", "e", "n", "w")
SLOTS = ("head", "body", "legs", "armL", "armR", "hands", "wrist")
ALLOW_K = {
    "head": 31,
    "body": 11,
    "legs": 29,
    "armL": 23,
    "armR": 23,
    "hands": 11,
    "wrist": 9,
}


def dilate(m: np.ndarray, k: int) -> np.ndarray:
    k = max(1, k if k % 2 else k + 1)
    im = Image.fromarray((m.astype(np.uint8) * 255), "L")
    return np.asarray(im.filter(ImageFilter.MaxFilter(k))) > 80


def save_l(path: Path, m: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray((m.astype(np.uint8) * 255), "L").save(path)


def load_m(stem: str, slot: str) -> np.ndarray:
    p = OCC / f"{stem}_{slot}.png"
    if not p.exists():
        return np.zeros((CELL, CELL), dtype=bool)
    return np.asarray(Image.open(p).convert("L")) > 80


def arm_lr(arms: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    ys, xs = np.where(arms)
    if len(xs) < 8:
        z = np.zeros_like(arms)
        return z, z
    cx = float(xs.mean())
    xx = np.ogrid[:CELL, :CELL][1]
    left = arms & (xx <= cx + 8)
    right = arms & (xx >= cx - 8)
    return left, right


def write_dir(stem: str, masks: dict[str, np.ndarray]) -> None:
    arms = masks["arms"]
    L, R = arm_lr(arms)
    hands = masks["hands"]
    wrist = dilate(L | R, 13) & dilate(hands, 11)
    exclusive = {
        "head": masks["head"],
        "body": masks["body"],
        "legs": masks["legs"],
        "armL": L,
        "armR": R,
        "hands": hands,
        "wrist": wrist,
    }
    for slot, m in exclusive.items():
        save_l(OCC / f"{stem}_{slot}_x.png", m)
        save_l(OCC / f"{stem}_{slot}.png", dilate(m, ALLOW_K[slot]))


def other_exclusive(stem: str, slot: str) -> np.ndarray:
    skip = {"arms": {"armL", "armR", "wrist"}, "head": {"head"}, "body": {"body"}, "legs": {"legs"}, "hands": {"hands", "wrist"}}.get(slot, {slot})
    acc = np.zeros((CELL, CELL), dtype=bool)
    for s in ("head", "body", "legs", "armL", "armR", "hands"):
        if s in skip:
            continue
        p = OCC / f"{stem}_{s}_x.png"
        if p.exists():
            acc |= np.asarray(Image.open(p).convert("L")) > 80
    return acc


def clip_to_allow(im: Image.Image, stem: str, slot: str) -> Image.Image:
    a = np.asarray(im).copy()
    al = a[..., 3]
    if slot == "arms":
        allow = load_m(stem, "armL") | load_m(stem, "armR")
    else:
        allow = load_m(stem, slot)
    hit = int(((al > 40) & allow).sum())
    if slot == "head" or hit > 40:
        a[..., 3] = np.where(allow, al, 0)
    else:
        a[..., 3] = np.where(~other_exclusive(stem, slot), al, 0)
    return Image.fromarray(a, "RGBA")


def split_lr_occ(im: Image.Image, stem: str) -> dict[str, Image.Image]:
    a = np.asarray(im).copy()
    al = a[..., 3]
    out = {}
    for side, slot in (("L", "armL"), ("R", "armR")):
        allow = load_m(stem, slot)
        b = a.copy()
        b[..., 3] = np.where(allow, al, 0)
        out[side] = Image.fromarray(b, "RGBA")
    return out


def expand_head_maps() -> None:
    """S37: head allow is the dome, not the visor slit."""
    for stem in (*DIRS, "h"):
        p = OCC / f"{stem}_head_x.png"
        if not p.exists():
            continue
        x = np.asarray(Image.open(p).convert("L")) > 80
        save_l(OCC / f"{stem}_head.png", dilate(x, ALLOW_K["head"]))


def write_index() -> None:
    idx = {"family": "ns-grey", "cell": CELL, "dirs": list(DIRS), "hangar": "h", "slots": list(SLOTS), "wrists": "45A frozen"}
    OCC.mkdir(parents=True, exist_ok=True)
    (OCC / "family.json").write_text(json.dumps(idx, indent=2))
