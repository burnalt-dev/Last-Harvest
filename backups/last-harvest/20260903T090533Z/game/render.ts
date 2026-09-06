import { img } from "./art";
import { BIOMES } from "./data";
import { TH, TW, iso, sheetCell } from "./iso";
import { drawComposite } from "./solace/compose";
import type { Loadout } from "./parts";
import type { Dungeon, Fx } from "./sim";
import { at } from "./sim";

function drawSheet(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dir: number,
  x: number,
  y: number,
  span: number,
) {
  const [col, row] = sheetCell(dir);
  const cw = image.width / 2;
  const ch = image.height / 2;
  const dw = TW * span;
  const dh = TW * span;
  ctx.drawImage(image, col * cw, row * ch, cw, ch, x - dw / 2, y - dh * 0.78, dw, dh);
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string, stroke?: string) {
  ctx.beginPath();
  ctx.moveTo(x, y - TH / 2);
  ctx.lineTo(x + TW / 2, y);
  ctx.lineTo(x, y + TH / 2);
  ctx.lineTo(x - TW / 2, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function blitCell(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  col: number,
  row: number,
  cols: number,
  rows: number,
  x: number,
  y: number,
  dw: number,
  dh: number,
) {
  const cw = image.width / cols;
  const ch = image.height / rows;
  ctx.drawImage(image, col * cw, row * ch, cw, ch, (x - dw / 2) | 0, (y - dh * 0.62) | 0, dw, dh);
}

function fogFill(biome: Dungeon["biome"]) {
  if (biome === "forest") return "rgba(12, 28, 14, 0.82)";
  if (biome === "ruins") return "rgba(28, 24, 22, 0.8)";
  return "rgba(6, 18, 28, 0.84)";
}

function hasUnseenNeighbor(d: Dungeon, x: number, y: number) {
  return (
    (x > 0 && !d.seen[y * d.w + (x - 1)]) ||
    (x < d.w - 1 && !d.seen[y * d.w + (x + 1)]) ||
    (y > 0 && !d.seen[(y - 1) * d.w + x]) ||
    (y < d.h - 1 && !d.seen[(y + 1) * d.w + x])
  );
}

export function drawDungeon(
  ctx: CanvasRenderingContext2D,
  d: Dungeon,
  loadout: Loadout,
  fx: Fx[],
  aim: { x: number; y: number } | null,
  now = performance.now(),
) {
  const { width: W, height: H } = ctx.canvas;
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = false;
  const cam = iso(d.px, d.py, 0, 0);
  const ox = W / 2 - cam.x;
  const oy = H * 0.42 - cam.y;
  const tiles = img(`tiles/${d.biome}`);
  const fogSheet = img(`tiles/${d.biome}-fog`);
  const treeA = img("props/pr001");
  const treeB = img("props/pr002");
  const order: { x: number; y: number }[] = [];
  for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) order.push({ x, y });
  order.sort((a, b) => a.x + a.y - (b.x + b.y));
  const dw = TW * 1.35;
  const dh = TH * 2.4;

  for (const t of order) {
    const p = iso(t.x, t.y, ox, oy);
    const tile = at(d, t.x, t.y);
    const seen = d.seen[t.y * d.w + t.x];
    const vis = d.vis[t.y * d.w + t.x];
    if (!seen) {
      if (fogSheet) blitCell(ctx, fogSheet, 0, 0, 2, 1, p.x, p.y, dw, dh * 1.15);
      else diamond(ctx, p.x, p.y, fogFill(d.biome));
      continue;
    }
    if (!vis && fogSheet) {
      blitCell(ctx, fogSheet, 1, 0, 2, 1, p.x, p.y, dw, dh * 1.1);
      continue;
    }
    if (tiles) {
      const kind = tile === 1 ? 1 : tile === 3 ? 3 : tile === 2 ? 2 : 0;
      blitCell(ctx, tiles, kind % 2, Math.floor(kind / 2), 2, 2, p.x, p.y, dw, dh);
      if (vis && tile !== 1 && fogSheet && hasUnseenNeighbor(d, t.x, t.y)) {
        ctx.globalAlpha = 0.38;
        blitCell(ctx, fogSheet, 1, 0, 2, 1, p.x, p.y, dw, dh * 1.05);
        ctx.globalAlpha = 1;
      }
    } else diamond(ctx, p.x, p.y, tile === 1 ? "#2a2420" : "#3a4a38", "#6a5a40");
    if (tile === 2 && vis) {
      ctx.fillStyle = "#5ee0d0";
      ctx.fillRect(p.x - 3, p.y - 10, 6, 6);
    }
  }

  const actors: { z: number; draw: () => void }[] = [];
  if (d.biome === "forest") {
    for (const t of order) {
      if (at(d, t.x, t.y) !== 1 || !d.vis[t.y * d.w + t.x]) continue;
      const spr = (t.x + t.y) % 2 === 0 ? treeA : treeB || treeA;
      if (!spr) continue;
      actors.push({
        z: t.x + t.y + 0.15,
        draw: () => {
          const p = iso(t.x, t.y, ox, oy);
          const tw = TW * 1.05;
          const th = TW * 1.35;
          ctx.drawImage(spr, 0, 0, spr.width, spr.height, (p.x - tw / 2) | 0, (p.y - th * 0.88) | 0, tw, th);
        },
      });
    }
  }
  for (const sh of d.shinies) {
    if (sh.taken || !d.vis[sh.y * d.w + sh.x]) continue;
    actors.push({
      z: sh.x + sh.y,
      draw: () => {
        const p = iso(sh.x, sh.y, ox, oy);
        const spark = img("props/sh001");
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.sin(now / 180) * 0.3;
        if (spark) ctx.drawImage(spark, (p.x - 14) | 0, (p.y - 28) | 0, 28, 28);
        else {
          ctx.fillStyle = "#d8f6ff";
          ctx.beginPath();
          ctx.arc(p.x, p.y - 6, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      },
    });
  }
  for (const e of d.enemies) {
    if (e.hp <= 0 || !d.vis[e.y * d.w + e.x]) continue;
    actors.push({
      z: e.x + e.y + 0.2,
      draw: () => {
        const p = iso(e.x, e.y, ox, oy);
        const key = e.kind === "elite" ? "enemies/elites" : e.kind === "big" ? BIOMES[d.biome].big : BIOMES[d.biome].small;
        const spr = img(key);
        const span = e.kind !== "small" ? 1.1 : 0.55;
        if (spr) drawSheet(ctx, spr, e.dir, p.x, p.y, span);
        else diamond(ctx, p.x, p.y - 8, "#6a7a40");
      },
    });
  }
  actors.push({
    z: d.cx + d.cy + 0.3,
    draw: () => {
      const p = iso(d.mounted ? d.px : d.cx, d.mounted ? d.py : d.cy, ox, oy);
      const g = img("companion/gasket");
      if (g) drawSheet(ctx, g, 0, p.x + (d.mounted ? 18 : 0), p.y - (d.mounted ? 22 : 0), 0.42);
    },
  });
  actors.push({
    z: d.px + d.py + 0.4,
    draw: () => {
      const p = iso(d.px, d.py, ox, oy);
      drawComposite(ctx, loadout, d.pdir, p.x, p.y, 1.15, "idle", now);
    },
  });
  actors.sort((a, b) => a.z - b.z);
  for (const a of actors) a.draw();
  if (aim) {
    const p = iso(aim.x, aim.y, ox, oy);
    ctx.strokeStyle = "#5ee0d0";
    ctx.strokeRect(p.x - 10, p.y - 10, 20, 20);
  }
  for (const f of fx) {
    if (f.k === "banner") {
      ctx.fillStyle = f.good ? "#5ee0d0" : "#9a4030";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, W / 2, H * 0.3);
    }
  }
}
