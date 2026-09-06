"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plate } from "../ui/Plate";
import { isoCell, isoDiamondGeo, ISO_YAW, subCell } from "./iso3d";
import { DROP_CAM, type DropView } from "./cam";
import {
  buildNestDummy,
  loadForestFoe,
  loadNestTiles,
  nestAct,
  nestOf,
  nestSpawnList,
  nestEdgeCell,
  NEST_BIOMES,
  NEST_R,
  NEST_TICK_MS,
  type NestActor,
  type NestBiome,
  type NestFoe,
  type NestSpec,
} from "./nest";

const CAM_ZOOM = { min: 0.4, max: 30, step: 0.05, def: DROP_CAM.far.zoom };

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
  const api = useRef<{
    load: (id: NestBiome) => void;
    focus: (id: string | null) => void;
    smite: (id: string) => void;
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
      new THREE.CylinderGeometry(0.12, 0.16, 0.04, 8),
      new THREE.MeshBasicMaterial({ color: 0x5ee0d0 }),
    );
    huntMark.position.set(0, 0.02, 0);
    huntMark.name = "gasketPad";
    scene.add(huntMark);

    const actors: NestActor[] = [];
    const clearPack = () => {
      for (const child of [...pack.children]) {
        pack.remove(child);
        disposeObj(child);
      }
      actors.length = 0;
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
        const p = plantPos(a);
        child.position.set(p.x, 0, p.z);
        child.rotation.y = ISO_YAW[a.dir] ?? 0;
      }
    };

    const plantRoster = async (spec: NestSpec, token: number) => {
      let uid = 1;
      for (const row of nestSpawnList(spec)) {
        let g: THREE.Group;
        if (row.kind) g = await loadForestFoe(row.kind);
        else g = buildNestDummy(row.dummy);
        if (dead || token !== gen) {
          disposeObj(g);
          return;
        }
        const a: NestActor = {
          uid: uid++,
          specId: row.id,
          small: !!(row.kind === "small" || row.dummy === "ghost" || row.dummy === "crawler"),
          x: 0,
          y: 0,
          sub: 0,
          dir: 0,
          hp: row.kind === "small" || row.dummy === "ghost" || row.dummy === "crawler" ? 12 : 28,
          max: row.kind === "small" || row.dummy === "ghost" || row.dummy === "crawler" ? 12 : 28,
        };
        const edge = nestEdgeCell(actors, a);
        a.x = edge.x;
        a.y = edge.y;
        a.sub = a.small ? a.uid % 4 : 0;
        a.dir = a.x < 0 ? 1 : a.x > 0 ? 3 : a.y < 0 ? 0 : 2;
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
      await plantRoster(spec, token);
    };

    api.current = {
      load,
      focus: (id) => {
        pack.children.forEach((c) => {
          const on = !id || c.userData.nestId === id;
          const base = (c.userData.baseScale as number) || 1;
          c.scale.setScalar(base * (on ? 1.12 : 0.82));
        });
      },
      smite: (id) => {
        for (const a of actors) {
          if (a.specId === id) a.hp = 0;
        }
        nestAct(actors);
        syncActors();
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
    const tick = (now: number) => {
      if (dead) return;
      if (actors.length && now - lastStep >= NEST_TICK_MS) {
        lastStep = now;
        nestAct(actors);
        syncActors();
      }
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
      disposeObj(floor);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  const pick = (id: NestBiome) => {
    setBiome(id);
    setFocus(null);
    api.current?.load(id);
  };
  const pickFoe = (row: NestFoe) => {
    setFocus(row.id);
    api.current?.focus(row.id);
  };
  const spec = biome ? nestOf(biome) : null;

  return (
    <main className="relative z-[80] h-dvh overflow-y-auto bg-bg" data-qa="nest3d">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="engraved text-xs">Monster Nest · look range</p>
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
          {spec
            ? `${spec.help} They hunt the cyan pad (Gasket later). Adjacent = threaten. Smite → rim respawn.`
            : "Pick a planet. Only that pack loads. Foes walk the dungeon stepper."}
        </p>
      </section>
      {spec ? (
        <section className="border-t border-border px-3 py-2">
          <p className="engraved mb-1 text-[10px]">{spec.label} · roster</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {spec.roster.map((row) => (
              <Plate key={row.id} qa={`nest-foe-${row.id}`} className={focus === row.id ? "text-cyan" : ""} onClick={() => pickFoe(row)}>
                {row.name}
              </Plate>
            ))}
          </div>
          {focus ? (
            <Plate qa="nest-smite" className="mt-2" onClick={() => api.current?.smite(focus)}>
              Smite · rim respawn
            </Plate>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
