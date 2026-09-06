"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plate } from "../ui/Plate";
import { buildWanzer, GOLD_GREY, GOLD_SIT, KIT_NAMES, type GoldSit, type Kit, type KitSlot } from "./kit";
import { buildGasket } from "./gasket";
import { sfxHit, sfxMove } from "../audio";
import { isoCell, hangerCell } from "./sprites";
import { DIR } from "../iso";

const DIRS = ["S", "E", "N", "W"] as const;
const CAM_ZOOM = { min: 0.55, max: 2.4, step: 0.05, def: 1 };

const SIT_SLIDERS: { key: keyof GoldSit; label: string; min: number; max: number; step: number }[] = [
  { key: "scale", label: "bay scale", min: 0.32, max: 0.7, step: 0.01 },
  { key: "chestW", label: "chest W", min: 0.28, max: 0.55, step: 0.01 },
  { key: "chestD", label: "chest D", min: 0.2, max: 0.42, step: 0.01 },
  { key: "chestH", label: "chest H", min: 0.12, max: 0.32, step: 0.01 },
  { key: "hipY", label: "hip Y", min: 0.22, max: 0.5, step: 0.01 },
  { key: "shoulderY", label: "shoulder Y", min: 0.42, max: 0.82, step: 0.01 },
  { key: "neckY", label: "neck Y", min: 0.52, max: 0.95, step: 0.01 },
  { key: "upperLen", label: "crane upper", min: 0.14, max: 0.36, step: 0.01 },
  { key: "faLen", label: "crane fore", min: 0.14, max: 0.4, step: 0.01 },
  { key: "thick", label: "arm thick", min: 0.04, max: 0.1, step: 0.002 },
  { key: "snath", label: "snath", min: 0.8, max: 1.8, step: 0.02 },
  { key: "grip", label: "grip spread", min: 0.28, max: 0.6, step: 0.01 },
];

export function Bay3D({ onBack }: { onBack: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [kit, setKit] = useState<Kit>({ ...GOLD_GREY });
  const [sit, setSit] = useState<GoldSit>({ ...GOLD_SIT });
  const [dir, setDir] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [zoom, setZoom] = useState(CAM_ZOOM.def);
  const api = useRef<{
    setKit: (k: Kit) => void;
    setSit: (s: GoldSit) => void;
    setDir: (d: number) => void;
    setMounted: (m: boolean) => void;
    setZoom: (z: number) => void;
    swing: () => void;
    step: (d: number) => void;
  } | null>(null);
  const kitRef = useRef(kit);
  kitRef.current = kit;

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101418);

    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;
    const aspect = w / h;
    const frustum = 2.35;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      0.1,
      80,
    );
    // Dimetric, same as dungeon 3/4. Floor is a 3×3 iso snippet.
    camera.position.set(5.2, 5.4, 5.2);
    camera.lookAt(0, 0.12, 0);

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

    const floor = new THREE.Group();
    floor.name = "hangerDeck";
    scene.add(floor);
    const BAY = 2;
    const protos = {
      pad: hangerCell("pad"),
      plate: hangerCell("plate"),
      grate: hangerCell("grate"),
    };
    for (let tx = -BAY; tx <= BAY; tx++) {
      for (let ty = -BAY; ty <= BAY; ty++) {
        const edge = Math.abs(tx) === BAY || Math.abs(ty) === BAY;
        const kind = tx === 0 && ty === 0 ? "pad" : edge ? "grate" : "plate";
        const spr = protos[kind].clone();
        spr.material = (protos[kind].material as THREE.SpriteMaterial).clone();
        const cell = isoCell(tx, ty);
        spr.position.set(cell.x, 0, cell.z);
        spr.center.set(0.5, 0.5);
        floor.add(spr);
      }
    }
    const steel = new THREE.MeshLambertMaterial({ color: 0x4a545c });
    const rust = new THREE.MeshLambertMaterial({ color: 0x6a4030 });
    for (const [tx, ty] of [
      [-BAY, -BAY],
      [BAY, -BAY],
      [-BAY, BAY],
      [BAY, BAY],
    ] as const) {
      const p = isoCell(tx, ty);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.55, 0.09), steel);
      post.position.set(p.x, 0.77, p.z);
      floor.add(post);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), rust);
      cap.position.set(p.x, 1.56, p.z);
      floor.add(cap);
    }

    let wanzer = buildWanzer(kitRef.current, GOLD_SIT);
    wanzer.root.scale.setScalar(GOLD_SIT.scale);
    wanzer.root.position.y = 0;
    scene.add(wanzer.root);

    const gasket = buildGasket();
    gasket.scale.setScalar(0.36);
    scene.add(gasket);

    let yaw = 0;
    let facing = 0;
    const cellPos = { tx: 0, ty: 0 };
    let moving = false;
    let slide = { t0: 0, dur: 170, x0: 0, z0: 0, x1: 0, z1: 0 };
    const followCam = (x: number, z: number) => {
      camera.position.set(x + 5.2, 5.4, z + 5.2);
      camera.lookAt(x, 0.12, z);
    };
    followCam(0, 0);
    const applyDir = (d: number) => {
      facing = d;
      yaw = (d * Math.PI) / 2;
      wanzer.root.rotation.y = yaw;
      placeGasket();
    };
    const step = (d: number) => {
      applyDir(d);
      if (moving) return;
      const v = DIR[d]!;
      const nx = cellPos.tx + v.x;
      const ny = cellPos.ty + v.y;
      if (Math.abs(nx) > BAY || Math.abs(ny) > BAY) return;
      const a = isoCell(cellPos.tx, cellPos.ty);
      const b = isoCell(nx, ny);
      cellPos.tx = nx;
      cellPos.ty = ny;
      slide = { t0: performance.now(), dur: 170, x0: a.x, z0: a.z, x1: b.x, z1: b.z };
      moving = true;
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
        const back = DIR[(facing + 2) % 4]!;
        const gx = cellPos.tx + back.x;
        const gy = cellPos.ty + back.y;
        const p = isoCell(
          Math.abs(gx) > BAY ? cellPos.tx : gx,
          Math.abs(gy) > BAY ? cellPos.ty : gy,
        );
        gasket.position.set(p.x, 0, p.z);
        gasket.rotation.set(0, yaw, 0);
        gasket.scale.setScalar(0.36);
      }
    };
    const apiMount = { current: true };
    placeGasket();

    const sitLive = { current: { ...GOLD_SIT } };
    const rebuild = (k: Kit, s: GoldSit = sitLive.current) => {
      sitLive.current = s;
      if (gasket.parent) gasket.parent.remove(gasket);
      scene.remove(wanzer.root);
      wanzer.root.traverse((o: THREE.Object3D) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      wanzer = buildWanzer(k, s);
      wanzer.root.scale.setScalar(s.scale);
      const p = isoCell(cellPos.tx, cellPos.ty);
      wanzer.root.position.set(p.x, 0, p.z);
      wanzer.root.rotation.y = yaw;
      followCam(p.x, p.z);
      scene.add(wanzer.root);
      placeGasket();
    };

    api.current = {
      setKit: rebuild,
      setSit: (s) => rebuild(kitRef.current, s),
      setDir: applyDir,
      setMounted: (m) => {
        apiMount.current = m;
        placeGasket();
      },
      swing: () => wanzer.swing(),
      step,
      setZoom: (z) => {
        camera.zoom = z;
        camera.updateProjectionMatrix();
      },
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
        show(floor, true);
        camera.zoom = 1;
        camera.lookAt(0, 0.18, 0);
        camera.updateProjectionMatrix();
        return;
      }
      show(gasket, slot === "mount");
      show(floor, true);
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
      wanzer.tick(performance.now());
      if (moving) {
        const u = Math.min(1, (performance.now() - slide.t0) / slide.dur);
        const e = 1 - (1 - u) * (1 - u);
        const x = slide.x0 + (slide.x1 - slide.x0) * e;
        const z = slide.z0 + (slide.z1 - slide.z0) * e;
        wanzer.root.position.set(x, 0, z);
        followCam(x, z);
        if (!apiMount.current) placeGasket();
        if (u >= 1) moving = false;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const map: Record<string, number> = {
        ArrowDown: 0,
        s: 0,
        ArrowRight: 1,
        d: 1,
        ArrowUp: 2,
        w: 2,
        ArrowLeft: 3,
        a: 3,
      };
      const d = map[e.key];
      if (d === undefined) return;
      e.preventDefault();
      sfxMove();
      step(d);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
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
    api.current?.setSit(sit);
  }, [sit]);
  useEffect(() => {
    api.current?.setDir(dir);
  }, [dir]);
  useEffect(() => {
    api.current?.setMounted(mounted);
  }, [mounted]);
  useEffect(() => {
    api.current?.setZoom(zoom);
  }, [zoom]);

  const cycle = (slot: KitSlot) => {
    setKit((k) => ({ ...k, [slot]: (k[slot] + 1) % KIT_NAMES[slot].length }));
  };

  return (
    <main className="relative z-[80] flex h-dvh flex-col bg-bg">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="engraved text-xs">3D bay · hanger deck</p>
        <Plate qa="bay3d-back" onClick={onBack}>
          Title
        </Plate>
      </div>
      <div ref={host} className="min-h-0 flex-1" />
      <div className="flex items-center gap-3 border-t border-border bg-surface px-3 py-2" data-qa="bay3d-zoom">
        <span className="engraved w-24 shrink-0 text-[10px]">cam zoom</span>
        <input
          type="range"
          min={CAM_ZOOM.min}
          max={CAM_ZOOM.max}
          step={CAM_ZOOM.step}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-2 min-w-0 flex-1 accent-cyan"
          aria-label="Camera zoom"
        />
        <span className="w-10 text-right text-[11px] tabular-nums text-muted">{zoom.toFixed(2)}</span>
        <Plate qa="bay3d-zoom-reset" onClick={() => setZoom(CAM_ZOOM.def)}>
          Reset
        </Plate>
      </div>
      <div className="max-h-[34vh] overflow-y-auto border-t border-border bg-surface/80 px-3 py-2" data-qa="bay3d-sit">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="engraved text-[10px]">solace-gold sit · live</p>
          <div className="flex gap-2">
            <Plate
              qa="bay3d-sit-reset"
              onClick={() => setSit({ ...GOLD_SIT })}
            >
              Reset gold
            </Plate>
            <Plate
              qa="bay3d-sit-copy"
              onClick={() => {
                void navigator.clipboard?.writeText(JSON.stringify(sit, null, 2));
              }}
            >
              Copy sit
            </Plate>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
          {SIT_SLIDERS.map((row) => (
            <label key={row.key} className="flex items-center gap-2 text-[11px] text-fg">
              <span className="w-24 shrink-0 uppercase tracking-wide text-brass">{row.label}</span>
              <input
                type="range"
                min={row.min}
                max={row.max}
                step={row.step}
                value={sit[row.key]}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSit((s) => ({ ...s, [row.key]: n }));
                }}
                className="h-2 min-w-0 flex-1 accent-cyan"
              />
              <span className="w-10 text-right tabular-nums text-muted">{sit[row.key].toFixed(2)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 p-3">
        <div className="iso-pad" data-qa="bay3d-pad">
          <button type="button" className="iso-dir n" aria-label="North" onClick={() => { sfxMove(); setDir(2); api.current?.step(2); }}>
            <span className="chev" />
          </button>
          <button type="button" className="iso-dir w" aria-label="West" onClick={() => { sfxMove(); setDir(3); api.current?.step(3); }}>
            <span className="chev" />
          </button>
          <button type="button" className="iso-dir e" aria-label="East" onClick={() => { sfxMove(); setDir(1); api.current?.step(1); }}>
            <span className="chev" />
          </button>
          <button type="button" className="iso-dir s" aria-label="South" onClick={() => { sfxMove(); setDir(0); api.current?.step(0); }}>
            <span className="chev" />
          </button>
        </div>
      <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 sm:grid-cols-4">
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
      </div>
    </main>
  );
}
