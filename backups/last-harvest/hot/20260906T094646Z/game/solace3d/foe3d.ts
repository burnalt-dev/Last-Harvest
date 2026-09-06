import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

/**
 * Veldt beastmen. Same toon construction as Solace (primitives + ramp + outline).
 * Not modular. Not wanzer plates. Cyan = bloom-ore only (eyes / tool spark).
 * Concepts: last-harvest-foe3d/assets/forest-beastmen/
 */
const ORE = new THREE.MeshBasicMaterial({ color: 0x5ee0d0 });

function sph(r: number, mat: THREE.Material, seg = 8) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg - 2), mat);
}
function box(w: number, h: number, d: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}
function cyl(rt: number, rb: number, h: number, mat: THREE.Material, seg = 6) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
}

function antler(mat: THREE.Material, s = 1) {
  const g = new THREE.Group();
  const beam = cyl(0.012 * s, 0.008 * s, 0.16 * s, mat, 5);
  beam.position.y = 0.08 * s;
  g.add(beam);
  const tine = cyl(0.008 * s, 0.006 * s, 0.09 * s, mat, 5);
  tine.position.set(0.03 * s, 0.13 * s, 0);
  tine.rotation.z = -0.7;
  g.add(tine);
  return g;
}

/** Stripekin — ¼-grid scavenger chaff. Stripes on face / mane / tail / ankle. Light scrap ~30–40%. */
function stripekin(): THREE.Group {
  const hide = texMat("hide");
  const pelt = texMat("pelt");
  const cream = texMat("cream");
  const soot = texMat("charcoal");
  const wood = texMat("wood");
  const stone = texMat("stone");
  const scrap = texMat("dark");
  const brass = texMat("brass");
  const rag = texMat("rubber");
  const amber = new THREE.MeshBasicMaterial({ color: 0xc48428 });
  const g = new THREE.Group();
  g.name = "stripekin";
  const bob = new THREE.Group();
  bob.name = "stripekin_bob";
  g.add(bob);

  const hip = sph(0.052, pelt, 8);
  hip.scale.set(1.15, 0.7, 0.95);
  hip.position.y = 0.28;
  g.add(hip);
  const torso = cyl(0.048, 0.058, 0.16, pelt, 8);
  torso.position.y = 0.4;
  g.add(torso);
  const belly = sph(0.042, cream, 7);
  belly.scale.set(0.9, 1.1, 0.55);
  belly.position.set(0, 0.36, 0.028);
  g.add(belly);

  const strapA = box(0.11, 0.016, 0.02, rag);
  strapA.position.set(0.01, 0.46, 0.038);
  strapA.rotation.z = 0.55;
  g.add(strapA);
  const strapB = box(0.1, 0.014, 0.018, rag);
  strapB.position.set(-0.01, 0.38, 0.04);
  strapB.rotation.z = -0.4;
  g.add(strapB);
  const rivet = sph(0.007, brass, 5);
  rivet.position.set(0.02, 0.44, 0.052);
  g.add(rivet);

  const belt = box(0.11, 0.018, 0.055, rag);
  belt.position.set(0, 0.3, 0.01);
  g.add(belt);
  const rope = cyl(0.008, 0.008, 0.12, wood, 5);
  rope.rotation.z = Math.PI / 2;
  rope.position.set(0, 0.3, 0.03);
  g.add(rope);
  const pouch = box(0.03, 0.036, 0.022, soot);
  pouch.position.set(0.04, 0.275, 0.04);
  g.add(pouch);
  const pouch2 = box(0.022, 0.028, 0.018, rag);
  pouch2.position.set(-0.035, 0.278, 0.038);
  g.add(pouch2);

  const cloth = box(0.1, 0.08, 0.04, soot);
  cloth.position.set(0, 0.22, 0.02);
  g.add(cloth);
  const flap = box(0.04, 0.07, 0.02, rag);
  flap.position.set(0.02, 0.2, 0.042);
  g.add(flap);

  const pauldron = box(0.07, 0.038, 0.08, scrap);
  pauldron.position.set(0.08, 0.49, 0.01);
  pauldron.rotation.z = 0.28;
  g.add(pauldron);
  const pLip = box(0.05, 0.012, 0.06, soot);
  pLip.position.set(0.085, 0.47, 0.02);
  g.add(pLip);

  const head = sph(0.068, hide, 8);
  head.name = "stripekin_head";
  head.scale.set(0.95, 1.05, 1.12);
  head.position.set(0, 0.58, 0.02);
  g.add(head);
  const cheek = box(0.018, 0.04, 0.012, hide);
  cheek.position.set(-0.04, 0.58, 0.05);
  g.add(cheek);
  const snout = cyl(0.03, 0.018, 0.075, cream, 6);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.56, 0.08);
  g.add(snout);
  const stripeNose = box(0.012, 0.02, 0.05, hide);
  stripeNose.position.set(0, 0.575, 0.09);
  g.add(stripeNose);
  const ear = (s: 1 | -1) => {
    const e = box(0.026, 0.055, 0.012, hide);
    e.position.set(s * 0.052, 0.655, -0.01);
    e.rotation.z = s * -0.35;
    g.add(e);
    const inr = box(0.012, 0.028, 0.007, cream);
    inr.position.set(s * 0.052, 0.65, 0.0);
    g.add(inr);
  };
  ear(1);
  ear(-1);
  for (let i = 0; i < 4; i++) {
    const tuft = box(0.016, 0.042, 0.014, i % 2 ? hide : soot);
    tuft.position.set((i - 1.5) * 0.012, 0.655 + (i % 2) * 0.01, -0.02);
    g.add(tuft);
  }
  const iris = sph(0.01, amber, 6);
  iris.position.set(0.028, 0.59, 0.072);
  g.add(iris);
  const spark = sph(0.004, ORE, 5);
  spark.position.set(0.032, 0.592, 0.08);
  g.add(spark);

  const armBare = cyl(0.018, 0.014, 0.15, pelt, 6);
  armBare.position.set(-0.095, 0.38, 0.02);
  armBare.rotation.z = 1.05;
  g.add(armBare);
  const handL = sph(0.016, hide, 6);
  handL.position.set(-0.155, 0.33, 0.045);
  g.add(handL);

  const armR = cyl(0.018, 0.014, 0.15, pelt, 6);
  armR.position.set(0.095, 0.4, 0.02);
  armR.rotation.z = -1.05;
  g.add(armR);
  const wrap = cyl(0.022, 0.02, 0.055, rag, 6);
  wrap.position.set(0.12, 0.36, 0.025);
  wrap.rotation.z = -1.05;
  g.add(wrap);
  const bracer = cyl(0.02, 0.018, 0.04, scrap, 6);
  bracer.position.set(0.135, 0.33, 0.03);
  bracer.rotation.z = -1.05;
  g.add(bracer);
  const handR = sph(0.016, hide, 6);
  handR.position.set(0.155, 0.32, 0.04);
  g.add(handR);

  const spear = new THREE.Group();
  spear.name = "stripekin_spear";
  spear.position.set(0, 0.34, 0.06);
  spear.rotation.set(0.15, 0, 1.15);
  const haft = cyl(0.01, 0.012, 0.52, wood, 5);
  spear.add(haft);
  const lash = cyl(0.016, 0.016, 0.04, soot, 5);
  lash.position.y = 0.2;
  spear.add(lash);
  const tip = box(0.028, 0.1, 0.014, stone);
  tip.position.y = 0.28;
  spear.add(tip);
  g.add(spear);

  const leg = (s: 1 | -1) => {
    const thigh = cyl(0.026, 0.02, 0.13, pelt, 6);
    thigh.position.set(s * 0.042, 0.16, 0);
    g.add(thigh);
    const shin = cyl(0.02, 0.016, 0.11, pelt, 6);
    shin.position.set(s * 0.045, 0.05, 0.01);
    g.add(shin);
    const ankle = cyl(0.018, 0.016, 0.03, hide, 6);
    ankle.position.set(s * 0.046, 0.018, 0.018);
    g.add(ankle);
    const wrapA = box(0.032, 0.014, 0.032, rag);
    wrapA.position.set(s * 0.046, 0.03, 0.025);
    g.add(wrapA);
    const foot = box(0.036, 0.016, 0.06, soot);
    foot.position.set(s * 0.046, 0.01, 0.02);
    g.add(foot);
  };
  leg(1);
  leg(-1);

  const tail = new THREE.Group();
  tail.position.set(0, 0.28, -0.05);
  for (let i = 0; i < 5; i++) {
    const ring = sph(0.02 - i * 0.002, i % 2 ? soot : hide, 6);
    ring.position.set(0, -0.01 * i, -0.05 * i);
    tail.add(ring);
  }
  const tuftEnd = box(0.018, 0.036, 0.018, soot);
  tuftEnd.position.set(0, 0.01, -0.26);
  tail.add(tuftEnd);
  g.add(tail);
  while (g.children.length > 1) bob.add(g.children[1]!);
  return g;
}

/** Antlerkin — stag brute, bloom-ore maul. */
function antlerkin(): THREE.Group {
  const hide = texMat("gasket");
  const cream = texMat("cream");
  const soot = texMat("charcoal");
  const wood = texMat("wood");
  const slag = texMat("steel");
  const g = new THREE.Group();
  const hips = sph(0.09, hide, 8);
  hips.scale.set(1.3, 0.8, 1.1);
  hips.position.y = 0.16;
  g.add(hips);
  const torso = sph(0.13, hide, 8);
  torso.scale.set(1.15, 1.05, 0.9);
  torso.position.y = 0.34;
  g.add(torso);
  const belly = sph(0.07, cream, 7);
  belly.position.set(0, 0.28, 0.1);
  g.add(belly);
  const head = sph(0.09, hide, 8);
  head.position.set(0, 0.52, 0.04);
  g.add(head);
  const muzzle = cyl(0.04, 0.03, 0.08, cream, 6);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.5, 0.1);
  g.add(muzzle);
  const L = antler(wood, 1.15);
  L.position.set(-0.05, 0.58, 0);
  L.rotation.z = 0.35;
  g.add(L);
  const R = antler(wood, 1.15);
  R.position.set(0.05, 0.58, 0);
  R.rotation.z = -0.35;
  g.add(R);
  const eye = sph(0.014, ORE, 6);
  eye.position.set(0.04, 0.54, 0.08);
  g.add(eye);
  const arm = cyl(0.04, 0.03, 0.22, soot, 6);
  arm.position.set(0.16, 0.32, 0.02);
  arm.rotation.z = -0.5;
  g.add(arm);
  const haft = cyl(0.016, 0.018, 0.36, wood, 6);
  haft.position.set(0.22, 0.28, 0.04);
  haft.rotation.z = -0.55;
  g.add(haft);
  const maul = box(0.12, 0.1, 0.1, slag);
  maul.position.set(0.34, 0.42, 0.04);
  g.add(maul);
  const spark = box(0.06, 0.04, 0.04, ORE);
  spark.position.set(0.38, 0.42, 0.07);
  g.add(spark);
  const thigh = cyl(0.045, 0.032, 0.16, hide, 6);
  thigh.position.set(0.06, 0.08, 0);
  g.add(thigh);
  const thighL = cyl(0.045, 0.032, 0.16, hide, 6);
  thighL.position.set(-0.06, 0.08, 0);
  g.add(thighL);
  const shin = cyl(0.028, 0.022, 0.12, soot, 6);
  shin.position.set(0.06, 0.0, 0.02);
  g.add(shin);
  const shinL = cyl(0.028, 0.022, 0.12, soot, 6);
  shinL.position.set(-0.06, 0.0, 0.02);
  g.add(shinL);
  return g;
}

/** Rootwarden — elite. Combat pickaxe, not a scythe. */
function rootwarden(): THREE.Group {
  const hide = texMat("gasket");
  const bark = texMat("wood");
  const cream = texMat("cream");
  const slag = texMat("steel");
  const g = new THREE.Group();
  const torso = sph(0.12, hide, 8);
  torso.scale.set(1.05, 1.25, 0.9);
  torso.position.y = 0.36;
  g.add(torso);
  const plate = box(0.22, 0.08, 0.16, bark);
  plate.position.set(0, 0.42, 0.02);
  g.add(plate);
  const head = sph(0.085, hide, 8);
  head.position.y = 0.56;
  g.add(head);
  const L = antler(bark, 1.35);
  L.position.set(-0.04, 0.62, -0.01);
  L.rotation.z = 0.45;
  g.add(L);
  const R = antler(bark, 1.35);
  R.position.set(0.04, 0.62, -0.01);
  R.rotation.z = -0.45;
  g.add(R);
  const eye = sph(0.015, ORE, 6);
  eye.position.set(0.035, 0.57, 0.07);
  g.add(eye);
  const muzzle = cyl(0.032, 0.022, 0.07, cream, 6);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.54, 0.09);
  g.add(muzzle);
  const haft = cyl(0.014, 0.016, 0.38, bark, 6);
  haft.position.set(0.18, 0.32, 0.02);
  haft.rotation.z = -0.35;
  g.add(haft);
  const pick = box(0.16, 0.04, 0.04, slag);
  pick.position.set(0.3, 0.48, 0.02);
  pick.rotation.z = 0.4;
  g.add(pick);
  const spike = box(0.04, 0.1, 0.03, ORE);
  spike.position.set(0.36, 0.54, 0.02);
  spike.rotation.z = 0.4;
  g.add(spike);
  return g;
}

/** Barkback — hunched bark sponge (smith slot until kinds split). */
function barkback(): THREE.Group {
  const hide = texMat("gasket");
  const bark = texMat("wood");
  const cream = texMat("cream");
  const g = new THREE.Group();
  const body = sph(0.16, hide, 8);
  body.scale.set(1.25, 0.85, 1.1);
  body.position.y = 0.2;
  g.add(body);
  for (const [x, y, z, s] of [
    [0, 0.28, -0.04, 1],
    [0.1, 0.22, 0.02, 0.85],
    [-0.1, 0.22, 0.02, 0.85],
    [0, 0.16, -0.08, 0.9],
  ] as const) {
    const sh = box(0.14 * s, 0.05, 0.12 * s, bark);
    sh.position.set(x, y, z);
    sh.rotation.x = -0.35;
    g.add(sh);
  }
  const head = sph(0.08, hide, 7);
  head.position.set(0, 0.28, 0.14);
  g.add(head);
  const snout = cyl(0.035, 0.025, 0.07, cream, 6);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 0.26, 0.2);
  g.add(snout);
  const eye = sph(0.012, ORE, 6);
  eye.position.set(0.03, 0.3, 0.18);
  g.add(eye);
  return g;
}

/** Visual fit for ¼-cell occupancy. Spear tip may overhang. */
export const SMALL_UNIT_SCALE = 0.24;
export const FULL_FOE_SCALE = 0.92;

export function buildFoe(kind: "small" | "big" | "elite" | "smith"): THREE.Group {
  const root = new THREE.Group();
  root.name = `foe_${kind}`;
  if (kind === "small") {
    root.add(stripekin());
    root.scale.setScalar(SMALL_UNIT_SCALE);
    root.userData.foeName = "Stripekin";
    addOutline(root, 1.1);
  } else if (kind === "elite") {
    root.add(rootwarden());
    root.scale.setScalar(FULL_FOE_SCALE);
    addOutline(root, 1.05);
  } else if (kind === "smith") {
    root.add(barkback());
    root.scale.setScalar(FULL_FOE_SCALE);
    addOutline(root, 1.05);
  } else {
    root.add(antlerkin());
    root.scale.setScalar(FULL_FOE_SCALE);
    addOutline(root, 1.05);
  }
  return root;
}

function wrapPi(d: number) {
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Procedural Stripekin idle + short yaw ease. No root XZ motion. */
export function tickFoe(root: THREE.Object3D, now: number) {
  if (!root.name.startsWith("foe_small") && root.name !== "stripekin" && !root.getObjectByName("stripekin_bob")) return;
  const bob = root.getObjectByName("stripekin_bob");
  const spear = root.getObjectByName("stripekin_spear");
  const head = root.getObjectByName("stripekin_head");
  const seed = (root.id % 19) * 0.41;
  const attack = root.userData.foeState === "attack";
  if (bob) {
    const s = Math.sin(now / 900 + seed);
    const c = Math.cos(now / 1280 + seed);
    bob.position.y = attack ? 0.012 : s * 0.01;
    bob.rotation.z = attack ? 0 : c * 0.05;
  }
  if (spear) {
    spear.rotation.x = attack ? Math.sin(now / 90) * 0.35 : Math.sin(now / 740 + seed) * 0.09;
  }
  if (head) head.rotation.y = Math.sin(now / 1480 + seed) * 0.07;
  const want = root.userData.faceYaw as number | undefined;
  if (want === undefined) return;
  root.rotation.y += wrapPi(want - root.rotation.y) * 0.28;
}
