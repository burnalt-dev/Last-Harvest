"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { img, preloadBiome, preloadBoot } from "./art";
import { sfxHit, sfxMove, sfxUi, startTheme, unlockAudio } from "./audio";
import { DIR, fromIso, iso } from "./iso";
import { equipWeapon, isArmed, type Loadout } from "./parts";
import type { WeaponId } from "./data";
import { drawDungeon } from "./render";
import { drawComposite } from "./solace/compose";
import { drawRadar, drawFloorMap } from "./radar";
import { NAMES, resources, usables } from "./inventory";
import { PROGRAMS } from "./programs";
import {
  makeDungeon,
  playerAct,
  type Dungeon,
  type Fx,
  type Pilot,
  newPilot,
  skillCharge,
  skillNanobot,
  setGasketMode,
  swingBlade,
  swingScythe,
  fireCannon,
  shootRepeat,
  startWithdraw,
  abortWithdraw,
  bankHaul,
} from "./sim";

type Mode = "title" | "ship" | "talk" | "dungeon" | "home" | "dead";

function Plate({
  children,
  onClick,
  className = "",
  qa,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  qa?: string;
}) {
  const go = () => {
    try {
      onClick?.();
    } catch (err) {
      console.error("plate", err);
    }
  };
  return (
    <button type="button" data-qa={qa} onClick={go} className={`plate plate-press relative z-20 px-4 py-3 text-left text-fg ${className}`}>
      {children}
    </button>
  );
}

export function LastHarvest() {
  const [mode, setMode] = useState<Mode>("title");
  const [pilot, setPilot] = useState<Pilot>(() => newPilot());
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [menu, setMenu] = useState<null | "gasket" | "pack" | "map" | "return">(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dunRef = useRef<Dungeon | null>(null);
  dunRef.current = dungeon;

  useEffect(() => {
    void preloadBoot();
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || mode !== "dungeon" || !dungeon) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let lastW = 0;
    let lastH = 0;
    const loop = () => {
      const d = dunRef.current;
      if (d) {
        const r = c.getBoundingClientRect();
        const w = Math.max(1, r.width | 0);
        const h = Math.max(1, r.height | 0);
        if (w !== lastW || h !== lastH) {
          c.width = w;
          c.height = h;
          lastW = w;
          lastH = h;
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        drawDungeon(ctx, d, pilot.loadout, fx, null);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, dungeon, fx, pilot.loadout]);

  const drop = () => {
    if (!isArmed(pilot.loadout)) return;
    sfxUi();
    void preloadBiome("forest").then(() => {
      if (!img("tiles/forest")) return preloadBiome("forest");
    }).then(() => {
      const d = makeDungeon("forest", 1, pilot);
      setDungeon(d);
      setMode("dungeon");
    });
  };

  const leaveBay = (how: "stairs" | "withdraw" | "dead") => {
    if (!dungeon) return;
    if (how === "dead") {
      pilot.stash = {};
      setPilot({ ...pilot });
      setDungeon(null);
      setMenu(null);
      setMode("dead");
      return;
    }
    bankHaul(pilot, dungeon);
    setPilot({ ...pilot, hp: dungeon.php });
    setDungeon(null);
    setMenu(null);
    setMode("ship");
  };

  const afterAct = (r: "ok" | "dead" | "stairs" | "withdraw") => {
    setFx([...fx]);
    if (r === "dead") leaveBay("dead");
    else if (r === "stairs" || r === "withdraw") leaveBay(r);
    else setDungeon({ ...dungeon! });
  };

  const stepPad = (dir: number) => {
    if (!dungeon) return;
    const v = DIR[dir]!;
    sfxMove();
    afterAct(playerAct(dungeon, pilot, v.x, v.y, fx));
  };

  const onCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!dungeon) return;
      const c = canvasRef.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      const p = "touches" in e ? e.touches[0] : e;
      if (!p) return;
      const cam = { x: dungeon.px, y: dungeon.py };
      const origin = iso(cam.x, cam.y, 0, 0);
      const ox = r.width / 2 - origin.x;
      const oy = r.height * 0.42 - origin.y;
      const t = fromIso(p.clientX - r.left, p.clientY - r.top, ox, oy);
      if (dungeon.aiming) {
        afterAct(fireCannon(dungeon, pilot, t.tx, t.ty, fx) ?? "ok");
        return;
      }
      const dx = Math.sign(t.tx - dungeon.px);
      const dy = Math.sign(t.ty - dungeon.py);
      if (dx === 0 && dy === 0) return;
      if (dx !== 0 && dy !== 0) {
        stepPad(dx < 0 ? 1 : 2);
        return;
      }
      const dir = DIR.findIndex((v) => v.x === dx && v.y === dy);
      if (dir >= 0) stepPad(dir);
    },
    [dungeon, fx, pilot],
  );

  if (mode === "title") {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Earth is dying</p>
        <h1 className="mt-2 text-4xl font-bold">Last Harvest</h1>
        <p className="mt-2 font-mono text-sm text-muted">Pick a kit. They will not drop an unarmed crate.</p>
        <div className="relative z-20 mt-4 grid gap-2">
          {(["blade", "scythe", "cannon"] as WeaponId[]).map((w) => (
            <Plate
              key={w}
              qa={`kit-${w}`}
              className={pilot.weapon === w && isArmed(pilot.loadout) ? "text-cyan" : ""}
              onClick={() => setPilot({ ...pilot, weapon: w, loadout: equipWeapon(pilot.loadout, w) })}
            >
              {w === "blade" ? "Saw & slab" : w === "scythe" ? "Harvest scythe" : "Prototype lance"}
            </Plate>
          ))}
          <Plate
            qa="title-board"
            className={isArmed(pilot.loadout) ? "" : "locked"}
            onClick={() => {
              if (!isArmed(pilot.loadout)) return;
              try {
                unlockAudio();
              } catch {
                /* mute */
              }
              drop();
            }}
          >
            {isArmed(pilot.loadout) ? "Board the Harvester" : "Arm the crate first"}
          </Plate>
        </div>
        {isArmed(pilot.loadout) && <TitleMech loadout={pilot.loadout} />}
      </main>
    );
  }

  if (mode === "ship") {
    return (
      <main className="flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Drop bay</p>
        <h2 className="mt-2 text-3xl font-bold">Capt. Rend</h2>
        <p className="mt-3 text-lg">If that was a withdrawal and not a panic, file it under luck. Ore in the hold. Kit stays locked until hangar.</p>
        <div className="mt-auto grid gap-2 pt-4">
          <Plate qa="title-board" onClick={drop}>Drop Veldt-9 again</Plate>
          <Plate onClick={() => setMode("title")}>Title</Plate>
        </div>
      </main>
    );
  }

  if (mode === "dead") {
    return (
      <main className="flex h-dvh flex-col items-center justify-center bg-bg p-4">
        <p className="engraved text-xs">Frame lost</p>
        <h2 className="mt-2 text-3xl">The crate went quiet.</h2>
        <Plate className="mt-6" onClick={() => { setDungeon(null); setMode("title"); }}>Return</Plate>
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
          style={{ cursor: dungeon.aiming ? "crosshair" : "default" }}
          onClick={onCanvasClick}
          onTouchStart={onCanvasClick}
        />
        <Hud hp={hpPct} energy={enPct} companion={dungeon.chp / dungeon.cmax} />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-xs text-cyan">
          Veldt-9 · 1/1
          <div className="text-muted">{dungeon.log}{dungeon.aiming ? " · LANCE AIM" : ""}</div>
        </div>
        <div className="absolute right-2 top-3 z-20 flex flex-col items-end gap-2">
          <div className="scope-plate">
            <RadarHud dungeon={dungeon} pilot={pilot} />
          </div>
          <div className="sub-rail">
            <Plate qa="menu-gasket" className="!px-1 !py-2" onClick={() => setMenu(menu === "gasket" ? null : "gasket")}>Gasket</Plate>
            <Plate qa="menu-pack" className="!px-1 !py-2" onClick={() => setMenu(menu === "pack" ? null : "pack")}>Pack</Plate>
            <Plate qa="menu-map" className="!px-1 !py-2" onClick={() => setMenu(menu === "map" ? null : "map")}>Map</Plate>
          </div>
        </div>
        <div className="absolute bottom-24 right-1 z-10">
          <div className="iso-pad">
            <button type="button" className="iso-dir n" aria-label="North" onClick={() => stepPad(3)}><span className="chev" /></button>
            <button type="button" className="iso-dir w" aria-label="West" onClick={() => stepPad(1)}><span className="chev" /></button>
            <button type="button" className="iso-dir e" aria-label="East" onClick={() => stepPad(2)}><span className="chev" /></button>
            <button type="button" className="iso-dir s" aria-label="South" onClick={() => stepPad(0)}><span className="chev" /></button>
          </div>
        </div>
        <div className="p-3 pt-1">
          {pilot.weapon === "cannon" && (
            <div className="mb-1 grid grid-cols-2 gap-2">
              <div />
              <Plate
                qa="shoot"
                className="gun-plate mx-auto"
                onClick={() => afterAct(shootRepeat(dungeon, pilot, fx))}
              >
                Shoot!
              </Plate>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
          <Plate onClick={() => afterAct(skillNanobot(dungeon, pilot, fx))}>{PROGRAMS.s001.name}</Plate>
          <Plate onClick={() => afterAct(skillCharge(dungeon, pilot, fx))}>{PROGRAMS.s002.name}</Plate>
          <Plate
            className={pilot.weapon === "cannon" ? "aim-slim" : ""}
            onClick={() => {
              if (pilot.weapon === "cannon") {
                dungeon.aiming = true;
                dungeon.log = "Lance: pick a tile.";
                setDungeon({ ...dungeon });
                return;
              }
              afterAct(pilot.weapon === "scythe" ? swingScythe(dungeon, pilot, fx) : swingBlade(dungeon, pilot, fx));
            }}
          >
            {pilot.weapon === "cannon" ? "Aim" : pilot.weapon === "scythe" ? "Scythe" : "Saw"}
          </Plate>
          <Plate
            qa="return"
            onClick={() => {
              if (dungeon.withdraw > 0) {
                abortWithdraw(dungeon);
                setDungeon({ ...dungeon });
                return;
              }
              setMenu("return");
            }}
          >
            {dungeon.withdraw > 0 ? `Spool ${dungeon.withdraw}` : "Return"}
          </Plate>
          </div>
        </div>
        {menu === "return" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={() => setMenu(null)}>
            <div className="menu-slate" onClick={(e) => e.stopPropagation()}>
              <h3>Return</h3>
              <p className="text-sm">Withdraw takes five turns and can be interrupted.</p>
              <p className="locked mt-2">A hit that lands on the crate cancels the spool. Parry and dodge do not.</p>
              <div className="mt-3 grid gap-2">
                <Plate
                  qa="return-confirm"
                  onClick={() => {
                    startWithdraw(dungeon);
                    setMenu(null);
                    setDungeon({ ...dungeon });
                  }}
                >
                  Spool withdraw
                </Plate>
                <Plate onClick={() => setMenu(null)}>Hold position</Plate>
              </div>
            </div>
          </div>
        )}
        {menu === "gasket" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={() => setMenu(null)}>
            <div className="menu-slate" onClick={(e) => e.stopPropagation()}>
              <h3>Gasket</h3>
              <p className="text-sm">HP {dungeon.chp | 0}/{dungeon.cmax} · Ranger-shaped default</p>
              <p className="locked mt-1">Parts locked off-ship</p>
              <p className="locked">one core · class locked this drop</p>
              <div className="mt-3 grid gap-2">
                <Plate onClick={() => { setGasketMode(dungeon, "follow"); setDungeon({ ...dungeon }); }}>Follow</Plate>
                <Plate onClick={() => { setGasketMode(dungeon, "hold"); setDungeon({ ...dungeon }); }}>Hold</Plate>
                <Plate onClick={() => { setGasketMode(dungeon, "mount"); setDungeon({ ...dungeon }); }}>Mount rear</Plate>
              </div>
              <p className="locked mt-2">Charge always mounts. Mounted: no melee.</p>
              <Plate className="mt-3" onClick={() => setMenu(null)}>Close</Plate>
            </div>
          </div>
        )}
        {menu === "pack" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={() => setMenu(null)}>
            <div className="menu-slate" onClick={(e) => e.stopPropagation()}>
              <h3>Pack</h3>
              <p className="text-xs engraved">Usable</p>
              {usables(dungeon.bag).length === 0 ? <p className="locked">No i### yet</p> : usables(dungeon.bag).map(([id, n]) => (
                <p key={id}>{NAMES[id] ?? id} · {n}</p>
              ))}
              <p className="mt-3 text-xs engraved">Resources</p>
              {resources(dungeon.bag).length === 0 ? <p className="locked">Empty</p> : resources(dungeon.bag).map(([id, n]) => (
                <p key={id}>{NAMES[id] ?? id} · {n}</p>
              ))}
              <Plate className="mt-3" onClick={() => setMenu(null)}>Close</Plate>
            </div>
          </div>
        )}
        {menu === "map" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={() => setMenu(null)}>
            <div className="menu-slate" onClick={(e) => e.stopPropagation()}>
              <h3>Deck slate</h3>
              <div className="slate-frame mx-auto">
                <FloorMap dungeon={dungeon} />
              </div>
              <Plate className="mt-3" onClick={() => setMenu(null)}>Close</Plate>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-bg">
      <div className="flex-1 p-4">
        <p className="engraved text-xs">HCS Last Harvest</p>
        <h2 className="mt-2 text-3xl font-bold">Drop bay</h2>
        <p className="mt-2 text-muted">Rend will criticize the landing. Slice 1 is Veldt-9 only.</p>
      </div>
      <div className="grid gap-2 p-3">
        <Plate qa="capt-rend" onClick={() => setMode("talk")}>Capt. Rend</Plate>
        <Plate onClick={() => setMode("title")}>Title</Plate>
      </div>
    </main>
  );
}

function RadarHud({ dungeon, pilot }: { dungeon: Dungeon; pilot: Pilot }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = 120;
    c.height = 120;
    drawRadar(ctx, dungeon, pilot);
  }, [dungeon, dungeon.px, dungeon.py, dungeon.turn, pilot]);
  return <canvas ref={ref} width={120} height={120} />;
}

function FloorMap({ dungeon }: { dungeon: Dungeon }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = 360;
    c.height = 360;
    drawFloorMap(ctx, dungeon);
  }, [dungeon, dungeon.seen, dungeon.px, dungeon.py]);
  return <canvas ref={ref} width={360} height={360} />;
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
      if (c.width !== 320) {
        c.width = 320;
        c.height = 240;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 320, 240);
      drawComposite(ctx, loadout, 0, 160, 210, 1.4, "idle", performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [loadout]);
  return <canvas ref={ref} className="pointer-events-none mx-auto mt-4 h-48 w-full" style={{ imageRendering: "pixelated" }} />;
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
