import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

export type KitSlot = "head" | "body" | "legs" | "arms" | "weapon";
export type Kit = { head: number; body: number; legs: number; arms: number; weapon: number };

/** Gold: Labor 1 + farmer-cut. Sit: solace-gold. */
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

function makeScythe(wood: THREE.Material, bladeM: THREE.Material, steel: THREE.Material, dark: THREE.Material) {
  const g = new THREE.Group();
  g.name = "scythe";
  const pole = cyl(0.016, 0.022, 1.28, wood, 7);
  pole.rotation.z = Math.PI / 2;
  g.add(pole);
  add(g, cyl(0.026, 0.026, 0.14, dark, 6), -0.08, 0, 0).rotation.z = Math.PI / 2;
  add(g, cyl(0.026, 0.026, 0.14, dark, 6), 0.18, 0, 0).rotation.z = Math.PI / 2;
  add(g, cyl(0.03, 0.03, 0.05, steel, 6), 0.58, 0, 0);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const a = t * Math.PI * 0.95;
    pts.push(new THREE.Vector3(0.56 + Math.sin(a) * 0.06, 0.01, -0.02 - Math.sin(a) * 0.34 - t * 0.08));
  }
  const blade = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.028, 5, false),
    bladeM,
  );
  g.add(blade);
  const edge = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => p.clone().add(new THREE.Vector3(0, 0, -0.03)))), 14, 0.012, 4, false),
    steel,
  );
  g.add(edge);
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
  add(legs, box(0.24, 0.06, 0.16, dark), 0, hipY, 0);
  const hip = cyl(0.05, 0.05, 0.22, steel, 8);
  hip.rotation.z = Math.PI / 2;
  add(legs, hip, 0, hipY, 0);
  const leg = (side: number, rj: boolean) => {
    const g = new THREE.Group();
    const thigh = cyl(0.055, 0.045, rj ? 0.16 : 0.2, plate, 8);
    add(g, thigh, 0, hipY - 0.12, rj ? -0.03 : 0);
    if (rj) thigh.rotation.x = 0.35;
    const knee = add(g, cyl(0.042, 0.042, 0.07, steel, 8), 0, hipY - 0.23, 0);
    knee.rotation.z = Math.PI / 2;
    const shin = cyl(0.04, 0.048, 0.18, dark, 8);
    add(g, shin, 0, hipY - 0.34, 0);
    add(g, box(0.09, 0.035, 0.02, stripe), 0, hipY - 0.3, 0.05);
    const foot = box(0.13, 0.045, 0.22, bootM);
    add(g, foot, 0, 0.025, 0.05);
    add(g, box(0.14, 0.03, 0.06, steel), 0, 0.02, -0.06);
    g.position.x = side * 0.1;
    return g;
  };
  legs.add(leg(-1, kit.legs === 1), leg(1, kit.legs === 1));
  root.add(legs);

  const body = new THREE.Group();
  body.name = "body";
  body.rotation.x = 0.08;
  add(body, box(chestW * 0.78, 0.1, chestD * 0.9, plate), 0, hipY + 0.04, 0);
  add(body, box(chestW, 0.26, chestD, hatch), 0, hipY + 0.18, 0);
  add(body, box(0.1, 0.05, 0.02, dark), 0, hipY + 0.16, chestD / 2 + 0.012);
  const collar = cyl(0.09, 0.1, 0.05, dark, 8);
  add(body, collar, 0, neckY - 0.06, 0.02);
  add(body, box(0.3, 0.26, 0.18, packM), 0, hipY + 0.18, -chestD / 2 - 0.1);
  add(body, box(0.22, 0.06, 0.16, dark), 0, hipY + 0.32, -chestD / 2 - 0.1);
  add(body, box(0.08, 0.03, 0.03, yellow), 0, hipY + 0.34, -chestD / 2 - 0.18);
  const mount = new THREE.Object3D();
  mount.name = "companion_mount";
  mount.position.set(0, hipY + 0.22, -0.34);
  body.add(mount);
  root.add(body);

  const head = new THREE.Group();
  head.name = "head";
  if (kit.head === 0) {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), plate);
    helm.scale.set(1.08, 0.92, 1.1);
    helm.position.y = 0.06;
    head.add(helm);
    add(head, box(0.13, 0.038, 0.028, visor), 0, 0.07, 0.095);
    add(head, box(0.04, 0.02, 0.03, dark), 0, 0.13, 0);
  } else {
    add(head, box(0.17, 0.14, 0.17, plate), 0, 0.06, 0);
    add(head, box(0.11, 0.03, 0.028, visor), 0, 0.07, 0.09);
  }
  head.position.set(0, neckY, 0.03);
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
    const thick = stork ? 0.045 : 0.052;
    const upperLen = stork ? 0.34 : 0.26;
    const faLen = stork ? 0.36 : 0.28;

    add(g, cyl(stork ? 0.07 : 0.085, stork ? 0.07 : 0.085, stork ? 0.1 : 0.12, plate, 8), 0, 0, 0);
    add(g, box(stork ? 0.12 : 0.14, 0.03, 0.03, stripe), 0, 0.01, stork ? 0.07 : 0.09);

    const upper = new THREE.Group();
    const ua = cyl(thick, thick * 0.9, upperLen, dark, 8);
    ua.position.y = -upperLen / 2;
    upper.add(ua);
    const elbow = cyl(thick * 1.15, thick * 1.15, 0.055, steel, 8);
    elbow.rotation.z = Math.PI / 2;
    elbow.position.y = -upperLen;
    upper.add(elbow);
    g.add(upper);

    const fore = new THREE.Group();
    fore.position.y = -upperLen;
    const fa = cyl(thick * 0.85, thick * 0.75, faLen, plate, 8);
    fa.position.set(0, -faLen / 2, 0.015);
    fore.add(fa);
    const fist = box(0.09, 0.075, 0.09, bootM);
    fist.position.set(0, -faLen - 0.02, 0);
    fore.add(fist);
    const hand = new THREE.Object3D();
    hand.position.copy(fist.position);
    fore.add(hand);
    upper.add(fore);

    g.position.set(side * (chestW / 2 + 0.14), 0, 0.05);
    return { g, upper, fore, hand, upperLen, faLen };
  };
  const L = makeArm(-1);
  const R = makeArm(1);
  arms.add(L.g, R.g);

  const wpn = new THREE.Group();
  wpn.name = "weapon";
  let scythe: THREE.Group | null = null;

  /** Aim -Y chain at a point in swingRig space. Elbow folds toward +Z (camera). */
  const reach = (
    arm: { g: THREE.Group; fore: THREE.Group; upperLen: number; faLen: number },
    target: THREE.Vector3,
    side: number,
  ) => {
    arm.g.rotation.set(0, 0, 0);
    arm.fore.rotation.set(0, 0, 0);
    const shoulder = arm.g.position.clone();
    const to = target.clone().sub(shoulder);
    let d = to.length();
    const maxd = arm.upperLen + arm.faLen - 0.03;
    const mind = Math.abs(arm.upperLen - arm.faLen) + 0.03;
    d = Math.min(maxd, Math.max(mind, d));
    const ul = arm.upperLen;
    const fl = arm.faLen;
    const elbow = Math.acos(Math.min(1, Math.max(-1, (ul * ul + fl * fl - d * d) / (2 * ul * fl))));
    const k = (ul * ul - fl * fl + d * d) / (2 * d);
    const dir = to.clone().normalize();
    const pole = new THREE.Vector3(side * 0.25, 0.15, 1);
    const n = new THREE.Vector3().crossVectors(dir, pole);
    if (n.lengthSq() < 1e-8) n.set(side, 0, 0);
    n.normalize();
    const bin = new THREE.Vector3().crossVectors(dir, n);
    const ang = Math.acos(Math.min(1, Math.max(-1, k / ul)));
    const upperDir = dir.clone().multiplyScalar(Math.cos(ang)).addScaledVector(bin, Math.sin(ang));
    arm.g.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), upperDir.normalize());
    arm.fore.rotation.x = -(Math.PI - elbow);
  };

  if (kit.weapon === 0) {
    scythe = makeScythe(wood, bladeM, steel, dark);
    const gripL = new THREE.Vector3(-0.34, -0.45, 0.16);
    const gripR = new THREE.Vector3(0.38, -0.42, 0.12);
    const mid = gripL.clone().add(gripR).multiplyScalar(0.5);
    const axis = gripR.clone().sub(gripL).normalize();
    scythe.position.copy(mid);
    scythe.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), axis);
    swingRig.add(scythe);
    reach(L, gripL, -1);
    reach(R, gripR, 1);
  } else if (kit.weapon === 1) {
    add(wpn, box(0.035, 0.06, 0.24, bladeM), 0.16, -0.48, 0.14);
    add(wpn, box(0.05, 0.22, 0.14, vents), -0.18, -0.24, 0.04);
    swingRig.add(wpn);
    reach(R, new THREE.Vector3(0.16, -0.48, 0.14), 1);
    reach(L, new THREE.Vector3(-0.18, -0.28, 0.08), -1);
  } else {
    const barrel = cyl(0.032, 0.048, 0.28, steel, 8);
    barrel.rotation.x = Math.PI / 2;
    add(wpn, barrel, 0.16, -0.42, 0.16);
    swingRig.add(wpn);
    reach(R, new THREE.Vector3(0.16, -0.42, 0.14), 1);
    reach(L, new THREE.Vector3(-0.12, -0.3, 0.06), -1);
  }

  addOutline(root, 1.045);

  const slashMat = new THREE.MeshBasicMaterial({
    color: 0xd4f4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const slash = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 1.55, 20, 1, 0, Math.PI * 1.05),
    slashMat,
  );
  slash.name = "slash";
  slash.rotation.set(-1.05, 0, 0.2);
  slash.position.set(0, -0.32, 0.55);
  slash.visible = false;
  swingRig.add(slash);

  let swinging = false;
  const swing = () => {
    if (swinging || kit.weapon !== 0) return;
    swinging = true;
    const t0 = performance.now();
    const dur = 820;
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      let yaw = 0;
      let pitch = 0;
      let flash = 0;
      if (u < 0.16) {
        const w = u / 0.16;
        yaw = 1.35 * w;
        pitch = 0.18 * w;
      } else if (u < 0.58) {
        const c = (u - 0.16) / 0.42;
        yaw = 1.35 - c * 2.85;
        pitch = 0.18 + Math.sin(c * Math.PI) * 0.22;
        flash = Math.sin(c * Math.PI);
      } else {
        const r = (u - 0.58) / 0.42;
        yaw = -1.5 * (1 - r);
        pitch = 0.18 * (1 - r);
        flash = Math.max(0, 1 - r * 2);
      }
      swingRig.rotation.set(pitch, yaw, 0.04 * Math.sin(u * Math.PI));
      slash.visible = flash > 0.02;
      slashMat.opacity = 0.15 + flash * 0.7;
      slash.scale.setScalar(0.85 + flash * 0.55);
      if (u < 1) requestAnimationFrame(tick);
      else {
        swingRig.rotation.set(0, 0, 0);
        slash.visible = false;
        slashMat.opacity = 0;
        swinging = false;
      }
    };
    requestAnimationFrame(tick);
  };

  return { root, mount, swing };
}
