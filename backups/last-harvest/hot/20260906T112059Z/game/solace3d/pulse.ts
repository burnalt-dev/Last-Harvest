import * as THREE from "three";
import { isoDiamondGeo } from "./iso3d";

/** Pulse-rifle bolt: small cyan energy orb. Not a laser line. */
export function makePulseOrb() {
  const g = new THREE.Group();
  g.name = "pulse_orb";
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0x5ee0d0, transparent: true, opacity: 0.32, depthWrite: false }),
  );
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xc8fff6, transparent: true, opacity: 1, depthWrite: false }),
  );
  const spark = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false }),
  );
  spark.position.set(0.016, 0.01, 0.006);
  g.add(halo, core, spark);
  return g;
}

export type PulseShot = {
  orb: THREE.Group;
  t0: number;
  life: number;
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
};

export function spawnPulse(
  parent: THREE.Object3D,
  shots: PulseShot[],
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  life = 260,
) {
  const orb = makePulseOrb();
  orb.position.set(ax, ay, az);
  parent.add(orb);
  shots.push({ orb, t0: performance.now(), life, ax, ay, az, bx, by, bz });
}

export function tickPulses(shots: PulseShot[], parent: THREE.Object3D, now: number) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i]!;
    const u = Math.min(1, (now - s.t0) / s.life);
    const e = u * u * (3 - 2 * u);
    const y = s.ay + (s.by - s.ay) * e + Math.sin(u * Math.PI) * 0.1;
    s.orb.position.set(s.ax + (s.bx - s.ax) * e, y, s.az + (s.bz - s.az) * e);
    const fade = u > 0.82 ? Math.max(0, 1 - (u - 0.82) / 0.18) : 1;
    const pop = (u < 0.12 ? 0.55 + u * 4 : u > 0.82 ? 1.15 * fade : 1) * fade;
    s.orb.scale.setScalar(Math.max(0.02, pop));
    const kids = s.orb.children;
    const halo = kids[0] as THREE.Mesh | undefined;
    const core = kids[1] as THREE.Mesh | undefined;
    const spark = kids[2] as THREE.Mesh | undefined;
    if (halo) (halo.material as THREE.MeshBasicMaterial).opacity = 0.32 * fade;
    if (core) (core.material as THREE.MeshBasicMaterial).opacity = 1 * fade;
    if (spark) (spark.material as THREE.MeshBasicMaterial).opacity = 0.95 * fade;
    if (u >= 1) {
      parent.remove(s.orb);
      s.orb.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      shots.splice(i, 1);
    }
  }
}

/** Full-tile Aim diamond. Touch-friendly. Pin mark is a separate body overlay. */
export function makeAimLock() {
  const g = new THREE.Group();
  g.name = "aimTile";
  const floor = new THREE.Mesh(
    isoDiamondGeo(),
    new THREE.MeshBasicMaterial({
      color: 0x5ee0d0,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  floor.name = "aimTile_floor";
  floor.scale.setScalar(1.02);
  floor.position.y = 0.032;
  const rim = new THREE.Mesh(
    isoDiamondGeo(),
    new THREE.MeshBasicMaterial({
      color: 0xc8fff6,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  rim.name = "aimTile_rim";
  rim.scale.setScalar(1.08);
  rim.position.y = 0.028;
  g.add(rim, floor);
  return g;
}

/** Secondary mark: the one ¼ body that Pin will hit. */
export function makePinMark() {
  const g = new THREE.Group();
  g.name = "pinMark";
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.018, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0xe8fff8, transparent: true, opacity: 1, depthWrite: false }),
  );
  ring.name = "pinMark_ring";
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.07;
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.03, 0.38, 8),
    new THREE.MeshBasicMaterial({ color: 0x7af8ea, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  pillar.name = "pinMark_pillar";
  pillar.position.y = 0.26;
  const core = makePulseOrb();
  core.name = "pinMark_core";
  core.position.y = 0.38;
  core.scale.setScalar(0.7);
  g.add(ring, pillar, core);
  return g;
}

export function tickAimLock(g: THREE.Object3D, now: number) {
  g.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    if (!mat) return;
    if (mesh.name === "aimTile_floor") mat.opacity = 0.32 + Math.sin(now / 160) * 0.14;
    if (mesh.name === "aimTile_rim") mat.opacity = 0.55 + Math.sin(now / 140) * 0.2;
    if (mesh.name === "pinMark_ring") mat.opacity = 0.8 + Math.sin(now / 100) * 0.2;
    if (mesh.name === "pinMark_pillar") mat.opacity = 0.45 + Math.sin(now / 130) * 0.2;
  });
}
