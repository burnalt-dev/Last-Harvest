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

  const pauldron = box(0.07, 0.045, 0.055, scrap);
  pauldron.position.set(0.055, 0.48, 0.01);
  pauldron.rotation.z = -0.25;
  g.add(pauldron);
  const stud = sph(0.008, brass, 5);
  stud.position.set(0.07, 0.49, 0.03);
  g.add(stud);

  const bracer = cyl(0.016, 0.016, 0.03, scrap, 6);
  bracer.position.set(-0.07, 0.34, 0.02);
  bracer.rotation.z = 0.4;
  g.add(bracer);

  const head = new THREE.Group();
  head.name = "stripekin_head";
  head.position.set(0, 0.54, 0.01);
  g.add(head);
  const skull = sph(0.048, hide, 8);
  head.add(skull);
  const snout = cyl(0.022, 0.016, 0.05, cream, 6);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.006, 0.04);
  head.add(snout);
  const stripe = box(0.018, 0.055, 0.012, soot);
  stripe.position.set(0, 0.01, 0.04);
  head.add(stripe);
  const mane = box(0.03, 0.06, 0.02, soot);
  mane.position.set(0, 0.03, -0.03);
  head.add(mane);
  const earL = box(0.016, 0.028, 0.01, hide);
  earL.position.set(-0.03, 0.04, -0.005);
  earL.rotation.z = 0.4;
  head.add(earL);
  const earR = box(0.016, 0.028, 0.01, hide);
  earR.position.set(0.03, 0.04, -0.005);
  earR.rotation.z = -0.4;
  head.add(earR);
  const eye = sph(0.01, amber, 6);
  eye.position.set(0.018, 0.008, 0.038);
  head.add(eye);
  const spark = sph(0.006, ORE, 5);
  spark.position.set(0.022, 0.01, 0.044);
  head.add(spark);

  const armR = cyl(0.014, 0.012, 0.1, hide, 6);
  armR.position.set(0.07, 0.38, 0.01);
  armR.rotation.z = -0.5;
  g.add(armR);
  const armL = cyl(0.014, 0.012, 0.1, hide, 6);
  armL.position.set(-0.07, 0.38, 0.01);
  armL.rotation.z = 0.45;
  g.add(armL);

  const spear = new THREE.Group();
  spear.name = "stripekin_spear";
  spear.position.set(0.1, 0.32, 0.02);
  spear.rotation.z = -0.55;
  g.add(spear);
  const shaft = cyl(0.008, 0.008, 0.28, wood, 5);
  spear.add(shaft);
  const tip = box(0.018, 0.05, 0.018, stone);
  tip.position.y = 0.16;
  spear.add(tip);

  const thighR = cyl(0.018, 0.014, 0.1, hide, 6);
  thighR.position.set(0.03, 0.2, 0);
  g.add(thighR);
  const thighL = cyl(0.018, 0.014, 0.1, hide, 6);
  thighL.position.set(-0.03, 0.2, 0);
  g.add(thighL);
  const shinR = cyl(0.014, 0.012, 0.08, hide, 6);
  shinR.position.set(0.03, 0.1, 0.01);
  g.add(shinR);
  const shinL = cyl(0.014, 0.012, 0.08, hide, 6);
  shinL.position.set(-0.03, 0.1, 0.01);
  g.add(shinL);
  const ankleR = box(0.03, 0.018, 0.04, soot);
  ankleR.position.set(0.03, 0.05, 0.015);
  g.add(ankleR);
  const ankleL = box(0.03, 0.018, 0.04, soot);
  ankleL.position.set(-0.03, 0.05, 0.015);
  g.add(ankleL);

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

/** Barkback — taller walking bunker (~head over Solace). Shield sponge, not squat mascot, not kaiju. */
function barkback(): THREE.Group {
  const hide = texMat("hide");
  const pelt = texMat("pelt");
  const cream = texMat("cream");
  const soot = texMat("charcoal");
  const bark = texMat("wood");
  const scrap = texMat("steel");
  const dark = texMat("dark");
  const brass = texMat("brass");
  const moss = new THREE.MeshBasicMaterial({ color: 0x3d5a32 });
  const g = new THREE.Group();
  g.name = "barkback";
  const bob = new THREE.Group();
  bob.name = "barkback_bob";
  g.add(bob);

  for (const x of [-0.13, 0.13] as const) {
    const thigh = cyl(0.07, 0.055, 0.26, soot, 6);
    thigh.position.set(x, 0.22, 0.02);
    bob.add(thigh);
    const shin = cyl(0.05, 0.042, 0.16, hide, 6);
    shin.position.set(x, 0.06, 0.05);
    bob.add(shin);
    const foot = box(0.12, 0.04, 0.16, soot);
    foot.position.set(x, 0.018, 0.08);
    bob.add(foot);
    for (const [ox, oz] of [
      [-0.03, 0.16],
      [0.03, 0.16],
      [0, 0.18],
    ] as const) {
      const claw = box(0.022, 0.016, 0.04, cream);
      claw.position.set(x + ox, 0.02, oz);
      bob.add(claw);
    }
  }

  const hip = sph(0.16, hide, 8);
  hip.scale.set(1.55, 0.95, 1.3);
  hip.position.y = 0.38;
  bob.add(hip);
  const belly = sph(0.12, pelt, 7);
  belly.scale.set(1.2, 1.25, 0.7);
  belly.position.set(0, 0.46, 0.14);
  bob.add(belly);

  const column = cyl(0.16, 0.2, 0.42, hide, 8);
  column.position.set(0, 0.62, 0);
  bob.add(column);

  const shell = sph(0.26, bark, 8);
  shell.scale.set(1.38, 1.72, 1.22);
  shell.position.set(0, 0.72, -0.06);
  bob.add(shell);

  const plates: [number, number, number, number, number, number, number][] = [
    [0, 1.02, -0.04, 0.34, 0.07, 0.22, -0.12],
    [0.16, 0.88, 0.02, 0.2, 0.06, 0.18, -0.14],
    [-0.16, 0.88, 0.02, 0.2, 0.06, 0.18, -0.14],
    [0, 0.74, -0.2, 0.32, 0.065, 0.18, -0.4],
    [0.14, 0.58, -0.14, 0.18, 0.055, 0.16, -0.35],
    [-0.14, 0.58, -0.14, 0.18, 0.055, 0.16, -0.35],
    [0, 0.48, -0.18, 0.28, 0.055, 0.16, -0.5],
    [0.2, 0.7, -0.08, 0.12, 0.05, 0.14, -0.22],
    [-0.2, 0.7, -0.08, 0.12, 0.05, 0.14, -0.22],
    [0, 1.16, -0.08, 0.22, 0.05, 0.16, -0.08],
  ];
  for (const [x, y, z, w, h, d, rx] of plates) {
    const p = box(w, h, d, bark);
    p.position.set(x, y, z);
    p.rotation.x = rx;
    bob.add(p);
    const rivet = sph(0.018, scrap, 5);
    rivet.position.set(x * 0.65, y + 0.022, z + d * 0.28);
    bob.add(rivet);
  }

  const mossA = box(0.1, 0.04, 0.07, moss);
  mossA.position.set(0.14, 1.08, -0.02);
  mossA.rotation.z = 0.25;
  bob.add(mossA);
  const mossB = box(0.08, 0.032, 0.06, moss);
  mossB.position.set(-0.12, 0.96, -0.1);
  bob.add(mossB);
  const mossC = box(0.07, 0.028, 0.05, moss);
  mossC.position.set(0.08, 0.52, -0.16);
  bob.add(mossC);

  const strap = box(0.05, 0.36, 0.024, dark);
  strap.position.set(0.04, 0.62, 0.18);
  strap.rotation.z = 0.28;
  bob.add(strap);
  const strapB = box(0.045, 0.3, 0.022, dark);
  strapB.position.set(-0.06, 0.56, 0.16);
  strapB.rotation.z = -0.38;
  bob.add(strapB);

  const head = new THREE.Group();
  head.name = "barkback_head";
  head.position.set(0, 1.08, 0.2);
  bob.add(head);
  const skull = sph(0.11, soot, 8);
  skull.scale.set(1.05, 1.0, 1.12);
  head.add(skull);
  const blaze = box(0.05, 0.12, 0.032, cream);
  blaze.position.set(0, 0.02, 0.09);
  head.add(blaze);
  const cheekL = sph(0.048, cream, 6);
  cheekL.scale.set(0.85, 0.72, 0.6);
  cheekL.position.set(-0.055, -0.015, 0.06);
  head.add(cheekL);
  const cheekR = sph(0.048, cream, 6);
  cheekR.scale.set(0.85, 0.72, 0.6);
  cheekR.position.set(0.055, -0.015, 0.06);
  head.add(cheekR);
  const snout = cyl(0.048, 0.032, 0.1, cream, 6);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.02, 0.12);
  head.add(snout);
  const nose = sph(0.022, soot, 5);
  nose.position.set(0, -0.015, 0.175);
  head.add(nose);
  const eyeL = sph(0.02, ORE, 6);
  eyeL.position.set(-0.042, 0.025, 0.1);
  head.add(eyeL);
  const eyeR = sph(0.02, ORE, 6);
  eyeR.position.set(0.042, 0.025, 0.1);
  head.add(eyeR);
  const earL = box(0.038, 0.055, 0.022, soot);
  earL.position.set(-0.09, 0.09, 0.01);
  earL.rotation.z = 0.35;
  head.add(earL);
  const earR = box(0.038, 0.055, 0.022, soot);
  earR.position.set(0.09, 0.09, 0.01);
  earR.rotation.z = -0.35;
  head.add(earR);

  const armL = cyl(0.055, 0.045, 0.28, hide, 6);
  armL.position.set(-0.28, 0.62, 0.08);
  armL.rotation.z = 0.45;
  armL.rotation.x = -0.2;
  bob.add(armL);
  const forearmL = cyl(0.042, 0.038, 0.18, hide, 6);
  forearmL.position.set(-0.4, 0.5, 0.16);
  forearmL.rotation.z = 0.2;
  forearmL.rotation.x = -0.5;
  bob.add(forearmL);

  const shield = new THREE.Group();
  shield.name = "barkback_shield";
  shield.position.set(-0.42, 0.55, 0.22);
  shield.rotation.y = 0.45;
  shield.rotation.x = -0.08;
  bob.add(shield);
  const trunk = cyl(0.28, 0.3, 0.14, bark, 12);
  trunk.rotation.x = Math.PI / 2;
  shield.add(trunk);
  const hollow = cyl(0.16, 0.17, 0.06, dark, 10);
  hollow.rotation.x = Math.PI / 2;
  hollow.position.z = 0.05;
  shield.add(hollow);
  const ringA = cyl(0.22, 0.23, 0.03, bark, 12);
  ringA.rotation.x = Math.PI / 2;
  ringA.position.z = 0.04;
  shield.add(ringA);
  const rim = cyl(0.305, 0.29, 0.04, scrap, 12);
  rim.rotation.x = Math.PI / 2;
  rim.position.z = 0.02;
  shield.add(rim);
  const hex = box(0.1, 0.1, 0.03, ORE);
  hex.rotation.z = Math.PI / 4;
  hex.position.z = 0.08;
  shield.add(hex);
  const xA = box(0.34, 0.028, 0.016, dark);
  xA.rotation.z = 0.65;
  xA.position.z = -0.075;
  shield.add(xA);
  const xB = box(0.34, 0.028, 0.016, dark);
  xB.rotation.z = -0.65;
  xB.position.z = -0.075;
  shield.add(xB);
  const mossS = box(0.08, 0.04, 0.05, moss);
  mossS.position.set(0.12, 0.18, 0.06);
  shield.add(mossS);
  for (const a of [0, 0.9, 1.8, 2.7, 3.6, 4.5] as const) {
    const stud = sph(0.018, brass, 5);
    stud.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0.08);
    shield.add(stud);
  }

  const armR = cyl(0.052, 0.042, 0.26, hide, 6);
  armR.position.set(0.28, 0.64, 0.04);
  armR.rotation.z = -0.85;
  armR.rotation.x = -0.12;
  bob.add(armR);
  const forearmR = cyl(0.04, 0.036, 0.16, hide, 6);
  forearmR.position.set(0.42, 0.5, 0.1);
  forearmR.rotation.z = -0.35;
  bob.add(forearmR);

  const mace = new THREE.Group();
  mace.name = "barkback_mace";
  mace.position.set(0.5, 0.42, 0.12);
  mace.rotation.z = -0.45;
  bob.add(mace);
  const haft = cyl(0.022, 0.028, 0.34, bark, 6);
  haft.position.y = 0.08;
  mace.add(haft);
  const wrap = cyl(0.032, 0.032, 0.06, dark, 6);
  wrap.position.y = -0.04;
  mace.add(wrap);
  const headM = box(0.16, 0.16, 0.16, scrap);
  headM.rotation.y = Math.PI / 4;
  headM.position.y = 0.28;
  mace.add(headM);
  const band = box(0.18, 0.03, 0.18, dark);
  band.position.y = 0.22;
  mace.add(band);
  for (const [sx, sy, sz] of [
    [0.1, 0.28, 0],
    [-0.1, 0.28, 0],
    [0, 0.36, 0],
    [0, 0.28, 0.1],
    [0, 0.28, -0.1],
    [0.07, 0.34, 0.07],
  ] as const) {
    const spike = box(0.03, 0.07, 0.03, scrap);
    spike.position.set(sx, sy, sz);
    mace.add(spike);
  }

  return g;
}

/** Visual fit for ¼-cell occupancy. Spear tip may overhang. */
export const SMALL_UNIT_SCALE = 0.24;
export const FULL_FOE_SCALE = 0.92;
/** Taller bunker: a head over Solace. Same one prefab. */
export const BARKBACK_SCALE = 1.08;

export function buildFoe(kind: "small" | "big" | "elite" | "smith"): THREE.Group {
  const root = new THREE.Group();
  root.name = `foe_${kind}`;
  if (kind === "small") {
    root.add(stripekin());
    root.scale.setScalar(SMALL_UNIT_SCALE);
    root.userData.foeName = "Stripekin";
    addOutline(root, 1.18);
  } else if (kind === "elite") {
    root.add(rootwarden());
    root.scale.setScalar(FULL_FOE_SCALE);
    addOutline(root, 1.05);
  } else if (kind === "smith") {
    root.add(barkback());
    root.scale.setScalar(BARKBACK_SCALE);
    root.userData.foeName = "Barkback";
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

/** Procedural idle + short yaw ease. No root XZ motion. Barkback = sponge settle, not maul wind-up. */
export function tickFoe(root: THREE.Object3D, now: number) {
  const barkBob = root.getObjectByName("barkback_bob");
  if (barkBob) {
    const seed = (root.id % 17) * 0.33;
    const s = Math.sin(now / 1400 + seed);
    barkBob.position.y = s * 0.008;
    const shield = root.getObjectByName("barkback_shield");
    if (shield) shield.rotation.z = s * 0.035;
    const want = root.userData.faceYaw as number | undefined;
    if (want !== undefined) root.rotation.y += wrapPi(want - root.rotation.y) * 0.22;
    return;
  }
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
