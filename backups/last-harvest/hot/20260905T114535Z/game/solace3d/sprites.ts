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

/**
 * 3/4 iso hanger diamond **on the ground**. Vertices tessellate with `isoCell`
 * (crate feet = center). Texture is the 2:1 Veldt blit, not a top-down plate.
 * S59: never `THREE.Sprite` for the deck — billboards cannot share edges.
 */
export function hangerCell(kind: "pad" | "plate" | "grate") {
  const w = 192;
  const h = 96;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const cx = w / 2;
  const cy = h / 2;
  const hw = w / 2 - 2;
  const hh = h / 2 - 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fillStyle = kind === "pad" ? "#3e4850" : kind === "grate" ? "#1c2228" : "#2c343c";
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = kind === "pad" ? "#2a3238" : "#22282e";
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh + 6);
  ctx.lineTo(cx + hw - 8, cy);
  ctx.lineTo(cx, cy + hh - 6);
  ctx.lineTo(cx - hw + 8, cy);
  ctx.closePath();
  ctx.fill();
  if (kind === "pad") {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy);
    ctx.lineTo(cx + 36, cy);
    ctx.moveTo(cx, cy - 18);
    ctx.lineTo(cx, cy + 18);
    ctx.stroke();
    ctx.strokeStyle = "#5ee0d0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + 24, cy);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 24, cy);
    ctx.closePath();
    ctx.stroke();
  }
  if (kind === "grate") {
    ctx.strokeStyle = "#3a444c";
    ctx.lineWidth = 1;
    for (let i = -hw + 8; i < hw; i += 8) {
      ctx.beginPath();
      ctx.moveTo(cx + i, cy - hh);
      ctx.lineTo(cx + i + hh, cy + hh);
      ctx.stroke();
    }
  }
  ctx.fillStyle = "#c4cad0";
  for (const [dx, dy] of [
    [0, -hh + 8],
    [hw - 10, 0],
    [0, hh - 8],
    [-hw + 10, 0],
  ] as const) {
    ctx.fillRect(cx + dx - 1, cy + dy - 1, 2, 2);
  }
  ctx.restore();
  ctx.strokeStyle = kind === "pad" ? "#c9a227" : "rgba(230, 220, 180, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    0.5, 0, 0, 0, 0, 0.5, -0.5, 0, 0, 0, 0, -0.5,
  ]);
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([1, 0.5, 0.5, 0, 0, 0.5, 0.5, 1]), 2),
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
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

/**
 * FM3 / Veldt plant: **diamond pack** so 3/4 sprites tessellate.
 * World (x,z) = ((tx-ty)*0.5, (tx+ty)*0.5). Neighbor = one diamond.
 * S58: wanzer **faces that neighbor** (`ISO_YAW`). Do not use axis `{x:tx,z:ty}`
 * with 3/4 sprites (double-iso / crab walk).
 */
export function isoCell(tx: number, ty: number) {
  return {
    x: (tx - ty) * 0.5,
    z: (tx + ty) * 0.5,
  };
}

/** Visor = local +Z. Face the iso neighbor (S down-left … W up-left). */
export const ISO_YAW = [-Math.PI / 4, Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4];

/** Shared XZ occupancy diamond (S59). One geo for the Veldt floor. */
export function isoDiamondGeo() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([0.5, 0, 0, 0, 0, 0.5, -0.5, 0, 0, 0, 0, -0.5]), 3),
  );
  geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([1, 0.5, 0.5, 0, 0, 0.5, 0.5, 1]), 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.computeVertexNormals();
  return geo;
}

export function isoDiamondMesh(tex: THREE.Texture) {
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(isoDiamondGeo(), mat);
}

export async function sliceSheet(url: string, cols: number, rows: number) {
  const img = await loadImage(url);
  const punched = punchMagenta(img);
  const cw = punched.width / cols;
  const ch = punched.height / rows;
  const out: THREE.CanvasTexture[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("canvas");
      cell.width = cw;
      cell.height = ch;
      cell.getContext("2d")!.drawImage(punched, col * cw, row * ch, cw, ch, 0, 0, cw, ch);
      const tex = new THREE.CanvasTexture(cell);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      out.push(tex);
    }
  }
  return out;
}

