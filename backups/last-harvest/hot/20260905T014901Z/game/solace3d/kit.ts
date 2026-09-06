import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

export type KitSlot = "head" | "body" | "legs" | "arms" | "weapon";
export type Kit = { head: number; body: number; legs: number; arms: number; weapon: number };

/** Gold: Labor 1 + farmer-cut. Sit: solace-gold. */
export const GOLD_GREY: Kit = { head: 0, body: 0, legs: 0, arms: 0, weapon: 0 };

/** Local units before bay scale. Lock: solace-gold. Bay sliders override until Ivan locks. */
export type GoldSit = {
  chestW: number;
  chestD: number;
  chestH: number;
  hipY: number;
  shoulderY: number;
  neckY: number;
  upperLen: number;
  faLen: number;
  thick: number;
  snath: number;
  grip: number;
  scale: number;
};

export const GOLD_SIT: GoldSit = {
  chestW: 0.4,
  chestD: 0.3,
  chestH: 0.2,
  hipY: 0.36,
  shoulderY: 0.62,
  neckY: 0.74,
  upperLen: 0.22,
  faLen: 0.24,
  thick: 0.062,
  snath: 1.28,
  grip: 0.42,
  scale: 0.48,
};

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
  tick: (now: number) => void;
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
/** Flattened can — labor hull, not a crate slab. squashZ 1 = round. */
function plump(rt: number, rb: number, h: number, squashZ: number, material: THREE.Material, seg = 10) {
  const m = cyl(rt, rb, h, material, seg);
  m.scale.z = squashZ;
  return m;
}
function boot(bootM: THREE.Material, steel: THREE.Material) {
  const g = new THREE.Group();
  const sole = cyl(0.055, 0.07, 0.16, bootM, 8);
  sole.rotation.x = Math.PI / 2;
  sole.position.set(0, 0.028, 0.04);
  g.add(sole);
  const toe = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), bootM);
  toe.scale.set(1.05, 0.5, 1.15);
  toe.position.set(0, 0.03, 0.12);
  g.add(toe);
  const heel = cyl(0.05, 0.055, 0.04, steel, 8);
  heel.rotation.x = Math.PI / 2;
  heel.position.set(0, 0.02, -0.05);
  g.add(heel);
  return g;
}

function makeScythe(wood: THREE.Material, bladeM: THREE.Material, steel: THREE.Material, dark: THREE.Material, snathLen: number) {
  const g = new THREE.Group();
  g.name = "scythe";
  const snath = cyl(0.013, 0.017, snathLen, wood, 8);
  snath.rotation.z = Math.PI / 2;
  g.add(snath);
  const wrap = snathLen / 1.28;
  add(g, cyl(0.02, 0.02, 0.12, dark, 6), -0.12 * wrap, 0, 0).rotation.z = Math.PI / 2;
  add(g, cyl(0.02, 0.02, 0.12, dark, 6), 0.16 * wrap, 0, 0).rotation.z = Math.PI / 2;
  const fx = snathLen * (0.6 / 1.28);
  const ferrule = cyl(0.02, 0.02, 0.04, steel, 8);
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.set(fx, 0, 0);
  g.add(ferrule);
  const weld = box(0.055, 0.03, 0.045, steel);
  weld.position.set(fx, 0, 0.012);
  g.add(weld);

  // Tang at shape origin = ferrule. Mild hook, not a floating C.
  const knife = new THREE.Shape();
  knife.moveTo(-0.012, 0);
  knife.lineTo(0.024, 0);
  knife.quadraticCurveTo(0.055, 0.14, 0.042, 0.34);
  knife.quadraticCurveTo(0.02, 0.44, -0.008, 0.46);
  knife.quadraticCurveTo(-0.032, 0.2, -0.012, 0);
  knife.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(knife, { depth: 0.012, bevelEnabled: false, steps: 1 }),
    bladeM,
  );
  blade.name = "blade";
  blade.rotation.set(Math.PI / 2, 0, 0);
  blade.position.set(fx, 0.006, 0);
  g.add(blade);
  return g;
}

export function buildWanzer(kit: Kit, sit: GoldSit = GOLD_SIT): WanzerRig {
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

  const hipY = sit.hipY;
  const shoulderY = sit.shoulderY;
  const neckY = sit.neckY;
  const taper = kit.body === 1;
  const chestW = taper ? sit.chestW * 0.9 : sit.chestW;
  const chestD = sit.chestD;
  const chestH = sit.chestH;

  const legs = new THREE.Group();
  legs.name = "legs";
  add(legs, plump(0.14, 0.15, 0.08, 0.72, dark, 10), 0, hipY, 0);
  const hip = cyl(0.06, 0.06, 0.26, steel, 8);
  hip.rotation.z = Math.PI / 2;
  add(legs, hip, 0, hipY, 0);
  const leg = (side: number, rj: boolean) => {
    const g = new THREE.Group();
    const thigh = cyl(0.065, 0.055, rj ? 0.13 : 0.16, plate, 8);
    add(g, thigh, 0, hipY - 0.1, rj ? -0.03 : 0);
    if (rj) thigh.rotation.x = 0.35;
    const knee = add(g, cyl(0.05, 0.05, 0.07, steel, 8), 0, hipY - 0.18, 0);
    knee.rotation.z = Math.PI / 2;
    const shin = cyl(0.05, 0.058, 0.14, dark, 8);
    add(g, shin, 0, hipY - 0.27, 0);
    add(g, box(0.11, 0.04, 0.025, stripe), 0, hipY - 0.24, 0.06);
    add(g, boot(bootM, steel), 0, 0, 0);
    g.position.x = side * 0.12;
    return g;
  };
  legs.add(leg(-1, kit.legs === 1), leg(1, kit.legs === 1));
  root.add(legs);

  const body = new THREE.Group();
  body.name = "body";
  body.rotation.x = 0.08;
  add(body, plump(chestW * 0.38, chestW * 0.4, chestH * 0.5, chestD / chestW, plate), 0, hipY + 0.04, 0);
  add(body, plump(chestW * 0.48, chestW * 0.42, chestH, (chestD / chestW) * 0.92, hatch), 0, hipY + chestH * 0.7, 0);
  add(body, plump(0.055, 0.05, 0.02, 0.4, dark, 8), 0, hipY + 0.13, chestD / 2 + 0.01);
  const collar = cyl(0.1, 0.11, 0.045, dark, 8);
  add(body, collar, 0, neckY - 0.05, 0.02);
  add(body, plump(0.16, 0.15, 0.18, 0.7, packM), 0, hipY + 0.14, -chestD / 2 - 0.1);
  add(body, plump(0.11, 0.1, 0.05, 0.75, dark), 0, hipY + 0.24, -chestD / 2 - 0.1);
  add(body, plump(0.04, 0.04, 0.025, 0.7, yellow, 6), 0, hipY + 0.25, -chestD / 2 - 0.18);
  const mount = new THREE.Object3D();
  mount.name = "companion_mount";
  mount.position.set(0, hipY + 0.16, -0.36);
  body.add(mount);
  root.add(body);

  const head = new THREE.Group();
  head.name = "head";
  if (kit.head === 0) {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), plate);
    helm.scale.set(1.08, 0.92, 1.1);
    helm.position.y = 0.06;
    head.add(helm);
    add(head, box(0.13, 0.038, 0.028, visor), 0, 0.07, 0.095).name = "visor";
    add(head, box(0.04, 0.02, 0.03, dark), 0, 0.13, 0);
  } else {
    add(head, box(0.17, 0.14, 0.17, plate), 0, 0.06, 0);
    add(head, box(0.11, 0.03, 0.028, visor), 0, 0.07, 0.09).name = "visor";
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
    const thick = stork ? sit.thick * 0.84 : sit.thick;
    const upperLen = stork ? sit.upperLen * 1.27 : sit.upperLen;
    const faLen = stork ? sit.faLen * 1.25 : sit.faLen;

    add(g, cyl(stork ? 0.08 : 0.1, stork ? 0.08 : 0.1, stork ? 0.09 : 0.11, plate, 8), 0, 0, 0);
    add(g, box(stork ? 0.14 : 0.16, 0.035, 0.035, stripe), 0, 0.01, stork ? 0.08 : 0.1);

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

    g.position.set(side * (chestW / 2 + 0.15), 0, 0.05);
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

  let gripL = new THREE.Vector3(-sit.grip, -0.32, 0.36);
  let gripR = new THREE.Vector3(sit.grip + 0.02, -0.3, 0.32);
  if (kit.weapon === 0) {
    scythe = makeScythe(wood, bladeM, steel, dark, sit.snath);
    const mid = gripL.clone().add(gripR).multiplyScalar(0.5);
    const xAxis = gripR.clone().sub(gripL).normalize();
    let zAxis = new THREE.Vector3(0, -0.35, 1);
    zAxis.addScaledVector(xAxis, -zAxis.dot(xAxis)).normalize();
    const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
    zAxis.crossVectors(xAxis, yAxis).normalize();
    if (zAxis.z < 0) {
      zAxis.negate();
      yAxis.negate();
    }
    if (yAxis.y < 0) {
      yAxis.negate();
      zAxis.negate();
    }
    const basis = new THREE.Matrix4();
    basis.makeBasis(xAxis, yAxis, zAxis);
    scythe.position.copy(mid);
    scythe.quaternion.setFromRotationMatrix(basis);
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
    color: 0xc8f4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const bladeMesh = scythe ? (scythe.getObjectByName("blade") as THREE.Mesh) : null;
  let glow: THREE.Mesh | null = null;
  if (scythe && bladeMesh) {
    glow = bladeMesh.clone();
    glow.material = slashMat;
    glow.name = "slash";
    glow.scale.set(1.06, 1.06, 1.5);
    glow.visible = false;
    glow.renderOrder = 8;
    scythe.add(glow);
  }

  const ghosts: THREE.Mesh[] = [];
  const clearGhosts = () => {
    for (const gho of ghosts) {
      gho.parent?.remove(gho);
      (gho.material as THREE.Material).dispose();
    }
    ghosts.length = 0;
  };
  const stamp = (strength: number) => {
    if (!bladeMesh) return;
    bladeMesh.updateMatrixWorld(true);
    const ghost = bladeMesh.clone();
    const mat = slashMat.clone();
    mat.opacity = 0.4 + strength * 0.5;
    ghost.material = mat;
    ghost.matrixAutoUpdate = false;
    ghost.matrix.copy(bladeMesh.matrixWorld);
    ghost.name = "slashTrail";
    ghost.renderOrder = 12;
    const host = root.parent ?? root;
    host.add(ghost);
    ghosts.push(ghost);
    if (ghosts.length > 22) {
      const old = ghosts.shift()!;
      old.parent?.remove(old);
      (old.material as THREE.Material).dispose();
    }
  };
  const fadeGhosts = () => {
    for (let i = ghosts.length - 1; i >= 0; i--) {
      const m = ghosts[i].material as THREE.MeshBasicMaterial;
      m.opacity *= 0.9;
      if (m.opacity < 0.03) {
        ghosts[i].parent?.remove(ghosts[i]);
        m.dispose();
        ghosts.splice(i, 1);
      }
    }
  };
  const drainTrail = () => {
    fadeGhosts();
    if (ghosts.length) requestAnimationFrame(drainTrail);
  };

  let swinging = false;
  const bodyIdleX = 0.08;
  let lastStamp = 0;
  let lastYaw = 0;
  const swing = () => {
    if (swinging || kit.weapon !== 0) return;
    swinging = true;
    const t0 = performance.now();
    lastStamp = 0;
    lastYaw = 0;
    const dur = 920;
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      let yaw = 0;
      let pitch = 0;
      let flash = 0;
      let coil = 0;
      let lean = 0;
      let dip = 0;
      let lunge = 0;
      const FRONT = -Math.PI / 2;
      if (u < 0.16) {
        const w = u / 0.16;
        yaw = FRONT + 0.62 * w;
        pitch = 0.22 * w;
        coil = w;
        lean = 0.16 * w;
        lunge = 0.06 * w;
      } else if (u < 0.58) {
        const c = (u - 0.16) / 0.42;
        yaw = FRONT + 0.62 - c * 1.24;
        pitch = 0.22 + Math.sin(c * Math.PI) * 0.08;
        flash = Math.sin(c * Math.PI);
        coil = 1 - c * 2;
        lean = 0.16 + Math.sin(c * Math.PI) * 0.18;
        dip = Math.sin(c * Math.PI) * 0.03;
        lunge = 0.06 + Math.sin(c * Math.PI) * 0.12;
      } else {
        const r = (u - 0.58) / 0.42;
        yaw = (FRONT - 0.62) * (1 - r);
        pitch = 0.22 * (1 - r);
        flash = 0;
        coil = -(1 - r);
        lean = 0.16 * (1 - r);
        dip = 0.03 * (1 - r);
        lunge = 0.06 * (1 - r);
      }
      swingRig.position.set(0, shoulderY, lunge);
      swingRig.rotation.set(pitch, yaw, 0.04 * Math.sin(u * Math.PI));
      body.position.z = lunge * 0.25;
      body.rotation.set(bodyIdleX + lean, (yaw - FRONT) * 0.28 + coil * 0.1, coil * -0.14);
      legs.rotation.set(lean * 0.22, (yaw - FRONT) * 0.12 + coil * 0.16, coil * -0.06);
      legs.position.y = -dip;
      head.rotation.set(lean * 0.45, (yaw - FRONT) * 0.15, 0);
      reach(L, gripL, -1);
      reach(R, gripR, 1);
      const moving = Math.abs(yaw - lastYaw);
      const cutting = u >= 0.16 && u < 0.58;
      lastYaw = yaw;
      if (glow) {
        glow.visible = cutting && (moving > 0.008 || flash > 0.04);
        slashMat.opacity = cutting ? Math.min(0.9, 0.18 + moving * 5 + flash * 0.45) : 0;
      }
      if (cutting && moving > 0.015 && now - lastStamp > 12) {
        stamp(Math.min(1, moving * 3 + flash));
        lastStamp = now;
      }
      fadeGhosts();
      if (u < 1) requestAnimationFrame(tick);
      else {
        swingRig.position.set(0, shoulderY, 0);
        swingRig.rotation.set(0, 0, 0);
        body.position.z = 0;
        body.rotation.set(bodyIdleX, 0, 0);
        legs.rotation.set(0, 0, 0);
        legs.position.y = 0;
        head.rotation.set(0, 0, 0);
        reach(L, gripL, -1);
        reach(R, gripR, 1);
        if (glow) {
          glow.visible = false;
          slashMat.opacity = 0;
        }
        swinging = false;
        drainTrail();
      }
    };
    requestAnimationFrame(tick);
  };

  const visorMesh = head.getObjectByName("visor") as THREE.Mesh | null;
  const visorIdle = visorMesh ? visorMesh.scale.clone() : null;
  const piston = kit.legs !== 1;
  const tick = (now: number) => {
    if (swinging) return;
    const s = Math.sin((now / 1600) * Math.PI * 2);
    const settle = piston ? s * -0.01 : s * -0.006;
    body.position.y = settle;
    body.rotation.x = bodyIdleX + s * 0.014;
    head.position.y = neckY + settle;
    head.rotation.x = s * 0.02;
    swingRig.position.set(0, shoulderY + settle * 0.85, 0);
    swingRig.rotation.set(s * 0.008, 0, s * 0.01);
    if (piston) legs.position.y = 0;
    else legs.rotation.x = s * 0.018;
    if (visorMesh && visorIdle) {
      const pulse = 1 + Math.max(0, s) * 0.07;
      visorMesh.scale.set(visorIdle.x * pulse, visorIdle.y, visorIdle.z);
    }
    if (kit.weapon === 0) {
      reach(L, gripL, -1);
      reach(R, gripR, 1);
    }
  };

  return { root, mount, swing, tick };
}
