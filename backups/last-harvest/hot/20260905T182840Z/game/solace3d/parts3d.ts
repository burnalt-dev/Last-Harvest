import * as THREE from "three";
import { mat as texMat } from "./tex";
import type { GoldSit } from "./kit";

function cyl(rt: number, rb: number, h: number, material: THREE.Material, seg = 8) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
}
function box(w: number, h: number, d: number, material: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}
function plump(rt: number, rb: number, h: number, squashZ: number, material: THREE.Material, seg = 10) {
  const m = cyl(rt, rb, h, material, seg);
  m.scale.z = squashZ;
  return m;
}

/** Small labor bucket + cyan slit. Parents to `head`. */
export function buildHead(kind: string, sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "part_head";
  if (kind !== "bucket") return g;
  const plate = texMat("plate");
  const visor = texMat("visor");
  const dark = texMat("dark");
  const h = sit.helm;
  const helm = plump(h * 0.61, h * 0.67, h, 0.92, plate, 10);
  helm.position.y = h * 0.55;
  g.add(helm);
  const slit = box(h * 1.1, h * 0.31, h * 0.24, visor);
  slit.name = "visor";
  slit.position.set(0, h * 0.61, h * 0.64);
  g.add(slit);
  const cap = box(h * 0.33, h * 0.18, h * 0.27, dark);
  cap.position.set(0, h * 1.11, 0);
  g.add(cap);
  return g;
}

/** Hull can + hopper pack. Parents to `body` / `pack_mount`. Skeleton stays underneath. */
export function buildBody(kind: string, sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "part_body";
  if (kind !== "can") return g;
  const plate = texMat("plate");
  const hatch = texMat("hatch");
  const dark = texMat("dark");
  const w = sit.chestW;
  const d = sit.chestD;
  const h = sit.chestH;
  const pecs = plump(w * 0.42, w * 0.36, h * 0.95, (d / w) * 0.9, hatch, 10);
  pecs.position.y = h * 0.15;
  g.add(pecs);
  const waist = plump(w * 0.28, w * 0.32, h * 0.45, (d / w) * 0.85, plate, 8);
  waist.position.y = -h * 0.35;
  g.add(waist);
  const hatchDot = plump(0.04, 0.038, 0.016, 0.45, dark, 6);
  hatchDot.position.set(0, h * 0.08, d * 0.42);
  g.add(hatchDot);
  return g;
}

export function buildPack(kind: string, sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "part_pack";
  const packM = texMat("pack");
  const dark = texMat("dark");
  const yellow = texMat("yellow");
  const steel = texMat("steel");
  const visor = texMat("visor");
  const p = sit.pack;
  if (kind === "can") {
    const hopper = plump(p * 0.64, p * 0.57, p, 0.7, packM, 8);
    hopper.position.z = -0.02;
    g.add(hopper);
    const lid = plump(p * 0.5, p * 0.46, p * 0.29, 0.75, dark, 6);
    lid.position.set(0, p * 0.57, -0.02);
    g.add(lid);
    const tape = plump(p * 0.2, p * 0.2, p * 0.14, 0.7, yellow, 6);
    tape.position.set(0, p * 0.64, -p * 0.57);
    g.add(tape);
  } else if (kind === "cell") {
    const bus = box(p * 1.14, p * 0.36, p * 0.57, steel);
    bus.position.set(0, p * 0.14, -p * 0.29);
    g.add(bus);
    const cell = (x: number) => {
      const c = plump(p * 0.32, p * 0.36, p * 1.14, 0.7, packM, 8);
      c.position.set(x, p * 0.71, -p * 0.36);
      g.add(c);
      const cap = plump(p * 0.21, p * 0.21, p * 0.14, 0.7, visor, 6);
      cap.position.set(x, p * 1.36, -p * 0.36);
      g.add(cap);
    };
    cell(-p * 0.36);
    cell(p * 0.36);
    const tape = box(p * 1.29, p * 0.14, p * 0.14, yellow);
    tape.position.set(0, p * 0.57, -p * 0.71);
    g.add(tape);
    const lead = cyl(0.012, 0.012, p * 0.71, dark, 6);
    lead.rotation.x = Math.PI / 2;
    lead.position.set(0, p * 0.14, p * 0.14);
    g.add(lead);
  }
  return g;
}

type ArmBits = {
  shoulder: THREE.Object3D;
  upper: THREE.Object3D;
  forearm: THREE.Object3D;
  wrist: THREE.Object3D;
};

/** Gunmetal blockers. Fancy plates swap these. Not dressed Solace. */
export function buildHeadShell(sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "shell_head";
  const steel = texMat("steel");
  const dark = texMat("dark");
  const h = sit.helm * 0.92;
  const dome = plump(h * 0.58, h * 0.64, h * 0.95, 0.9, steel, 8);
  dome.position.y = h * 0.48;
  g.add(dome);
  const collar = cyl(h * 0.42, h * 0.5, h * 0.22, dark, 8);
  collar.position.y = h * 0.08;
  g.add(collar);
  return g;
}

export function buildBodyShell(sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "shell_body";
  const steel = texMat("steel");
  const charcoal = texMat("charcoal");
  const w = sit.chestW;
  const d = sit.chestD;
  const h = sit.chestH;
  const pecs = plump(w * 0.4, w * 0.34, h * 0.92, (d / w) * 0.88, steel, 8);
  pecs.position.y = h * 0.12;
  g.add(pecs);
  const waist = plump(w * 0.26, w * 0.3, h * 0.42, (d / w) * 0.82, charcoal, 8);
  waist.position.y = -h * 0.32;
  g.add(waist);
  return g;
}

export function attachArmShell(arm: ArmBits, sit: GoldSit, side: 1 | -1) {
  const steel = texMat("steel");
  const dark = texMat("dark");
  const t = sit.thick * 1.15;
  const cap = cyl(sit.pauldron * 0.48, sit.pauldron * 0.42, sit.pauldron * 0.7, steel, 8);
  cap.name = side < 0 ? "shell_arm_L" : "shell_arm_R";
  cap.position.y = 0.01;
  arm.shoulder.add(cap);
  const sleeve = cyl(t * 0.88, t * 0.78, sit.upperLen * 0.78, dark, 8);
  sleeve.position.y = sit.upperLen * 0.4;
  arm.upper.add(sleeve);
  const gaunt = cyl(t * 0.74, t * 0.66, sit.faLen * 0.74, steel, 8);
  gaunt.position.y = sit.faLen * 0.38;
  arm.forearm.add(gaunt);
}

type LegBits = {
  thigh: THREE.Object3D;
  shin: THREE.Object3D;
  foot: THREE.Object3D;
};

export function attachLegShell(leg: LegBits, sit: GoldSit, side: 1 | -1) {
  const steel = texMat("steel");
  const dark = texMat("dark");
  const charcoal = texMat("charcoal");
  const thighCan = cyl(0.034, 0.03, sit.thighLen * 0.78, steel, 8);
  thighCan.name = side < 0 ? "shell_leg_L" : "shell_leg_R";
  thighCan.position.y = sit.thighLen * 0.38;
  leg.thigh.add(thighCan);
  const shinCan = cyl(0.028, 0.032, sit.shinLen * 0.74, dark, 8);
  shinCan.position.y = sit.shinLen * 0.36;
  leg.shin.add(shinCan);
  const boot = cyl(sit.boot * 0.34, sit.boot * 0.4, sit.boot * 0.72, charcoal, 8);
  boot.rotation.x = Math.PI / 2;
  boot.position.set(0, 0.018, sit.boot * 0.18);
  leg.foot.add(boot);
}

/** Small labor bucket + cyan slit. Parents to `head`. Swaps the head shell. */
export function attachArm(arm: ArmBits, kind: string, sit: GoldSit, side: 1 | -1) {
  if (kind !== "crane") return;
  const plate = texMat("plate");
  const dark = texMat("dark");
  const stripe = texMat("stripe");
  const t = sit.thick;

  const pauldron = cyl(sit.pauldron * 0.69, sit.pauldron * 0.62, sit.pauldron, plate, 8);
  pauldron.name = side < 0 ? "part_arm_L" : "part_arm_R";
  pauldron.position.set(0, 0.01, 0);
  arm.shoulder.add(pauldron);
  const tape = box(sit.pauldron * 1.12, sit.pauldron * 0.25, sit.pauldron * 0.25, stripe);
  tape.position.set(0, 0.01, sit.pauldron * 0.69);
  arm.shoulder.add(tape);

  const sleeve = cyl(t * 0.95, t * 0.82, sit.upperLen * 0.72, dark, 8);
  sleeve.position.y = sit.upperLen * 0.36;
  arm.upper.add(sleeve);

  const gaunt = cyl(t * 0.8, t * 0.7, sit.faLen * 0.7, plate, 8);
  gaunt.position.y = sit.faLen * 0.36;
  arm.forearm.add(gaunt);
}

export type GripHold = "pole" | "hilt" | "slab";

/** Labor clamp on `wrist_*` only when that hand holds a tool. Cannon is the hand — no gripper. No empty-hand pose (cannot Board unarmed). */
export function buildGripper(side: 1 | -1, hold: GripHold, sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = side < 0 ? "gripper_L" : "gripper_R";
  const charcoal = texMat("charcoal");
  const brass = texMat("brass");
  const dark = texMat("dark");
  const curl = 1.05;

  const palm = box(0.042, 0.026, 0.036, charcoal);
  palm.position.y = 0.016;
  g.add(palm);
  const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.016, 7, 5), brass);
  g.add(knuckle);
  const pad = cyl(0.014, 0.014, 0.028, dark, 6);
  pad.position.y = 0.02;
  g.add(pad);

  const digit = (yaw: number, splay: number, scale = 1) => {
    const root = new THREE.Group();
    root.position.set(splay, 0.022, 0);
    root.rotation.set(curl * 0.4, yaw, splay * 8);
    const p1 = box(0.012 * scale, 0.026 * scale, 0.011 * scale, charcoal);
    p1.position.y = 0.013 * scale;
    root.add(p1);
    const mid = new THREE.Group();
    mid.position.y = 0.026 * scale;
    mid.rotation.x = curl * 0.75;
    root.add(mid);
    const p2 = box(0.01 * scale, 0.02 * scale, 0.01 * scale, charcoal);
    p2.position.y = 0.01 * scale;
    mid.add(p2);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.007 * scale, 5, 4), brass);
    tip.position.y = 0.022 * scale;
    mid.add(tip);
    return root;
  };

  const inw = -side * 0.016;
  g.add(digit(0.15, inw * 0.4, 0.92));
  g.add(digit(-0.55, inw));
  g.add(digit(0.7, -inw * 0.85, 0.88));
  if (hold === "pole") g.rotation.z = Math.PI / 2;
  else if (hold === "slab") g.rotation.set(0.2, side * 0.4, 0);
  else g.rotation.set(0.08, 0.12, 0.1);
  g.scale.setScalar(sit.gripSize);
  return g;
}

/** Piston cans on the live leg sockets. Knee/ankle brass stay exposed. */
export function attachLeg(leg: LegBits, kind: string, sit: GoldSit, side: 1 | -1) {
  if (kind !== "piston") return;
  const plate = texMat("plate");
  const dark = texMat("dark");
  const bootM = texMat("boot");
  const steel = texMat("steel");
  const stripe = texMat("stripe");

  const thighCan = cyl(0.038, 0.032, sit.thighLen * 0.7, plate, 8);
  thighCan.name = side < 0 ? "part_leg_L" : "part_leg_R";
  thighCan.position.y = sit.thighLen * 0.35;
  leg.thigh.add(thighCan);

  const shinCan = cyl(0.03, 0.034, sit.shinLen * 0.68, dark, 8);
  shinCan.position.y = sit.shinLen * 0.34;
  leg.shin.add(shinCan);
  const tape = box(0.055, 0.018, 0.012, stripe);
  tape.position.set(0, sit.shinLen * 0.34, 0.034);
  leg.shin.add(tape);

  const sole = cyl(sit.boot * 0.4, sit.boot * 0.48, sit.boot, bootM, 8);
  sole.rotation.x = Math.PI / 2;
  sole.position.set(0, 0.02, sit.boot * 0.25);
  leg.foot.add(sole);
  const heel = cyl(sit.boot * 0.33, sit.boot * 0.37, sit.boot * 0.25, steel, 6);
  heel.rotation.x = Math.PI / 2;
  heel.position.set(0, 0.016, -sit.boot * 0.33);
  leg.foot.add(heel);
}

/** Parents to `weapon` / `weapon_L` on `weapon_mount_*`. side +1 right, -1 left. */
export function buildWeapon(kind: string, sit: GoldSit, side: 1 | -1 = 1): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  if (kind === "scythe") return buildScythe(sit);
  if (kind === "cannon") return buildCannon(sit, side);
  if (kind === "saw") return buildSaw(sit);
  if (kind === "shield") return buildShield(sit, side);
  return g;
}

/** Farmer-cut: snath across the hips, both fists on the pole, crescent out. */
function buildScythe(sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const wood = texMat("wood");
  const bladeM = texMat("blade");
  const steel = texMat("steel");
  const dark = texMat("dark");
  const snathLen = sit.snath;
  const scythe = new THREE.Group();
  scythe.name = "scythe";
  const snath = cyl(0.013, 0.017, snathLen, wood, 8);
  snath.rotation.z = Math.PI / 2;
  scythe.add(snath);
  const wrap = snathLen / 1.28;
  const w1 = cyl(0.02, 0.02, 0.12, dark, 6);
  w1.rotation.z = Math.PI / 2;
  w1.position.x = -0.12 * wrap;
  scythe.add(w1);
  const w2 = cyl(0.02, 0.02, 0.12, dark, 6);
  w2.rotation.z = Math.PI / 2;
  w2.position.x = 0.16 * wrap;
  scythe.add(w2);
  const fx = snathLen * (0.6 / 1.28);
  const ferrule = cyl(0.02, 0.02, 0.04, steel, 8);
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.set(fx, 0, 0);
  scythe.add(ferrule);
  const weld = box(0.055, 0.03, 0.045, steel);
  weld.position.set(fx, 0, 0.012);
  scythe.add(weld);
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
  const bScale = sit.blade / 0.46;
  blade.scale.set(bScale, 1, bScale);
  scythe.add(blade);
  scythe.position.set(0, 0, 0);
  g.add(scythe);
  return g;
}

/** Forearm lance: tube continues the wrist. Muzzle along +Y. */
function buildCannon(sit: GoldSit, side: 1 | -1 = 1): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const steel = texMat("steel");
  const dark = texMat("dark");
  const visor = texMat("visor");
  const yellow = texMat("yellow");
  const len = sit.cannonLen;
  const r = sit.cannonR;
  const gun = new THREE.Group();
  gun.name = "cannon";
  const cuff = cyl(r * 1.4, r * 1.22, len * 0.29, dark, 8);
  cuff.position.y = len * 0.07;
  gun.add(cuff);
  const tube = cyl(r * 0.83, r, len * 0.71, steel, 8);
  tube.position.y = len * 0.57;
  gun.add(tube);
  const ring = cyl(r * 1.06, r * 1.06, len * 0.1, yellow, 8);
  ring.position.y = len * 0.29;
  gun.add(ring);
  const ring2 = cyl(r * 1.06, r * 1.06, len * 0.08, yellow, 8);
  ring2.position.y = len * 0.64;
  gun.add(ring2);
  const muzzle = cyl(r * 0.5, r * 0.78, len * 0.14, visor, 8);
  muzzle.name = "muzzle";
  muzzle.position.y = len;
  gun.add(muzzle);
  const bore = cyl(r * 0.33, r * 0.33, len * 0.11, dark, 8);
  bore.position.y = len * 1.07;
  gun.add(bore);
  /** Muzzle along +Y. A little pitch so the 3/4 sit reads as a presented lance, not a hanging pipe. */
  gun.rotation.x = 0.18;
  g.add(gun);
  return g;
}

/** Serrated short sword hanging from the fist. Blade along +Y (down when the arm hangs). */
function buildSaw(sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const steel = texMat("steel");
  const dark = texMat("dark");
  const bladeM = texMat("blade");
  const yellow = texMat("yellow");
  const len = sit.sawLen;
  const saw = new THREE.Group();
  saw.name = "saw";
  const hilt = cyl(0.016, 0.02, 0.07, dark, 6);
  saw.add(hilt);
  const guard = box(0.055, 0.018, 0.04, steel);
  guard.position.y = 0.07;
  saw.add(guard);
  const bar = box(0.03, len, 0.01, steel);
  bar.position.y = 0.07 + len * 0.5;
  saw.add(bar);
  const teeth = box(0.042, len * 0.94, 0.006, bladeM);
  teeth.position.set(0.016, 0.07 + len * 0.5, 0);
  saw.add(teeth);
  const tape = box(0.036, 0.02, 0.036, yellow);
  tape.position.y = 0.08;
  saw.add(tape);
  /** Hang: blade along +Y (world down). Slight yaw so the teeth read in 3/4. */
  saw.rotation.y = 0.45;
  g.add(saw);
  return g;
}

/** Door slab at the hip. Face toward the camera when the off-arm hangs. */
function buildShield(sit: GoldSit, side: 1 | -1 = 1): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const plate = texMat("plate");
  const steel = texMat("steel");
  const dark = texMat("dark");
  const yellow = texMat("yellow");
  const h = sit.shieldH;
  const w = sit.shieldW;
  const slab = new THREE.Group();
  slab.name = "shield";
  /** Hang: +Y is down. Negative Y covers the ribs; inward + toward camera so the door is a flank. */
  const ox = -side * w * 0.38;
  const oy = -h * 0.22;
  const oz = -0.08;
  const door = box(w, h, 0.04, plate);
  door.position.set(ox, oy, oz);
  slab.add(door);
  const rim = box(w * 1.1, h * 1.04, 0.016, steel);
  rim.position.set(ox, oy, oz + 0.02);
  slab.add(rim);
  const slot = box(w * 0.28, h * 0.06, 0.012, dark);
  slot.position.set(ox, oy + h * 0.28, oz + 0.028);
  slab.add(slot);
  const warn = box(w * 0.2, w * 0.2, 0.012, yellow);
  warn.position.set(ox, oy - h * 0.28, oz + 0.028);
  slab.add(warn);
  const grip = cyl(0.016, 0.016, 0.08, dark, 6);
  slab.add(grip);
  slab.rotation.y = side * 0.22;
  g.add(slab);
  return g;
}
