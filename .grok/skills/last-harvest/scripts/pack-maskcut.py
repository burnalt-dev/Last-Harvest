#!/usr/bin/env python3
"""Mask-cut north-star assemble RGB with isolate alpha. No flip, no dir copy."""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
ART = ROOT / "artifacts/imagine_images"
GOLD = ROOT / "artifacts/lookdev"
B3 = ROOT / "public/game/parts"
SRC = ROOT / "src/game/solace"
VAULT = ROOT / ".grok/skills/last-harvest/assets/solace/b3"
CELL = 384
FOOT = 352
DIRS = ("s", "e", "n", "w")
POSES = ("idle", "idle2", "walk", "fire", "grip")

LAYERS = {
    "p015": {  # head
        "s": "0dd3387a-78fd-464b-ba47-151c8231f518.jpg",
        "e": "c2987c99-0386-438a-b58a-f31135296230.jpg",
        "n": "2dded2bf-03c8-4751-9b41-cc6f4e22d649.jpg",
        "w": "da486a8e-07df-414b-8872-e72e996dce5a.jpg",
    },
    "p016": {
        "s": "7e89d49b-4172-4993-82f5-e953915e667c.jpg",
        "e": "ca8e4198-6acc-40d8-9be6-b70737ff1991.jpg",
        "n": "6d4207d7-c752-44d8-93f9-e6e41f364087.jpg",
        "w": "ca012b50-c175-49f8-b7e2-fae5d2241775.jpg",
    },
    "p017": {
        "s": "f13d7e02-f7bc-4661-9f51-731f6355dfa0.jpg",
        "e": "f2f83800-4ab0-4749-b37c-ded94f173dac.jpg",
        "n": "b01c7f0c-7fb0-42da-bdda-c70eec045b24.jpg",
        "w": "dc4d151d-695a-48d9-a746-b640254756f4.jpg",
    },
    "p014": {
        "s": "25e89c6a-5823-4bf8-817d-dfc40242b30d.jpg",
        "e": "51fe037f-acc7-4129-892b-eed5a23cd31c.jpg",
        "n": "871c5f16-1f52-4c22-916c-c16432973cfd.jpg",
        "w": "6f4f85d3-fe40-4107-afb3-65bece11ca7d.jpg",
    },
    "p018": {
        "s": "d049de3c-8206-4e24-b67d-5ecb0ab523d6.jpg",
        "e": "14f08bea-41c5-4395-a997-1eed84e4583b.jpg",
        "n": "cf590bac-7b1a-4ae3-8113-ffa4fb1bd6aa.jpg",
        "w": "085fe7c7-715e-4b22-b4e4-8faee4c46ba4.jpg",
    },
}
SLOT = {"p015": "head", "p016": "body", "p017": "legs", "p014": "arms", "p018": "hands"}
PAIR = {"p014"}

sys.path.insert(0, str(Path(__file__).resolve().parent))
from occupancy import split_lr_occ, write_dir, write_index  # noqa: E402


def key_alpha(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA").resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(im).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 160
    rose = (r > 160) & (g < 90) & (b > 40)
    a[..., 3] = np.where(mag | rose, 0, 255)
    a[a[..., 3] < 40] = [0, 0, 0, 0]
    return Image.fromarray(a, "RGBA")


def gold(d: str) -> Image.Image:
    im = Image.open(GOLD / f"northstar-{d}-384.png").convert("RGBA")
    if im.size != (CELL, CELL):
        im = im.resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(im).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 140
    a[..., 3] = np.where(mag, 0, a[..., 3])
    return Image.fromarray(a, "RGBA")


def dilate(m: np.ndarray, k: int = 9) -> np.ndarray:
    k = k if k % 2 else k + 1
    im = Image.fromarray((m.astype(np.uint8) * 255), "L")
    im = im.filter(ImageFilter.MaxFilter(k))
    return np.asarray(im) > 80


def slot_masks(g: Image.Image, d: str) -> dict[str, np.ndarray]:
    """Exclusive owners first, then a small seam dilate. Head never owns pauldron."""
    a = np.asarray(g)
    r, gc, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
    op = al > 40
    z = np.zeros((CELL, CELL), dtype=bool)
    if not op.any():
        return {k: z for k in ("head", "body", "legs", "arms", "hands")}
    ys, xs = np.where(op)
    y0 = int(ys.min())
    cy, cx = int(ys.mean()), int(xs.mean())
    yy, xx = np.ogrid[:CELL, :CELL]
    visor = op & (b > 140) & (gc > 70) & (r < 160) & (b > r) & (yy < y0 + 110)
    wood = op & (r > 85) & (gc > 50) & (b < 80) & (r > b + 15)
    yellow = op & (r > 110) & (gc > 60) & (b < 120) & (r > b + 20)
    side = {"s": -1, "e": 1, "n": 1, "w": -1}[d]
    if visor.sum() > 8:
        vxs, vys = np.where(visor)[1], np.where(visor)[0]
        vcy = int(vys.mean())
        vmin, vmax = int(vxs.min()), int(vxs.max())
        head_seed = op & (xx >= vmin - 16) & (xx <= vmax + 10) & (yy < vcy + 30) & (yy > vcy - 58)
        head_seed &= ~((yy > vcy + 4) & ((xx > vmax + 2) | (xx < vmin - 2)))
    else:
        head_seed = op & (yy < y0 + 92) & (np.abs(xx - cx) < 36)
    head_seed &= ~yellow
    far = op & ((xx - cx) * side > 55)
    hands_seed = dilate(wood, 11) | (far & (np.abs(xx - cx) > 72))
    hands_seed = hands_seed & op & ~head_seed
    legs_seed = op & (yy > FOOT - 168) & ~head_seed & ~hands_seed
    chest = op & (np.abs(xx - cx) < 40) & (yy > y0 + 82) & (yy < FOOT - 150) & ~head_seed & ~hands_seed
    pack = op & (np.abs(xx - cx) < 58) & (yy > y0 + 90) & (yy < FOOT - 140) & ~head_seed & ~hands_seed
    own = np.zeros((CELL, CELL), dtype=np.uint8)
    own[head_seed] = 1
    own[hands_seed & (own == 0)] = 2
    own[legs_seed & (own == 0)] = 4
    own[(chest | pack) & (own == 0)] = 5
    # remaining upper limb = arms (never leftover onto body)
    own[(own == 0) & op & (yy < FOOT - 90)] = 3
    own[(own == 0) & op] = 4

    def grow(bit: int, k: int) -> np.ndarray:
        return dilate(own == bit, k) & op

    head = grow(1, 3) & ~yellow
    if visor.sum() > 8:
        vmin, vmax = int(np.where(visor)[1].min()), int(np.where(visor)[1].max())
        head &= (xx >= vmin - 20) & (xx <= vmax + 14)
    hands = grow(2, 5) & ~(own == 1)
    arms = (own == 3) | (grow(3, 5) & op)
    arms &= ~(own == 1) & ~(own == 2) & ~(own == 4) & ~visor
    arms &= yy < FOOT - 90
    arms &= ~chest
    legs = grow(4, 5) & ~(own == 1) & ~(own == 2) & ~visor
    # Body keeps a seam with arms (overlap) but is hull+pack, not the scythe.
    body = grow(5, 9) & op & ~visor & ~(own == 1) & ~(own == 2)
    if visor.sum() > 8:
        vcy = int(np.where(visor)[0].mean())
        body &= yy > vcy + 8
        legs &= yy > vcy + 40
    body &= yy < FOOT - 140
    hip = op & (yy > FOOT - 185) & (yy < FOOT - 140) & ~(own == 1) & ~(own == 2)
    body = body | (hip & ~visor)
    # Shoulder seam only — not the whole limb.
    seam = op & (yy > y0 + 80) & (yy < FOOT - 160) & (np.abs(xx - cx) > 28) & (np.abs(xx - cx) < 70) & ~visor
    body = body | (seam & ~(own == 2))
    covered = head | body | legs | arms | hands
    holes = op & ~covered
    body = body | (holes & (np.abs(xx - cx) < 48) & (yy > y0 + 80) & (yy < FOOT - 140))
    arms = arms | (holes & (yy > y0 + 60) & (yy < FOOT - 90) & ~head)
    legs = legs | (holes & (yy > FOOT - 170))
    return {"head": head, "body": body, "legs": legs, "arms": arms, "hands": hands}


def gold_slot_mask(g: Image.Image, d: str, slot: str) -> np.ndarray:
    return slot_masks(g, d)[slot]


def qa_no_bleed(g: Image.Image, d: str, tag: str) -> None:
    """S25: slot must not own another slot's signature pixels."""
    a = np.asarray(g)
    r, gc, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
    visor = (al > 40) & (b > 140) & (gc > 70) & (r < 160) & (b > r)
    yellow = (al > 40) & (r > 110) & (gc > 60) & (b < 120) & (r > b + 20)
    m = slot_masks(g, d)
    head, arms, body, legs = m["head"], m["arms"], m["body"], m["legs"]
    box = np.argwhere(head)
    wide = int(box[:, 1].max() - box[:, 1].min()) if len(box) else 0
    hatch_in_head = int((head & yellow).sum())
    visor_in_arms = int((arms & visor).sum())
    visor_in_body = int((body & visor).sum())
    visor_in_legs = int((legs & visor).sum())
    yellow_in_body = int((body & yellow).sum())
    yellow_in_legs = int((legs & yellow).sum())
    share = int((head & arms).sum())
    if hatch_in_head > 25:
        raise SystemExit(f"S25 {tag} {d} head has pauldron/hatch {hatch_in_head}")
    if visor_in_arms > 20 or visor_in_body > 8 or visor_in_legs > 8:
        raise SystemExit(f"S26 {tag} {d} visor leaked arms={visor_in_arms} body={visor_in_body} legs={visor_in_legs}")
    if yellow_in_body > 80 and int((body & yellow & (np.abs(np.arange(CELL)[None, :] - CELL // 2) > 52)).sum()) > 40:
        raise SystemExit(f"S26 {tag} {d} pauldron hatch on body")
    if yellow_in_legs > 120:
        raise SystemExit(f"S26 {tag} {d} hatch on legs={yellow_in_legs}")
    if wide > 150:
        raise SystemExit(f"S25 {tag} {d} head too wide {wide}")
    if head.sum() and share / max(int(head.sum()), 1) > 0.22:
        raise SystemExit(f"S25 {tag} {d} head∩arms {share}/{int(head.sum())}")
    ys, _ = np.where(m["arms"])
    if len(ys) and int(ys.max()) > FOOT - 50:
        raise SystemExit(f"S28 {tag} {d} arms reach soles y={int(ys.max())}")
    core = (np.abs(np.arange(CELL)[None, :] - int(np.where(al > 40)[1].mean() if (al > 40).any() else CELL // 2)) < 36) & (
        np.arange(CELL)[:, None] > 90
    ) & (np.arange(CELL)[:, None] < FOOT - 160)
    if core.any() and int((m["arms"] & core).sum()) > int(core.sum()) * 0.35:
        raise SystemExit(f"S28 {tag} {d} arms cover torso core")


def visor_xy(g: Image.Image, d: str) -> tuple[int, int] | None:
    a = np.asarray(g)
    r, gc, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
    visor = (al > 40) & (b > 140) & (gc > 70) & (r < 160) & (b > r)
    if visor.sum() > 8:
        ys, xs = np.where(visor)
        return int(xs.mean()), int(ys.mean())
    m = slot_masks(g, d)["head"]
    ys, xs = np.where(m)
    if len(xs) < 8:
        return None
    return int(xs.mean()), int(ys.mean())


def alpha_xy(im: Image.Image) -> tuple[int, int] | None:
    a = np.asarray(im)
    ys, xs = np.where(a[..., 3] > 40)
    if len(xs) < 8:
        return None
    return int(xs.mean()), int(ys.mean())


def shift_im(im: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out


def align_to_anchor(im: Image.Image, src: tuple[int, int] | None, dst: tuple[int, int] | None) -> Image.Image:
    if not src or not dst:
        return im
    return shift_im(im, dst[0] - src[0], dst[1] - src[1])


def qa_head_align(a: Image.Image, b: Image.Image, tag: str) -> None:
    """S27: variant B visor sits on A’s neck."""
    aa = np.asarray(a)
    ba = np.asarray(b)

    def c(arr: np.ndarray) -> tuple[float, float] | None:
        al = arr[..., 3]
        r, g, bl = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
        visor = (al > 40) & (bl > 140) & (g > 70) & (r < 160) & (bl > r)
        ys, xs = np.where(visor if visor.sum() > 8 else al > 40)
        if len(xs) < 8:
            return None
        return float(xs.mean()), float(ys.mean())

    ca, cb = c(aa), c(ba)
    if not ca or not cb:
        raise SystemExit(f"S27 {tag} missing visor")
    dist = ((ca[0] - cb[0]) ** 2 + (ca[1] - cb[1]) ** 2) ** 0.5
    if dist > 16:
        print(f"WARN S27 {tag} head offset {dist:.1f}px A={ca} B={cb}")


def strip_magenta(a: np.ndarray) -> np.ndarray:
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = ((r > 200) & (b > 180) & (g < 130)) | ((r > 230) & (b > 230) & (g < 90))
    a[..., 3] = np.where(mag, 0, a[..., 3])
    return a


def largest_cc(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=np.uint8)
    best: list[tuple[int, int]] = []
    ys, xs = np.where(mask)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if seen[y, x]:
            continue
        stack = [(y, x)]
        seen[y, x] = 1
        pix: list[tuple[int, int]] = []
        while stack:
            cy, cx = stack.pop()
            pix.append((cy, cx))
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = 1
                    stack.append((ny, nx))
        if len(pix) > len(best):
            best = pix
    out = np.zeros_like(mask)
    for y, x in best:
        out[y, x] = True
    return out


def qa_solid(im: Image.Image, tag: str) -> None:
    """S39: one blob, no magenta leftover."""
    a = np.asarray(im)
    al = a[..., 3]
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    vis = al > 40
    mag = vis & (((r > 200) & (b > 180) & (g < 130)) | ((r > 230) & (b > 230) & (g < 90)))
    if int(mag.sum()) > 80:
        raise SystemExit(f"S39 {tag} magenta leftover {int(mag.sum())}")
    n = int(vis.sum())
    if n < 1200:
        raise SystemExit(f"S39 {tag} too sparse vis={n}")
    joined = int((vis & largest_cc(dilate(vis, 15))).sum())
    if joined < n * 0.8:
        print(f"WARN S39 {tag} split blob {joined}/{n}")


def apply_mask(g: Image.Image, m: np.ndarray) -> Image.Image:
    out = strip_magenta(np.asarray(g).copy())
    out[..., 3] = np.where(m, out[..., 3], 0)
    vis = out[..., 3] > 40
    keep = largest_cc(dilate(vis, 15))
    out[..., 3] = np.where(vis & keep, out[..., 3], 0)
    return Image.fromarray(out, "RGBA")


def cut(g: Image.Image, iso: Image.Image) -> Image.Image:
    ga = np.asarray(g)
    ia = np.asarray(iso)
    mask = np.minimum(ia[..., 3].astype(np.uint16), ga[..., 3])
    out = ga.copy()
    out[..., 3] = mask.astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    m = im.split()[-1].filter(ImageFilter.MaxFilter(3))
    im.putalpha(m)
    ga2 = np.asarray(im).copy()
    ga2[..., 3] = np.minimum(ga2[..., 3], ga[..., 3])
    return Image.fromarray(ga2, "RGBA")


B_SLOT = {"p012": "head", "p011": "body", "p013": "legs", "p019": "arms"}
B_LOCK = {
    "s": "751c5a51-4dc6-4f26-bd62-70a6f7adcc97.jpg",
    "e": "76fcd570-71db-426a-8396-9f59409b914a.jpg",
    "n": "478b8c0e-c322-401e-80a6-13c51a72fa53.jpg",
    "w": "aeab6ae9-e877-4af8-b75b-c65c6a3405c8.jpg",
}


def match_turn_height(g: Image.Image, target_h: int) -> Image.Image:
    """Soles on FOOT, visor-to-sole height matches south. Turn must not grow/shrink."""
    a = np.asarray(g)
    ys, xs = np.where(a[..., 3] > 40)
    if len(ys) < 8:
        return g
    t, f = int(ys.min()), int(ys.max())
    cx = float(xs.mean())
    h = max(8, f - t)
    s = target_h / h
    nw, nh = max(1, int(CELL * s)), max(1, int(CELL * s))
    scaled = g.resize((nw, nh), Image.Resampling.LANCZOS)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    dx = int(round(cx * (1 - s)))
    dy = int(round(FOOT - f * s))
    cell.alpha_composite(scaled, (dx, dy))
    return cell


def gold_file(stem: str, d: str) -> Image.Image:
    im = Image.open(GOLD / f"{stem}-{d}-384.png").convert("RGBA")
    if im.size != (CELL, CELL):
        im = im.resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(im).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = ((r > 200) & (b > 180) & (g < 130)) | ((r > 230) & (b > 230) & (g < 90))
    a[..., 3] = np.where(mag, 0, a[..., 3])
    return Image.fromarray(a, "RGBA")


def split_lr(im: Image.Image) -> dict[str, Image.Image]:
    """Two 384 isolates. Not a mirror. Seam overlap at the arm centroid."""
    a = np.asarray(im).copy()
    al = a[..., 3]
    ys, xs = np.where(al > 40)
    if len(xs) < 8:
        z = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        return {"L": z, "R": z}
    cx = float(xs.mean())
    yy, xx = np.ogrid[:CELL, :CELL]
    left = a.copy()
    right = a.copy()
    left[..., 3] = np.where(xx <= cx + 8, al, 0)
    right[..., 3] = np.where(xx >= cx - 8, al, 0)
    return {"L": Image.fromarray(left, "RGBA"), "R": Image.fromarray(right, "RGBA")}


def pack_pid(pid: str, slot: str, cells: dict, pair: bool, hangar: Image.Image | None = None) -> dict:
    sides = ("L", "R") if slot == "arms" else (None,)
    n = len(POSES) * len(DIRS) * len(sides) + (len(sides) if hangar is not None else 0)
    atlas = Image.new("RGBA", (CELL * n, CELL), (0, 0, 0, 0))
    frames = []
    i = 0
    for pose in POSES:
        for d in DIRS:
            pieces = split_lr_occ(cells[d], d) if slot == "arms" else {None: cells[d]}
            for side in sides:
                atlas.paste(pieces[side], (i * CELL, 0))
                fr = {
                    "pose": pose,
                    "dir": d,
                    "x": i * CELL,
                    "y": 0,
                    "w": CELL,
                    "h": CELL,
                    "origin": {"x": 0, "y": 0},
                    "sole": 352 if slot == "legs" else None,
                    "flipX": False,
                    "frame": 1 if pose == "idle2" else 0,
                }
                if side:
                    fr["side"] = side
                frames.append(fr)
                i += 1
    if hangar is not None:
        pieces = split_lr_occ(hangar, "h") if slot == "arms" else {None: hangar}
        for side in sides:
            atlas.paste(pieces[side], (i * CELL, 0))
            fr = {
                "pose": "hangar",
                "dir": "s",
                "x": i * CELL,
                "y": 0,
                "w": CELL,
                "h": CELL,
                "origin": {"x": 0, "y": 0},
                "sole": 352 if slot == "legs" else None,
                "flipX": False,
                "frame": 0,
            }
            if side:
                fr["side"] = side
            frames.append(fr)
            i += 1
    atlas.save(B3 / f"{pid}.png")
    meta = {
        "id": pid,
        "slot": slot,
        "image": f"{pid}.png",
        "cell": {"w": CELL, "h": CELL},
        "frames": frames,
        "pair": False,
        "sides": ["L", "R"] if slot == "arms" else None,
        "registered": True,
        "maskcut": True,
        "no_mirror": True,
    }
    (B3 / f"{pid}.json").write_text(json.dumps(meta, indent=2))
    shutil.copy2(B3 / f"{pid}.png", VAULT / f"{pid}.png")
    (VAULT / f"{pid}.json").write_text(json.dumps(meta, indent=2))
    return meta


def register_jpg(jpg: str, dest_stem: str) -> None:
    src = Image.open(ART / jpg).convert("RGBA")
    a = np.asarray(src).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 160
    rose = (r > 150) & (g < 90) & (b > 40)
    a[..., 3] = np.where(mag | rose, 0, 255)
    spr = Image.fromarray(a, "RGBA")
    box = spr.getbbox()
    if not box:
        raise SystemExit(f"empty hangar {jpg}")
    spr = spr.crop(box)
    s = min((CELL - 8) / spr.size[0], (FOOT - 16) / spr.size[1])
    w, h = max(1, int(spr.size[0] * s)), max(1, int(spr.size[1] * s))
    spr = spr.resize((w, h), Image.Resampling.LANCZOS)
    cell = Image.new("RGBA", (CELL, CELL), (255, 0, 255, 255))
    cell.paste(spr, (max(0, (CELL - w) // 2), FOOT - h), spr)
    cell.save(GOLD / f"{dest_stem}-s-384.png")


def register_inplace(jpg: str, dest: Path) -> None:
    """Keep the 384 framing. Never crop/recenter (that unseats B)."""
    src = Image.open(ART / jpg).convert("RGBA").resize((CELL, CELL), Image.Resampling.LANCZOS)
    a = np.asarray(src).copy()
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (np.abs(r - 255) + np.abs(b - 255) + g) < 160
    rose = (r > 150) & (g < 90) & (b > 40)
    a[..., 3] = np.where(mag | rose, 0, 255)
    Image.fromarray(a, "RGBA").save(dest)


def main() -> None:
    B3.mkdir(parents=True, exist_ok=True)
    VAULT.mkdir(parents=True, exist_ok=True)
    golds = {d: gold_file("northstar", d) for d in DIRS}
    a = np.asarray(golds["s"])
    ys = np.where(a[..., 3] > 40)[0]
    target_h = int(ys.max() - ys.min()) if len(ys) else 320
    golds = {d: match_turn_height(g, target_h) for d, g in golds.items()}
    for d, g in golds.items():
        ys = np.where(np.asarray(g)[..., 3] > 40)[0]
        h = int(ys.max() - ys.min()) if len(ys) else 0
        sole = int(ys.max()) if len(ys) else 0
        if abs(h - target_h) > 12:
            raise SystemExit(f"S34 {d} height {h} vs south {target_h}")
        if abs(sole - FOOT) > 8:
            raise SystemExit(f"S34 {d} sole {sole} vs FOOT {FOOT}")
    ha = gold_file("hangarA", "s")
    for d in DIRS:
        qa_no_bleed(golds[d], d, "lockA")
        write_dir(d, slot_masks(golds[d], d))
    qa_no_bleed(ha, "s", "hangarA")
    write_dir("h", slot_masks(ha, "s"))
    write_index()
    metas = {}
    for pid, dirs in LAYERS.items():
        cells = {}
        for d in DIRS:
            cells[d] = apply_mask(golds[d], gold_slot_mask(golds[d], d, SLOT[pid]))
        hang = apply_mask(ha, gold_slot_mask(ha, "s", SLOT[pid]))
        metas[pid] = pack_pid(pid, SLOT[pid], cells, pid in PAIR, hang)
        print(pid, {d: cells[d].getbbox() for d in DIRS}, "hangar", hang.getbbox())
    # Variants are isolate-from-isolate (pack-from-isolate.py). Do not mask-cut a second lock.

    atlases = {jf.stem: json.loads(jf.read_text()) for jf in sorted(B3.glob("p*.json"))}
    (SRC / "atlases.ts").write_text("export const ATLASES = " + json.dumps(atlases, indent=2) + " as const;\n")

    order = ["p017", "p016", "p015", "p014", "p018"]
    pub = ROOT / "public/game/lookdev"
    pub.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGB", (768, 768), (255, 0, 255))
    for di, d in enumerate(DIRS):
        out = Image.new("RGBA", (CELL, CELL), (255, 0, 255, 255))
        for pid in order:
            im = Image.open(B3 / f"{pid}.png")
            x = di * CELL
            out.alpha_composite(im.crop((x, 0, x + CELL, CELL)))
        out.save(GOLD / f"ns-assemble-{d}.png")
        sheet.paste(out.convert("RGB"), ((di % 2) * 384, (di // 2) * 384))
    sheet.save(pub / "ns-assemble-4dir.png")
    hang_preview = Image.new("RGBA", (CELL, CELL), (255, 0, 255, 255))
    for pid in order:
        meta = json.loads((B3 / f"{pid}.json").read_text())
        fr = next(f for f in meta["frames"] if f["pose"] == "hangar")
        im = Image.open(B3 / f"{pid}.png")
        hang_preview.alpha_composite(im.crop((fr["x"], 0, fr["x"] + CELL, CELL)))
    hang_preview.save(pub / "hangar-a.png")
    print("sheet")


if __name__ == "__main__":
    main()
