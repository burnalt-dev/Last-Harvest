import * as THREE from "three";

function canvas(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.imageSmoothingEnabled = false;
  draw(ctx, w, h);
  return c;
}

function texFrom(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function rivets(ctx: CanvasRenderingContext2D, w: number, h: number, step = 8) {
  for (let y = 3; y < h - 2; y += step) {
    for (let x = 3; x < w - 2; x += step) {
      ctx.fillStyle = "#2c3238";
      ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = "#c4cad0";
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export type TexKind = "plate" | "hatch" | "vents" | "stripe" | "visor" | "pack" | "dark" | "steel" | "boot" | "wood" | "blade" | "yellow" | "gasket" | "cream" | "brass" | "charcoal" | "rubber";

function paint(kind: TexKind) {
  return canvas(32, 32, (ctx, w, h) => {
    if (kind === "stripe") {
      ctx.fillStyle = "#2e343a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9a024";
      for (let i = -h; i < w + h; i += 7) {
        ctx.fillRect(i, 0, 3, h);
      }
      return;
    }
    if (kind === "visor") {
      ctx.fillStyle = "#142028";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2eb8dc";
      ctx.fillRect(2, 10, 28, 12);
      ctx.fillStyle = "#d8f6ff";
      ctx.fillRect(4, 11, 8, 3);
      ctx.fillStyle = "#0a1014";
      ctx.fillRect(0, 0, w, 2);
      ctx.fillRect(0, h - 2, w, 2);
      return;
    }
    if (kind === "wood") {
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6e4e38";
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
      ctx.fillStyle = "#3a281c";
      ctx.fillRect(0, 0, 2, h);
      return;
    }
    if (kind === "blade") {
      ctx.fillStyle = "#c8d0d6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9aa4ac";
      ctx.fillRect(0, 14, w, 4);
      ctx.fillStyle = "#eef2f4";
      ctx.fillRect(0, 2, w, 3);
      return;
    }
    if (kind === "yellow") {
      ctx.fillStyle = "#c9a024";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a88418";
      ctx.fillRect(0, 0, w, 3);
      ctx.fillStyle = "#e0c040";
      ctx.fillRect(2, 2, w - 4, 4);
      return;
    }
    if (kind === "gasket") {
      ctx.fillStyle = "#8a929a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9aa2aa";
      ctx.fillRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = "#c9a024";
      ctx.fillRect(10, 10, 12, 10);
      rivets(ctx, w, h, 10);
      return;
    }
    if (kind === "cream") {
      ctx.fillStyle = "#c8c2b4";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ece6d8";
      ctx.fillRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = "#f6f1e6";
      ctx.fillRect(4, 4, 12, 8);
      return;
    }
    if (kind === "brass") {
      ctx.fillStyle = "#6a5414";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(1, 1, w - 2, h - 3);
      ctx.fillStyle = "#e6d48a";
      ctx.fillRect(3, 2, 10, 6);
      ctx.fillStyle = "#8a7014";
      ctx.fillRect(0, h - 3, w, 3);
      return;
    }
    if (kind === "charcoal") {
      ctx.fillStyle = "#1a1e22";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2a3238";
      ctx.fillRect(1, 1, w - 2, h - 3);
      ctx.fillStyle = "#3a444c";
      ctx.fillRect(4, 3, 8, 5);
      ctx.fillStyle = "#12161a";
      ctx.fillRect(18, 14, 7, 3);
      rivets(ctx, w, h, 12);
      return;
    }
    if (kind === "rubber") {
      ctx.fillStyle = "#0c1014";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1a1614";
      ctx.fillRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = "#2a2420";
      ctx.fillRect(8, 6, 14, 3);
      return;
    }

    const base =
      kind === "dark" ? "#3a4248" :
      kind === "steel" ? "#9aa4ac" :
      kind === "boot" ? "#4a5258" :
      kind === "pack" ? "#5a626a" :
      "#7a848c";
    const hi =
      kind === "dark" ? "#4c545c" :
      kind === "steel" ? "#c4ccd2" :
      "#8e969e";
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = hi;
    ctx.fillRect(1, 1, w - 2, h - 3);
    ctx.fillStyle = "#2a3036";
    ctx.fillRect(0, h - 2, w, 2);
    ctx.fillRect(0, 0, w, 1);
    rivets(ctx, w, h, kind === "dark" ? 10 : 8);
    if (kind === "hatch") {
      ctx.fillStyle = "#c9a024";
      ctx.fillRect(9, 9, 14, 14);
      ctx.fillStyle = "#8a7014";
      ctx.fillRect(9, 9, 14, 3);
    }
    if (kind === "vents" || kind === "pack") {
      ctx.fillStyle = "#1c2228";
      for (let i = 0; i < 4; i++) ctx.fillRect(7 + i * 5, 10, 3, 12);
    }
  });
}

let ramp: THREE.Texture | null = null;
function toonRamp() {
  if (ramp) return ramp;
  ramp = texFrom(
    canvas(4, 1, (ctx) => {
      ctx.fillStyle = "#5a6268";
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = "#7e868e";
      ctx.fillRect(1, 0, 1, 1);
      ctx.fillStyle = "#a8b0b6";
      ctx.fillRect(2, 0, 1, 1);
      ctx.fillStyle = "#d0d6dc";
      ctx.fillRect(3, 0, 1, 1);
    }),
  );
  return ramp;
}

const cache = new Map<string, THREE.MeshToonMaterial>();

export function mat(kind: TexKind) {
  const hit = cache.get(kind);
  if (hit) return hit;
  const map = texFrom(paint(kind));
  const m = new THREE.MeshToonMaterial({
    map,
    gradientMap: toonRamp(),
    color: 0xffffff,
  });
  cache.set(kind, m);
  return m;
}

const outlineMat = new THREE.MeshBasicMaterial({
  color: 0x1a1612,
  side: THREE.BackSide,
});

/** Dark shell so 3D reads like the 2D 1px outline. */
export function addOutline(root: THREE.Object3D, inflate = 1.07) {
  const extras: THREE.Mesh[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.outline) return;
    const ol = new THREE.Mesh(mesh.geometry, outlineMat);
    ol.scale.setScalar(inflate);
    ol.userData.outline = true;
    extras.push(ol);
    mesh.add(ol);
  });
}
