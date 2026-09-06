import * as THREE from "three";
import { addOutline, mat as texMat } from "./tex";

/** Simple 3D foes. Not modular. Not wanzer parts. Small = ¼-grid scale. */
export function buildFoe(kind: "small" | "big" | "elite" | "smith"): THREE.Group {
  const root = new THREE.Group();
  root.name = `foe_${kind}`;
  const moss = texMat("gasket");
  const soot = texMat("dark");
  const ore = texMat("visor");
  const hide = texMat("boot");
  const slag = texMat("steel");
  const yellow = texMat("yellow");

  if (kind === "small") {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), moss);
    body.scale.set(0.95, 1.05, 0.9);
    body.position.y = 0.12;
    root.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), moss);
    head.position.y = 0.24;
    root.add(head);
    const spark = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.02), ore);
    spark.position.set(0.08, 0.16, 0.06);
    spark.rotation.z = -0.5;
    root.add(spark);
    root.scale.setScalar(0.42);
  } else {
    const tall = kind === "elite" ? 0.42 : 0.38;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, tall, 0.18), soot);
    torso.position.y = 0.22 + (kind === "elite" ? 0.04 : 0);
    root.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), soot);
    head.position.y = 0.48;
    root.add(head);
    if (kind === "smith") {
      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.04), hide);
      apron.position.set(0, 0.2, 0.11);
      root.add(apron);
      const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.34, 6), hide);
      haft.position.set(0.16, 0.28, 0.02);
      haft.rotation.z = -0.4;
      root.add(haft);
      const headH = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.06), slag);
      headH.position.set(0.26, 0.42, 0.02);
      root.add(headH);
    } else {
      const axe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.04), slag);
      axe.position.set(0.2, 0.32, 0.04);
      axe.rotation.z = -0.35;
      root.add(axe);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.02), ore);
      glow.position.set(0.24, 0.44, 0.06);
      root.add(glow);
    }
    if (kind === "elite") {
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.18), yellow);
      crown.position.y = 0.58;
      root.add(crown);
    }
    root.scale.setScalar(0.92);
  }

  addOutline(root, 1.05);
  return root;
}
