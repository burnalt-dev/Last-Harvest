"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plate } from "../ui/Plate";
import { isoCell, isoDiamondGeo, ISO_YAW, subCell } from "./iso3d";
import { DROP_CAM, type DropView } from "./cam";
import { applyGasketSit, buildGasket, cloneGasketSit, dumpGasketSit, GASKET_SIT, GASKET_SIT_YARD, setGasketSitVisible, type GasketSit } from "./gasket";
import {
  buildNestDummy,
  loadForestFoe,
  loadNestTiles,
  makeNestGasket,
  nestAct,
  nestApplyDiff,
  nestGasketStep,
  nestKitOf,
  nestOf,
  nestPackPlants,
  nestRespawnGasket,
  nestRound,
  nestStats,
  NEST_BIOMES,
  NEST_GASKET_KITS,
  NEST_PACK,
  NEST_R,
  NEST_TICK_MS,
  type NestActor,
  type NestBiome,
  type NestFoe,
  type NestGasket,
  type NestGasketKitId,
  type NestPack,
  type NestSpec,
} from "./nest";
import type { Difficulty } from "../data";

const CAM_ZOOM = { min: 0.4, max: 30, step: 0.05, def: DROP_CAM.far.zoom };
const GASKET_SIT_LS = "lh-nest-gasket-sit";
const GASKET_SIT_SLIDERS: { key: keyof GasketSit; label: string; min: number; max: number; step: number }[] = [
  { key: "scale", label: "scale", min: 0.18, max: 0.55, step: 0.01 },
  { key: "height", label: "height", min: 0.7, max: 1.35, step: 0.02 },
  { key: "width", label: "width", min: 0.7, max: 1.4, step: 0.02 },
  { key: "thick", label: "thick", min: 0.7, max: 1.4, step: 0.02 },
  { key: "stance", label: "stance", min: 0.6, max: 1.6, step: 0.02 },
];

function readNestGasketSit(): GasketSit {
  try {
    const raw = localStorage.getItem(GASKET_SIT_LS);
    if (!raw) return cloneGasketSit();
    const o = JSON.parse(raw) as Partial<GasketSit>;
    return {
      scale: Number(o.scale) || GASKET_SIT.scale,
      width: Number(o.width) || GASKET_SIT.width,
      thick: Number(o.thick) || GASKET_SIT.thick,
      height: Number(o.height) || GASKET_SIT.height,
      stance: Number(o.stance) || GASKET_SIT.stance,
    };
  } catch {
    return cloneGasketSit();
  }
}

function writeNestGasketSit(sit: GasketSit) {
  try {
    localStorage.setItem(GASKET_SIT_LS, JSON.stringify(sit));
  } catch {
    /* mute */
  }
}

function solid(hex: number) {
  return new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, depthWrite: true });
}

function texMat(tex: THREE.Texture) {
  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

function disposeObj(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material;
    const list = Array.isArray(mat) ? mat : [mat];
    for (const item of list) {
      const map = (item as THREE.MeshBasicMaterial).map;
      map?.dispose();
      item.dispose();
    }
  });
}

export function Nest3D({ onBack }: { onBack: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [biome, setBiome] = useState<NestBiome | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(CAM_ZOOM.def);
  const [view, setView] = useState<DropView>("far");
  const [kit, setKit] = useState<NestGasketKitId>("harvester");
  const [packN, setPackN] = useState<NestPack>(3);
  const [diff, setDiff] = useState<Difficulty>("default");
  const [fighting, setFighting] = useState(false);
  const [gasketSitOn, setGasketSitOn] = useState(false);
  const [gasketSit, setGasketSit] = useState<GasketSit>(() => readNestGasketSit());
  const [gasketHp, setGasketHp] = useState({ hp: 22, max: 22 });
  const api = useRef<{
    load: (id: NestBiome) => void;
    spawn: (row: NestFoe, n: number) => void;
    reset: () => void;
    fight: (on: boolean) => void;
    diff: (d: Difficulty) => void;
    kit: (id: NestGasketKitId) => void;
    sit: (s: GasketSit) => void;
    sitVis: (on: boolean) => void;
    step: (dir: number) => void;
    setView: (v: DropView) => void;
    setZoom: (z: number) => void;
  } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let gen = 0;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101418);

    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;
    const aspect = w / h;
    const frustum = 22;
    const camera = new THREE.OrthographicCamera(-frustum * aspect, frustum * aspect, frustum, -frustum, 0.1, 200);
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

    const geo = isoDiamondGeo();
    const floor = new THREE.Group();
    floor.name = "nestFloor";
    scene.add(floor);
    const pack = new THREE.Group();
    pack.name = "nestPack";
    scene.add(pack);

    const pad = solid(0x2c343c);
    for (let tx = -NEST_R; tx <= NEST_R; tx++) {
      for (let ty = -NEST_R; ty <= NEST_R; ty++) {
        const mesh = new THREE.Mesh(geo, pad);
        const p = isoCell(tx, ty);
        mesh.position.set(p.x, 0, p.z);
        mesh.userData = { tx, ty };
        floor.add(mesh);
      }
    }
    const huntMark = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.03, 12),
      new THREE.MeshBasicMaterial({ color: 0x5ee0d0, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    huntMark.position.set(0, 0.02, 0);
    huntMark.name = "gasketPad";
    scene.add(huntMark);

    const gasketLive: NestGasket = makeNestGasket("harvester", "default");
    const sitLive = readNestGasketSit();
    let gasketRig = buildGasket();
    const gasketRoot = gasketRig.root;
    applyGasketSit(gasketRoot, sitLive);
    setGasketSitVisible(gasketRoot, false);
    scene.add(gasketRoot);
    const plantGasket = () => {
      const p = subCell(gasketLive.x, gasketLive.y, gasketLive.sub);
      gasketRoot.position.set(p.x, 0, p.z);
      gasketRoot.rotation.y = ISO_YAW[gasketLive.dir] ?? 0;
      huntMark.position.set(p.x, 0.02, p.z);
    };
    plantGasket();
    nestRespawnGasket(gasketLive, performance.now());

    const actors: NestActor[] = [];
    const fight = { on: false, cleave: true };
    let wanzerRoot: THREE.Object3D | null = null;
    const clearPack = () => {
      for (const child of [...pack.children]) {
        pack.remove(child);
        disposeObj(child);
      }
      actors.length = 0;
    };
    const dropWanzer = () => {
      if (!wanzerRoot) return;
      scene.remove(wanzerRoot);
      disposeObj(wanzerRoot);
      wanzerRoot = null;
    };
    const mountWanzer = async () => {
      if (wanzerRoot) return;
      const { buildWanzer, GOLD_GREY, GOLD_SIT, plantY } = await import("./kit");
      if (dead) return;
      const wanzer = buildWanzer(GOLD_GREY, GOLD_SIT);
      wanzer.root.scale.setScalar(GOLD_SIT.scale);
      wanzer.root.position.set(0, plantY(GOLD_SIT), 0);
      scene.add(wanzer.root);
      wanzerRoot = wanzer.root;
    };
    const paintFloor = (spec: NestSpec, floorTex?: THREE.Texture, fogTex?: THREE.Texture) => {
      const edge = fogTex ? texMat(fogTex) : solid(spec.paint.fog);
      const walk = floorTex ? texMat(floorTex) : solid(spec.paint.floor);
      const varn = floorTex ? texMat(floorTex) : solid(spec.paint.variant);
      floor.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh;
        const tx = mesh.userData.tx as number;
        const ty = mesh.userData.ty as number;
        const rim = Math.abs(tx) === NEST_R || Math.abs(ty) === NEST_R;
        mesh.material = rim ? edge : (tx + ty) % 3 === 0 ? varn : walk;
        void i;
      });
    };

    const plantPos = (a: NestActor) => (a.small ? subCell(a.x, a.y, a.sub) : isoCell(a.x, a.y));
    const syncActors = () => {
      for (const child of pack.children) {
        const a = actors.find((n) => n.uid === child.userData.uid);
        if (!a) continue;
        child.visible = a.hp > 0;
        if (a.hp <= 0) continue;
        const p = plantPos(a);
        child.position.set(p.x, 0, p.z);
        child.rotation.y = ISO_YAW[a.dir] ?? 0;
      }
    };

    const plantPack = async (row: NestFoe, n: number, token: number) => {
      if (!row.ready) return;
      clearPack();
      fight.on = false;
      let uid = 1;
      const plants = nestPackPlants(row, n);
      for (const plant of plants) {
        let g: THREE.Group;
        if (row.kind) g = await loadForestFoe(row.kind);
        else g = buildNestDummy(row.dummy);
        if (dead || token !== gen) {
          disposeObj(g);
          return;
        }
        const st = nestStats(row);
        const a: NestActor = {
          uid: uid++,
          specId: row.id,
          small: st.small,
          x: plant.x,
          y: plant.y,
          sub: plant.sub,
          dir: plant.dir,
          hp: st.hp,
          max: st.hp,
          dmg: st.dmg,
          def: st.def,
        };
        actors.push(a);
        g.userData.nestId = row.id;
        g.userData.uid = a.uid;
        g.userData.baseScale = row.scale;
        const p = plantPos(a);
        g.position.set(p.x, 0, p.z);
        g.rotation.y = ISO_YAW[a.dir] ?? 0;
        g.scale.setScalar(row.scale);
        pack.add(g);
      }
    };

    const load = async (id: NestBiome) => {
      const token = ++gen;
      const spec = nestOf(id);
      scene.background = new THREE.Color(spec.bg);
      fight.on = false;
      clearPack();
      paintFloor(spec);
      let tiles: Awaited<ReturnType<typeof loadNestTiles>> = null;
      try {
        tiles = await loadNestTiles(spec);
      } catch {
        tiles = null;
      }
      if (dead || token !== gen) return;
      const floorTex = tiles?.floor[0];
      const fogTex = tiles?.fog[0];
      paintFloor(spec, floorTex, fogTex);
      nestRespawnGasket(gasketLive, performance.now());
      plantGasket();
      if (gasketLive.kit === "harvester") await mountWanzer();
    };

    const reportHp = () => setGasketHp({ hp: Math.round(gasketLive.hp), max: gasketLive.max });

    api.current = {
      load,
      spawn: (row, n) => {
        void plantPack(row, n, gen);
      },
      reset: () => {
        fight.on = false;
        clearPack();
        nestRespawnGasket(gasketLive, performance.now());
        plantGasket();
        reportHp();
      },
      fight: (on) => {
        fight.on = on;
      },
      diff: (d) => {
        nestApplyDiff(gasketLive, d);
        reportHp();
      },
      kit: (id) => {
        gasketLive.kit = id;
        applyGasketSit(gasketRoot, sitLive);
        fight.cleave = id === "harvester";
        if (id === "harvester") void mountWanzer();
        else dropWanzer();
      },
      sit: (s) => {
        sitLive.scale = s.scale;
        sitLive.width = s.width;
        sitLive.thick = s.thick;
        sitLive.height = s.height;
        sitLive.stance = s.stance;
        applyGasketSit(gasketRoot, sitLive);
      },
      sitVis: (on) => {
        setGasketSitVisible(gasketRoot, on);
      },
      step: (dir) => {
        const v = [
          { x: 0, y: 1 },
          { x: 1, y: 0 },
          { x: 0, y: -1 },
          { x: -1, y: 0 },
        ][dir] ?? { x: 0, y: 1 };
        nestGasketStep(actors, gasketLive, v.x, v.y);
        nestAct(actors, gasketLive.x, gasketLive.y, gasketLive);
        if (gasketLive.hp <= 0) nestRespawnGasket(gasketLive, performance.now());
        syncActors();
        plantGasket();
        reportHp();
      },
      setView: (v) => {
        const spec = DROP_CAM[v];
        camera.position.set(spec.ox, spec.oy, spec.oz);
        camera.zoom = spec.zoom;
        camera.lookAt(0, 0.14, 0);
        camera.updateProjectionMatrix();
      },
      setZoom: (z) => {
        camera.zoom = z;
        camera.updateProjectionMatrix();
      },
    };

    let raf = 0;
    let lastStep = 0;
    const glowMat = huntMark.material as THREE.MeshBasicMaterial;
    const tick = (now: number) => {
      if (dead) return;
      if (fight.on && actors.length && now - lastStep >= NEST_TICK_MS) {
        lastStep = now;
        nestRound(actors, gasketLive, now, fight.cleave);
        syncActors();
        plantGasket();
        reportHp();
      }
      gasketRig.tick(now);
      const glow = Math.max(0, (gasketLive.glowUntil - now) / 720);
      glowMat.opacity = glow > 0 ? 0.25 + glow * 0.7 : 0.12;
      huntMark.scale.setScalar(1 + glow * 1.4);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const ww = el.clientWidth || 800;
      const hh = el.clientHeight || 600;
      camera.left = -frustum * (ww / hh);
      camera.right = frustum * (ww / hh);
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      dead = true;
      gen++;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      api.current = null;
      clearPack();
      dropWanzer();
      disposeObj(gasketRoot);
      disposeObj(floor);
      disposeObj(huntMark);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  const pick = (id: NestBiome) => {
    setBiome(id);
    setFocus(null);
    setFighting(false);
    api.current?.load(id);
  };
  const pickFoe = (row: NestFoe) => {
    if (!row.ready) return;
    setFocus(row.id);
  };
  const spec = biome ? nestOf(biome) : null;
  const selected = spec?.roster.find((r) => r.id === focus) ?? null;

  return (
    <main className="relative z-[80] h-dvh overflow-y-auto bg-bg" data-qa="nest3d">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="engraved text-xs">MONSTER NEST · LOOK RANGE</p>
        <Plate qa="nest3d-back" onClick={onBack}>
          Title
        </Plate>
      </div>
      <div className="relative">
        <div ref={host} className="h-[78dvh] min-h-[78dvh] w-full" />
      </div>
      <div className="flex items-center gap-3 border-t border-border bg-surface px-3 py-2">
        <span className="engraved w-24 shrink-0 text-[10px]">cam sit</span>
        <Plate
          qa="nest-cam-far"
          className={view === "far" ? "text-cyan" : ""}
          onClick={() => {
            setView("far");
            setZoom(DROP_CAM.far.zoom);
            api.current?.setView("far");
          }}
        >
          Far
        </Plate>
        <Plate
          qa="nest-cam-close"
          className={view === "close" ? "text-cyan" : ""}
          onClick={() => {
            setView("close");
            setZoom(DROP_CAM.close.zoom);
            api.current?.setView("close");
          }}
        >
          Close
        </Plate>
        <input
          type="range"
          min={CAM_ZOOM.min}
          max={CAM_ZOOM.max}
          step={CAM_ZOOM.step}
          value={zoom}
          onChange={(e) => {
            const z = Number(e.target.value);
            setZoom(z);
            api.current?.setZoom(z);
          }}
          className="h-2 min-w-0 flex-1 accent-cyan"
          aria-label="Camera zoom"
        />
      </div>
      <section className="border-t border-border px-3 py-2">
        <p className="engraved mb-1 text-[10px]">planet</p>
        <div className="grid grid-cols-3 gap-2">
          {NEST_BIOMES.map((b) => (
            <Plate key={b.id} qa={`nest-biome-${b.id}`} className={biome === b.id ? "text-cyan" : ""} onClick={() => pick(b.id)}>
              {b.planet}
            </Plate>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          {spec ? spec.help : "Pick a planet. Arena stays empty until Spawn pack."}
        </p>
      </section>
      <section className="border-t border-border px-3 py-2">
        <p className="engraved mb-1 text-[10px]">sandbox</p>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <Plate
            qa="nest-diff-story"
            className={diff === "story" ? "text-cyan" : ""}
            onClick={() => {
              setDiff("story");
              api.current?.diff("story");
            }}
          >
            Story
          </Plate>
          <Plate
            qa="nest-diff-default"
            className={diff === "default" ? "text-cyan" : ""}
            onClick={() => {
              setDiff("default");
              api.current?.diff("default");
            }}
          >
            Default
          </Plate>
        </div>
        <p className="engraved mb-1 text-[10px]">pack size</p>
        <div className="mb-2 grid grid-cols-3 gap-2">
          {NEST_PACK.map((n) => (
            <Plate key={n} qa={`nest-pack-${n}`} className={packN === n ? "text-cyan" : ""} onClick={() => setPackN(n)}>
              {n}
            </Plate>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Plate
            qa="nest-spawn"
            disabled={!selected}
            className={selected ? "" : "locked"}
            onClick={() => {
              if (!selected) return;
              setFighting(false);
              api.current?.spawn(selected, packN);
            }}
          >
            Spawn pack
          </Plate>
          <Plate
            qa="nest-reset"
            onClick={() => {
              setFighting(false);
              api.current?.reset();
            }}
          >
            Reset arena
          </Plate>
          <Plate
            qa="nest-fight"
            className={fighting ? "text-cyan" : ""}
            onClick={() => {
              const next = !fighting;
              setFighting(next);
              api.current?.fight(next);
            }}
          >
            Fight
          </Plate>
        </div>
      </section>
      <section className="border-t border-border px-3 py-2">
        <p className="engraved mb-1 text-[10px]">
          Gasket · {gasketHp.hp}/{gasketHp.max}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {NEST_GASKET_KITS.map((k) => (
            <Plate
              key={k.id}
              qa={`nest-gasket-${k.id}`}
              className={kit === k.id ? "text-cyan" : ""}
              onClick={() => {
                setKit(k.id);
                api.current?.kit(k.id);
              }}
            >
              {k.name}
            </Plate>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">{nestKitOf(kit).help}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Plate
            qa="nest-gasket-sit"
            className={gasketSitOn ? "text-cyan" : ""}
            onClick={() => {
              const next = !gasketSitOn;
              setGasketSitOn(next);
              api.current?.sitVis(next);
            }}
          >
            Gasket sit
          </Plate>
          <Plate
            qa="nest-gasket-yard"
            onClick={() => {
              const next = cloneGasketSit(GASKET_SIT_YARD);
              setGasketSit(next);
              writeNestGasketSit(next);
              api.current?.sit(next);
            }}
          >
            Nest yardstick
          </Plate>
          <Plate
            qa="nest-gasket-sit-reset"
            onClick={() => {
              const next = cloneGasketSit(GASKET_SIT);
              setGasketSit(next);
              writeNestGasketSit(next);
              api.current?.sit(next);
            }}
          >
            Reset gasket sit
          </Plate>
          <Plate
            qa="nest-gasket-sit-copy"
            onClick={() => {
              void navigator.clipboard?.writeText(dumpGasketSit(gasketSit));
            }}
          >
            Copy sit
          </Plate>
        </div>
        {gasketSitOn ? (
          <div className="mt-2 grid grid-cols-1 gap-1" data-qa="nest-gasket-sit-dock">
            {GASKET_SIT_SLIDERS.map((row) => (
              <label key={row.key} className="flex items-center gap-2 text-[11px] text-fg">
                <span className="w-16 shrink-0 uppercase tracking-wide text-brass">{row.label}</span>
                <input
                  data-qa={`nest-gasket-sit-${row.key}`}
                  type="range"
                  min={row.min}
                  max={row.max}
                  step={row.step}
                  value={gasketSit[row.key]}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    const next = { ...gasketSit, [row.key]: n };
                    setGasketSit(next);
                    writeNestGasketSit(next);
                    api.current?.sit(next);
                  }}
                  className="h-2 min-w-0 flex-1 accent-cyan"
                />
                <span className="w-10 text-right tabular-nums text-muted">{gasketSit[row.key].toFixed(2)}</span>
              </label>
            ))}
            <p className="text-[10px] text-muted">Nest authoring only. ¼-grid occupancy. Play/drop stay locked until promoted.</p>
          </div>
        ) : null}
        <div className="iso-pad mt-3" data-qa="nest-pad">
          <button type="button" className="iso-dir n" aria-label="North" onClick={() => api.current?.step(2)}>
            <span className="chev" />
          </button>
          <button type="button" className="iso-dir e" aria-label="East" onClick={() => api.current?.step(1)}>
            <span className="chev" />
          </button>
          <button type="button" className="iso-dir s" aria-label="South" onClick={() => api.current?.step(0)}>
            <span className="chev" />
          </button>
          <button type="button" className="iso-dir w" aria-label="West" onClick={() => api.current?.step(3)}>
            <span className="chev" />
          </button>
        </div>
      </section>
      {spec ? (
        <section className="border-t border-border px-3 py-2">
          <p className="engraved mb-1 text-[10px]">{spec.label} · roster</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {spec.roster.map((row) => (
              <Plate
                key={row.id}
                qa={`nest-foe-${row.id}`}
                disabled={!row.ready}
                className={`${focus === row.id ? "text-cyan" : ""} ${row.ready ? "" : "locked"}`}
                onClick={() => pickFoe(row)}
              >
                {row.ready ? row.name : `${row.name} · later`}
              </Plate>
            ))}
          </div>
          {selected ? (
            <div className="mt-2 text-[11px] leading-snug" data-qa="nest-detail">
              <p className="text-fg">
                {selected.name} — {selected.role}
              </p>
              <p className="text-muted">{selected.tags.join(" · ")}</p>
              <p className="text-muted">Soft counter: {selected.counter}</p>
              <p className="text-muted">Occupancy: {selected.occupancy}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
