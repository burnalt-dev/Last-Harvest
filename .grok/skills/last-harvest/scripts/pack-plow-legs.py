#!/usr/bin/env python3
"""p017 grey plow legs. Identity = concept 4. Soles on FOOT. One slot."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
B3 = ROOT / "public/game/parts"
SRC = ROOT / "src/game/solace"
OCC = ROOT / "public/game/solace/occupancy"
CELL = 384
FOOT = 352
PID = "p017"

from occupancy import dilate, save_l  # noqa: E402
pm_path = Path(__file__).resolve().parent / "pack-maskcut.py"
spec = importlib.util.spec_from_file_location("pm", pm_path)
pm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pm)

IDLE = {
    "s": "32f54ef3-faa7-45e4-8439-d6711036f66f.jpg",
    "e": "8cb0f563-9f20-403b-92cd-a5edbce73240.jpg",
    "n": "c9c5c4b5-5be9-435b-bf1f-9eeb182b48e4.jpg",
    "w": "1b150548-2f2e-47fa-85dd-1ce8f7f7aaca.jpg",
}
LOCK = "n"


def load_jpg(name: str) -> Image.Image:
    src = Image.open(ART / name).convert("RGBA").resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(src).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 160
    a[..., 3] = np.where(mag, 0, 255)
    return Image.fromarray(a, "RGBA")


def clean_legs(im: Image.Image) -> Image.Image:
    a = pm.strip_magenta(np.asarray(im).copy())
    yy = np.ogrid[:CELL, :CELL][0]
    vis = (a[..., 3] > 40) & (yy > 80)
    keep = pm.largest_cc(pm.dilate(vis, 15))
    a[..., 3] = np.where(vis & keep, a[..., 3], 0)
    return Image.fromarray(a, "RGBA")


def plant(im: Image.Image, target_h: int | None, cx: int | None) -> Image.Image:
    bb = im.getbbox()
    if not bb:
        return im
    h = max(8, bb[3] - bb[1])
    cell = im
    if target_h and abs(h - target_h) > 6:
        s = target_h / h
        nw, nh = max(1, int(CELL * s)), max(1, int(CELL * s))
        scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
        tmp = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        tmp.alpha_composite(scaled, ((CELL - nw) // 2, CELL - nh))
        cell = tmp
        bb = cell.getbbox()
        h = max(8, bb[3] - bb[1])
    dx = (cx - (bb[0] + bb[2]) // 2) if cx is not None else 0
    dy = FOOT - bb[3]
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.alpha_composite(cell, (dx, dy))
    return out


def ncc_alpha(a: Image.Image, b: Image.Image) -> float:
    A = (np.asarray(a)[..., 3] > 40).astype(np.float64)
    B = (np.asarray(b)[..., 3] > 40).astype(np.float64)
    A -= A.mean()
    B -= B.mean()
    den = float(np.sqrt((A * A).sum() * (B * B).sum()) + 1e-6)
    return float((A * B).sum() / den)


def yellow_frac(im: Image.Image) -> float:
    a = np.asarray(im)
    al = a[..., 3] > 40
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    y = al & (r > 140) & (g > 90) & (b < 90)
    n = int(al.sum())
    return int(y.sum()) / max(1, n)


def ur_frac(im: Image.Image) -> float:
    bb = im.getbbox()
    if not bb:
        return 0.0
    a = np.asarray(im)[..., 3] > 40
    mx = (bb[0] + bb[2]) // 2
    my = (bb[1] + bb[3]) // 2
    ur = int(a[bb[1] : my, mx : bb[2]].sum())
    tot = int(a[bb[1] : bb[3], bb[0] : bb[2]].sum())
    return ur / max(1, tot)


def write_occ(stem: str, im: Image.Image) -> None:
    m = np.asarray(im)[..., 3] > 40
    save_l(OCC / f"{stem}_legs_x.png", m)
    save_l(OCC / f"{stem}_legs.png", dilate(m, 29))


def main() -> None:
    B3.mkdir(parents=True, exist_ok=True)
    OCC.mkdir(parents=True, exist_ok=True)
    raw = {d: clean_legs(load_jpg(j)) for d, j in IDLE.items()}
    lbb = raw[LOCK].getbbox()
    target_h = lbb[3] - lbb[1]
    cells = {d: Image.fromarray(pm.strip_magenta(np.asarray(plant(im, target_h, None)).copy()), "RGBA") for d, im in raw.items()}
    vis_lock = int((np.asarray(cells[LOCK])[..., 3] > 40).sum())
    y_lock = yellow_frac(cells[LOCK])
    for d, c in cells.items():
        pm.qa_solid(c, f"{PID} {d}")
        bb = c.getbbox()
        if abs(bb[3] - FOOT) > 6:
            raise SystemExit(f"S33 {PID} {d} sole {bb[3]} != {FOOT}")
        vis = int((np.asarray(c)[..., 3] > 40).sum())
        if d != LOCK and (vis < vis_lock * 0.7 or vis > vis_lock * 1.35):
            raise SystemExit(f"S40 {PID} {d} vis {vis} vs lock {LOCK} {vis_lock} — new mesh?")
        if d == "e" and "s" in cells and ur_frac(c) < ur_frac(cells["s"]) + 0.04:
            print(f"WARN S41 {PID} east ur={ur_frac(c):.3f} s={ur_frac(cells['s']):.3f}")
        if d in ("e", "w") and yellow_frac(c) < y_lock * 0.45:
            raise SystemExit(f"S42 {PID} {d} lost yellow {yellow_frac(c):.3f} vs lock {y_lock:.3f}")
    write_occ(d, c)
    idle_dirs = [d for d in ("s", "e", "n", "w") if d in cells]
    order = [("idle", d) for d in idle_dirs]
    atlas = Image.new("RGBA", (CELL * len(order), CELL), (0, 0, 0, 0))
    frames = []
    for i, (pose, d) in enumerate(order):
        cell = cells[d]
        atlas.paste(cell, (i * CELL, 0))
        frames.append(
            {
                "pose": pose,
                "dir": d,
                "x": i * CELL,
                "y": 0,
                "w": CELL,
                "h": CELL,
                "origin": {"x": 0, "y": 0},
                "sole": FOOT,
                "flipX": False,
                "frame": 0,
            }
        )
    atlas.save(B3 / f"{PID}.png")
    meta = {"id": PID, "slot": "legs", "image": f"{PID}.png", "frames": frames, "no_mirror": True, "kind": "plow", "pass": "sn"}
    (B3 / f"{PID}.json").write_text(json.dumps(meta, indent=2))
    atlases = {jf.stem: json.loads(jf.read_text()) for jf in sorted(B3.glob("p*.json"))}
    (SRC / "atlases.ts").write_text("export const ATLASES = " + json.dumps(atlases, indent=2) + " as const;\n")
    sheet = Image.new("RGBA", (CELL * 2, CELL), (255, 0, 255, 255))
    sheet.paste(cells["s"], (0, 0))
    sheet.paste(cells["n"], (CELL, 0))
    coh = ROOT / "artifacts/lookdev/cohesion"
    coh.mkdir(parents=True, exist_ok=True)
    sheet.save(coh / f"{PID}_sn.png")
    pub = ROOT / "public/game/lookdev"
    pub.mkdir(parents=True, exist_ok=True)
    sheet.save(pub / "legs-sn.png")
    print(PID, "pass", idle_dirs, {d: cells[d].getbbox() for d in cells})


if __name__ == "__main__":
    main()
