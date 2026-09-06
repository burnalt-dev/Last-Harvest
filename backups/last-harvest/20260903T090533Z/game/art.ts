const PATHS: Record<string, string> = {
  "companion/gasket": "/game/companion/gasket.png",
  "enemies/goblin": "/game/enemies/goblin.png",
  "enemies/orc": "/game/enemies/orc.png",
  "enemies/skeleton": "/game/enemies/skeleton.png",
  "enemies/crawler": "/game/enemies/crawler.png",
  "enemies/ghost": "/game/enemies/ghost.png",
  "enemies/elites": "/game/enemies/elites.png",
  "tiles/forest": "/game/tiles/forest.png",
  "tiles/forest-fog": "/game/tiles/forest-fog.png",
  "tiles/ruins": "/game/tiles/ruins.png",
  "tiles/ruins-fog": "/game/tiles/ruins-fog.png",
  "tiles/mines": "/game/tiles/mines.png",
  "tiles/mines-fog": "/game/tiles/mines-fog.png",
  "props/sh001": "/game/props/sh001.png",
  "props/pr001": "/game/props/pr001.png",
  "props/pr002": "/game/props/pr002.png",
  "parts/p000": "/game/parts/p000.png",
  "parts/p001": "/game/parts/p001.png",
  "parts/p002": "/game/parts/p002.png",
  "parts/p005": "/game/parts/p005.png",
  "parts/p006": "/game/parts/p006.png",
};

const cache = new Map<string, HTMLImageElement>();
let ready = false;

export function artReady() {
  return ready;
}

export function img(id: string) {
  return cache.get(id) ?? null;
}

export function preloadArt(): Promise<void> {
  if (ready && cache.size === Object.keys(PATHS).length) return Promise.resolve();
  const jobs = Object.entries(PATHS).map(
    ([id, src]) =>
      new Promise<void>((resolve) => {
        const el = new Image();
        el.onload = () => {
          cache.set(id, el);
          resolve();
        };
        el.onerror = () => resolve();
        el.src = src;
      }),
  );
  return Promise.all(jobs).then(() => {
    ready = true;
  });
}
