import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

export type KitSlot = "head" | "body" | "legs" | "arms" | "weapon";
export type Kit = { head: number; body: number; legs: number; arms: number; weapon: number };

/** Gold: Concepts 1 Labor + farmer-cut build. Civilian FM, not marine. */
export const GOLD_GREY: Kit = { head: 0, body: 0, legs: 0, arms: 0, weapon: 0 };

export const KIT_NAMES: Record<KitSlot, string[]> = {
  head: ["slit", "dome"],
  body: ["labor", "taper"],
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

/** Farmer scythe: long snath, big crescent. Blade at +X end. */
function makeScythe(wood: THREE.Material, bladeM: THREE.Material, steel: THREE.Material) {
  const g = new THREE.Group();
  g.name = "scythe";
  const pole = cyl(0.016, 0.02, 1.28, wood, 6);
  pole.rotation.z = Math.PI / 2;
  g.add(pole);
  add(g, cyl(0.028, 0.028, 0.05, steel, 6), 0.58, 0, 0);
  const blade = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.032, 6, 12, Math.PI * 0.92),
    bladeM,
  );
  blade.rotation.set(Math.PI / 2, Math.PI * 0.15, 0);
  blade.position.set(0.58, 0.02, -0.18);
  g.add(blade);
  const tip = box(0.05, 0.04, 0.14, bladeM);
  tip.position.set(0.42, 0.02, -0.48);
  tip.rotation.y = 0.5;
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

  const hipY = 0.46;
  const shoulderY = 0.78;
  const neckY = 0.93;
  const taper = kit.body === 1;
  const chestW = taper ? 0.3 : 0.34;
  const chestD = 0.26;

  const legs = new THREE.Group();
  legs.name = "legs";
  add(legs, box(0.28, 0.07, 0.2, dark), 0, hipY, 0);
  const leg = (side: number, rj: boolean) => {
    const g = new THREE.Group();
    const thigh = box(0.11, rj ? 0.16 : 0.2, 0.12, plate);
    add(g, thigh, 0, hipY - 0.12, rj ? -0.02 : 0);
    if (rj) thigh.rotation.x = 0.32;
    const knee = add(g, cyl(0.04, 0.04, 0.07, steel, 8), 0, hipY - 0.24, 0);
    knee.rotation.z = Math.PI / 2;
    add(g, box(0.1, 0.18, 0.1, dark), 0, hipY - 0.34, 0);
    add(g, box(0.11, 0.04, 0.025, stripe), 0, hipY - 0.3, 0.06);
    add(g, box(0.14, 0.05, 0.22, bootM), 0, 0.03, 0.04);
    g.position.x = side * 0.1;
    return g;
  };
  legs.add(leg(-1, kit.legs === 1), leg(1, kit.legs === 1));
  root.add(legs);

  const body = new THREE.Group();
  body.name = "body";
  add(body, box(chestW, 0.28, chestD, hatch), 0, hipY + 0.16, 0);
  add(body, box(chestW * 0.72, 0.08, chestD * 0.9, plate), 0, hipY + 0.02, 0);
  add(body, box(0.12, 0.06, 0.025, dark), 0, hipY + 0.14, chestD / 2 + 0.012);
  add(body, box(0.28, 0.24, 0.16, packM), 0, hipY + 0.18, -chestD / 2 - 0.09);
  add(body, box(0.1, 0.04, 0.04, yellow), 0, hipY + 0.3, -chestD / 2 - 0.09);
  const mount = new THREE.Object3D();
  mount.name = "companion_mount";
  mount.position.set(0, hipY + 0.22, -0.32);
  body.add(mount);
  root.add(body);

  const head = new THREE.Group();
  head.name = "head";
  if (kit.head === 0) {
    add(head, box(0.16, 0.07, 0.16, dark), 0, 0, 0);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), plate);
    helm.scale.set(1.05, 0.95, 1.05);
    helm.position.y = 0.08;
    head.add(helm);
    add(head, box(0.12, 0.035, 0.03, visor), 0, 0.08, 0.09);
  } else {
    add(head, box(0.18, 0.14, 0.18, plate), 0, 0.07, 0);
    add(head, box(0.11, 0.03, 0.03, visor), 0, 0.08, 0.1);
  }
  head.position.set(0, neckY, 0.02);
  root.add(head);

  const swingRig = new THREE.Group();
  swingRig.name = "swingRig";
  swingRig.position.set(0, shoulderY, 0);
  root.add(swingRig);

  const arms = new THREE.Group();
  arms.name = "arms";
  swingRig.add(arms);

  const makeArm = (side: number) => {
    const g = new THREE.Group();
    g.name = side < 0 ? "armL" : "armR";
    const stork = kit.arms === 1;
    const thick = stork ? 0.08 : 0.11;
    const upperLen = stork ? 0.34 : 0.26;
    const faLen = stork ? 0.36 : 0.28;

    add(g, box(stork ? 0.13 : 0.16, stork ? 0.1 : 0.12, stork ? 0.13 : 0.16, plate), 0, 0, 0);
    add(g, box(stork ? 0.12 : 0.15, 0.035, 0.035, stripe), 0, 0.01, stork ? 0.08 : 0.1);

    const upper = new THREE.Group();
    const ua = box(thick, upperLen, thick, dark);
    ua.position.y = -upperLen / 2;
    upper.add(ua);
    const elbow = cyl(thick * 0.5, thick * 0.5, thick * 0.65, steel, 8);
    elbow.rotation.z = Math.PI / 2;
    elbow.position.y = -upperLen;
    upper.add(elbow);
    g.add(upper);

    const fore = new THREE.Group();
    fore.position.y = -upperLen;
    const fa = box(thick * 0.85, faLen, thick * 0.85, plate);
    fa.position.set(0, -faLen / 2, 0.02);
    fore.add(fa);
    const fist = box(0.1, 0.08, 0.1, bootM);
    fist.position.set(0, -faLen - 0.03, 0.04);
    fore.add(fist);
    const hand = new THREE.Object3D();
    hand.position.copy(fist.position);
    fore.add(hand);
    upper.add(fore);

    g.position.set(side * (chestW / 2 + 0.12), 0, 0.06);
    return { g, upper, fore, hand };
  };
  const L = makeArm(-1);
  const R = makeArm(1);
  arms.add(L.g, R.g);

  const wpn = new THREE.Group();
  wpn.name = "weapon";
  let scythe: THREE.Group | null = null;

  // Farmer idle: both fists on a pole that crosses the hips, blade out to +X.
  const idleG = (side: number) => new THREE.Euler(0.72, side * 0.08, side * 0.42);
  const reachG = (side: number) => new THREE.Euler(0.95, side * 0.12, side * 0.55);
  const idleFore = 0.35;
  const reachFore = 0.12;

  L.g.rotation.copy(idleG(-1));
  R.g.rotation.copy(idleG(1));
  L.fore.rotation.x = idleFore;
  R.fore.rotation.x = idleFore;

  if (kit.weapon === 0) {
    scythe = makeScythe(wood, bladeM, steel);
    scythe.position.set(0.04, -0.46, 0.16);
    scythe.rotation.set(0.15, 0.55, -0.2);
    swingRig.add(scythe);
  } else if (kit.weapon === 1) {
    add(wpn, box(0.035, 0.06, 0.24, bladeM), 0.16, -0.48, 0.14);
    add(wpn, box(0.05, 0.24, 0.14, vents), -0.2, -0.22, 0.04);
    swingRig.add(wpn);
  } else {
    const barrel = cyl(0.035, 0.05, 0.3, steel, 8);
    barrel.rotation.x = Math.PI / 2;
    add(wpn, barrel, 0.16, -0.42, 0.16);
    swingRig.add(wpn);
  }

  addOutline(root, 1.05);

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
      if (u < 0.18) grip = sm(u / 0.18);
      else if (u < 0.62) {
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
      swingRig.rotation.set(0.2 * Math.sin(cut * Math.PI), 0.7 - cut * 1.9, 0.08 * (1 - cut));
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
