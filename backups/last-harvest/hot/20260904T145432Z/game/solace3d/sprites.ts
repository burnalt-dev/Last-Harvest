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

/** Iso diamond tile as a standing sprite (legacy). Prefer loadGroundIso. */
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
