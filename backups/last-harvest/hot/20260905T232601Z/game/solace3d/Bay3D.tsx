"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Plate } from "../ui/Plate";
import { ScopeReticle } from "../ui/ScopeReticle";
import { buildWanzer, clampKit, cloneSit, cycleHands, dumpHoldProfiles, GOLD_GREY, GOLD_REV, GOLD_SIT, HOLD_IDS, holdId, KIT_NAMES, plantY, resetGoldGlobals, resetHoldProfiles, setBonesVisible, setSeatGizmoVisible, type GoldSit, type HoldId, type HoldProfile, type Kit, type KitSlot } from "./kit";
import { buildGasket } from "./gasket";
import { sfxHit, sfxMove, sfxScope } from "../audio";
import { isoCell, hangerCell, ISO_YAW } from "./iso3d";
import { DIR } from "../iso";
import { DROP_CAM, type DropView } from "./cam";

const DIRS = ["S", "E", "N", "W"] as const;
const CAM_ZOOM = { min: 0.4, max: 30, step: 0.05, def: DROP_CAM.far.zoom };
const BAY = 5;
type DockId = "move" | "parts" | "gold";
const DOCK_START: DockId[] = ["move", "parts", "gold"];

const n = (k: Kit, slot: KitSlot) => KIT_NAMES[slot][k[slot]] ?? "none";
type SitNum = { [K in keyof GoldSit]: GoldSit[K] extends number ? K : never }[keyof GoldSit];
const SIT_SLIDERS: {
  key: SitNum;
  label: string;
  min: number;
  max: number;
  step: number;
  when?: (k: Kit) => boolean;
}[] = [
  { key: "scale", label: "bay scale", min: 0.35, max: 1.35, step: 0.01 },
  { key: "chestW", label: "chest W", min: 0.18, max: 1.15, step: 0.01 },
  { key: "chestD", label: "chest D", min: 0.12, max: 0.85, step: 0.01 },
  { key: "chestH", label: "chest H", min: 0.08, max: 0.7, step: 0.01 },
  { key: "hipY", label: "hip Y", min: 0.16, max: 0.85, step: 0.01 },
  { key: "shoulderY", label: "shoulder Y", min: 0.3, max: 1.45, step: 0.01 },
  { key: "neckY", label: "neck Y", min: 0.4, max: 1.7, step: 0.01 },
  { key: "upperLen", label: "crane upper", min: 0.1, max: 0.95, step: 0.01 },
  { key: "faLen", label: "crane fore", min: 0.1, max: 1.05, step: 0.01 },
  { key: "thick", label: "arm thick", min: 0.03, max: 0.22, step: 0.002 },
  { key: "thighLen", label: "thigh len", min: 0.08, max: 0.7, step: 0.01 },
  { key: "shinLen", label: "shin len", min: 0.06, max: 0.62, step: 0.01 },
  { key: "stance", label: "stance W", min: 0.04, max: 0.42, step: 0.01 },
  { key: "gripScale", label: "grip scale", min: 0.5, max: 1.8, step: 0.02 },
  { key: "gripWidth", label: "grip width", min: 0.55, max: 1.8, step: 0.02 },
  { key: "fingerLen", label: "finger len", min: 0.5, max: 1.8, step: 0.02 },
  { key: "holdAngle", label: "global hold∠", min: -0.8, max: 1.2, step: 0.02 },
  { key: "weaponSeat", label: "global seat", min: 0, max: 0.12, step: 0.005 },
  { key: "helm", label: "helm", min: 0.04, max: 0.22, step: 0.005, when: (k) => n(k, "head") === "bucket" },
  { key: "pack", label: "pack", min: 0.06, max: 0.4, step: 0.005, when: (k) => n(k, "body") !== "none" },
  { key: "pauldron", label: "pauldron", min: 0.04, max: 0.2, step: 0.005, when: (k) => n(k, "arms") === "crane" },
  { key: "boot", label: "boot", min: 0.06, max: 0.28, step: 0.005, when: (k) => n(k, "legs") === "piston" },
  { key: "snath", label: "snath", min: 0.4, max: 3.6, step: 0.02, when: (k) => n(k, "handR") === "scythe" },
  { key: "grip", label: "grip spread", min: 0.16, max: 1.4, step: 0.01, when: (k) => n(k, "handR") === "scythe" },
  { key: "blade", label: "crescent", min: 0.2, max: 1.2, step: 0.01, when: (k) => n(k, "handR") === "scythe" },
  { key: "sawLen", label: "saw len", min: 0.12, max: 0.9, step: 0.01, when: (k) => n(k, "handR") === "saw" },
  { key: "cannonLen", label: "lance len", min: 0.12, max: 0.8, step: 0.01, when: (k) => n(k, "handR") === "cannon" || n(k, "handL") === "cannon" },
  { key: "cannonR", label: "lance bore", min: 0.018, max: 0.08, step: 0.002, when: (k) => n(k, "handR") === "cannon" || n(k, "handL") === "cannon" },
  { key: "shieldH", label: "slab H", min: 0.16, max: 0.9, step: 0.01, when: (k) => n(k, "handL") === "shield" },
  { key: "shieldW", label: "slab W", min: 0.08, max: 0.4, step: 0.005, when: (k) => n(k, "handL") === "shield" },
];

const HOLD_FIELDS: { key: keyof HoldProfile; label: string; min: number; max: number; step: number }[] = [
  { key: "seat", label: "hold_seat", min: -0.08, max: 0.12, step: 0.005 },
  { key: "pitch", label: "hold_pitch", min: -1.6, max: 1.6, step: 0.02 },
  { key: "roll", label: "hold_roll", min: -1.6, max: 1.6, step: 0.02 },
  { key: "yaw", label: "hold_yaw", min: -1.6, max: 1.6, step: 0.02 },
];

function equippedHold(kit: Kit): Set<HoldId> {
  const rKind = n(kit, "handR");
  const lKind = n(kit, "handL");
  const eq = new Set<HoldId>();
  if (rKind !== "none") eq.add(holdId(rKind, 1));
  if (lKind !== "none") eq.add(holdId(lKind, -1));
  if (rKind === "scythe" || lKind === "scythe") {
    eq.add("scytheR");
    eq.add("scytheL");
  }
  return eq;
}

function HoldSliders({
  kit,
  sit,
  setSit,
}: {
  kit: Kit;
  sit: GoldSit;
  setSit: (fn: (s: GoldSit) => GoldSit) => void;
}) {
  const eq = equippedHold(kit);
  const patch = (id: HoldId, key: keyof HoldProfile, v: number) => {
    setSit((s) => ({
      ...s,
      hold: { ...s.hold, [id]: { ...(s.hold[id] ?? sit.hold[id]), [key]: v } },
    }));
  };
  return (
    <div className="mt-2 border-t border-border pt-2">
      <p className="engraved mb-1 text-[10px]">hold profiles · per weapon × hand</p>
      {HOLD_IDS.map((id) => {
        const live = eq.has(id);
        return (
          <div key={id} className={`mb-1 ${live ? "" : "opacity-70"}`}>
            <p className={`mb-1 text-[10px] ${live ? "text-cyan" : "engraved"}`}>
              {id}
              {live ? " · equipped" : ""}
            </p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              {HOLD_FIELDS.map((f) => {
                const val = sit.hold[id]?.[f.key] ?? 0;
                return (
                  <label key={f.key} className="flex items-center gap-2 text-[11px] text-fg">
                    <span className="w-28 shrink-0 uppercase tracking-wide text-brass">
                      {id}.{f.label}
                    </span>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={val}
                      onChange={(e) => patch(id, f.key, Number(e.target.value))}
                      className="h-2 min-w-0 flex-1 accent-cyan"
                    />
                    <span className="w-10 text-right tabular-nums text-muted">{val.toFixed(2)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[9px] leading-snug text-muted" data-qa="bay3d-hold-dump">
        {dumpHoldProfiles(sit)}
      </pre>
    </div>
  );
}

export function Bay3D({ onBack }: { onBack: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [kit, setKit] = useState<Kit>({ ...GOLD_GREY });
  const [sit, setSit] = useState<GoldSit>(() => cloneSit());
  const [dir, setDir] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [zoom, setZoom] = useState<number>(CAM_ZOOM.def);
  const [view, setView] = useState<DropView>("far");
  const [dock, setDock] = useState<DockId[]>(DOCK_START);
  const [bones, setBones] = useState(false);
  const api = useRef<{
    setKit: (k: Kit) => void;
    setSit: (s: GoldSit) => void;
    setDir: (d: number) => void;
    setMounted: (m: boolean) => void;
    setZoom: (z: number) => void;
    setView: (v: DropView) => void;
    setBones: (on: boolean) => void;
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
    const frustum = 22;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      0.1,
      200,
    );
    camera.zoom = DROP_CAM.far.zoom;
    camera.position.set(DROP_CAM.far.ox, DROP_CAM.far.oy, DROP_CAM.far.oz);
    camera.lookAt(0, 0.14, 0);
    camera.updateProjectionMatrix();

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
    const protos = {
      pad: hangerCell("pad"),
      plate: hangerCell("plate"),
      grate: hangerCell("grate"),
    };
    for (let tx = -BAY; tx <= BAY; tx++) {
      for (let ty = -BAY; ty <= BAY; ty++) {
        const edge = Math.abs(tx) === BAY || Math.abs(ty) === BAY;
        const kind = tx === 0 && ty === 0 ? "pad" : edge ? "grate" : "plate";
        const tile = protos[kind].clone();
        tile.material = (protos[kind].material as THREE.MeshBasicMaterial).clone();
        const cell = isoCell(tx, ty);
        tile.position.set(cell.x, 0, cell.z);
        floor.add(tile);
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
    wanzer.root.position.y = plantY(GOLD_SIT);
    setBonesVisible(wanzer.root, false);
    setSeatGizmoVisible(wanzer.root, true);
    scene.add(wanzer.root);

    const gasketRig = buildGasket();
    const gasket = gasketRig.root;
    gasket.scale.setScalar(0.36);
    scene.add(gasket);

    let yaw = 0;
    let facing = 0;
    const cellPos = { tx: 0, ty: 0 };
    let moving = false;
    let slide = { t0: 0, dur: 170, x0: 0, z0: 0, x1: 0, z1: 0 };
    const viewRef = { current: "far" as DropView };
    const followCam = (x: number, z: number) => {
      const spec = DROP_CAM[viewRef.current];
      let lx = x;
      let lz = z;
      if (spec.look > 0) {
        const v = DIR[facing] ?? DIR[0]!;
        const b = isoCell(cellPos.tx + v.x * spec.look, cellPos.ty + v.y * spec.look);
        lx = x * 0.55 + b.x * 0.45;
        lz = z * 0.55 + b.z * 0.45;
      }
      camera.position.set(lx + spec.ox, spec.oy, lz + spec.oz);
      camera.lookAt(lx, 0.14, lz);
    };
    followCam(0, 0);
    const applyDir = (d: number) => {
      facing = d;
      yaw = ISO_YAW[d] ?? 0;
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
    applyDir(0);

    const sitLive = { current: { ...GOLD_SIT } };
    const bonesLive = { current: false };
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
      wanzer.root.position.set(p.x, plantY(s), p.z);
      wanzer.root.rotation.y = yaw;
      setBonesVisible(wanzer.root, bonesLive.current);
      setSeatGizmoVisible(wanzer.root, true);
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
      setView: (v) => {
        viewRef.current = v;
        const spec = DROP_CAM[v];
        camera.zoom = spec.zoom;
        camera.updateProjectionMatrix();
        followCam(wanzer.root.position.x, wanzer.root.position.z);
      },
      setBones: (on) => {
        bonesLive.current = on;
        setBonesVisible(wanzer.root, on);
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
      const wpnL = wanzer.root.getObjectByName("weapon_L");
      const armL = wanzer.root.getObjectByName("armL");
      const armR = wanzer.root.getObjectByName("armR");
      if (!slot) {
        [legs, body, head, swingG, armsG, wpnG, wpnL, armL, armR].forEach((o) => show(o, true));
        show(gasket, true);
        show(floor, true);
        camera.zoom = CAM_ZOOM.def;
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
      show(wpnG, slot === "weapon" || slot === "handR");
      show(wpnL, slot === "weapon" || slot === "handL");
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
      gasketRig.tick(performance.now());
      if (moving) {
        const u = Math.min(1, (performance.now() - slide.t0) / slide.dur);
        const e = 1 - (1 - u) * (1 - u);
        const x = slide.x0 + (slide.x1 - slide.x0) * e;
        const z = slide.z0 + (slide.z1 - slide.z0) * e;
        wanzer.root.position.set(x, plantY(sitLive.current), z);
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
    setSit((s) => resetGoldGlobals(s));
  }, [GOLD_REV]);
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

  const pickView = (v: DropView) => {
    if (v === "scope" && view !== "scope") sfxScope();
    setView(v);
    setZoom(DROP_CAM[v].zoom);
    api.current?.setView(v);
  };

  const cycle = (slot: KitSlot) => {
    setKit((k) => {
      if (slot === "handR" || slot === "handL") return cycleHands(k, slot);
      return clampKit({ ...k, [slot]: (k[slot] + 1) % KIT_NAMES[slot].length });
    });
  };

  const promote = (id: DockId) => {
    setDock((d) => {
      const i = d.indexOf(id);
      if (i <= 0) return [...d.slice(1), d[0]!];
      const next = d.slice();
      const top = next[0]!;
      next[0] = id;
      next[i] = top;
      return next;
    });
  };

  const windows: Record<DockId, { qa: string; label: string; body: ReactNode }> = {
    move: {
      qa: "bay3d-dock-move",
      label: "move · anim",
      body: (
        <div className="flex flex-wrap items-end gap-3">
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
          <div className="flex flex-wrap gap-2">
            <Plate onClick={() => setDir((d) => (d + 1) % 4)}>Turn {DIRS[dir]}</Plate>
            <Plate
              onClick={() => {
                sfxHit();
                api.current?.swing();
              }}
            >
              Swing
            </Plate>
            <Plate onClick={() => setMounted((m) => !m)}>{mounted ? "Gasket mount" : "Gasket follow"}</Plate>
            <Plate
              qa="bay3d-bones"
              className={bones ? "text-cyan" : ""}
              onClick={() => {
                const next = !bones;
                setBones(next);
                api.current?.setBones(next);
              }}
            >
              {bones ? "Bones on" : "Bones off"}
            </Plate>
          </div>
        </div>
      ),
    },
    parts: {
      qa: "bay3d-dock-parts",
      label: "parts",
      body: (
        <div className="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-5">
          {(["head", "body", "legs", "arms", "handR", "handL"] as KitSlot[]).map((s) => (
            <Plate key={s} onClick={() => cycle(s)}>
              {s} · {["head", "body", "legs", "arms"].includes(s) && KIT_NAMES[s][kit[s]] === "none" ? "shell" : KIT_NAMES[s][kit[s]]}
            </Plate>
          ))}
        </div>
      ),
    },
    gold: {
      qa: "bay3d-sit",
      label: "solace-gold sit · live",
      body: (
        <div>
          <div className="mb-2 flex gap-2">
            <Plate qa="bay3d-sit-reset" onClick={() => setSit((s) => resetGoldGlobals(s))}>
              Reset gold
            </Plate>
            <Plate qa="bay3d-hold-reset" onClick={() => setSit((s) => resetHoldProfiles(s))}>
              Reset profiles
            </Plate>
            <Plate
              qa="bay3d-sit-copy"
              onClick={() => {
                const text = `${dumpHoldProfiles(sit)}\n\n${JSON.stringify(sit, null, 2)}`;
                void navigator.clipboard?.writeText(text);
              }}
            >
              Copy sit
            </Plate>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {SIT_SLIDERS.filter((row) => !row.when || row.when(kit)).map((row) => (
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
                <span className="w-10 text-right tabular-nums text-muted">{Number(sit[row.key]).toFixed(2)}</span>
              </label>
            ))}
          </div>
          <HoldSliders kit={kit} sit={sit} setSit={setSit} />
        </div>
      ),
    },
  };

  return (
    <main className="relative z-[80] h-dvh overflow-y-auto bg-bg">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="engraved text-xs">3D bay · hanger deck</p>
        <Plate qa="bay3d-back" onClick={onBack}>
          Title
        </Plate>
      </div>
      <div className="relative">
        <div ref={host} className="h-[78dvh] min-h-[78dvh] w-full" />
        {view === "scope" && <ScopeReticle />}
      </div>
      <div className="flex items-center gap-3 border-t border-border bg-surface px-3 py-2" data-qa="bay3d-zoom">
        <span className="engraved w-24 shrink-0 text-[10px]">cam sit</span>
        <Plate qa="bay-cam-far" onClick={() => pickView("far")}>Far</Plate>
        <Plate qa="bay-cam-close" onClick={() => pickView("close")}>Close</Plate>
        <Plate qa="bay-cam-scope" onClick={() => pickView("scope")}>Scope</Plate>
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
        <Plate qa="bay3d-zoom-reset" onClick={() => pickView("far")}>
          Reset
        </Plate>
      </div>
      {dock.map((id) => {
        const win = windows[id];
        return (
          <section
            key={id}
            data-qa={win.qa}
            className="relative border-t border-border bg-surface/80 py-2 pl-10 pr-3"
          >
            <button
              type="button"
              data-qa={`bay3d-dock-up-${id}`}
              aria-label={`Move ${win.label} to top`}
              onClick={() => promote(id)}
              className="absolute left-1 top-1/2 flex h-8 w-7 -translate-y-1/2 items-center justify-center rounded-sm border border-brass/50 bg-bg text-brass shadow-[inset_0_1px_0_rgba(255,220,160,0.25)]"
            >
              <span className="block h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-brass" />
            </button>
            <p className="engraved mb-2 text-[10px]">{win.label}</p>
            {win.body}
          </section>
        );
      })}
    </main>
  );
}
