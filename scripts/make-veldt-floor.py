#!/usr/bin/env python3
"""Veldt-9 2x2 iso diamond floor. Dirt lanes + sparse moss. No baked fog."""
from PIL import Image
import random

CW, CH = 256, 128
COLS, ROWS = 2, 2
OUT = "/workspace/public/game/tiles/forest.png"

rng = random.Random(9)


def diamond_mask(pad=2):
    m = [[0] * CW for _ in range(CH)]
    cx, cy = (CW - 1) / 2, (CH - 1) / 2
    hw, hh = CW / 2 - pad, CH / 2 - pad
    for y in range(CH):
        for x in range(CW):
            nx = abs(x - cx) / hw
            ny = abs(y - cy) / hh
            m[y][x] = 1 if nx + ny <= 1.0 else 0
    return m


def edge(mask):
    e = [[0] * CW for _ in range(CH)]
    for y in range(CH):
        for x in range(CW):
            if not mask[y][x]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if xx < 0 or yy < 0 or xx >= CW or yy >= CH or not mask[yy][xx]:
                    e[y][x] = 1
                    break
    return e


def rim(mask, depth=7):
    d = [[99] * CW for _ in range(CH)]
    q = []
    for y in range(CH):
        for x in range(CW):
            if not mask[y][x]:
                continue
            border = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if xx < 0 or yy < 0 or xx >= CW or yy >= CH or not mask[yy][xx]:
                    border = True
                    break
            if border:
                d[y][x] = 0
                q.append((x, y))
    i = 0
    while i < len(q):
        x, y = q[i]
        i += 1
        nd = d[y][x] + 1
        if nd > depth:
            continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            xx, yy = x + dx, y + dy
            if 0 <= xx < CW and 0 <= yy < CH and mask[yy][xx] and nd < d[yy][xx]:
                d[yy][xx] = nd
                q.append((xx, yy))
    return d


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def jitter(c, n=8):
    return tuple(max(0, min(255, c[i] + rng.randint(-n, n))) for i in range(3))


def paint(kind):
    mask = diamond_mask(2)
    outline = edge(mask)
    dist = rim(mask, 10)
    img = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    px = img.load()
    cx, cy = CW // 2, CH // 2
    moss_budget = int(sum(sum(r) for r in mask) * 0.18)
    moss = 0
    for y in range(CH):
        for x in range(CW):
            if not mask[y][x]:
                continue
            if outline[y][x]:
                px[x, y] = (22, 16, 12, 255)
                continue
            grain = rng.random()
            d = dist[y][x]
            # distance from diamond tips (corners)
            tip = min(
                abs(x - 4) + abs(y - cy) * 2,
                abs(x - (CW - 5)) + abs(y - cy) * 2,
                abs(x - cx) * 2 + abs(y - 3),
                abs(x - cx) * 2 + abs(y - (CH - 4)),
            )
            if kind == "path":
                base = (138, 110, 74)
                if grain < 0.22:
                    base = (122, 96, 64)
                elif grain > 0.82:
                    base = (158, 128, 88)
                if d <= 1:
                    base = lerp(base, (176, 148, 104), 0.35)
                c = jitter(base, 6)
            elif kind == "undergrowth":
                base = (86, 80, 64)
                if grain < 0.3:
                    base = (74, 78, 66)
                elif grain > 0.85:
                    base = (98, 90, 70)
                cool = lerp(base, (70, 78, 68), 0.4)
                c = jitter(cool, 5)
                if tip < 38 and moss < moss_budget and rng.random() < 0.55:
                    c = jitter((78, 92, 58) if rng.random() < 0.5 else (62, 76, 48), 4)
                    moss += 1
            elif kind == "pit":
                well = (28, 20, 16)
                if d >= 8:
                    c = jitter(well, 4)
                elif d >= 4:
                    c = jitter((48, 34, 26), 5)
                elif d >= 2:
                    c = jitter((92, 70, 48), 4)  # rim highlight
                else:
                    c = jitter((58, 44, 32), 4)
                # thorn nubs near rim
                if 2 <= d <= 5 and rng.random() < 0.08:
                    c = (42, 32, 26)
            else:  # seam / scar
                base = (106, 88, 66)
                if grain < 0.25:
                    base = (92, 76, 56)
                c = jitter(base, 6)
                if d <= 3:
                    c = lerp(c, (58, 42, 28), 0.7)  # umber seam
                # cracked grey harvest-yard scar in the belly
                dx, dy = x - cx, y - cy
                if abs(dx) < 40 and abs(dy) < 16:
                    scar = (92, 90, 86)
                    t = 1 - (abs(dx) / 40 + abs(dy) / 16) * 0.5
                    c = lerp(c, scar, 0.45 * t)
                    if abs(dy) <= 1 or (abs(dx) % 13 == 0 and abs(dy) < 10):
                        c = (48, 42, 38)
            px[x, y] = (*c, 255)
    return img


sheet = Image.new("RGBA", (CW * COLS, CH * ROWS), (0, 0, 0, 0))
sheet.paste(paint("path"), (0, 0))
sheet.paste(paint("undergrowth"), (CW, 0))
sheet.paste(paint("pit"), (0, CH))
sheet.paste(paint("seam"), (CW, CH))
sheet.save(OUT, "PNG")
print("wrote", OUT, sheet.size)
