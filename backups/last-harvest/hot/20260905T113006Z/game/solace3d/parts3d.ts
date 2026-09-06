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
export function buildHead(kind: string, _sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "part_head";
  if (kind !== "bucket") return g;
  const plate = texMat("plate");
  const visor = texMat("visor");
  const dark = texMat("dark");
  const helm = plump(0.055, 0.06, 0.09, 0.92, plate, 10);
  helm.position.y = 0.05;
  g.add(helm);
  const slit = box(0.1, 0.028, 0.022, visor);
  slit.name = "visor";
  slit.position.set(0, 0.055, 0.058);
  g.add(slit);
  const cap = box(0.03, 0.016, 0.024, dark);
  cap.position.set(0, 0.1, 0);
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
  if (kind === "can") {
    const hopper = plump(0.09, 0.08, 0.14, 0.7, packM, 8);
    hopper.position.z = -0.02;
    g.add(hopper);
    const lid = plump(0.07, 0.065, 0.04, 0.75, dark, 6);
    lid.position.set(0, 0.08, -0.02);
    g.add(lid);
    const tape = plump(0.028, 0.028, 0.02, 0.7, yellow, 6);
    tape.position.set(0, 0.09, -0.08);
    g.add(tape);
  } else if (kind === "cell") {
    const bus = box(0.16, 0.05, 0.08, steel);
    bus.position.set(0, 0.02, -0.04);
    g.add(bus);
    const cell = (x: number) => {
      const c = plump(0.045, 0.05, 0.16, 0.7, packM, 8);
      c.position.set(x, 0.1, -0.05);
      g.add(c);
      const cap = plump(0.03, 0.03, 0.02, 0.7, visor, 6);
      cap.position.set(x, 0.19, -0.05);
      g.add(cap);
    };
    cell(-0.05);
    cell(0.05);
    const tape = box(0.18, 0.02, 0.02, yellow);
    tape.position.set(0, 0.08, -0.1);
    g.add(tape);
    const lead = cyl(0.012, 0.012, 0.1, dark, 6);
    lead.rotation.x = Math.PI / 2;
    lead.position.set(0, 0.02, 0.02);
    g.add(lead);
  }
  void sit;
  return g;
}

type ArmBits = {
  shoulder: THREE.Object3D;
  upper: THREE.Object3D;
  forearm: THREE.Object3D;
  wrist: THREE.Object3D;
};

/** Crane plates on the live arm sockets. Elbow/wrist brass stay exposed. */
export function attachArm(arm: ArmBits, kind: string, sit: GoldSit, side: 1 | -1) {
  if (kind !== "crane") return;
  const plate = texMat("plate");
  const dark = texMat("dark");
  const stripe = texMat("stripe");
  const bootM = texMat("boot");
  const t = sit.thick;

  const pauldron = cyl(0.055, 0.05, 0.08, plate, 8);
  pauldron.name = side < 0 ? "part_arm_L" : "part_arm_R";
  pauldron.position.set(0, 0.01, 0);
  arm.shoulder.add(pauldron);
  const tape = box(0.09, 0.02, 0.02, stripe);
  tape.position.set(0, 0.01, 0.055);
  arm.shoulder.add(tape);

  const sleeve = cyl(t * 0.95, t * 0.82, sit.upperLen * 0.72, dark, 8);
  sleeve.position.y = sit.upperLen * 0.36;
  arm.upper.add(sleeve);

  const gaunt = cyl(t * 0.8, t * 0.7, sit.faLen * 0.7, plate, 8);
  gaunt.position.y = sit.faLen * 0.36;
  arm.forearm.add(gaunt);

  const fist = box(0.07, 0.055, 0.07, bootM);
  fist.position.y = 0.04;
  arm.wrist.add(fist);
}

type LegBits = {
  thigh: THREE.Object3D;
  shin: THREE.Object3D;
  foot: THREE.Object3D;
};

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

  const sole = cyl(0.048, 0.058, 0.12, bootM, 8);
  sole.rotation.x = Math.PI / 2;
  sole.position.set(0, 0.02, 0.03);
  leg.foot.add(sole);
  const heel = cyl(0.04, 0.044, 0.03, steel, 6);
  heel.rotation.x = Math.PI / 2;
  heel.position.set(0, 0.016, -0.04);
  leg.foot.add(heel);
}

/** Parents to `weapon` / `weapon_L` on `weapon_mount_*`. side +1 right, -1 left. */
export function buildWeapon(kind: string, sit: GoldSit, side: 1 | -1 = 1): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  if (kind === "scythe") return buildScythe(sit);
  if (kind === "cannon") return buildCannon(side);
  if (kind === "saw") return buildSaw();
  if (kind === "shield") return buildShield(side);
  return g;
}

/** Staff-carry: snath vertical at the hip, crescent at the top. Idle is not two-hand across. */
function buildScythe(sit: GoldSit): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const wood = texMat("wood");
  const bladeM = texMat("blade");
  const steel = texMat("steel");
  const dark = texMat("dark");
  const yellow = texMat("yellow");
  const snathLen = sit.snath;
  const scythe = new THREE.Group();
  scythe.name = "scythe";
  const snath = cyl(0.014, 0.018, snathLen, wood, 8);
  snath.position.y = -snathLen * 0.18;
  scythe.add(snath);
  const wrap = snathLen / 1.28;
  const w1 = cyl(0.022, 0.022, 0.1, dark, 6);
  w1.position.y = 0.06 * wrap;
  scythe.add(w1);
  const w2 = cyl(0.022, 0.022, 0.1, dark, 6);
  w2.position.y = -0.28 * wrap;
  scythe.add(w2);
  const tape = cyl(0.02, 0.02, 0.05, yellow, 6);
  tape.position.y = -0.12 * wrap;
  scythe.add(tape);
  const tip = -snathLen * 0.68;
  const ferrule = cyl(0.02, 0.022, 0.05, steel, 8);
  ferrule.position.y = tip;
  scythe.add(ferrule);
  const weld = box(0.04, 0.04, 0.05, steel);
  weld.position.set(0.012, tip, 0);
  scythe.add(weld);
  const knife = new THREE.Shape();
  knife.moveTo(0, -0.02);
  knife.lineTo(0.02, 0.01);
  knife.quadraticCurveTo(0.18, 0.1, 0.38, 0.05);
  knife.quadraticCurveTo(0.48, 0.0, 0.42, -0.08);
  knife.quadraticCurveTo(0.18, -0.05, 0, -0.03);
  knife.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(knife, { depth: 0.012, bevelEnabled: false, steps: 1 }),
    bladeM,
  );
  blade.name = "blade";
  blade.position.set(0, tip, -0.006);
  scythe.add(blade);
  scythe.rotation.set(0.08, 0.18, 0.06);
  scythe.position.set(0.015 + sit.grip * 0.03, -snathLen * 0.12, 0.05);
  g.add(scythe);
  return g;
}

/** Forearm lance: tube continues the wrist. Muzzle along +Y. */
function buildCannon(side: 1 | -1 = 1): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const steel = texMat("steel");
  const dark = texMat("dark");
  const visor = texMat("visor");
  const yellow = texMat("yellow");
  const gun = new THREE.Group();
  gun.name = "cannon";
  const sleeve = cyl(0.04, 0.044, 0.1, dark, 8);
  sleeve.position.y = 0.02;
  gun.add(sleeve);
  const tube = cyl(0.03, 0.036, 0.2, steel, 8);
  tube.position.y = 0.16;
  gun.add(tube);
  const ring = cyl(0.038, 0.038, 0.028, yellow, 8);
  ring.position.y = 0.08;
  gun.add(ring);
  const ring2 = cyl(0.038, 0.038, 0.022, yellow, 8);
  ring2.position.y = 0.18;
  gun.add(ring2);
  const muzzle = cyl(0.018, 0.028, 0.04, visor, 8);
  muzzle.name = "muzzle";
  muzzle.position.y = 0.28;
  gun.add(muzzle);
  const bore = cyl(0.012, 0.012, 0.03, dark, 8);
  bore.position.y = 0.3;
  gun.add(bore);
  gun.rotation.z = side * 0.06;
  g.add(gun);
  return g;
}

/** Serrated short sword hanging from the fist. Blade along +Y (down when the arm hangs). */
function buildSaw(): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const steel = texMat("steel");
  const dark = texMat("dark");
  const bladeM = texMat("blade");
  const yellow = texMat("yellow");
  const saw = new THREE.Group();
  saw.name = "saw";
  const hilt = cyl(0.016, 0.02, 0.07, dark, 6);
  hilt.position.y = 0.03;
  saw.add(hilt);
  const guard = box(0.055, 0.018, 0.04, steel);
  guard.position.y = 0.07;
  saw.add(guard);
  const bar = box(0.03, 0.34, 0.01, steel);
  bar.position.y = 0.25;
  saw.add(bar);
  const teeth = box(0.042, 0.32, 0.006, bladeM);
  teeth.position.set(0.016, 0.25, 0);
  saw.add(teeth);
  const tape = box(0.036, 0.02, 0.036, yellow);
  tape.position.y = 0.08;
  saw.add(tape);
  saw.rotation.set(0.12, 0.15, 0.18);
  g.add(saw);
  return g;
}

/** Door slab at the hip. Face toward the camera when the off-arm hangs. */
function buildShield(side: 1 | -1 = 1): THREE.Group {
  const g = new THREE.Group();
  g.name = "weapon";
  const plate = texMat("plate");
  const steel = texMat("steel");
  const dark = texMat("dark");
  const yellow = texMat("yellow");
  const slab = new THREE.Group();
  slab.name = "shield";
  const door = box(0.16, 0.42, 0.036, plate);
  door.position.set(side * 0.07, -0.06, 0.05);
  slab.add(door);
  const rim = box(0.18, 0.44, 0.014, steel);
  rim.position.set(side * 0.07, -0.06, 0.032);
  slab.add(rim);
  const slot = box(0.05, 0.028, 0.012, dark);
  slot.position.set(side * 0.07, -0.18, 0.07);
  slab.add(slot);
  const warn = box(0.036, 0.036, 0.012, yellow);
  warn.position.set(side * 0.07, 0.08, 0.07);
  slab.add(warn);
  const grip = cyl(0.016, 0.016, 0.08, dark, 6);
  grip.position.set(side * 0.02, 0.04, 0.02);
  slab.add(grip);
  slab.rotation.set(0.04, Math.PI + side * -0.25, side * 0.06);
  g.add(slab);
  return g;
}
