import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

/** Cute default for 3D Bay and drop. Not modular. ~¼ tile. */
export type GasketRig = {
  root: THREE.Group;
  tick: (now: number) => void;
};

export function buildGasket(): GasketRig {
  const root = new THREE.Group();
  root.name = "gasket";
  const bob = new THREE.Group();
  bob.name = "gasket_bob";
  root.add(bob);

  const cream = texMat("cream");
  const visor = texMat("visor");
  const dark = texMat("dark");
  const yellow = texMat("yellow");
  const boot = texMat("boot");

  const tummy = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), cream);
  tummy.scale.set(1.28, 1.08, 1.2);
  tummy.position.y = 0.118;
  bob.add(tummy);

  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.022, 0.024), yellow);
  tape.position.set(0, 0.132, 0.102);
  bob.add(tape);
  const tapeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.006, 0.004), dark);
  tapeEdge.position.set(0, 0.144, 0.112);
  bob.add(tapeEdge);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 10), cream);
  head.position.y = 0.242;
  bob.add(head);
  const visorSlit = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.02, 0.02), visor);
  visorSlit.name = "eye";
  visorSlit.position.set(0, 0.246, 0.048);
  bob.add(visorSlit);
  const glint = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.006), visor);
  glint.position.set(-0.018, 0.254, 0.058);
  bob.add(glint);

  const ear = (x: number) => {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), dark);
    n.position.set(x, 0.24, 0.008);
    bob.add(n);
  };
  ear(-0.05);
  ear(0.05);

  const antL = new THREE.Group();
  antL.position.set(-0.028, 0.29, 0);
  bob.add(antL);
  const antR = new THREE.Group();
  antR.position.set(0.028, 0.29, 0);
  bob.add(antR);
  const stick = (g: THREE.Group, lean: number) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.1, 6), yellow);
    pole.position.y = 0.05;
    pole.rotation.z = lean;
    g.add(pole);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), yellow);
    ball.position.set(lean * 0.09, 0.108, 0);
    g.add(ball);
  };
  stick(antL, 0.32);
  stick(antR, -0.32);

  const arm = (x: number) => {
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.07, 6), cream);
    a.rotation.z = x > 0 ? -0.95 : 0.95;
    a.position.set(x * 0.92, 0.13, 0.02);
    bob.add(a);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), boot);
    fist.position.set(x * 1.22, 0.09, 0.03);
    bob.add(fist);
  };
  arm(-0.1);
  arm(0.1);

  const foot = (x: number) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), boot);
    f.scale.set(1.08, 0.52, 1.22);
    f.position.set(x, 0.026, 0.018);
    bob.add(f);
  };
  foot(-0.042);
  foot(0.042);

  addOutline(root, 1.12);

  const tick = (now: number) => {
    const s = Math.sin((now / 920) * Math.PI * 2);
    const c = Math.cos((now / 1480) * Math.PI * 2);
    bob.position.y = s * 0.01;
    bob.rotation.y = c * 0.07;
    antL.rotation.z = s * 0.14;
    antR.rotation.z = -s * 0.14;
  };

  return { root, tick };
}
