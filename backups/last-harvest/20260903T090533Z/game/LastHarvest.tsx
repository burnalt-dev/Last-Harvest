import { useCallback, useEffect, useRef, useState } from "react";
import { artReady, preloadArt } from "./art";
import { sfxHit, sfxMove, sfxUi, startTheme, unlockAudio } from "./audio";
import { BIOMES, WEAPONS, derive, type BiomeId, type WeaponId } from "./data";
import { DIR, fromIso, iso } from "./iso";
import { equipWeapon, partById, SLOT_ORDER, type Loadout } from "./parts";
import { drawDungeon } from "./render";
import { drawComposite } from "./solace/compose";
import { drawFloorSlate, drawScope } from "./radar";
import {
  makeDungeon,
  playerAct,
  type Dungeon,
  type Fx,
  type Pilot,
  newPilot,
  descend,
  skillCharge,
  skillNanobot,
} from "./sim";

type Mode = "boot" | "title" | "ship" | "talk" | "hangar" | "drop" | "dungeon" | "map" | "status" | "test" | "dead";

function Plate({
  children,
  onClick,
  className = "",
  active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`plate plate-press px-4 py-3 text-left text-fg ${active ? "ring-1 ring-cyan" : ""} ${className}`}>
      {children}
    </button>
  );
}

export function LastHarvest() {
  const [mode, setMode] = useState<Mode>("boot");
  const [pilot, setPilot] = useState<Pilot>(() => newPilot());
  const [talk, setTalk] = useState<{ who: string; lines: string[] } | null>(null);
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null);
  const [testDir, setTestDir] = useState(0);
  const [testWep, setTestWep] = useState<WeaponId>("blade");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const testRef = useRef<HTMLCanvasElement>(null);
  const dunRef = useRef<Dungeon | null>(null);
  dunRef.current = dungeon;

  useEffect(() => {
    void preloadArt().then(() => setMode((m) => (m === "boot" ? "title" : m)));
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || mode !== "dungeon" || !dungeon) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const d = dunRef.current;
      if (d) {
        const r = c.getBoundingClientRect();
        c.width = r.width * devicePixelRatio;
        c.height = r.height * devicePixelRatio;
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        drawDungeon(ctx, d, d && pilot.loadout, fx, aim);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, dungeon, fx, aim, pilot.loadout]);

  useEffect(() => {
    const c = testRef.current;
    if (!c || mode !== "test") return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loadout = equipWeapon(pilot.loadout, testWep);
    const loop = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width * devicePixelRatio;
      c.height = r.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.fillStyle = "#0c1014";
      ctx.fillRect(0, 0, r.width, r.height);
      drawComposite(ctx, loadout, testDir, r.width / 2, r.height * 0.72, 1.6, "idle", performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, testDir, testWep, pilot.loadout]);

  const startRun = (id: BiomeId) => {
    sfxUi();
    const d = makeDungeon(id, 1, pilot);
    setDungeon(d);
    setMode("dungeon");
  };

  const stepPad = (dir: number) => {
    if (!dungeon) return;
    sfxMove();
    const v = DIR[dir]!;
    const r = playerAct(dungeon, pilot, v.x, v.y, fx);
    setDungeon({ ...dungeon });
    if (r === "stairs") {
      const n = descend(dungeon, { ...pilot, hp: dungeon.php });
      if (n) setDungeon(n);
      else {
        setPilot({ ...pilot, hp: dungeon.php, earthScrip: pilot.earthScrip + 2 });
        setMode("ship");
        setDungeon(null);
      }
    }
    if (r === "dead") setMode("dead");
  };

  const onCanvasClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dungeon || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const p = "touches" in e ? e.touches[0] : e;
      if (!p) return;
      const cam = iso(dungeon.px, dungeon.py, 0, 0);
      const ox = rect.width / 2 - cam.x;
      const oy = rect.height * 0.42 - cam.y;
      const g = fromIso(p.clientX - rect.left, p.clientY - rect.top, ox, oy);
      const dx = Math.sign(g.tx - dungeon.px);
      const dy = Math.sign(g.ty - dungeon.py);
      if (dx || dy) {
        const dir = dx === 1 ? 2 : dx === -1 ? 1 : dy === -1 ? 3 : 0;
        stepPad(dir);
      }
    },
    [dungeon, fx, pilot],
  );

  if (mode === "boot") {
    return (
      <main className="flex h-dvh flex-col items-center justify-center bg-bg">
        <p className="engraved text-xs">HCS Last Harvest</p>
        <p className="mt-2 text-muted">Fitting visor…</p>
      </main>
    );
  }

  if (mode === "title") {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Earth is dying</p>
        <h1 className="mt-2 text-4xl font-bold">Last Harvest</h1>
        <p className="mt-2 font-mono text-sm text-muted">Prototype crate. Three graves. Do you have the talent?</p>
        <TitleMech loadout={pilot.loadout} />
        <div className="mt-auto grid gap-2">
          <Plate onClick={() => { unlockAudio(); startTheme(); sfxUi(); setMode("ship"); }}>Board the Harvester</Plate>
          <Plate onClick={() => { sfxUi(); setMode("test"); }}>Mech test</Plate>
        </div>
      </main>
    );
  }

  if (mode === "test") {
    return (
      <main className="flex h-dvh flex-col bg-bg">
        <canvas ref={testRef} className="min-h-0 w-full flex-1" />
        <div className="grid grid-cols-4 gap-2 p-3">
          <Plate onClick={() => setTestDir(3)}>N</Plate>
          <Plate onClick={() => setTestDir(1)}>W</Plate>
          <Plate onClick={() => setTestDir(2)}>E</Plate>
          <Plate onClick={() => setTestDir(0)}>S</Plate>
        </div>
        <div className="grid grid-cols-3 gap-2 px-3">
          {(["blade", "scythe", "cannon"] as WeaponId[]).map((w) => (
            <Plate key={w} active={testWep === w} onClick={() => setTestWep(w)}>{w}</Plate>
          ))}
        </div>
        <div className="p-3">
          <Plate onClick={() => setMode("title")}>Exit test</Plate>
        </div>
      </main>
    );
  }

  if (mode === "talk" && talk) {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">{talk.who === "captain" ? "Capt. Rend" : "Liaison Halle"}</p>
        {talk.lines.map((l) => (
          <p key={l} className="mt-3 text-lg">{l}</p>
        ))}
        <div className="mt-auto pt-4">
          {talk.who === "captain" && <Plate className="mb-2" onClick={() => { sfxUi(); setTalk(null); setMode("drop"); }}>Authorize drop</Plate>}
          <Plate onClick={() => { sfxUi(); setTalk(null); setMode("ship"); }}>Cut channel</Plate>
        </div>
      </main>
    );
  }

  if (mode === "hangar") {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Hangar lock · grey starter</p>
        <h2 className="mt-1 text-3xl font-bold">Frame bay</h2>
        <HangarPreview loadout={pilot.loadout} />
        <div className="mt-2 grid max-h-36 grid-cols-2 gap-2 overflow-auto font-mono text-xs">
          {SLOT_ORDER.map((slot) => {
            const id = pilot.loadout[slot];
            const p = id ? partById(id) : null;
            return (
              <div key={slot} className="plate px-3 py-2">
                <div className="engraved text-[10px]">{slot}</div>
                <div className="text-cyan">{id || "—"}</div>
                <div className="text-muted">{p?.name ?? "empty"}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2">
          {(Object.keys(WEAPONS) as WeaponId[]).map((id) => (
            <Plate key={id} active={pilot.weapon === id} onClick={() => { sfxUi(); setPilot({ ...pilot, weapon: id, loadout: equipWeapon(pilot.loadout, id) }); }}>
              <div className="text-lg font-semibold">{WEAPONS[id].name}</div>
            </Plate>
          ))}
        </div>
        <div className="mt-auto pt-3">
          <Plate onClick={() => setMode("ship")}>Return to bay</Plate>
        </div>
      </main>
    );
  }

  if (mode === "drop") {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Capt. Rend · drop authority</p>
        <h2 className="mt-1 text-3xl font-bold">Pick a grave</h2>
        <div className="mt-4 grid gap-3">
          {(Object.keys(BIOMES) as BiomeId[]).map((id) => (
            <Plate key={id} onClick={() => startRun(id)}>
              <div className="engraved text-xs">{BIOMES[id].planet}</div>
              <div className="text-lg font-semibold">{BIOMES[id].title}</div>
              <p className="mt-1 font-mono text-xs text-muted">{BIOMES[id].blurb}</p>
            </Plate>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <Plate onClick={() => setMode("ship")}>Hold the drop</Plate>
        </div>
      </main>
    );
  }

  if (mode === "status") {
    const st = derive(pilot.stur, pilot.avo, pilot.per);
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Frame status</p>
        <h2 className="mt-1 text-3xl font-bold">Solace</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="plate p-3"><div className="engraved text-[10px]">Stur</div><div className="text-2xl text-cyan">{pilot.stur}</div></div>
          <div className="plate p-3"><div className="engraved text-[10px]">Avo</div><div className="text-2xl text-cyan">{pilot.avo}</div></div>
          <div className="plate p-3"><div className="engraved text-[10px]">Per</div><div className="text-2xl text-cyan">{pilot.per}</div></div>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">radar {st.radar} · hp {st.hp} · idle MMX 2-frame</p>
        <div className="mt-auto pt-3">
          <Plate onClick={() => setMode(dungeon ? "dungeon" : "ship")}>Back</Plate>
        </div>
      </main>
    );
  }

  if (mode === "map" && dungeon) {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Deck slate</p>
        <h2 className="mt-1 text-3xl font-bold">{BIOMES[dungeon.biome].planet}</h2>
        <FloorSlate dungeon={dungeon} />
        <div className="mt-auto pt-3">
          <Plate onClick={() => setMode("dungeon")}>Close slate</Plate>
        </div>
      </main>
    );
  }

  if (mode === "dead") {
    return (
      <main className="flex h-dvh flex-col items-center justify-center bg-bg p-4">
        <p className="engraved text-xs">Frame lost</p>
        <h2 className="mt-2 text-3xl">The crate went quiet.</h2>
        <Plate className="mt-6" onClick={() => { setDungeon(null); setMode("ship"); }}>Return</Plate>
      </main>
    );
  }

  if (mode === "dungeon" && dungeon) {
    const hpPct = dungeon.php / dungeon.pmax;
    const enPct = dungeon.energy / dungeon.emax;
    return (
      <main className="relative flex h-dvh flex-col bg-bg">
        <canvas
          ref={canvasRef}
          className="min-h-0 w-full flex-1 touch-none"
          onClick={onCanvasClick}
          onTouchStart={onCanvasClick}
        />
        <Hud hp={hpPct} energy={enPct} companion={dungeon.chp / dungeon.cmax} />
        <Scope dungeon={dungeon} radar={derive(pilot.stur, pilot.avo, pilot.per).radar} onOpen={() => { sfxUi(); setMode("map"); }} />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-xs text-cyan">
          {BIOMES[dungeon.biome].planet} · {dungeon.floor}/3
          <div className="text-muted">{dungeon.log}</div>
        </div>
        <div className="absolute bottom-24 right-1 z-10">
          <div className="iso-pad">
            <button type="button" className="iso-dir n" aria-label="North" onClick={() => stepPad(3)}><span className="chev" /></button>
            <button type="button" className="iso-dir w" aria-label="West" onClick={() => stepPad(1)}><span className="chev" /></button>
            <button type="button" className="iso-dir e" aria-label="East" onClick={() => stepPad(2)}><span className="chev" /></button>
            <button type="button" className="iso-dir s" aria-label="South" onClick={() => stepPad(0)}><span className="chev" /></button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          <Plate onClick={() => { skillNanobot(dungeon); setDungeon({ ...dungeon }); }}>Nanobot</Plate>
          <Plate onClick={() => { skillCharge(dungeon, pilot, fx); sfxHit(); setDungeon({ ...dungeon }); }}>Charge</Plate>
          <Plate onClick={() => { dungeon.mounted = !dungeon.mounted; setDungeon({ ...dungeon }); }}>{dungeon.mounted ? "Unlatch" : "Mount"}</Plate>
          <Plate onClick={() => setMode("status")}>Frame</Plate>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-bg">
      <div className="flex-1 p-4">
        <p className="engraved text-xs">HCS Last Harvest</p>
        <h2 className="mt-2 text-3xl font-bold">Drop bay</h2>
        <p className="mt-2 text-muted">Rend will criticize the landing. Halle still wants ore.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <Plate onClick={() => { setTalk({ who: "captain", lines: ["If that landing was a plan, file it under luck.", "You want a planet? Fine."] }); setMode("talk"); }}>Capt. Rend</Plate>
        <Plate onClick={() => { setTalk({ who: "liaison", lines: ["Earth still needs copper.", `Scrip: ${pilot.earthScrip}`] }); setMode("talk"); }}>Liaison Halle</Plate>
        <Plate onClick={() => { const st = derive(pilot.stur, pilot.avo, pilot.per); setPilot({ ...pilot, hp: st.hp, max: st.hp }); sfxUi(); }}>Quarters · free repair</Plate>
        <Plate onClick={() => setMode("hangar")}>Hangar</Plate>
        <Plate className="col-span-2" onClick={() => setMode("drop")}>Request drop</Plate>
        <Plate className="col-span-2" onClick={() => setMode("title")}>Title</Plate>
      </div>
    </main>
  );
}

function TitleMech({ loadout }: { loadout: Loadout }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      c.width = 320;
      c.height = 240;
      ctx.clearRect(0, 0, 320, 240);
      drawComposite(ctx, loadout, 0, 160, 210, 1.4, "idle", performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [loadout]);
  return <canvas ref={ref} className="mx-auto mt-4 h-48 w-full" style={{ imageRendering: "pixelated" }} />;
}

function HangarPreview({ loadout }: { loadout: Loadout }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      c.width = 280;
      c.height = 220;
      ctx.clearRect(0, 0, 280, 220);
      drawComposite(ctx, loadout, 0, 140, 200, 1.2, "idle", performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [loadout]);
  return <canvas ref={ref} className="mx-auto mt-2 h-40 w-full" style={{ imageRendering: "pixelated" }} />;
}

function Scope({ dungeon, radar, onOpen }: { dungeon: Dungeon; radar: number; onOpen: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dRef = useRef(dungeon);
  dRef.current = dungeon;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = 120;
    c.height = 120;
    let raf = 0;
    const loop = () => {
      drawScope(ctx, dRef.current, radar, performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [radar, dungeon.px, dungeon.py, dungeon.turn]);
  return (
    <button type="button" className="scope-plate absolute right-3 top-3 z-10" onClick={onOpen} aria-label="Open deck slate">
      <p className="engraved mb-1 text-center text-[9px]">Scope</p>
      <canvas ref={ref} width={120} height={120} />
    </button>
  );
}

function FloorSlate({ dungeon }: { dungeon: Dungeon }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const size = Math.min(420, Math.floor(window.innerWidth * 0.9));
    c.width = size;
    c.height = size;
    let raf = 0;
    const loop = () => {
      drawFloorSlate(ctx, dungeon, performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dungeon]);
  return (
    <div className="slate-frame mx-auto mt-3">
      <canvas ref={ref} />
    </div>
  );
}

function Hud({ hp, energy, companion }: { hp: number; energy: number; companion: number }) {
  const a = Math.max(0.001, Math.min(0.999, energy)) * Math.PI * 2 - Math.PI / 2;
  const pie = `M 18 18 L 18 5 A 13 13 0 ${energy > 0.5 ? 1 : 0} 1 ${18 + Math.cos(a) * 13} ${18 + Math.sin(a) * 13} Z`;
  return (
    <div className="pointer-events-none absolute bottom-28 left-3 flex items-end gap-3">
      <svg width="92" height="36" viewBox="0 0 92 36">
        <path d="M4 8h70l14 10v10H10L4 22z" fill="#2a1c14" stroke="#c9a227" />
        <rect x="4" y="8" width={84 * Math.max(0, hp)} height="28" fill={hp > 0.4 ? "#9a4030" : "#5a2020"} />
      </svg>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="#12181e" stroke="#c9a227" />
        <path d={pie} fill="#5ee0d0" />
      </svg>
      <div className="mb-1 h-1.5 w-10 overflow-hidden bg-plate">
        <div className="h-full" style={{ width: `${Math.max(0, companion) * 100}%`, background: companion > 0.45 ? "#7dba6a" : "#9a4030" }} />
      </div>
    </div>
  );
}
