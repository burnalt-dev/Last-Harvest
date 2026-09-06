"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plate } from "../ui/Plate";
import { buildWanzer, GOLD_GREY, KIT_NAMES, type Kit, type KitSlot } from "./kit";
import { buildGasket } from "./gasket";
import { sfxHit } from "../audio";
import { loadBillboard, loadGroundIso, isoCell } from "./sprites";

const DIRS = ["S", "E", "N", "W"] as const;

export function Bay3D({ onBack }: { onBack: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [kit, setKit] = useState<Kit>({ ...GOLD_GREY });
  const [dir, setDir] = useState(0);
  const [mounted, setMounted] = useState(true);
  const api = useRef<{
    setKit: (k: Kit) => void;
    setDir: (d: number) => void;
    setMounted: (m: boolean) => void;
    swing: () => void;
  } | null>(null);
  const kitRef = useRef(kit);
  kitRef.current = kit;

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121614);

    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;
    const aspect = w / h;
    const frustum = 1.58;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      0.1,
      80,
    );
    // Side-on dimetric so orc/goblins sit left/right, not in front of the crate
    camera.position.set(4.8, 5.0, 4.8);
    camera.lookAt(0, 0.18, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = false;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xd8dce0, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2dc, 0.45);
    sun.position.set(3, 8, 2);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9aacc0, 0.25);
    fill.position.set(-4, 3, -3);
    scene.add(fill);

    const ground = new THREE.Group();
    scene.add(ground);
    const hitRank = new THREE.Group();
    hitRank.name = "hitRank";
    scene.add(hitRank);
    const ORC = isoCell(0, -1);
    const GOBS = isoCell(0, 1);
    const frontRank = (d: number) => {
      const yaw = (d * Math.PI) / 2;
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      return [-0.52, 0, 0.52].map((x) => ({
        x: x * c + 0.68 * s,
        z: -x * s + 0.68 * c,
      }));
    };
    const placeHits = (d: number) => {
      const pts = frontRank(d);
      hitRank.children.forEach((m, i) => {
        const p = pts[i];
        if (p) m.position.set(p.x, 0, p.z);
      });
    };
    void (async () => {
      const proto = await loadGroundIso("/game/tiles/forest.png");
      for (const cell of [isoCell(0, 0), ORC, GOBS]) {
        const tile = proto.clone();
        tile.material = (proto.material as THREE.MeshBasicMaterial).clone();
        tile.position.set(cell.x, 0, cell.z);
        ground.add(tile);
      }
      for (let i = 0; i < 3; i++) {
        const tile = proto.clone();
        const mat = (proto.material as THREE.MeshBasicMaterial).clone();
        mat.color.set(0xc5e8d4);
        tile.material = mat;
        hitRank.add(tile);
      }
      placeHits(0);
    })();

    let wanzer = buildWanzer(kitRef.current);
    wanzer.root.scale.setScalar(0.48);
    wanzer.root.position.y = 0;
    scene.add(wanzer.root);

    const gasket = buildGasket();
    gasket.scale.setScalar(0.36);
    scene.add(gasket);

    void loadBillboard("/game/enemies/orc.png", 0.52).then((s) => {
      s.position.set(ORC.x, 0, ORC.z);
      s.renderOrder = 1;
      scene.add(s);
    });
    void loadBillboard("/game/enemies/goblin.png", 0.16).then((s) => {
      const offsets = [
        [0.08, 0.05],
        [-0.1, 0.02],
        [0.02, -0.08],
      ];
      for (const [dx, dz] of offsets) {
        const g = s.clone();
        g.material = (s.material as THREE.SpriteMaterial).clone();
        g.position.set(GOBS.x + dx, 0, GOBS.z + dz);
        g.renderOrder = 1;
        scene.add(g);
      }
    });

    let yaw = 0;
    const applyDir = (d: number) => {
      yaw = (d * Math.PI) / 2;
      wanzer.root.rotation.y = yaw;
      placeHits(d);
      placeGasket();
    };

    const placeGasket = () => {
      if (apiMount.current) {
        wanzer.mount.add(gasket);
        gasket.position.set(0, 0.02, 0);
        gasket.rotation.set(0, Math.PI, 0);
        gasket.scale.setScalar(0.32);
      } else {
        if (gasket.parent) gasket.parent.remove(gasket);
        scene.add(gasket);
        const p = isoCell(-1, 0);
        gasket.position.set(p.x, 0, p.z);
        gasket.rotation.set(0, yaw, 0);
        gasket.scale.setScalar(0.36);
      }
    };
    const apiMount = { current: true };
    placeGasket();

    const rebuild = (k: Kit) => {
      if (gasket.parent) gasket.parent.remove(gasket);
      scene.remove(wanzer.root);
      wanzer.root.traverse((o: THREE.Object3D) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      wanzer = buildWanzer(k);
      wanzer.root.scale.setScalar(0.48);
      wanzer.root.position.y = 0;
      wanzer.root.rotation.y = yaw;
      scene.add(wanzer.root);
      placeGasket();
    };

    api.current = {
      setKit: rebuild,
      setDir: applyDir,
      setMounted: (m) => {
        apiMount.current = m;
        placeGasket();
      },
      swing: () => wanzer.swing(),
    };

    const show = (o: THREE.Object3D | undefined, v: boolean) => {
      if (o) o.visible = v;
    };
    const solo = (slot: string | null) => {
      const legs = wanzer.root.getObjectByName("legs");
      const body = wanzer.root.getObjectByName("body");
      const head = wanzer.root.getObjectByName("head");
      const swingG = wanzer.root.getObjectByName("swingRig");
      const armsG = wanzer.root.getObjectByName("arms");
      const wpnG = wanzer.root.getObjectByName("weapon") ?? wanzer.root.getObjectByName("scythe");
      const armL = wanzer.root.getObjectByName("armL");
      const armR = wanzer.root.getObjectByName("armR");
      if (!slot) {
        [legs, body, head, swingG, armsG, wpnG, armL, armR].forEach((o) => show(o, true));
        show(gasket, true);
        show(ground, true);
        camera.zoom = 1;
        camera.lookAt(0, 0.18, 0);
        camera.updateProjectionMatrix();
        return;
      }
      show(gasket, slot === "mount");
      show(ground, true);
      camera.zoom = 1;
      camera.lookAt(0, 0.18, 0);
      camera.updateProjectionMatrix();
      show(legs, slot === "legs");
      show(body, slot === "body");
      show(head, slot === "head");
      show(swingG, slot === "arms" || slot === "weapon");
      show(armsG, slot === "arms");
      show(armL, slot === "arms");
      show(armR, slot === "arms");
      show(wpnG, slot === "weapon");
    };

    (window as unknown as { __lh3d?: unknown }).__lh3d = {
      setDir: applyDir,
      solo,
      names: () => {
        const n: string[] = [];
        wanzer.root.traverse((o) => {
          if (o.name) n.push(o.name + (o.visible ? "" : ":off"));
        });
        return n;
      },
      canvas: renderer.domElement,
    };

    let raf = 0;
    const loop = () => {
      const ww = el.clientWidth;
      const hh = el.clientHeight;
      if (ww && hh && (ww !== renderer.domElement.width || hh !== renderer.domElement.height)) {
        renderer.setSize(ww, hh);
        const a = ww / hh;
        camera.left = -frustum * a;
        camera.right = frustum * a;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      api.current = null;
      delete (window as unknown as { __lh3d?: unknown }).__lh3d;
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    api.current?.setKit(kit);
  }, [kit]);
  useEffect(() => {
    api.current?.setDir(dir);
  }, [dir]);
  useEffect(() => {
    api.current?.setMounted(mounted);
  }, [mounted]);

  const cycle = (slot: KitSlot) => {
    setKit((k) => ({ ...k, [slot]: (k[slot] + 1) % KIT_NAMES[slot].length }));
  };

  return (
    <main className="relative z-[80] flex h-dvh flex-col bg-bg">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="engraved text-xs">3D bay · GOLD labor 1 · farmer cut</p>
        <Plate qa="bay3d-back" onClick={onBack}>
          Title
        </Plate>
      </div>
      <div ref={host} className="min-h-0 flex-1" />
      <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
        <Plate onClick={() => setDir((d) => (d + 1) % 4)}>Turn {DIRS[dir]}</Plate>
        <Plate
          onClick={() => {
            sfxHit();
            api.current?.swing();
          }}
        >
          Swing
        </Plate>
        {(["head", "body", "legs", "arms", "weapon"] as KitSlot[]).map((s) => (
          <Plate key={s} onClick={() => cycle(s)}>
            {s} · {KIT_NAMES[s][kit[s]]}
          </Plate>
        ))}
        <Plate onClick={() => setMounted((m) => !m)}>{mounted ? "Gasket mount" : "Gasket follow"}</Plate>
      </div>
    </main>
  );
}
