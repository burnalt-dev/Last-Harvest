import { at, type Dungeon } from "./sim";

export function scopeRange(radar: number) {
  return Math.max(5, radar | 0);
}

function visAt(d: Dungeon, x: number, y: number) {
  if (x < 0 || y < 0 || x >= d.w || y >= d.h) return false;
  return d.vis[y * d.w + x] === 1;
}
function seenAt(d: Dungeon, x: number, y: number) {
  if (x < 0 || y < 0 || x >= d.w || y >= d.h) return false;
  return d.seen[y * d.w + x] === 1;
}

function brass(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#1a1510";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}

function paintTerrain(ctx: CanvasRenderingContext2D, tile: number, x: number, y: number, s: number) {
  ctx.fillStyle = tile === 1 ? "#162414" : tile === 3 ? "#101820" : "#243828";
  ctx.fillRect(x, y, s, s);
  if (tile === 2) {
    ctx.fillStyle = "#5ee0d0";
    ctx.fillRect(x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4);
  }
}

export function drawScope(ctx: CanvasRenderingContext2D, d: Dungeon, radar: number, now: number) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.imageSmoothingEnabled = false;
  brass(ctx, W, H);
  const range = scopeRange(radar);
  const n = range * 2 + 1;
  const cell = Math.max(4, Math.floor((Math.min(W, H) - 24) / n));
  const ox = ((W - cell * n) / 2) | 0;
  const oy = ((H - cell * n) / 2) | 0;
  ctx.fillStyle = "#0c181c";
  ctx.fillRect(ox - 2, oy - 2, cell * n + 4, cell * n + 4);
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue;
      const tx = d.px + dx;
      const ty = d.py + dy;
      const x = ox + (dx + range) * cell;
      const y = oy + (dy + range) * cell;
      ctx.fillStyle = "#102028";
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      if (visAt(d, tx, ty)) paintTerrain(ctx, at(d, tx, ty), x + 1, y + 1, cell - 2);
    }
  }
  const pulse = 0.55 + Math.sin(now / 180) * 0.35;
  for (const sh of d.shinies) {
    if (sh.taken || !visAt(d, sh.x, sh.y)) continue;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#d4a24a";
    ctx.fillRect(ox + (sh.x - d.px + range) * cell + cell * 0.3, oy + (sh.y - d.py + range) * cell + cell * 0.3, cell * 0.4, cell * 0.4);
    ctx.globalAlpha = 1;
  }
  for (const e of d.enemies) {
    if (e.hp <= 0 || !visAt(d, e.x, e.y)) continue;
    ctx.fillStyle = "#9a4030";
    ctx.beginPath();
    ctx.arc(ox + (e.x - d.px + range) * cell + cell / 2, oy + (e.y - d.py + range) * cell + cell / 2, Math.max(2, cell * 0.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#5ee0d0";
  ctx.beginPath();
  ctx.arc(ox + range * cell + cell / 2, oy + range * cell + cell / 2, Math.max(3, cell * 0.22), 0, Math.PI * 2);
  ctx.fill();
}

export function drawFloorSlate(ctx: CanvasRenderingContext2D, d: Dungeon, now: number) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.imageSmoothingEnabled = false;
  brass(ctx, W, H);
  const cell = Math.max(8, Math.floor((Math.min(W, H) - 36) / Math.max(d.w, d.h)));
  const ox = ((W - cell * d.w) / 2) | 0;
  const oy = ((H - cell * d.h) / 2) | 0;
  for (let y = 0; y < d.h; y++) {
    for (let x = 0; x < d.w; x++) {
      const px = ox + x * cell;
      const py = oy + y * cell;
      if (!seenAt(d, x, y)) {
        ctx.fillStyle = "#0a1014";
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        continue;
      }
      paintTerrain(ctx, at(d, x, y), px + 1, py + 1, cell - 2);
      if (!visAt(d, x, y)) {
        ctx.fillStyle = "rgba(12,16,20,0.45)";
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
      }
    }
  }
  const pulse = 0.55 + Math.sin(now / 180) * 0.35;
  for (const sh of d.shinies) {
    if (sh.taken || !visAt(d, sh.x, sh.y)) continue;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#d4a24a";
    ctx.fillRect(ox + sh.x * cell + 3, oy + sh.y * cell + 3, cell - 6, cell - 6);
    ctx.globalAlpha = 1;
  }
  for (const e of d.enemies) {
    if (e.hp <= 0 || !visAt(d, e.x, e.y)) continue;
    ctx.fillStyle = "#9a4030";
    ctx.beginPath();
    ctx.arc(ox + e.x * cell + cell / 2, oy + e.y * cell + cell / 2, cell * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#5ee0d0";
  ctx.beginPath();
  ctx.arc(ox + d.px * cell + cell / 2, oy + d.py * cell + cell / 2, cell * 0.22, 0, Math.PI * 2);
  ctx.fill();
}
