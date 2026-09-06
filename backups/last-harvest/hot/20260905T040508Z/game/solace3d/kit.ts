import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

export type KitSlot = "head" | "body" | "legs" | "arms" | "weapon";
export type Kit = { head: number; body: number; legs: number; arms: number; weapon: number };

/** Indices only. No p###. Slot 0 = none until parts parent onto sockets. */
export const GOLD_GREY: Kit = { head: 0, body: 0, legs: 0, arms: 0, weapon: 0 };

/** Local units before bay scale. Lock: solace-gold. Bay sliders stretch this cage. */
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

/** Rotate-through still works. Only empty until parts exist. */
export const KIT_NAMES: Record<KitSlot, string[]> = {
  head: ["none"],
  body: ["none"],
  legs: ["none"],
  arms: ["none"],
  weapon: ["none"],
};

export type WanzerRig = {
  root: THREE.Group;
  mount: THREE.Object3D;
  swing: () => void;
  tick: (now: number) => void;
};

function cyl(rt: number, rb: number, h: number, material: THREE.Material, seg = 6) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
}

/** Thin bone along +Y, brass ball at the origin (parent joint). */
function joint(name: string, len: number, boneM: THREE.Material, brass: THREE.Material, rBone = 0.013, rJoint = 0.024) {
  const g = new THREE.Group();
  g.name = name;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(rJoint, 8, 6), brass);
  g.add(ball);
  if (len > 0.001) {
    const shaft = cyl(rBone, rBone * 0.92, len, boneM, 6);
    shaft.position.y = len / 2;
    g.add(shaft);
  }
  return g;
}

function cage(w: number, h: number, d: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const t = 0.01;
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  const bar = (sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    m.position.set(x, y, z);
    g.add(m);
  };
  for (const y of [-hh, hh]) {
    bar(w, t, t, 0, y, hd);
    bar(w, t, t, 0, y, -hd);
    bar(t, t, d, hw, y, 0);
    bar(t, t, d, -hw, y, 0);
  }
  for (const x of [-hw, hw]) {
    for (const z of [-hd, hd]) bar(t, h, t, x, 0, z);
  }
  return g;
}

export function buildWanzer(_kit: Kit, sit: GoldSit = GOLD_SIT): WanzerRig {
  const root = new THREE.Group();
  root.name = "root";

  const boneM = texMat("dark");
  const brass = texMat("yellow");
  const steel = texMat("steel");

  const hipY = sit.hipY;
  const shoulderY = sit.shoulderY;
  const neckY = sit.neckY;
  const rB = 0.012 + sit.thick * 0.04;
  const rJ = 0.02 + sit.thick * 0.08;

  const hips = joint("hips", 0, boneM, brass, rB, rJ * 1.15);
  hips.position.y = hipY;
  root.add(hips);

  const skirt = new THREE.Mesh(new THREE.TorusGeometry(sit.chestW * 0.28, 0.008, 6, 16), brass);
  skirt.name = "skirt_ring";
  skirt.rotation.x = Math.PI / 2;
  hips.add(skirt);

  const spineSpan = Math.max(0.04, shoulderY - hipY);
  const lowLen = spineSpan * 0.34;
  const midLen = spineSpan * 0.34;
  const chestLen = spineSpan * 0.32;

  const spine_low = joint("spine_low", lowLen, boneM, brass, rB, rJ);
  hips.add(spine_low);
  const spine_mid = joint("spine_mid", midLen, boneM, brass, rB, rJ);
  spine_mid.position.y = lowLen;
  spine_low.add(spine_mid);

  const chest = joint("chest", chestLen, boneM, brass, rB * 1.1, rJ * 1.1);
  chest.position.y = midLen;
  spine_mid.add(chest);
  const cageMesh = cage(sit.chestW * 0.7, sit.chestH, sit.chestD * 0.85, steel);
  cageMesh.position.y = chestLen * 0.45;
  chest.add(cageMesh);

  const pack_mount = new THREE.Object3D();
  pack_mount.name = "pack_mount";
  pack_mount.position.set(0, chestLen * 0.4, -sit.chestD * 0.45);
  chest.add(pack_mount);

  const core_mount = new THREE.Object3D();
  core_mount.name = "core_mount";
  core_mount.position.set(0, chestLen * 0.4, sit.chestD * 0.2);
  chest.add(core_mount);

  const neckLen = Math.max(0.04, neckY - shoulderY);
  const neck = joint("neck", neckLen, boneM, brass, rB * 0.85, rJ * 0.85);
  neck.position.y = chestLen;
  chest.add(neck);

  const headJ = joint("head", 0.05, boneM, brass, rB, rJ * 1.05);
  headJ.position.y = neckLen;
  neck.add(headJ);

  const bodySlot = new THREE.Group();
  bodySlot.name = "body";
  chest.add(bodySlot);
  const headSlot = new THREE.Group();
  headSlot.name = "head";
  headJ.add(headSlot);
  const armsSlot = new THREE.Group();
  armsSlot.name = "arms";
  chest.add(armsSlot);
  const legsSlot = new THREE.Group();
  legsSlot.name = "legs";
  hips.add(legsSlot);
  const wpnSlot = new THREE.Group();
  wpnSlot.name = "weapon";

  const makeArm = (side: "L" | "R") => {
    const s = side === "L" ? -1 : 1;
    const clav = joint(`clavicle_${side}`, sit.chestW * 0.22, boneM, brass, rB * 0.9, rJ * 0.85);
    clav.rotation.z = s * -Math.PI / 2;
    clav.position.set(s * 0.02, chestLen * 0.85, 0);
    chest.add(clav);
    const shoulder = joint(`shoulder_${side}`, 0.02, boneM, brass, rB, rJ * 1.1);
    shoulder.position.y = sit.chestW * 0.22;
    shoulder.rotation.z = s * Math.PI / 2;
    clav.add(shoulder);
    if (side === "L") {
      const gm = new THREE.Object3D();
      gm.name = "gasket_mount";
      gm.position.set(0.02, 0.04, 0.02);
      shoulder.add(gm);
    }
    const upper = joint(`upper_arm_${side}`, sit.upperLen, boneM, brass, rB, rJ);
    upper.position.y = 0.02;
    shoulder.add(upper);
    const elbow = joint(`elbow_${side}`, 0.02, boneM, brass, rB, rJ * 1.05);
    elbow.position.y = sit.upperLen;
    upper.add(elbow);
    const forearm = joint(`forearm_${side}`, sit.faLen, boneM, brass, rB * 0.92, rJ);
    forearm.position.y = 0.02;
    elbow.add(forearm);
    const wrist = joint(`wrist_${side}`, 0.03, boneM, brass, rB * 0.85, rJ * 0.9);
    wrist.position.y = sit.faLen;
    forearm.add(wrist);
    const wmount = new THREE.Object3D();
    wmount.name = `weapon_mount_${side}`;
    wmount.position.y = 0.03;
    wrist.add(wmount);
    if (side === "R") wmount.add(wpnSlot);
    return { shoulder, upper, elbow, forearm };
  };
  const armL = makeArm("L");
  const armR = makeArm("R");

  const thighLen = hipY * 0.52;
  const shinLen = hipY * 0.4;
  const makeLeg = (side: "L" | "R") => {
    const s = side === "L" ? -1 : 1;
    const hip = joint(`hip_${side}`, 0.03, boneM, brass, rB, rJ);
    hip.position.set(s * sit.chestW * 0.22, 0, 0);
    hip.rotation.x = Math.PI;
    hips.add(hip);
    const thigh = joint(`thigh_${side}`, thighLen, boneM, brass, rB * 1.05, rJ);
    thigh.position.y = 0.03;
    hip.add(thigh);
    const knee = joint(`knee_${side}`, 0.02, boneM, brass, rB, rJ * 1.05);
    knee.position.y = thighLen;
    thigh.add(knee);
    const shin = joint(`shin_${side}`, shinLen, boneM, brass, rB, rJ);
    shin.position.y = 0.02;
    knee.add(shin);
    const ankle = joint(`ankle_${side}`, 0.03, boneM, brass, rB, rJ);
    ankle.position.y = shinLen;
    shin.add(ankle);
    const foot = joint(`foot_${side}`, 0.07, boneM, brass, rB * 0.9, rJ * 0.9);
    foot.position.y = 0.03;
    foot.rotation.x = -Math.PI / 2;
    ankle.add(foot);
    return { hip, thigh, knee, shin };
  };
  const legL = makeLeg("L");
  const legR = makeLeg("R");

  const gasket_mount =
    (root.getObjectByName("gasket_mount") as THREE.Object3D | null) ?? new THREE.Object3D();
  gasket_mount.name = "gasket_mount";
  const mount = gasket_mount;

  addOutline(root, 1.04);

  let swinging = false;
  const rest = {
    chestX: 0,
    upperL: 0.35,
    upperR: 0.35,
    elbowL: 0.4,
    elbowR: 0.4,
  };
  armL.upper.rotation.x = rest.upperL;
  armR.upper.rotation.x = rest.upperR;
  armL.elbow.rotation.x = rest.elbowL;
  armR.elbow.rotation.x = rest.elbowR;

  const swing = () => {
    if (swinging) return;
    swinging = true;
    const t0 = performance.now();
    const dur = 880;
    const tickSw = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      let yaw = 0;
      let lift = 0;
      if (u < 0.18) {
        const w = u / 0.18;
        yaw = 0.55 * w;
        lift = 0.25 * w;
      } else if (u < 0.58) {
        const c = (u - 0.18) / 0.4;
        yaw = 0.55 - c * 1.35;
        lift = 0.25 + Math.sin(c * Math.PI) * 0.2;
      } else {
        const r = (u - 0.58) / 0.42;
        yaw = (0.55 - 1.35) * (1 - r);
        lift = 0.25 * (1 - r);
      }
      chest.rotation.y = yaw;
      spine_mid.rotation.y = yaw * 0.4;
      armR.upper.rotation.x = rest.upperR + lift;
      armL.upper.rotation.x = rest.upperL + lift * 0.7;
      armR.upper.rotation.y = -yaw * 0.5;
      armL.upper.rotation.y = -yaw * 0.35;
      hips.rotation.y = yaw * 0.12;
      if (u < 1) requestAnimationFrame(tickSw);
      else {
        chest.rotation.y = 0;
        spine_mid.rotation.y = 0;
        hips.rotation.y = 0;
        armL.upper.rotation.set(rest.upperL, 0, 0);
        armR.upper.rotation.set(rest.upperR, 0, 0);
        swinging = false;
      }
    };
    requestAnimationFrame(tickSw);
  };

  const tick = (now: number) => {
    if (swinging) return;
    const s = Math.sin((now / 1600) * Math.PI * 2);
    spine_mid.rotation.x = s * 0.03;
    chest.rotation.x = s * 0.02;
    hips.position.y = hipY + s * -0.008;
    armL.upper.rotation.x = rest.upperL + s * 0.03;
    armR.upper.rotation.x = rest.upperR + s * 0.03;
    legL.thigh.rotation.x = s * 0.02;
    legR.thigh.rotation.x = -s * 0.02;
  };

  return { root, mount, swing, tick };
}
