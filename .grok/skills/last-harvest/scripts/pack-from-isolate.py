#!/usr/bin/env python3
"""Pack a variant from isolate-from-isolate jpgs. Same 384 as the source id. No crop."""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
B3 = ROOT / "public/game/parts"
SRC = ROOT / "src/game/solace"
VAULT = ROOT / "backups/last-harvest/hot/latest/public/game/parts"
CELL = 384
SLOT_OF = {"p019": "arms", "p013": "legs", "p011": "body", "p012": "head"}

sys.path.insert(0, str(Path(__file__).resolve().parent))
from occupancy import clip_to_allow, dilate, expand_head_maps, load_m  # noqa: E402

ISO = ROOT / "artifacts/lookdev/isolates"

VARIANTS = {
    "p012": {
        "from": "hangar",
        "no_clip": True,
        "idle": {
            "s": "022b15a2-fc13-4ed2-b4d0-86238a314c97.jpg",
            "e": "cc62a4b2-2a78-43df-a5ec-29bfc9ea55f3.jpg",
            "n": "16921d2c-5095-4fa4-8a16-2ead2cbac555.jpg",
            "w": "0b415dcb-1b10-4720-ac03-53d0720d7670.jpg",
        },
        "hangar": ISO / "p012_hangar.png",
    },
}


def occ_xy(stem: str, slot: str = "head") -> tuple[int, int] | None:
    m = load_m(stem, slot)
    ys, xs = np.where(m)
    if len(xs) < 8:
        return None
    return int(xs.mean()), int(ys.mean())


def visor_width(im: Image.Image) -> int:
    a = np.asarray(im)
    r, g, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
    visor = (al > 40) & (b > 140) & (g > 70) & (r < 160) & (b > r)
    xs = np.where(visor)[1]
    if len(xs) < 4:
        return 0
    return int(xs.max() - xs.min())


def load_cell(src: str | Path) -> Image.Image:
    p = Path(src)
    if p.suffix.lower() == ".png" and p.exists():
        im = Image.open(p).convert("RGBA")
        if im.size != (CELL, CELL):
            im = im.resize((CELL, CELL), Image.Resampling.LANCZOS)
        return im
    return inplace(str(p.name) if p.suffix == ".jpg" else src)


def qa_head(pid: str, d: str, cell: Image.Image) -> None:
    bb = cell.getbbox()
    h = (bb[3] - bb[1]) if bb else 0
    w = (bb[2] - bb[0]) if bb else 0
    if h < 20 or h > 140:
        raise SystemExit(f"S35 {pid} {d} head h={h} {bb}")
    if w < 36:
        raise SystemExit(f"S37 {pid} {d} head cropped to visor w={w}")
    vw = visor_width(cell)
    if d == "n" and vw > 80:
        print(f"WARN S36 {pid} north visor-like vw={vw}")
    if d == "w" and vw > 80:
        print(f"WARN S36 {pid} {d} visor-like vw={vw}")


def visor_xy(im: Image.Image) -> tuple[int, int] | None:
    a = np.asarray(im)
    r, g, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
    visor = (al > 40) & (b > 140) & (g > 70) & (r < 160) & (b > r)
    ys, xs = np.where(visor if visor.sum() > 8 else al > 40)
    if len(xs) < 8:
        return None
    return int(xs.mean()), int(ys.mean())


def shift_to(im: Image.Image, src: tuple[int, int] | None, dst: tuple[int, int] | None) -> Image.Image:
    if not src or not dst:
        return im
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.alpha_composite(im, (dst[0] - src[0], dst[1] - src[1]))
    return out


def inplace(jpg: str) -> Image.Image:
    src = Image.open(ART / jpg).convert("RGBA").resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(src).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 160
    rose = (r > 150) & (g < 90) & (b > 40)
    a[..., 3] = np.where(mag | rose, 0, 255)
    return Image.fromarray(a, "RGBA")


def main() -> None:
    B3.mkdir(parents=True, exist_ok=True)
    expand_head_maps()
    for pid, spec in VARIANTS.items():
        slot = SLOT_OF[pid]
        hang_im = load_cell(spec["hangar"])
        hang_anchor = visor_xy(hang_im) or occ_xy("h", "head")
        hang_a = np.asarray(hang_im)[..., 3] > 40
        dome = dilate(hang_a, 25)
        cells = {}
        for d, src in spec["idle"].items():
            im = load_cell(src)
            seated = shift_to(im, visor_xy(im), hang_anchor)
            a = np.asarray(seated).copy()
            a[..., 3] = np.where(dome, a[..., 3], 0)
            seated = Image.fromarray(a, "RGBA")
            cells[d] = seated if spec.get("no_clip") else clip_to_allow(seated, d, slot)
        hang = hang_im if spec.get("no_clip") else clip_to_allow(hang_im, "h", slot)
        if slot == "head":
            for d, cell in cells.items():
                qa_head(pid, d, cell)
        order = [("idle", d) for d in ("s", "e", "n", "w")]
        atlas = Image.new("RGBA", (CELL * len(order), CELL), (0, 0, 0, 0))
        frames = []
        for i, (pose, d) in enumerate(order):
            cell = cells[d]
            atlas.paste(cell, (i * CELL, 0))
            frames.append({"pose": pose, "dir": d, "x": i * CELL, "y": 0, "w": CELL, "h": CELL, "origin": {"x": 0, "y": 0}, "flipX": False, "frame": 0})
        atlas.save(B3 / f"{pid}.png")
        meta = {"id": pid, "slot": slot, "image": f"{pid}.png", "frames": frames, "from_isolate": spec["from"], "no_mirror": True}
        (B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
        print(pid, {d: cells[d].getbbox() for d in cells})
    atlases = {jf.stem: json.loads(jf.read_text()) for jf in sorted(B3.glob("p*.json"))}
    (SRC / "atlases.ts").write_text("export const ATLASES = " + json.dumps(atlases, indent=2) + " as const;\n")


if __name__ == "__main__":
    main()
