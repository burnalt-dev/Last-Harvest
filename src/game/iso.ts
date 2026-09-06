export const TW = 156;
export const TH = 78;

export function iso(tx: number, ty: number, ox: number, oy: number) {
  return {
    x: ox + (tx - ty) * (TW / 2),
    y: oy + (tx + ty) * (TH / 2),
  };
}

export function fromIso(px: number, py: number, ox: number, oy: number) {
  const x = px - ox;
  const y = py - oy;
  const tx = (x / (TW / 2) + y / (TH / 2)) / 2;
  const ty = (y / (TH / 2) - x / (TW / 2)) / 2;
  return { tx: Math.round(tx), ty: Math.round(ty) };
}

/** 0 S down-left, 1 E down-right, 2 N up-right, 3 W up-left */
export const DIR = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

export function faceTo(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 1 : 3;
  return dy < 0 ? 2 : 0;
}

export function sheetCell(dir: number) {
  const map = [
    [0, 0],
    [1, 1],
    [1, 0],
    [0, 1],
  ];
  return map[dir] ?? map[0];
}
