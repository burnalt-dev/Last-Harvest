"use client";

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";
import { preloadBoot } from "./art";
import { sfxMove, sfxScope, sfxUi } from "./audio";
import { DIR, faceTo } from "./iso";
import { hasTwoHandMelee, isArmed, isRanged } from "./parts";
import { DIFFICULTY, FOE_NAME, FOE_TEACH, type Difficulty } from "./data";
import { NAMES, resources, usables } from "./inventory";
import { SKILLGRAMS } from "./skillgrams";
import { Plate } from "./ui/Plate";
import { ScopeReticle } from "./ui/ScopeReticle";
import { applyDifficulty, newPilot, type Pilot } from "./pilot";
import { loadPilot, probeWitsKeys, writePilot } from "./save";
import type { Dungeon, Fx } from "./sim";

const Bay3D = lazy(() => import("./solace3d/Bay3D").then((m) => ({ default: m.Bay3D })));
const Nest3D = lazy(() => import("./solace3d/Nest3D").then((m) => ({ default: m.Nest3D })));
const Drop3D = lazy(() => import("./solace3d/Drop3D").then((m) => ({ default: m.Drop3D })));
const LookdevBoard = lazy(() => import("./Lookdev").then((m) => ({ default: m.LookdevBoard })));

let playP: Promise<typeof import("./play")> | null = null;
function loadPlay() {
  playP ??= import("./play");
  return playP;
}

type Mode = "title" | "ship" | "dungeon" | "dead" | "lookdev" | "bay3d" | "nest";

export function LastHarvest() {
  const [mode, setMode] = useState<Mode>("title");
  const [pilot, setPilot] = useState<Pilot>(() => newPilot());
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [menu, setMenu] = useState<null | "sheet" | "return">(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [dropCam, setDropCam] = useState<"far" | "close">("far");
  const [hydrated, setHydrated] = useState(false);
  const [verb, setVerb] = useState<"attack" | "harvest" | "aim" | null>(null);

  useEffect(() => {
    setLive(true);
    void preloadBoot();
    const loaded = loadPilot();
    if (loaded) {
      setPilot(loaded);
      probeWitsKeys("load-save", loaded);
    } else {
      const fresh = newPilot();
      setPilot(fresh);
      probeWitsKeys("new-game", fresh);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writePilot(pilot);
  }, [pilot, hydrated]);

  const drop = () => {
    if (!isArmed(pilot.loadout)) return;
    try {
      sfxUi();
    } catch {
      /* mute */
    }
    void loadPlay().then((p) => {
      setDungeon(p.makeDungeon("forest", 1, pilot));
      setMode("dungeon");
      setDropCam("far");
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
    void loadPlay().then((p) => {
      p.bankHaul(pilot, dungeon);
      setPilot({ ...pilot, hp: dungeon.php });
      setDungeon(null);
      setMenu(null);
      setMode("ship");
    });
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
    void loadPlay().then((p) => afterAct(p.playerAct(dungeon, pilot, v.x, v.y, fx)));
  };

  const onTile = useCallback(
    (tx: number, ty: number) => {
      if (!dungeon) return;
      if (dungeon.aiming) {
        void loadPlay().then((p) => afterAct(p.fireCannon(dungeon, pilot, tx, ty, fx) ?? "ok"));
        return;
      }
      const foe = dungeon.enemies.find((e) => e.hp > 0 && e.x === tx && e.y === ty);
      if (foe) {
        setPicked(foe.id);
        dungeon.lastAimId = foe.id;
        setDungeon({ ...dungeon });
        return;
      }
      const dx = Math.sign(tx - dungeon.px);
      const dy = Math.sign(ty - dungeon.py);
      if (dx === 0 && dy === 0) return;
      stepPad(faceTo(dungeon.px, dungeon.py, tx, ty));
    },
    [dungeon, fx, pilot],
  );

  if (mode === "title") {
    return (
      <main className="relative z-[80] flex h-dvh flex-col bg-bg p-4" data-live={live ? "1" : "0"}>
        <article className="title-card">
          <p className="engraved text-xs">Harvester · Solace</p>
          <h1>Last Harvest</h1>
          <p className="title-marks">Solace · Gasket · Veldt-9</p>
          <p className="title-body">
            Earth is dying. Pilot the 8-foot labor wanzer. Gasket rides the pack. First drop is Veldt-9 for Bloom-ore.
          </p>
        </article>
        {live ? (
          <div className="relative z-[80] mt-3 grid gap-1">
            <DifficultyDock
              value={pilot.difficulty}
              onPick={(id) => setPilot(applyDifficulty(pilot, id))}
            />
            <Plate qa="title-board" disabled={!isArmed(pilot.loadout)} className={isArmed(pilot.loadout) ? "" : "locked"} onClick={drop}>
              New game
            </Plate>
            <div className="grid grid-cols-2 gap-2">
              <Plate qa="title-bay3d" onClick={() => setMode("bay3d")}>
                3D Bay
              </Plate>
              <Plate qa="title-nest" onClick={() => setMode("nest")}>
                Monster Nest
              </Plate>
            </div>
            <Plate qa="title-lookdev" onClick={() => setMode("lookdev")}>
              Concepts
            </Plate>
          </div>
        ) : (
          <p className="mt-4 font-mono text-sm text-muted">Seating plates…</p>
        )}
      </main>
    );
  }

  if (mode === "lookdev") {
    return (
      <Suspense fallback={<main className="bg-bg p-4 text-muted">Seating concepts…</main>}>
        <LookdevBoard onBack={() => setMode("title")} />
      </Suspense>
    );
  }

  if (mode === "bay3d") {
    return (
      <Suspense fallback={<main className="bg-bg p-4 text-muted">Seating 3D bay…</main>}>
        <Bay3D onBack={() => setMode("title")} />
      </Suspense>
    );
  }

  if (mode === "nest") {
    return (
      <Suspense fallback={<main className="bg-bg p-4 text-muted">Seating nest…</main>}>
        <Nest3D onBack={() => setMode("title")} />
      </Suspense>
    );
  }

  if (mode === "ship") {
    return (
      <main className="relative z-[80] flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Drop bay</p>
        <h2 className="mt-2 text-3xl font-bold">Capt. Rend</h2>
        <p className="mt-3 text-lg">If that was a withdrawal and not a panic, file it under luck. Ore in the hold. Kit stays locked until hangar.</p>
        <div className="relative z-[80] mt-4 grid gap-2 pt-4">
          <DifficultyDock
            value={pilot.difficulty}
            onPick={(id) => setPilot(applyDifficulty(pilot, id))}
            pending
          />
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
    const gPct = dungeon.chp / dungeon.cmax;
    const mark = dungeon.enemies.find((e) => e.hp > 0 && e.id === picked) ?? null;
    const teach = mark ? FOE_TEACH[mark.kind] : null;
    const carry = (dungeon.ore || 0) + (dungeon.scrap || 0);
    return (
      <main className="relative flex h-dvh flex-col bg-bg" data-qa="drop-hud">
        <Suspense fallback={<div className="min-h-0 w-full flex-1 bg-bg text-muted">Seating Veldt…</div>}>
          <div className="relative min-h-0 w-full flex-1">
            <Drop3D dungeon={dungeon} onTile={onTile} onStep={stepPad} view={dungeon.aiming ? "scope" : dropCam} loadout={pilot.loadout} fx={fx} />
            {dungeon.aiming && <ScopeReticle />}
          </div>
        </Suspense>
        {fx
          .filter((f): f is Extract<Fx, { k: "banner" }> => f.k === "banner")
          .slice(-1)
          .map((f, i) => (
            <div
              key={`${f.text}-${i}`}
              className="pointer-events-none absolute left-1/2 top-[20%] -translate-x-1/2 text-4xl font-bold tracking-wide drop-banner"
              style={{ color: f.good ? "#5ee0d0" : "#9a4030" }}
              data-qa="drop-banner"
            >
              {f.text}
            </div>
          ))}
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[13px] text-cyan">
          Veldt-9 · 1/1
        </div>
        <div className="absolute right-2 top-3 z-20 flex flex-col items-end gap-1">
          <div className="scope-plate">
            <RadarHud dungeon={dungeon} pilot={pilot} />
          </div>
          <Plate
            qa="drop-cam"
            className="!px-2 !py-1 text-center text-[10px] tracking-widest uppercase"
            onClick={() => {
              if (dungeon.aiming) return;
              setDropCam(dropCam === "far" ? "close" : "far");
            }}
          >
            {dungeon.aiming ? "Scope" : dropCam === "far" ? "Close" : "Far"}
          </Plate>
        </div>
        <div className="drop-dock" data-qa="drop-dock">
          <div className="flex items-center gap-2">
            <svg width="96" height="14" viewBox="0 0 96 14" aria-label="Pilot HP">
              <rect x="0.5" y="0.5" width="95" height="13" fill="#2a1c14" stroke="#c9a227" />
              <rect x="0.5" y="0.5" width={95 * Math.max(0, hpPct)} height="13" fill={hpPct > 0.4 ? "#9a4030" : "#5a2020"} />
            </svg>
            <svg width="16" height="16" viewBox="0 0 36 36" aria-label="Energy">
              <circle cx="18" cy="18" r="15" fill="#12181e" stroke="#c9a227" />
              <path
                d={`M 18 18 L 18 5 A 13 13 0 ${enPct > 0.5 ? 1 : 0} 1 ${18 + Math.cos(enPct * Math.PI * 2 - Math.PI / 2) * 13} ${18 + Math.sin(enPct * Math.PI * 2 - Math.PI / 2) * 13} Z`}
                fill="#5ee0d0"
              />
            </svg>
            <p className="text-[10px] text-muted">
              {carry ? `haul ${carry}` : "empty"}
              {dungeon.withdraw > 0 ? ` · spool ${dungeon.withdraw}` : ""}
            </p>
            <p className="drop-log ml-2 min-w-0 flex-1 truncate" data-qa="drop-log">
              {dungeon.aiming ? "Lance: pick a tile" : dungeon.log}
            </p>
            <div className="ml-auto flex items-center gap-1" data-qa="gasket-pip">
              <div className="h-1.5 w-7 overflow-hidden bg-plate" title="Gasket">
                <div className="h-full" style={{ width: `${Math.max(0, gPct) * 100}%`, background: gPct > 0.45 ? "#7dba6a" : "#9a4030" }} />
              </div>
              {(["follow", "hold", "focus", "mount"] as const).map((c) => (
                <Plate
                  key={c}
                  qa={`drop-gasket-${c}`}
                  className={`!px-1.5 !py-1 text-[10px] ${dungeon.gasketMode === c ? "text-cyan" : ""}`}
                  onClick={() =>
                    void loadPlay().then((p) => {
                      p.setGasketMode(dungeon, c);
                      setDungeon({ ...dungeon });
                    })
                  }
                >
                  {c === "follow" ? "Follow" : c === "hold" ? "Hold" : c === "focus" ? "Focus" : "Mount"}
                </Plate>
              ))}
            </div>
          </div>
          {mark && teach ? (
            <div className="drop-foe" data-qa="drop-foe">
              <p className="text-fg">
                {FOE_NAME[mark.kind]} · {mark.hp}/{mark.max}
              </p>
              <div className="my-0.5 h-1 overflow-hidden bg-plate">
                <div className="h-full bg-rust" style={{ width: `${Math.max(0, mark.hp / mark.max) * 100}%` }} />
              </div>
              <p className="text-muted">{teach.tags}</p>
              <p className="text-brass">{teach.counter}</p>
            </div>
          ) : null}
          <div className="mt-1 flex items-end gap-2">
            <div className="iso-pad shrink-0" data-qa="drop-move">
              <button type="button" className="iso-dir n" aria-label="North" onClick={() => stepPad(2)}>
                <span className="chev" />
              </button>
              <button type="button" className="iso-dir w" aria-label="West" onClick={() => stepPad(3)}>
                <span className="chev" />
              </button>
              <button type="button" className="iso-dir e" aria-label="East" onClick={() => stepPad(1)}>
                <span className="chev" />
              </button>
              <button type="button" className="iso-dir s" aria-label="South" onClick={() => stepPad(0)}>
                <span className="chev" />
              </button>
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
              {hasTwoHandMelee(pilot.loadout) ? (
                <Plate
                  qa="drop-attack"
                  className={verb === "attack" ? "text-cyan" : ""}
                  onClick={() => {
                    setVerb("attack");
                    void loadPlay().then((p) => afterAct(p.swingAttack(dungeon, pilot, fx)));
                  }}
                >
                  Attack
                </Plate>
              ) : isRanged(pilot.loadout) ? (
                <Plate
                  qa="shoot"
                  className={dungeon.aiming || verb === "aim" ? "text-cyan" : ""}
                  onClick={() => {
                    if (!dungeon.aiming) sfxScope();
                    dungeon.aiming = true;
                    dungeon.log = "Lance: pick a tile.";
                    setVerb("aim");
                    setDungeon({ ...dungeon });
                  }}
                >
                  Aim
                </Plate>
              ) : (
                <Plate disabled className="locked">
                  Attack
                </Plate>
              )}
              <Plate
                qa="drop-harvest"
                className={verb === "harvest" ? "text-cyan" : ""}
                onClick={() => {
                  setVerb("harvest");
                  void loadPlay().then((p) => afterAct(p.harvestHere(dungeon, pilot, fx)));
                }}
              >
                Harvest
              </Plate>
              <Plate qa="drop-program" onClick={() => setMenu(menu === "sheet" ? null : "sheet")}>
                Program
              </Plate>
              <Plate
                qa="return"
                onClick={() => {
                  if (dungeon.withdraw > 0) {
                    void loadPlay().then((p) => {
                      p.abortWithdraw(dungeon);
                      setDungeon({ ...dungeon });
                    });
                    return;
                  }
                  setMenu("return");
                }}
              >
                {dungeon.withdraw > 0 ? `Spool ${dungeon.withdraw}` : "Withdraw"}
              </Plate>
            </div>
          </div>
          <p className="drop-hint" data-qa="drop-hint">
            {verb === "attack"
              ? "Wide 3 · tiles ahead"
              : verb === "harvest"
                ? "Adjacent bloom"
                : verb === "aim" || dungeon.aiming
                  ? "Pick a tile in range"
                  : "Move bump-strikes. End Turn passes."}
          </p>
          <Plate qa="drop-wait" className="drop-end mt-1 text-cyan" onClick={() => void loadPlay().then((p) => afterAct(p.waitTurn(dungeon, pilot, fx)))}>
            End Turn
          </Plate>
        </div>
        {menu === "return" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={() => setMenu(null)}>
            <div className="menu-slate" onClick={(e) => e.stopPropagation()}>
              <h3>Withdraw</h3>
              <p className="text-sm">Five turns. A hit that lands on the crate cancels the spool.</p>
              <div className="mt-3 grid gap-2">
                <Plate
                  qa="return-confirm"
                  onClick={() => {
                    void loadPlay().then((p) => {
                      p.startWithdraw(dungeon);
                      setMenu(null);
                      setDungeon({ ...dungeon });
                    });
                  }}
                >
                  Spool withdraw
                </Plate>
                <Plate onClick={() => setMenu(null)}>Stay</Plate>
              </div>
            </div>
          </div>
        )}
        {menu === "sheet" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-3" onClick={() => setMenu(null)}>
            <div className="menu-slate max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-qa="drop-sheet">
              <h3>Programs</h3>
              <p className="text-sm text-muted">Short tools. Close restores the board.</p>
              <div className="mt-3 grid gap-2">
                <Plate onClick={() => void loadPlay().then((p) => { setMenu(null); afterAct(p.skillNanobot(dungeon, pilot, fx)); })}>
                  {SKILLGRAMS.sg001!.name} · patch
                </Plate>
                <Plate onClick={() => void loadPlay().then((p) => { setMenu(null); afterAct(p.skillCharge(dungeon, pilot, fx)); })}>
                  {SKILLGRAMS.sg002!.name} · mount then rush
                </Plate>
              </div>
              <p className="mt-4 text-xs engraved">Pack</p>
              {usables(dungeon.bag).length === 0 ? <p className="locked">No usables</p> : usables(dungeon.bag).map(([id, n]) => (
                <p key={id}>{NAMES[id] ?? id} · {n}</p>
              ))}
              <p className="mt-3 text-xs engraved">Haul</p>
              {resources(dungeon.bag).length === 0 ? <p className="locked">Empty</p> : resources(dungeon.bag).map(([id, n]) => (
                <p key={id}>{NAMES[id] ?? id} · {n}</p>
              ))}
              <p className="mt-4 text-xs engraved">Deck</p>
              <div className="slate-frame mx-auto overflow-hidden">
                <FloorMap dungeon={dungeon} />
              </div>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted" data-qa="drop-map-legend">
                <span className="text-cyan">you</span>
                <span>walk</span>
                <span>wall</span>
                <span className="text-rust">foe</span>
                <span>bloom</span>
              </p>
              <Plate className="mt-3" onClick={() => setMenu(null)}>Close</Plate>
            </div>
          </div>
        )}
      </main>
    );
  }
  return (
    <main className="relative z-[80] flex h-dvh flex-col bg-bg p-4">
      <p className="engraved text-xs">Drop bay</p>
      <h2 className="mt-2 text-3xl font-bold">Capt. Rend</h2>
      <p className="mt-3 text-lg">Kit stays locked until hangar.</p>
      <div className="relative z-[80] mt-4 grid gap-2 pt-4">
        <Plate onClick={() => setMode("title")}>Title</Plate>
      </div>
    </main>
  );
}

function DifficultyDock({
  value,
  onPick,
  pending = false,
}: {
  value: Difficulty;
  onPick: (id: Difficulty) => void;
  pending?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <p className="engraved text-xs">Difficulty</p>
      <div className="grid grid-cols-2 gap-2">
        {(["story", "default"] as Difficulty[]).map((id) => (
          <Plate key={id} qa={`diff-${id}`} className={value === id ? "text-cyan" : ""} onClick={() => onPick(id)}>
            {DIFFICULTY[id].label}
          </Plate>
        ))}
      </div>
      <p className="text-[11px] leading-snug text-muted">{DIFFICULTY[value].help}</p>
      {DIFFICULTY[value].extra ? <p className="text-[10px] leading-snug text-muted">{DIFFICULTY[value].extra}</p> : null}
      {pending ? <p className="text-[10px] leading-snug text-muted">Applies next drop. Not mid-fight.</p> : null}
    </div>
  );
}

function RadarHud({ dungeon, pilot }: { dungeon: Dungeon; pilot: Pilot }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let alive = true;
    void loadPlay().then((p) => {
      if (!alive || !c) return;
      c.width = 72;
      c.height = 72;
      p.drawRadar(ctx, dungeon, pilot);
    });
    return () => {
      alive = false;
    };
  }, [dungeon, dungeon.px, dungeon.py, dungeon.turn, pilot]);
  return (
    <div>
      <canvas ref={ref} width={72} height={72} />
      <p className="mt-1 flex justify-between text-[8px] leading-none text-muted" data-qa="drop-radar-legend">
        <span className="text-cyan">you</span>
        <span>walk</span>
        <span className="text-rust">foe</span>
        <span>bloom</span>
      </p>
    </div>
  );
}

function FloorMap({ dungeon }: { dungeon: Dungeon }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let alive = true;
    void loadPlay().then((p) => {
      if (!alive || !c) return;
      c.width = 360;
      c.height = 360;
      p.drawFloorMap(ctx, dungeon);
    });
    return () => {
      alive = false;
    };
  }, [dungeon, dungeon.seen, dungeon.px, dungeon.py]);
  return <canvas ref={ref} width={360} height={360} />;
}



