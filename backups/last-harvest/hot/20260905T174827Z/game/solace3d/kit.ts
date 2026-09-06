import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";
import { attachArm, attachLeg, buildBody, buildGripper, buildHead, buildPack, buildWeapon } from "./parts3d";

export type KitSlot = "head" | "body" | "legs" | "arms" | "handR" | "handL";
export type Kit = { head: number; body: number; legs: number; arms: number; handR: number; handL: number };

/** Armor none. Scythe (`p018`) occupies both hands — empty hands do not ship. */
export const GOLD_GREY: Kit = { head: 0, body: 0, legs: 0, arms: 0, handR: 1, handL: 1 };

/** Local units before bay scale. Lock: solace-gold. Bay sliders stretch this cage + plates + weapons. */
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
  thighLen: number;
  shinLen: number;
  stance: number;
  snath: number;
  grip: number;
  blade: number;
  scale: number;
  helm: number;
  pack: number;
  pauldron: number;
  boot: number;
  gripSize: number;
  sawLen: number;
  cannonLen: number;
  cannonR: number;
  shieldH: number;
  shieldW: number;
};

export const GOLD_SIT: GoldSit = {
  chestW: 0.38,
  chestD: 0.22,
  chestH: 0.18,
  hipY: 0.36,
  shoulderY: 0.62,
  neckY: 0.74,
  upperLen: 0.22,
  faLen: 0.24,
  thick: 0.062,
  thighLen: 0.19,
  shinLen: 0.14,
  stance: 0.12,
  snath: 1.28,
  grip: 0.42,
  blade: 0.46,
  scale: 1.1,
  helm: 0.09,
  pack: 0.14,
  pauldron: 0.08,
  boot: 0.12,
  gripSize: 1,
  sawLen: 0.5,
  cannonLen: 0.4,
  cannonR: 0.07,
  shieldH: 0.56,
  shieldW: 0.22,
};

/** Bump when Ivan says Reset gold so Bay sliders drop stale sit. */
export const GOLD_REV = 5;

/** Slot 0 = none (bare sockets). Crude plates parent on; never replace the armature. */
export const KIT_NAMES: Record<KitSlot, string[]> = {
  head: ["none", "bucket"],
  body: ["none", "can", "cell"],
  legs: ["none", "piston"],
  arms: ["none", "crane"],
  handR: ["none", "scythe", "saw", "cannon"],
  handL: ["none", "scythe", "shield", "cannon"],
};

/** Hands never rest on `none` while cycling. Empty hands do not ship. */
export function nextArmed(slot: "handR" | "handL", i: number) {
  const names = KIT_NAMES[slot];
  let n = i;
  for (let s = 0; s < names.length; s++) {
    n = (n + 1) % names.length;
    if (names[n] !== "none") return n;
  }
  return i;
}

/** Leave two-hand together (both get the next real part). Then each hand cycles on its own. Hitting scythe re-locks both. */
export function cycleHands(k: Kit, slot: "handR" | "handL"): Kit {
  const two = KIT_NAMES.handR[k.handR] === "scythe" || KIT_NAMES.handL[k.handL] === "scythe";
  if (two) {
    return clampKit({
      ...k,
      handR: nextArmed("handR", k.handR),
      handL: nextArmed("handL", k.handL),
    });
  }
  return clampKit({ ...k, [slot]: nextArmed(slot, k[slot]) });
}

/** One scythe id occupies both hand slots. Bay may show Lancers without a cell mesh. */
export function clampKit(k: Kit): Kit {
  const next = { ...k };
  const r = KIT_NAMES.handR[next.handR];
  const l = KIT_NAMES.handL[next.handL];
  if (r === "scythe" || l === "scythe") {
    next.handR = KIT_NAMES.handR.indexOf("scythe");
    next.handL = KIT_NAMES.handL.indexOf("scythe");
  }
  return next;
}

/** Map hangar loadout ids onto crude KIT_NAMES indices. */
export function kitFromLoadout(l: {
  body: string;
  head: string;
  legs: string;
  arms: string;
  handL: string;
  handR: string;
}): Kit {
  const twoHand = l.handR === "p018" || l.handR === "p009" || l.handL === "p018" || l.handL === "p009";
  const handR = twoHand ? 1 : l.handR === "p008" ? 2 : l.handR === "p010" ? 3 : 0;
  const handL = twoHand ? 1 : l.handL === "p007" ? 2 : l.handL === "p010" ? 3 : 0;
  return clampKit({
    head: l.head ? 1 : 0,
    body: l.body && l.body !== "p020" ? 1 : 0,
    legs: l.legs ? 1 : 0,
    arms: l.arms ? 1 : 0,
    handR,
    handL,
  });
}

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

/** Tapered oval ribcage: wide pecs, pinched waist. Cardinal posts — not a corner-box. */
function ribs(topW: number, botW: number, h: number, topD: number, botD: number, mat: THREE.Material) {
  const g = new THREE.Group();
  g.name = "ribs";
  const hoop = (rw: number, rd: number, y: number, tube = 0.0062) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.5, tube, 5, 24), mat);
    m.rotation.x = Math.PI / 2;
    m.scale.set(rw / 0.5, 1, rd / 0.5);
    m.position.y = y;
    g.add(m);
  };
  const topY = h * 0.5;
  const botY = -h * 0.5;
  /** t=0 shoulders, t=1 waist. t² keeps pecs wide then drops — not a truncated box. */
  const span = (t: number) => {
    const u = t * t;
    return {
      w: topW + (botW - topW) * u,
      d: topD + (botD - topD) * u,
      y: topY + (botY - topY) * t,
    };
  };
  for (const t of [0, 0.2, 0.42, 0.68, 1]) {
    const s = span(t);
    hoop(s.w, s.d, s.y, t > 0.75 ? 0.0052 : 0.0062);
  }
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  for (const [sx, sz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const) {
    const a = span(0);
    const b = span(1);
    const x0 = sx * a.w * 0.94;
    const z0 = sz * a.d * 0.94;
    const x1 = sx * b.w * 0.94;
    const z1 = sz * b.d * 0.94;
    dir.set(x1 - x0, b.y - a.y, z1 - z0);
    const len = dir.length();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.0042, len, 5), mat);
    post.position.set((x0 + x1) * 0.5, (a.y + b.y) * 0.5, (z0 + z1) * 0.5);
    post.quaternion.setFromUnitVectors(up, dir.normalize());
    g.add(post);
  }
  const sternum = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0075, h * 0.7, 6), mat);
  sternum.position.set(0, h * 0.06, topD * 0.62);
  g.add(sternum);
  return g;
}

export function buildWanzer(kit: Kit, sit: GoldSit = GOLD_SIT): WanzerRig {
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
  /** Elbow / wrist / knee / ankle — read at bay camera. Shoulder/hip/spine stay smaller. */
  const rLimb = 0.046 + sit.thick * 0.14;

  const hips = joint("hips", 0, boneM, brass, rB, rJ * 1.15);
  hips.position.y = hipY;
  root.add(hips);

  const skirt = new THREE.Mesh(new THREE.TorusGeometry(sit.chestW * 0.16, 0.006, 6, 16), brass);
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
  const cageMesh = ribs(
    sit.chestW * 0.46,
    sit.chestW * 0.18,
    sit.chestH * 1.4,
    sit.chestD * 0.55,
    sit.chestD * 0.28,
    steel,
  );
  cageMesh.position.y = chestLen * 0.4;
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
  const wpnSlotR = new THREE.Group();
  wpnSlotR.name = "weapon";
  const wpnSlotL = new THREE.Group();
  wpnSlotL.name = "weapon_L";

  const makeArm = (side: "L" | "R") => {
    const s = side === "L" ? -1 : 1;
    const clav = joint(`clavicle_${side}`, sit.chestW * 0.42, boneM, brass, rB * 0.9, rJ * 0.85);
    clav.rotation.z = s * -Math.PI / 2;
    clav.position.set(s * 0.02, chestLen * 0.85, 0);
    chest.add(clav);
    const shoulder = joint(`shoulder_${side}`, 0.02, boneM, brass, rB, rJ * 1.1);
    shoulder.position.y = sit.chestW * 0.42;
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
    const elbow = joint(`elbow_${side}`, 0.02, boneM, brass, rB, rLimb);
    elbow.position.y = sit.upperLen;
    upper.add(elbow);
    const forearm = joint(`forearm_${side}`, sit.faLen, boneM, brass, rB * 0.92, rJ);
    forearm.position.y = 0.02;
    elbow.add(forearm);
    const wrist = joint(`wrist_${side}`, 0.03, boneM, brass, rB * 0.85, rLimb * 0.92);
    wrist.position.y = sit.faLen;
    forearm.add(wrist);
    const wmount = new THREE.Object3D();
    wmount.name = `weapon_mount_${side}`;
    wmount.position.y = 0.03;
    wrist.add(wmount);
    if (side === "R") wmount.add(wpnSlotR);
    else wmount.add(wpnSlotL);
    return { shoulder, upper, elbow, forearm, wrist };
  };
  const armL = makeArm("L");
  const armR = makeArm("R");

  const thighLen = sit.thighLen;
  const shinLen = sit.shinLen;
  const makeLeg = (side: "L" | "R") => {
    const s = side === "L" ? -1 : 1;
    const hip = joint(`hip_${side}`, 0.03, boneM, brass, rB, rJ);
    hip.position.set(s * sit.stance * 0.5, 0, 0);
    hip.rotation.x = Math.PI;
    hips.add(hip);
    const thigh = joint(`thigh_${side}`, thighLen, boneM, brass, rB * 1.05, rJ);
    thigh.position.y = 0.03;
    hip.add(thigh);
    const knee = joint(`knee_${side}`, 0.02, boneM, brass, rB, rLimb);
    knee.position.y = thighLen;
    thigh.add(knee);
    const shin = joint(`shin_${side}`, shinLen, boneM, brass, rB, rJ);
    shin.position.y = 0.02;
    knee.add(shin);
    const ankle = joint(`ankle_${side}`, 0.03, boneM, brass, rB, rLimb * 0.95);
    ankle.position.y = shinLen;
    shin.add(ankle);
    const foot = joint(`foot_${side}`, 0.07, boneM, brass, rB * 0.9, rJ * 0.9);
    foot.position.y = 0.03;
    foot.rotation.x = -Math.PI / 2;
    ankle.add(foot);
    return { hip, thigh, knee, shin, ankle, foot };
  };
  const legL = makeLeg("L");
  const legR = makeLeg("R");

  const headKind = KIT_NAMES.head[kit.head] ?? "none";
  const bodyKind = KIT_NAMES.body[kit.body] ?? "none";
  const legsKind = KIT_NAMES.legs[kit.legs] ?? "none";
  const armsKind = KIT_NAMES.arms[kit.arms] ?? "none";
  const rKind = KIT_NAMES.handR[kit.handR] ?? "none";
  const lKind = KIT_NAMES.handL[kit.handL] ?? "none";
  if (headKind !== "none") headSlot.add(buildHead(headKind, sit));
  if (bodyKind !== "none") {
    bodySlot.add(buildBody(bodyKind === "cell" ? "can" : bodyKind, sit));
    pack_mount.add(buildPack(bodyKind, sit));
  }
  if (armsKind !== "none") {
    attachArm(armL, armsKind, sit, -1);
    attachArm(armR, armsKind, sit, 1);
  }
  if (legsKind !== "none") {
    attachLeg(legL, legsKind, sit, -1);
    attachLeg(legR, legsKind, sit, 1);
  }
  if (rKind !== "none") wpnSlotR.add(buildWeapon(rKind, sit, 1));
  if (lKind !== "none" && rKind !== "scythe") wpnSlotL.add(buildWeapon(lKind, sit, -1));
  if (rKind === "scythe") {
    armR.wrist.add(buildGripper(1, "pole", sit));
    armL.wrist.add(buildGripper(-1, "pole", sit));
  } else {
    if (rKind === "saw") armR.wrist.add(buildGripper(1, "hilt", sit));
    if (lKind === "shield") armL.wrist.add(buildGripper(-1, "slab", sit));
  }

  const gasket_mount =
    (root.getObjectByName("gasket_mount") as THREE.Object3D | null) ?? new THREE.Object3D();
  gasket_mount.name = "gasket_mount";
  const mount = gasket_mount;

  addOutline(root, 1.04);

  let swinging = false;
  /** Bind +Y is up. Hang = π (dead, 1H saw/slab). Lance present = upper lifted, elbow −π/2, muzzle at chest. Scythe = hip farmer-cut. */
  const reap = rKind === "scythe";
  const hangU = Math.PI - 0.05;
  const hangE = 0.04;
  const presentU = Math.PI - 0.92;
  const presentE = -1.12;
  const restOf = (kind: string, side: 1 | -1) => {
    if (kind === "cannon") return { u: presentU, e: presentE, z: side * -0.16 };
    return { u: hangU, e: hangE, z: side * -0.1 };
  };
  const L = restOf(lKind, -1);
  const R = restOf(rKind, 1);
  const rest = {
    chestX: 0,
    upperL: reap ? 2.2 : L.u,
    upperR: reap ? 2.25 : R.u,
    elbowL: reap ? 1.05 : L.e,
    elbowR: reap ? 1.1 : R.e,
    zL: reap ? 0.2 : L.z,
    zR: reap ? -0.2 : R.z,
  };
  armL.upper.rotation.set(rest.upperL, 0, rest.zL);
  armR.upper.rotation.set(rest.upperR, 0, rest.zR);
  armL.elbow.rotation.x = rest.elbowL;
  armR.elbow.rotation.x = rest.elbowR;
  if (reap) {
    root.updateMatrixWorld(true);
    const pole = wpnSlotR.getObjectByName("scythe");
    const mountL = root.getObjectByName("weapon_mount_L");
    const mountR = root.getObjectByName("weapon_mount_R");
    if (pole && mountL && mountR) {
      const toL = mountR.worldToLocal(mountL.getWorldPosition(new THREE.Vector3()));
      const x = toL.lengthSq() > 1e-6 ? toL.normalize().negate() : new THREE.Vector3(1, 0, 0);
      const inv = mountR.getWorldQuaternion(new THREE.Quaternion()).invert();
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(inv);
      const z = new THREE.Vector3().crossVectors(x, up);
      if (z.lengthSq() < 1e-6) z.set(0, 0, 1);
      else z.normalize();
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(inv);
      if (z.dot(fwd) < 0) z.negate();
      const y = new THREE.Vector3().crossVectors(z, x).normalize();
      z.crossVectors(x, y).normalize();
      pole.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
      pole.rotateX(0.38);
      pole.position.set(0, 0, 0);
      root.updateMatrixWorld(true);
      const axisW = new THREE.Vector3(1, 0, 0).applyQuaternion(pole.getWorldQuaternion(new THREE.Quaternion()));
      for (const mount of [mountR, mountL]) {
        const grip = mount.getObjectByName(mount === mountR ? "gripper_R" : "gripper_L");
        if (!grip) continue;
        const q = mount.getWorldQuaternion(new THREE.Quaternion()).invert();
        const dir = axisW.clone().applyQuaternion(q).normalize();
        if (dir.lengthSq() > 1e-6) grip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      }
    }
  }

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
        lift = 0.55 * w;
      } else if (u < 0.58) {
        const c = (u - 0.18) / 0.4;
        yaw = 0.55 - c * 1.35;
        lift = 0.55 + Math.sin(c * Math.PI) * 0.28;
      } else {
        const r = (u - 0.58) / 0.42;
        yaw = (0.55 - 1.35) * (1 - r);
        lift = 0.55 * (1 - r);
      }
      chest.rotation.y = yaw;
      spine_mid.rotation.y = yaw * 0.4;
      armR.upper.rotation.x = rest.upperR - lift;
      armL.upper.rotation.x = rest.upperL - lift * 0.7;
      armR.upper.rotation.y = -yaw * 0.5;
      armL.upper.rotation.y = -yaw * 0.35;
      hips.rotation.y = yaw * 0.12;
      if (u < 1) requestAnimationFrame(tickSw);
      else {
        chest.rotation.y = 0;
        spine_mid.rotation.y = 0;
        hips.rotation.y = 0;
        armL.upper.rotation.set(rest.upperL, 0, rest.zL);
        armR.upper.rotation.set(rest.upperR, 0, rest.zR);
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
