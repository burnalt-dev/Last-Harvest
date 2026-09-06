/**
 * Loading lanes (S61):
 *   title  — BOOT empty. No three, no biome, no foes, no lookdev sheets.
 *   bay/ship — 3D parts via kit/parts3d (procedural). No planet tiles, no foes.
 *   drop   — current biome only, streamed by Drop3D. Never all biomes.
 */
import type { BiomeId } from "./data";
import type { Loadout } from "./parts";

const BOOT: Record<string, string> = {};

const BIOME: Record<BiomeId, Record<string, string>> = {
  forest: {
    "tiles/forest": "/game/tiles/forest.png?v=veldt1",
    "tiles/forest-fog": "/game/tiles/forest-fog.png?v=hd",
    "props/pr001": "/game/props/pr001.png?v=hd",
    "props/pr002": "/game/props/pr002.png?v=hd",
    "props/pr003": "/game/props/pr003.png?v=hd",
    "props/sh001": "/game/props/sh001.png",
  },
};

const cache = new Map<string, HTMLImageElement>();
const inflight = new Map<string, Promise<void>>();
const cacheSrc = new Map<string, string>();

export function img(id: string) {
  return cache.get(id) ?? null;
}

function loadOne(id: string, src: string, ms = 4000) {
  if (cache.has(id) && cacheSrc.get(id) === src) return Promise.resolve();
  cache.delete(id);
  inflight.delete(id);
  const hit = inflight.get(id);
  if (hit) return hit;
  const job = new Promise<void>((resolve) => {
    const el = new Image();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      inflight.delete(id);
      resolve();
    };
    el.onload = () => {
      cache.set(id, el);
      cacheSrc.set(id, src);
      finish();
    };
    el.onerror = finish;
    el.src = src;
    setTimeout(() => {
      if (!cache.has(id)) inflight.delete(id);
      finish();
    }, ms);
  });
  inflight.set(id, job);
  return job;
}

function loadGroup(group: Record<string, string>, ms?: number) {
  return Promise.all(Object.entries(group).map(([id, src]) => loadOne(id, src, ms))).then(() => undefined);
}

/** Title/ship: no 2D actor PNGs. Crate/Gasket/foes are 3D after Board. */
export function preloadBoot() {
  return loadGroup(BOOT, 1200);
}

export function preloadLoadout(_l: Loadout) {
  return Promise.resolve();
}

/** Bay parts are 3D (`parts3d`). Do not fetch forest, foes, or p### PNGs. */
export function preloadBay() {
  return Promise.resolve();
}

export function preloadBiome(id: BiomeId) {
  return loadGroup(BIOME[id], 5000);
}

/** Leftover 2D blit helper. Drop3D streams the live biome itself — do not gate Board on this. */
export function preloadBiomeOrGo(id: BiomeId, go: () => void, ms = 1400) {
  let gone = false;
  const run = () => {
    if (gone) return;
    gone = true;
    go();
  };
  const t = setTimeout(run, ms);
  return preloadBiome(id)
    .then(() => {
      if (!img(`tiles/${id}`)) return preloadBiome(id);
    })
    .then(() => {
      clearTimeout(t);
      run();
    })
    .catch(() => {
      clearTimeout(t);
      run();
    });
}