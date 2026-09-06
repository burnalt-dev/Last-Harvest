"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildWanzer, GOLD_GREY, GOLD_SIT, kitFromLoadout, plantY, setBonesVisible, setSeatGizmoVisible } from "./kit";
import { buildGasket } from "./gasket";
import { buildFoe } from "./foe3d";
import { isoCell, ISO_YAW, isoDiamondGeo, subCell } from "./iso3d";
import { loadIsoTile, sliceSheet } from "./sprites";
import { DIR } from "../iso";
import { DROP_CAM, type DropView } from "./cam";
import type { Loadout } from "../parts";
import type { Dungeon, Fx } from "../sim";

export type { DropView };
export { DROP_CAM };

const FRUSTUM = 22;

function solidMat(hex: number) {
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

export function Drop3D({
  dungeon,
  onTile,
  onStep,
  view = "far",
  loadout,
  fx = [],
}: {
  dungeon: Dungeon;
  onTile: (tx: number, ty: number) => void;
  onStep: (dir: number) => void;
  view?: DropView;
  loadout?: Loadout;
  fx?: Fx[];
}) {
  const host = useRef<HTMLDivElement>(null);
  const dunRef = useRef(dungeon);
  dunRef.current = dungeon;
  const onTileRef = useRef(onTile);
  onTileRef.current = onTile;
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  const viewRef = useRef<DropView>(view);
  viewRef.current = view;
  const kitRef = useRef(loadout ? kitFromLoadout(loadout) : GOLD_GREY);
  kitRef.current = loadout ? kitFromLoadout(loadout) : GOLD_GREY;
  const fxRef = useRef(fx);
  fxRef.current = fx;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1810);

    const w0 = el.clientWidth || 800;
    const h0 = el.clientHeight || 600;
    const aspect = w0 / h0;
    const camera = new THREE.OrthographicCamera(
      -FRUSTUM * aspect,
      FRUSTUM * aspect,
      FRUSTUM,
      -FRUSTUM,
      0.1,
      200,
    );
    camera.zoom = DROP_CAM[viewRef.current].zoom;
    camera.position.set(2.6, 6.6, 8.4);
    camera.lookAt(0, 0.14, 0);
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w0, h0);
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xd8dce0, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2dc, 0.45);
    sun.position.set(3, 8, 2);
    scene.add(sun);

    const geo = isoDiamondGeo();
    const matUnseen = solidMat(0x142414);
    const matSeen = solidMat(0x1c3320);
    const matFloor = solidMat(0x3d4a30);
    const matVariant = solidMat(0x4a5a38);
    const matStairs = solidMat(0x3a5850);
    const mats = { unseen: matUnseen, seen: matSeen, floor: matFloor, variant: matVariant, stairs: matStairs };

    const floor = new THREE.Group();
    floor.name = "veldtFloor";
    scene.add(floor);
    const cells: THREE.Mesh[] = [];
    const d0 = dunRef.current;
    for (let ty = 0; ty < d0.h; ty++) {
      for (let tx = 0; tx < d0.w; tx++) {
        const mesh = new THREE.Mesh(geo, matUnseen);
        const p = isoCell(tx, ty);
        mesh.position.set(p.x, 0, p.z);
        mesh.userData = { tx, ty };
        floor.add(mesh);
        cells.push(mesh);
      }
    }

    const stairsMark = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.16),
      new THREE.MeshBasicMaterial({ color: 0x5ee0d0 }),
    );
    stairsMark.visible = false;
    scene.add(stairsMark);

    const wanzer = buildWanzer(kitRef.current, GOLD_SIT);
    wanzer.root.scale.setScalar(GOLD_SIT.scale);
    setBonesVisible(wanzer.root, false);
    setSeatGizmoVisible(wanzer.root, false);
    scene.add(wanzer.root);

    const lasers = new THREE.Group();
    scene.add(lasers);
    const liveLasers: { line: THREE.Line; t0: number; life: number }[] = [];
    const seenBolt = new Set<string>();

    const gasketRig = buildGasket();
    const gasket = gasketRig.root;
    gasket.scale.setScalar(0.36);
    scene.add(gasket);

    const foes = new Map<number, THREE.Group>();
    const trees = new Map<string, THREE.Object3D>();
    const anvilSpr: THREE.Object3D[] = [];
    const shinySpr: { obj: THREE.Object3D; x: number; y: number }[] = [];

    const followCam = (x: number, z: number) => {
      const spec = DROP_CAM[viewRef.current];
      const d = dunRef.current;
      let lx = x;
      let lz = z;
      if (spec.look > 0) {
        const v = DIR[d.pdir] ?? DIR[0]!;
        const b = isoCell(d.px + v.x * spec.look, d.py + v.y * spec.look);
        lx = x * 0.55 + b.x * 0.45;
        lz = z * 0.55 + b.z * 0.45;
      }
      camera.position.set(lx + spec.ox, spec.oy, lz + spec.oz);
      camera.lookAt(lx, 0.14, lz);
    };

    const matForTile = (tile: number) => (tile === 2 ? mats.stairs : tile === 3 ? mats.variant : mats.floor);

    const placeGasket = (d: Dungeon, yaw: number) => {
      if (d.chp <= 0) {
        gasket.visible = false;
        return;
      }
      gasket.visible = true;
      if (d.mounted) {
        wanzer.mount.add(gasket);
        gasket.position.set(0, 0.02, 0);
        gasket.rotation.set(0, Math.PI, 0);
        gasket.scale.setScalar(0.32);
      } else {
        if (gasket.parent) gasket.parent.remove(gasket);
        scene.add(gasket);
        const p = isoCell(d.cx, d.cy);
        gasket.position.set(p.x, 0, p.z);
        gasket.rotation.set(0, yaw, 0);
        gasket.scale.setScalar(0.36);
      }
    };

    const syncFoes = (d: Dungeon) => {
      const live = new Set<number>();
      for (const e of d.enemies) {
        live.add(e.id);
        let g = foes.get(e.id);
        if (!g) {
          g = buildFoe(e.kind);
          foes.set(e.id, g);
          scene.add(g);
        }
        const vis = !!d.vis[e.y * d.w + e.x];
        g.visible = e.hp > 0 && vis;
        if (!g.visible) continue;
        const p = e.kind === "small" ? subCell(e.x, e.y, e.sub ?? 0) : isoCell(e.x, e.y);
        g.position.set(p.x, 0, p.z);
        g.rotation.y = ISO_YAW[e.dir] ?? 0;
      }
      for (const [id, g] of foes) {
        if (live.has(id)) continue;
        scene.remove(g);
        foes.delete(id);
      }
    };

    const sync = () => {
      const d = dunRef.current;
      const yaw = ISO_YAW[d.pdir] ?? 0;
      stairsMark.visible = false;
      for (const cell of cells) {
        const tx = cell.userData.tx as number;
        const ty = cell.userData.ty as number;
        const i = ty * d.w + tx;
        const seen = d.seen[i];
        const vis = d.vis[i];
        const tile = d.tiles[i]!;
        if (!seen) cell.material = mats.unseen;
        else if (!vis) cell.material = mats.seen;
        else cell.material = matForTile(tile);
        const tree = trees.get(`${tx},${ty}`);
        if (tree) tree.visible = !!vis && tile === 1;
        if (tile === 2 && vis) {
          const p = isoCell(tx, ty);
          stairsMark.position.set(p.x, 0.08, p.z);
          stairsMark.visible = true;
        }
      }
      for (const a of anvilSpr) {
        const tx = a.userData.tx as number;
        const ty = a.userData.ty as number;
        a.visible = !!d.vis[ty * d.w + tx];
      }
      for (const s of shinySpr) {
        const sh = d.shinies.find((n) => n.x === s.x && n.y === s.y);
        s.obj.visible = !!sh && !sh.taken && !!d.vis[s.y * d.w + s.x];
      }
      const p = isoCell(d.px, d.py);
      wanzer.root.position.set(p.x, plantY(GOLD_SIT), p.z);
      wanzer.root.rotation.y = yaw;
      wanzer.root.scale.setScalar(GOLD_SIT.scale);
      followCam(p.x, p.z);
      placeGasket(d, yaw);
      syncFoes(d);
    };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onPointer = (e: PointerEvent) => {
      if (e.button && e.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(floor.children, false)[0];
      if (!hit) return;
      const tx = hit.object.userData.tx as number;
      const ty = hit.object.userData.ty as number;
      onTileRef.current(tx, ty);
    };
    renderer.domElement.addEventListener("pointerdown", onPointer);

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
      const dir = map[e.key];
      if (dir === undefined) return;
      e.preventDefault();
      onStepRef.current(dir);
    };
    window.addEventListener("keydown", onKey);

    let raf = 0;
    let lastW = 0;
    let lastH = 0;
    const loop = () => {
      if (dead) return;
      const ww = el.clientWidth;
      const hh = el.clientHeight;
      if (ww && hh && (ww !== lastW || hh !== lastH)) {
        renderer.setSize(ww, hh);
        lastW = ww;
        lastH = hh;
        const a = ww / hh;
        camera.left = -FRUSTUM * a;
        camera.right = FRUSTUM * a;
        camera.updateProjectionMatrix();
      }
      const z = DROP_CAM[viewRef.current].zoom;
      if (camera.zoom !== z) {
        camera.zoom = z;
        camera.updateProjectionMatrix();
      }
      sync();
      wanzer.tick(performance.now());
      gasketRig.tick(performance.now());
      for (const f of fxRef.current) {
        if (f.k !== "bolt") continue;
        const id = `${f.x0}:${f.y0}:${f.x1}:${f.y1}:${f.t}:${f.side ?? 0}`;
        if (seenBolt.has(id)) continue;
        seenBolt.add(id);
        const a = isoCell(f.x0, f.y0);
        const b = isoCell(f.x1, f.y1);
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz) || 1;
        const side = f.side ?? 0;
        const ox = (-dz / len) * 0.09 * side;
        const oz = (dx / len) * 0.09 * side;
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x + ox, 0.28, a.z + oz),
          new THREE.Vector3(b.x + ox * 0.3, 0.2, b.z + oz * 0.3),
        ]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x5ee0d0, transparent: true, opacity: 1 }));
        lasers.add(line);
        liveLasers.push({ line, t0: performance.now(), life: 280 });
      }
      const nowL = performance.now();
      for (let i = liveLasers.length - 1; i >= 0; i--) {
        const L = liveLasers[i]!;
        const u = (nowL - L.t0) / L.life;
        (L.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, 1 - u);
        if (u >= 1) {
          lasers.remove(L.line);
          L.line.geometry.dispose();
          liveLasers.splice(i, 1);
        }
      }
      const pulse = 0.7 + Math.sin(performance.now() / 180) * 0.3;
      for (const s of shinySpr) {
        const spr = s.obj as THREE.Sprite;
        if (spr.material) (spr.material as THREE.SpriteMaterial).opacity = pulse;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    sync();

    void (async () => {
      const [floorTex, fogTex, treeA, treeB, anvil, spark] = await Promise.all([
        sliceSheet("/game/tiles/forest.png?v=hd", 2, 2).catch(() => [] as THREE.CanvasTexture[]),
        sliceSheet("/game/tiles/forest-fog.png?v=hd", 2, 1).catch(() => [] as THREE.CanvasTexture[]),
        loadIsoTile("/game/props/pr001.png?v=hd", 0.95).catch(() => null),
        loadIsoTile("/game/props/pr002.png?v=hd", 0.95).catch(() => null),
        loadIsoTile("/game/props/pr003.png?v=hd", 0.55).catch(() => null),
        loadIsoTile("/game/props/sh001.png", 0.28).catch(() => null),
      ]);
      if (dead) return;
      if (fogTex[0]) mats.unseen = texMat(fogTex[0]);
      if (fogTex[1]) mats.seen = texMat(fogTex[1]);
      if (floorTex[0]) mats.floor = texMat(floorTex[0]);
      if (floorTex[3]) mats.variant = texMat(floorTex[3]);
      if (floorTex[2]) mats.stairs = texMat(floorTex[2]);
      const d = dunRef.current;
      for (let ty = 0; ty < d.h; ty++) {
        for (let tx = 0; tx < d.w; tx++) {
          if (d.tiles[ty * d.w + tx] !== 1) continue;
          const proto = (tx + ty) % 2 === 0 ? treeA : treeB || treeA;
          if (!proto) continue;
          const spr = proto.clone();
          const p = isoCell(tx, ty);
          spr.position.set(p.x, 0, p.z);
          spr.visible = false;
          scene.add(spr);
          trees.set(`${tx},${ty}`, spr);
        }
      }
      if (anvil) {
        for (const an of d.anvils) {
          const spr = anvil.clone();
          const p = isoCell(an.x, an.y);
          spr.position.set(p.x, 0, p.z);
          spr.userData = { tx: an.x, ty: an.y };
          spr.visible = false;
          scene.add(spr);
          anvilSpr.push(spr);
        }
      }
      if (spark) {
        (spark.material as THREE.SpriteMaterial).transparent = true;
        for (const sh of d.shinies) {
          const spr = spark.clone();
          const p = isoCell(sh.x, sh.y);
          spr.position.set(p.x, 0, p.z);
          spr.visible = false;
          scene.add(spr);
          shinySpr.push({ obj: spr, x: sh.x, y: sh.y });
        }
      }
    })();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      renderer.domElement.removeEventListener("pointerdown", onPointer);
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={host}
      data-qa="drop3d"
      className="min-h-0 w-full flex-1 touch-none"
      style={{ cursor: dungeon.aiming ? "crosshair" : "default" }}
    />
  );
}
