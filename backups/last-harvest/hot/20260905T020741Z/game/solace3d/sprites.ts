import * as THREE from "three";

function punchMagenta(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const p = data.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i]!, g = p[i + 1]!, b = p[i + 2]!;
    if (r > 200 && b > 180 && g < 140) p[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function cropAlpha(src: HTMLCanvasElement) {
  const ctx = src.getContext("2d");
  if (!ctx) return src;
  const data = ctx.getImageData(0, 0, src.width, src.height).data;
  let x0 = src.width, y0 = src.height, x1 = 0, y1 = 0;
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      if (data[(y * src.width + x) * 4 + 3]! > 40) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 <= x0) return src;
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")!.drawImage(src, x0, y0, w, h, 0, 0, w, h);
  return out;
}

function spriteFromCanvas(canvas: HTMLCanvasElement, height: number) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const spr = new THREE.Sprite(mat);
  const aspect = canvas.width / Math.max(1, canvas.height);
  spr.scale.set(height * aspect, height, 1);
  spr.center.set(0.5, 0);
  return spr;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(url));
    img.src = url;
  });
}

export async function loadBillboard(url: string, height: number) {
  const img = await loadImage(url);
  return spriteFromCanvas(cropAlpha(punchMagenta(img)), height);
}

/** One dungeon floor cell (forest.png is 2×2). Same blit as render.ts. */
export async function loadDungeonCell(url: string, col = 0, row = 0, cols = 2, rows = 2) {
  const img = await loadImage(url);
  const punched = punchMagenta(img);
  const cw = punched.width / cols;
  const ch = punched.height / rows;
  const cell = document.createElement("canvas");
  cell.width = cw;
  cell.height = ch;
  cell.getContext("2d")!.drawImage(punched, col * cw, row * ch, cw, ch, 0, 0, cw, ch);
  const canvas = cropAlpha(cell);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const spr = new THREE.Sprite(mat);
  const aspect = canvas.height / Math.max(1, canvas.width);
  spr.scale.set(1, aspect, 1);
  spr.center.set(0.5, 0);
  return spr;
}

/** Flat hanger diamond on y=0. Vertices tessellate with isoCell. Crate stands at the center. */
export function hangerTile(kind: "pad" | "plate" | "grate") {
  const w = 64;
  const h = 64;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = kind === "pad" ? "#3e4850" : kind === "grate" ? "#1a2026" : "#2a3238";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = kind === "pad" ? "#2e363c" : "#22282e";
  ctx.fillRect(4, 4, w - 8, h - 8);
  if (kind === "grate") {
    ctx.strokeStyle = "#3a444c";
    ctx.lineWidth = 1;
    for (let i = 6; i < w; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 4);
      ctx.lineTo(i, h - 4);
      ctx.stroke();
    }
  }
  if (kind === "pad") {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, h / 2);
    ctx.lineTo(w - 12, h / 2);
    ctx.moveTo(w / 2, 12);
    ctx.lineTo(w / 2, h - 12);
    ctx.stroke();
    ctx.strokeStyle = "#5ee0d0";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 24, 24);
  }
  for (let y = 6; y < h - 4; y += 14) {
    for (let x = 6; x < w - 4; x += 14) {
      ctx.fillStyle = "#2c3238";
      ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = "#c4cad0";
      ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.strokeStyle = kind === "pad" ? "#c9a227" : "rgba(230, 220, 180, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide });
  const s = new THREE.Shape();
  s.moveTo(0, 0.5);
  s.lineTo(0.5, 0);
  s.lineTo(0, -0.5);
  s.lineTo(-0.5, 0);
  s.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  return mesh;
}

export async function loadIsoTile(url: string, width = 1) {
  const img = await loadImage(url);
  const canvas = cropAlpha(punchMagenta(img));
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: true });
  const spr = new THREE.Sprite(mat);
  const aspect = canvas.height / Math.max(1, canvas.width);
  spr.scale.set(width, width * aspect, 1);
  spr.center.set(0.5, 0);
  return spr;
}

/** Flat iso diamond on y=0. Not a standing sprite. */
export async function loadGroundIso(url: string) {
  const img = await loadImage(url);
  const canvas = cropAlpha(punchMagenta(img));
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  return mesh;
}

/** 2:1 iso cell center. */
export function isoCell(tx: number, ty: number) {
  return {
    x: (tx - ty) * 0.5,
    z: (tx + ty) * 0.5,
  };
}
