import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

/** One cute default. Not modular. Sprite `gasket.png` is the look guide. ~¼ tile. */
export function buildGasket() {
  const root = new THREE.Group();
  root.name = "gasket";
  const bodyM = texMat("gasket");
  const plate = texMat("plate");
  const visor = texMat("visor");
  const dark = texMat("dark");
  const yellow = texMat("yellow");
  const boot = texMat("boot");

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), bodyM);
  body.scale.set(1.05, 1.15, 0.95);
  body.position.y = 0.15;
  root.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), plate);
  head.scale.set(1.05, 1.08, 1.0);
  head.position.y = 0.32;
  root.add(head);

  const eye = new THREE.Mesh(new THREE.CircleGeometry(0.055, 12), visor);
  eye.position.set(0, 0.33, 0.09);
  root.add(eye);

  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), dark);
  ant.position.set(0.04, 0.46, 0);
  root.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), yellow);
  tip.position.set(0.04, 0.53, 0);
  root.add(tip);

  const stub = (x: number) => {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), plate);
    a.position.set(x, 0.16, 0.04);
    root.add(a);
  };
  stub(-0.1);
  stub(0.1);

  const foot = (x: number) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), boot);
    f.position.set(x, 0.02, 0.01);
    root.add(f);
  };
  foot(-0.045);
  foot(0.045);

  addOutline(root, 1.12);
  return root;
}
