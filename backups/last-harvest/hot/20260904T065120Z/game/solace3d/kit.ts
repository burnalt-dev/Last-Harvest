import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

export type KitSlot = "head" | "body" | "legs" | "arms" | "weapon";
export type Kit = { head: number; body: number; legs: number; arms: number; weapon: number };
/** Gold grey (Ivan 1, 2026-09-03). Variants must snap onto this. */
export const GOLD_GREY: Kit = { head: 0, body: 0, legs: 0, arms: 0, weapon: 0 };

export const KIT_NAMES: Record<KitSlot, string[]> = {
  head: ["visor", "dome"],
  body: ["plated", "taper"],
  legs: ["piston", "rj"],
  arms: ["crane", "stork"],
  weapon: ["scythe", "saw", "cannon"],
};

export type WanzerRig = {
  root: THREE.Group;
  mount: THREE.Object3D;
  swing: () => void;
};

function box(w: number, h: number, d: number, material: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}
function cyl(rt: number, rb: number, h: number, material: THREE.Material, seg = 8) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
}
function add(p: THREE.Object3D, m: THREE.Object3D, x: number, y: number, z: number) {
  m.position.set(x, y, z);
  p.add(m);
  return m;
}

function makeScythe(wood: THREE.Material, bladeM: THREE.Material, steel: THREE.Material) {
  const g = new THREE.Group();
  g.name = "scythe";
  const pole = cyl(0.018, 0.022, 1.15, wood, 6);
  pole.position.y = 0.15;
  g.add(pole);
  const collar = cyl(0.03, 0.03, 0.06, steel, 6);
  collar.position.y = 0.68;
  g.add(collar);
  const blade = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.035, 6, 10, Math.PI * 0.85),
    bladeM,
  );
  blade.rotation.set(Math.PI / 2, 0, Math.PI * 0.15);
  blade.position.set(-0.22, 0.7, 0);
  g.add(blade);
  const tip = box(0.04, 0.04, 0.12, bladeM);
  tip.position.set(-0.48, 0.58, 0);
  tip.rotation.z = 0.6;
  g.add(tip);
  return g;
}

export function buildWanzer(kit: Kit): WanzerRig {
  const root = new THREE.Group();
  root.name = "solace";

  const plate = texMat("plate");
  const hatch = texMat("hatch");
  const vents = texMat("vents");
  const stripe = texMat("stripe");
  const visor = texMat("visor");
  const packM = texMat("pack");
  const steel = texMat("steel");
  const dark = texMat("dark");
  const bootM = texMat("boot");
  const wood = texMat("wood");
  const bladeM = texMat("blade");
  const yellow = texMat("yellow");

  const hipY = 0.5;
  const shoulderY = 0.82;
  const neckY = 0.96;
  const taper = kit.body === 1;
  const chestW = taper ? 0.36 : 0.4;
  const chestD = 0.32;

  const legs = new THREE.Group();
  legs.name = "legs";
  add(legs, box(0.34, 0.09, 0.24, dark), 0, hipY, 0);
  const leg = (side: number, rj: boolean) => {
    const g = new THREE.Group();
    const thigh = box(0.14, rj ? 0.18 : 0.22, 0.15, plate);
    add(g, thigh, 0, hipY - 0.14, rj ? -0.03 : 0);
    if (rj) thigh.rotation.x = 0.28;
    const knee = add(g, cyl(0.05, 0.05, 0.07, steel, 8), 0, hipY - 0.26, 0);
    knee.rotation.z = Math.PI / 2;
    add(g, box(0.13, 0.2, 0.13, dark), 0, hipY - 0.36, 0);
    add(g, box(0.14, 0.05, 0.03, stripe), 0, hipY - 0.32, 0.08);
    add(g, box(0.18, 0.06, 0.26, bootM), 0, 0.03, 0.03);
    g.position.x = side * 0.11;
    return g;
  };
  legs.add(leg(-1, kit.legs === 1), leg(1, kit.legs === 1));
  root.add(legs);

  const body = new THREE.Group();
  body.name = "body";
  add(body, box(chestW, 0.3, chestD, hatch), 0, hipY + 0.18, 0);
  add(body, box(0.16, 0.07, 0.03, dark), 0, hipY + 0.12, chestD / 2 + 0.015);
  add(body, box(0.32, 0.26, 0.14, packM), 0, hipY + 0.18, -chestD / 2 - 0.08);
  const mount = new THREE.Object3D();
  mount.name = "companion_mount";
  mount.position.set(0, hipY + 0.2, -0.3);
  body.add(mount);
  root.add(body);

  const head = new THREE.Group();
  head.name = "head";
  if (kit.head === 0) {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), plate);
    helm.scale.set(1.1, 1.05, 1.08);
    helm.position.y = 0.08;
    head.add(helm);
    add(head, box(0.15, 0.04, 0.035, visor), 0, 0.08, 0.11);
  } else {
    add(head, box(0.2, 0.16, 0.2, plate), 0, 0.08, 0);
    add(head, box(0.13, 0.035, 0.035, visor), 0, 0.09, 0.11);
  }
  head.position.set(0, neckY, 0.02);
  root.add(head);

  const swingRig = new THREE.Group();
  swingRig.name = "swingRig";
  swingRig.position.set(0, shoulderY, 0);
  root.add(swingRig);

  const makeArm = (side: number) => {
    const g = new THREE.Group();
    g.name = side < 0 ? "armL" : "armR";
    const stork = kit.arms === 1;
    const thick = stork ? 0.1 : 0.17;
    const upperLen = stork ? 0.36 : 0.28;
    const faLen = stork ? 0.4 : 0.3;

    add(g, box(stork ? 0.16 : 0.24, stork ? 0.13 : 0.2, stork ? 0.16 : 0.24, plate), 0, 0, 0);
    add(g, box(stork ? 0.14 : 0.22, 0.05, 0.05, stripe), 0, 0.02, stork ? 0.1 : 0.14);

    const upper = new THREE.Group();
    const ua = box(thick, upperLen, thick, dark);
    ua.position.y = -upperLen / 2;
    upper.add(ua);
    const elbow = cyl(thick * 0.55, thick * 0.55, thick * 0.7, steel, 8);
    elbow.rotation.z = Math.PI / 2;
    elbow.position.y = -upperLen;
    upper.add(elbow);
    g.add(upper);

    const fore = new THREE.Group();
    fore.position.y = -upperLen;
    const fa = box(thick * 0.88, faLen, thick * 0.88, plate);
    fa.position.set(0, -faLen / 2, 0.03);
    fore.add(fa);
    if (stork) {
      const mid = cyl(0.035, 0.035, 0.14, steel, 6);
      mid.position.set(0, -faLen * 0.45, 0);
      fore.add(mid);
    }
    const fist = box(0.13, 0.1, 0.13, bootM);
    fist.position.set(0, -faLen - 0.04, 0.05);
    fore.add(fist);
    const hand = new THREE.Object3D();
    hand.position.copy(fist.position);
    fore.add(hand);
    upper.add(fore);

    // Hang outside the chest, slightly toward camera so the limb isn't buried.
    g.position.set(side * (chestW / 2 + 0.18), 0, 0.12);
    return { g, upper, fore, hand };
  };
  const L = makeArm(-1);
  const R = makeArm(1);
  swingRig.add(L.g, R.g);

  const wpn = new THREE.Group();
  wpn.name = "weapon";
  let scythe: THREE.Group | null = null;

  const idleG = (side: number) => new THREE.Euler(0.45, 0, side * 0.18);
  const reachG = (side: number) => new THREE.Euler(0.85, side * 0.12, side * 0.38);
  const idleFore = 0.55;
  const reachFore = 0.15;

  L.g.rotation.copy(idleG(-1));
  R.g.rotation.copy(idleG(1));
  L.fore.rotation.x = idleFore;
  R.fore.rotation.x = idleFore;

  if (kit.weapon === 0) {
    scythe = makeScythe(wood, bladeM, steel);
    scythe.position.set(0.28, -0.5, 0.22);
    scythe.rotation.set(0.35, 0.5, -0.4);
    swingRig.add(scythe);
  } else if (kit.weapon === 1) {
    add(wpn, box(0.04, 0.07, 0.26, bladeM), R.g.position.x + 0.04, -0.46, 0.16);
    add(wpn, box(0.05, 0.28, 0.16, vents), L.g.position.x - 0.12, -0.2, 0.04);
    add(wpn, box(0.02, 0.04, 0.04, yellow), L.g.position.x - 0.15, -0.12, 0.04);
    swingRig.add(wpn);
  } else {
    const barrel = cyl(0.04, 0.055, 0.32, steel, 8);
    barrel.rotation.x = Math.PI / 2;
    add(wpn, barrel, R.g.position.x, -0.4, 0.18);
    const ring = cyl(0.035, 0.035, 0.04, yellow, 8);
    ring.rotation.x = Math.PI / 2;
    add(wpn, ring, R.g.position.x, -0.4, 0.34);
    swingRig.add(wpn);
  }

  addOutline(root, 1.06);

  const sm = (t: number) => t * t * (3 - 2 * t);
  const lerpE = (out: THREE.Euler, a: THREE.Euler, b: THREE.Euler, t: number) => {
    out.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  };

  let swinging = false;
  const swing = () => {
    if (swinging || kit.weapon !== 0 || !scythe) return;
    swinging = true;
    const t0 = performance.now();
    const dur = 720;
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      let grip = 0;
      let cut = 0;
      if (u < 0.18) {
        grip = sm(u / 0.18);
      } else if (u < 0.62) {
        grip = 1;
        cut = sm((u - 0.18) / 0.44);
      } else {
        const r = sm((u - 0.62) / 0.38);
        grip = 1 - r;
        cut = 1 - r;
      }
      lerpE(L.g.rotation, idleG(-1), reachG(-1), grip);
      lerpE(R.g.rotation, idleG(1), reachG(1), grip);
      L.fore.rotation.x = idleFore + (reachFore - idleFore) * grip;
      R.fore.rotation.x = idleFore + (reachFore - idleFore) * grip;
      // Harvest: wind to his right, sweep across the front, blade stays low.
      swingRig.rotation.set(0.28 * Math.sin(cut * Math.PI), 0.85 - cut * 2.15, 0.12 * (1 - cut));
      if (u < 1) requestAnimationFrame(tick);
      else {
        L.g.rotation.copy(idleG(-1));
        R.g.rotation.copy(idleG(1));
        L.fore.rotation.x = idleFore;
        R.fore.rotation.x = idleFore;
        swingRig.rotation.set(0, 0, 0);
        swinging = false;
      }
    };
    requestAnimationFrame(tick);
  };

  return { root, mount, swing };
}
