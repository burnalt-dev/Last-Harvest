import { statsOf } from "./data";
import { at, type Dungeon, type Pilot } from "./sim";

/** Manhattan diamond HUD + full-floor slate. last-harvest-radar. */

export function drawRadar(ctx: CanvasRenderingContext2D, d: Dungeon, pilot: Pilot) {
  const r = statsOf(pilot).radar;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = "#12181e";
  ctx.fillRect(0, 0, W, H);
  const cell = Math.min(W, H) / (r * 2 + 1);
  const cx = W / 2;
  const cy = H / 2;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > r) continue;
      const x = d.px + dx;
      const y = d.py + dy;
      const px = cx + dx * cell;
      const py = cy + dy * cell;
      const vis = x >= 0 && y >= 0 && x < d.w && y < d.h && d.vis[y * d.w + x];
      const walk = vis && at(d, x, y) === 0;
      ctx.fillStyle = vis ? (walk ? "#3a4a38" : "#1a2218") : "#0a0d10";
      ctx.fillRect(px - cell / 2 + 1, py - cell / 2 + 1, cell - 2, cell - 2);
      if (vis && d.shinies.some((s) => !s.taken && s.x === x && s.y === y)) {
        ctx.fillStyle = "#d8f6ff";
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
      if (vis && d.enemies.some((e) => e.hp > 0 && e.x === x && e.y === y)) {
        ctx.fillStyle = "#9a4030";
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.fillStyle = "#5ee0d0";
  ctx.fillRect(cx - 3, cy - 3, 6, 6);
  ctx.fillStyle = "#c9a227";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`R${r}`, W / 2, H - 6);
}

export function drawFloorMap(ctx: CanvasRenderingContext2D, d: Dungeon) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = "#0c1014";
  ctx.fillRect(0, 0, W, H);
  const cell = Math.min(W / d.w, H / d.h);
  const ox = (W - d.w * cell) / 2;
  const oy = (H - d.h * cell) / 2;
  for (let y = 0; y < d.h; y++) {
    for (let x = 0; x < d.w; x++) {
      const vis = d.seen[y * d.w + x];
      const t = at(d, x, y);
      ctx.fillStyle = !vis ? "#0a0d10" : t === 1 ? "#1a2218" : t === 2 ? "#5ee0d0" : "#3a4a38";
      ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
      if (vis && d.shinies.some((s) => !s.taken && s.x === x && s.y === y)) {
        ctx.fillStyle = "#d8f6ff";
        ctx.fillRect(ox + x * cell + cell / 2 - 2, oy + y * cell + cell / 2 - 2, 4, 4);
      }
      if (vis && d.enemies.some((e) => e.hp > 0 && e.x === x && e.y === y)) {
        ctx.fillStyle = "#9a4030";
        ctx.fillRect(ox + x * cell + cell / 2 - 3, oy + y * cell + cell / 2 - 3, 6, 6);
      }
    }
  }
  ctx.fillStyle = "#5ee0d0";
  ctx.fillRect(ox + d.px * cell + cell / 2 - 4, oy + d.py * cell + cell / 2 - 4, 8, 8);
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = "#8a9aa4";
  ctx.fillText("you  walk  wall  foe  bloom", 8, H - 8);
}
