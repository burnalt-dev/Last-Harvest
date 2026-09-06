import type { BiomeId } from "./data";

const BOOT: Record<string, string> = {
  "companion/gasket": "/game/companion/gasket.png",
  "parts/p000": "/game/parts/p000.png?v=iso2",
  "parts/p001": "/game/parts/p001.png?v=iso2",
  "parts/p002": "/game/parts/p002.png?v=iso2",
  "parts/p005": "/game/parts/p005.png?v=iso2",
  "parts/p006": "/game/parts/p006.png?v=iso2",
  "parts/p007": "/game/parts/p007.png?v=iso2",
  "parts/p008": "/game/parts/p008.png?v=iso2",
  "parts/p009": "/game/parts/p009.png?v=iso2",
  "parts/p010": "/game/parts/p010.png?v=iso2",
};

const BIOME: Record<BiomeId, Record<string, string>> = {
  forest: {
    "tiles/forest": "/game/tiles/forest.png?v=hd",
    "tiles/forest-fog": "/game/tiles/forest-fog.png?v=hd",
    "props/pr001": "/game/props/pr001.png?v=hd",
    "props/pr002": "/game/props/pr002.png?v=hd",
    "props/pr003": "/game/props/pr003.png?v=hd",
    "props/sh001": "/game/props/sh001.png",
    "enemies/goblin": "/game/enemies/goblin.png?v=hd",
    "enemies/orc": "/game/enemies/orc.png?v=hd",
    "enemies/blacksmith": "/game/enemies/blacksmith.png?v=hd",
  },
  ruins: {},
  mines: {},
};

const cache = new Map<string, HTMLImageElement>();
const inflight = new Map<string, Promise<void>>();
let bootReady = false;

export function artReady() {
  return bootReady;
}

export function img(id: string) {
  return cache.get(id) ?? null;
}

function loadOne(id: string, src: string, ms = 4000) {
  if (cache.has(id)) return Promise.resolve();
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

/** Title/ship: gasket + starter crate only. Never all biomes. */
export function preloadBoot() {
  return loadGroup(BOOT, 1200).then(() => {
    bootReady = true;
  });
}

export function preloadBiome(id: BiomeId) {
  return loadGroup(BIOME[id], 5000);
}

export function preloadArt() {
  return preloadBoot();
}
