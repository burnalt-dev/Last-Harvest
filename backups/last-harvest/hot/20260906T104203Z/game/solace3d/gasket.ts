import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

/** Pocket-industrial default. Not modular. ~¼ tile. Peg-rollers, not walking legs. */
export type GasketRig = {
  root: THREE.Group;
  tick: (now: number) => void;
};

/** Nest-authoring sit. Play/drop stay on GASKET_SIT until Ivan promotes a yardstick. */
export type GasketSit = {
  scale: number;
  width: number;
  thick: number;
  height: number;
  stance: number;
};

export const GASKET_SIT: GasketSit = {
  scale: 0.28,
  width: 1,
  thick: 1,
  height: 1,
  stance: 1,
};

/** Readable next to Stripekin. Hard clamp: companion ≤½ tile. */
export const GASKET_SIT_YARD: GasketSit = {
  scale: 0.3,
  width: 1.08,
  thick: 1.04,
  height: 1.02,
  stance: 1.08,
};

export function cloneGasketSit(s: GasketSit = GASKET_SIT): GasketSit {
  return { ...s };
}

export function applyGasketSit(root: THREE.Object3D, sit: GasketSit) {
  root.scale.setScalar(Math.min(0.5, sit.scale));
  const bob = root.getObjectByName("gasket_bob");
  if (bob) bob.scale.set(sit.width, sit.height, sit.thick);
  const pegL = root.getObjectByName("gasket_peg_L");
  const pegR = root.getObjectByName("gasket_peg_R");
  if (pegL) pegL.position.x = -0.038 * sit.stance;
  if (pegR) pegR.position.x = 0.038 * sit.stance;
}

export function setGasketSitVisible(root: THREE.Object3D, on: boolean) {
  root.traverse((o) => {
    if (o.userData.gasketSitVis) o.visible = on;
  });
}

export function dumpGasketSit(sit: GasketSit) {
  return `NEST GASKET SIT\n${JSON.stringify(sit, null, 2)}`;
}

const CYAN = 0x5ee0d0;
const CYAN_DIM = 0x2a7a88;

function glow(hex: number) {
  return new THREE.MeshBasicMaterial({ color: hex });
}

export function buildGasket(): GasketRig {
  const root = new THREE.Group();
  root.name = "gasket";
  const bob = new THREE.Group();
  bob.name = "gasket_bob";
  root.add(bob);

  const steel = texMat("charcoal");
  const brass = texMat("brass");
  const rubber = texMat("rubber");
  const yellow = texMat("yellow");
  const dark = texMat("dark");

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.078, 14, 12), steel);
  body.scale.set(1.12, 1.02, 1.08);
  body.position.y = 0.118;
  bob.add(body);

  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.009, 8, 18), yellow);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 0.148;
  stripe.scale.set(1.12, 1.08, 1);
  bob.add(stripe);

  const portRing = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 14), brass);
  portRing.position.set(0, 0.108, 0.078);
  bob.add(portRing);
  const portWell = new THREE.Mesh(new THREE.CircleGeometry(0.016, 12), dark);
  portWell.position.set(0, 0.108, 0.08);
  bob.add(portWell);

  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), brass);
  hip.position.set(0, 0.072, 0.07);
  bob.add(hip);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 16), rubber);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.188;
  bob.add(collar);
  const collarCap = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.005, 6, 14), brass);
  collarCap.rotation.x = Math.PI / 2;
  collarCap.position.y = 0.2;
  bob.add(collarCap);

  const head = new THREE.Group();
  head.name = "gasket_head";
  head.position.y = 0.268;
  bob.add(head);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 14), steel);
  helmet.scale.set(1.02, 1.04, 1.04);
  head.add(helmet);

  const ear = (x: number) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.016, 10), brass);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(x, 0.01, 0);
    head.add(cap);
    const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), brass);
    bolt.position.set(x * 1.15, 0.01, 0);
    head.add(bolt);
  };
  ear(-0.09);
  ear(0.09);

  const ant = new THREE.Group();
  ant.name = "gasket_ant";
  ant.position.set(0.012, 0.082, 0);
  head.add(ant);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.018, 8), brass);
  ant.add(base);
  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.007, 0.11, 6), rubber);
  whip.position.set(0.028, 0.062, 0);
  whip.rotation.z = -0.72;
  ant.add(whip);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), brass);
  bead.position.set(0.062, 0.108, 0);
  ant.add(bead);

  const arm = (side: number) => {
    const g = new THREE.Group();
    g.position.set(side * 0.092, 0.122, 0.01);
    bob.add(g);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), brass);
    g.add(sh);
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.055, 8), steel);
    limb.rotation.z = side * 1.05;
    limb.position.set(side * 0.028, -0.02, 0.01);
    g.add(limb);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), brass);
    palm.position.set(side * 0.052, -0.048, 0.016);
    g.add(palm);
    for (let i = 0; i < 3; i++) {
      const prong = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.022, 0.007), brass);
      const a = (i - 1) * 0.45;
      prong.position.set(side * 0.062, -0.062, 0.016 + a * 0.012);
      prong.rotation.z = side * 0.35;
      prong.rotation.x = a * 0.35;
      g.add(prong);
    }
  };
  arm(-1);
  arm(1);

  const peg = (side: number) => {
    const g = new THREE.Group();
    g.name = side < 0 ? "gasket_peg_L" : "gasket_peg_R";
    g.position.set(side * 0.038, 0.042, 0.006);
    bob.add(g);
    const hipCap = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), brass);
    hipCap.position.y = 0.01;
    g.add(hipCap);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.036, 8), steel);
    shin.position.y = -0.012;
    g.add(shin);
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 10), dark);
    roller.rotation.z = Math.PI / 2;
    roller.position.y = -0.032;
    g.add(roller);
    const capL = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), brass);
    capL.rotation.z = Math.PI / 2;
    capL.position.set(-0.012, -0.032, 0);
    g.add(capL);
    const capR = capL.clone();
    capR.position.x = 0.012;
    g.add(capR);
  };
  peg(-1);
  peg(1);

  addOutline(bob, 1.1);

  const markM = texMat("brass");
  const sitMark = (name: string, y: number, r: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), markM);
    m.name = name;
    m.userData.gasketSitVis = true;
    m.visible = false;
    m.position.y = y;
    bob.add(m);
  };
  sitMark("gasket_sit_foot", 0.012, 0.02);
  sitMark("gasket_sit_hip", 0.118, 0.016);
  sitMark("gasket_sit_head", 0.358, 0.018);

  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.008, 8, 18), brass);
  bezel.position.set(0, 0.006, 0.072);
  head.add(bezel);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), glow(CYAN));
  lens.name = "eye";
  lens.position.set(0, 0.006, 0.078);
  head.add(lens);
  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), glow(0x0a3040));
  pupil.position.set(0.006, -0.004, 0.08);
  head.add(pupil);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.008, 8), glow(0xe8ffff));
  glint.position.set(-0.014, 0.014, 0.082);
  head.add(glint);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.042, 16), steel);
  lid.name = "gasket_lid";
  lid.position.set(0, 0.006, 0.079);
  lid.scale.set(1, 0.04, 1);
  lid.visible = false;
  head.add(lid);

  const eyeOn = glow(CYAN);
  const eyeOff = glow(CYAN_DIM);

  const tick = (now: number) => {
    const s = Math.sin((now / 1100) * Math.PI * 2);
    const c = Math.cos((now / 1640) * Math.PI * 2);
    bob.position.y = s * 0.008;
    bob.rotation.y = c * 0.05;
    ant.rotation.z = s * 0.18;
    ant.rotation.x = c * 0.08;
    const phase = now % 3400;
    const blink = phase > 3260 && phase < 3360;
    lid.visible = blink;
    lens.material = blink ? eyeOff : eyeOn;
  };

  return { root, tick };
}
