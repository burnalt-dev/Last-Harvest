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

function makeScythe(wood: THREE.Material, bladeM: THREE.Material, steel: THREE.Material, dark: THREE.Material) {
  const g = new THREE.Group();
  g.name = "scythe";
  const snath = cyl(0.013, 0.017, 1.28, wood, 8);
  snath.rotation.z = Math.PI / 2;
  g.add(snath);
  add(g, cyl(0.02, 0.02, 0.12, dark, 6), -0.12, 0, 0).rotation.z = Math.PI / 2;
  add(g, cyl(0.02, 0.02, 0.12, dark, 6), 0.16, 0, 0).rotation.z = Math.PI / 2;
  const ferrule = cyl(0.02, 0.02, 0.04, steel, 8);
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.set(0.6, 0, 0);
  g.add(ferrule);
  const weld = box(0.055, 0.03, 0.045, steel);
  weld.position.set(0.6, 0, 0.012);
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
  blade.position.set(0.6, 0.006, 0);
  g.add(blade);
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

  const hipY = 0.36;
  const shoulderY = 0.62;
  const neckY = 0.74;
  const taper = kit.body === 1;
  const chestW = taper ? 0.36 : 0.4;
  const chestD = 0.3;

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
  add(body, plump(chestW * 0.38, chestW * 0.4, 0.1, chestD / chestW, plate), 0, hipY + 0.04, 0);
  add(body, plump(chestW * 0.48, chestW * 0.42, 0.2, (chestD / chestW) * 0.92, hatch), 0, hipY + 0.14, 0);
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
    const thick = stork ? 0.052 : 0.062;
    const upperLen = stork ? 0.28 : 0.22;
    const faLen = stork ? 0.3 : 0.24;

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

  let gripL = new THREE.Vector3(-0.36, -0.3, 0.18);
  let gripR = new THREE.Vector3(0.4, -0.28, 0.14);
  if (kit.weapon === 0) {
    scythe = makeScythe(wood, bladeM, steel, dark);
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

  const worldSlash = new THREE.Group();
  worldSlash.name = "slashWorld";
  const fanMat = slashMat.clone();
  fanMat.opacity = 0;
  const fan = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.2), fanMat);
  fan.name = "slashFan";
  fan.rotation.x = -Math.PI / 2;
  fan.position.set(0, 0.1, 0.95);
  fan.visible = false;
  fan.renderOrder = 10;
  worldSlash.add(fan);
  const wipe = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.25), fanMat.clone());
  wipe.name = "slashWipe";
  wipe.rotation.x = -Math.PI / 2;
  wipe.position.set(0, 0.12, 0.95);
  wipe.visible = false;
  wipe.renderOrder = 11;
  worldSlash.add(wipe);

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
  const syncWorld = () => {
    const host = root.parent;
    if (!host) return;
    if (worldSlash.parent !== host) host.add(worldSlash);
    root.updateMatrixWorld(true);
    worldSlash.position.set(root.matrixWorld.elements[12]!, 0, root.matrixWorld.elements[14]!);
    worldSlash.rotation.y = root.rotation.y;
    worldSlash.scale.set(1, 1, 1);
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
      if (u < 0.16) {
        const w = u / 0.16;
        yaw = 1.15 * w;
        pitch = 0.22 * w;
        coil = w;
        lean = 0.2 * w;
      } else if (u < 0.58) {
        const c = (u - 0.16) / 0.42;
        yaw = 1.15 - c * 2.55;
        pitch = 0.22 + Math.sin(c * Math.PI) * 0.18;
        flash = Math.sin(c * Math.PI);
        coil = 1 - c * 2;
        lean = 0.2 + Math.sin(c * Math.PI) * 0.22;
        dip = Math.sin(c * Math.PI) * 0.035;
      } else {
        const r = (u - 0.58) / 0.42;
        yaw = -1.4 * (1 - r);
        pitch = 0.22 * (1 - r);
        flash = Math.max(0, 1 - r * 2.2);
        coil = -(1 - r);
        lean = 0.2 * (1 - r);
        dip = 0.035 * (1 - r);
      }
      swingRig.rotation.set(pitch, yaw, 0.05 * Math.sin(u * Math.PI));
      body.rotation.set(bodyIdleX + lean, yaw * 0.38 + coil * 0.18, coil * -0.16);
      legs.rotation.set(lean * 0.22, yaw * 0.18 + coil * 0.22, coil * -0.07);
      legs.position.y = -dip;
      head.rotation.set(lean * 0.45, yaw * 0.22, 0);
      reach(L, gripL, -1);
      reach(R, gripR, 1);
      const moving = Math.abs(yaw - lastYaw);
      lastYaw = yaw;
      if (glow) {
        glow.visible = moving > 0.008 || flash > 0.04;
        slashMat.opacity = Math.min(0.9, 0.18 + moving * 5 + flash * 0.45);
      }
      syncWorld();
      fan.visible = flash > 0.04;
      wipe.visible = flash > 0.04;
      fanMat.opacity = flash * 0.35;
      (wipe.material as THREE.MeshBasicMaterial).opacity = 0.15 + flash * 0.7;
      wipe.position.x = yaw * 0.72;
      if (moving > 0.015 && now - lastStamp > 12) {
        stamp(Math.min(1, moving * 3 + flash));
        lastStamp = now;
      }
      fadeGhosts();
      if (u < 1) requestAnimationFrame(tick);
      else {
        swingRig.rotation.set(0, 0, 0);
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
        fan.visible = false;
        wipe.visible = false;
        fanMat.opacity = 0;
        worldSlash.parent?.remove(worldSlash);
        swinging = false;
        drainTrail();
      }
    };
    requestAnimationFrame(tick);
  };

  return { root, mount, swing };
}
