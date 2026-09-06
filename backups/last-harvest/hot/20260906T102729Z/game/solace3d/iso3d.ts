import * as THREE from "three";

/**
 * Bay / Drop plant. No biome fetches. Drop tile loaders stay in sprites.ts.
 * S58/S59: occupancy XZ diamonds. Never THREE.Sprite for the deck.
 */

/**
 * 3/4 iso hanger diamond **on the ground**. Vertices tessellate with `isoCell`
 * (crate feet = center). Texture is the 2:1 blit, not a top-down plate.
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
  const geo = isoDiamondGeo();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0;
  return mesh;
}

/**
 * FM3 / Veldt plant: **diamond pack** so 3/4 sprites tessellate.
 * World (x,z) = ((tx-ty)*0.5, (tx+ty)*0.5). Neighbor = one diamond.
 */
export function isoCell(tx: number, ty: number) {
  return {
    x: (tx - ty) * 0.5,
    z: (tx + ty) * 0.5,
  };
}

/** ¼-square plant. Shared by Gasket + small foes. `sub` 0..3 = SW/SE/NW/NE of the tile. */
export function subCell(tx: number, ty: number, sub = 0) {
  const ox = (sub % 2) * 0.46 - 0.23;
  const oy = (Math.floor(sub / 2) % 2) * 0.46 - 0.23;
  return isoCell(tx + ox, ty + oy);
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
