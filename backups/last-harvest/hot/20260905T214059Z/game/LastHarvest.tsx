"use client";

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";
import { preloadBoot } from "./art";
import { sfxMove, sfxScope, sfxUi } from "./audio";
import { DIR, faceTo } from "./iso";
import { equipWeapon, hasTwoHandMelee, isArmed, isRanged } from "./parts";
import { DIFFICULTY, STANCE_LABEL, STANCES, statsOf, type Difficulty, type Stance } from "./data";
import { NAMES, resources, usables } from "./inventory";
import { SKILLGRAMS } from "./skillgrams";
import { Plate } from "./ui/Plate";
import { ScopeReticle } from "./ui/ScopeReticle";
import { applyDifficulty, newPilot, type Pilot } from "./pilot";
import { loadPilot, writePilot } from "./save";
import type { Dungeon, Fx } from "./sim";

const Bay3D = lazy(() => import("./solace3d/Bay3D").then((m) => ({ default: m.Bay3D })));
const Drop3D = lazy(() => import("./solace3d/Drop3D").then((m) => ({ default: m.Drop3D })));
const LookdevBoard = lazy(() => import("./Lookdev").then((m) => ({ default: m.LookdevBoard })));

let playP: Promise<typeof import("./play")> | null = null;
function loadPlay() {
  playP ??= import("./play");
  return playP;
}

type Mode = "title" | "ship" | "dungeon" | "dead" | "lookdev" | "bay3d";

export function LastHarvest() {
  const [mode, setMode] = useState<Mode>("title");
  const [pilot, setPilot] = useState<Pilot>(() => newPilot());
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [menu, setMenu] = useState<null | "gasket" | "pack" | "map" | "return">(null);
  const [live, setLive] = useState(false);
  const [dropCam, setDropCam] = useState<"far" | "close">("far");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLive(true);
    void preloadBoot();
    const loaded = loadPilot();
    if (loaded) setPilot(loaded);
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
      const dx = Math.sign(tx - dungeon.px);
      const dy = Math.sign(ty - dungeon.py);
      if (dx === 0 && dy === 0) return;
      stepPad(faceTo(dungeon.px, dungeon.py, tx, ty));
    },
    [dungeon, fx, pilot],
  );

  const pickKit = (w: Stance) => {
    const loadout = equipWeapon(pilot.loadout, w);
    setPilot({ ...pilot, weapon: w, loadout });
  };

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
            <p className="engraved text-xs">Difficulty</p>
            <div className="grid grid-cols-2 gap-2">
              {(["story", "default"] as Difficulty[]).map((id) => (
                <Plate
                  key={id}
                  qa={`diff-${id}`}
                  className={pilot.difficulty === id ? "text-cyan" : ""}
                  onClick={() => setPilot(applyDifficulty(pilot, id))}
                >
                  {DIFFICULTY[id].label}
                </Plate>
              ))}
            </div>
            <p className="text-[11px] leading-snug text-muted">{DIFFICULTY[pilot.difficulty].help}</p>
            {DIFFICULTY[pilot.difficulty].extra ? (
              <p className="text-[10px] leading-snug text-muted">{DIFFICULTY[pilot.difficulty].extra}</p>
            ) : null}
            <p className="engraved text-xs">Fit a stance</p>
            <div className="grid grid-cols-2 gap-2">
            {STANCES.map((w) => (
              <Plate
                key={w}
                qa={`kit-${w}`}
                className={pilot.weapon === w && isArmed(pilot.loadout) ? "text-cyan" : ""}
                onClick={() => pickKit(w)}
              >
                {STANCE_LABEL[w]}
              </Plate>
            ))}
            </div>
            <Plate qa="title-board" disabled={!isArmed(pilot.loadout)} className={isArmed(pilot.loadout) ? "" : "locked"} onClick={drop}>
              {isArmed(pilot.loadout) ? "Board the Harvester" : "Arm Solace first"}
            </Plate>
            <Plate qa="title-bay3d" onClick={() => setMode("bay3d")}>
              3D Bay
            </Plate>
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

  if (mode === "ship") {
    return (
      <main className="relative z-[80] flex h-dvh flex-col bg-bg p-4">
        <p className="engraved text-xs">Drop bay</p>
        <h2 className="mt-2 text-3xl font-bold">Capt. Rend</h2>
        <p className="mt-3 text-lg">If that was a withdrawal and not a panic, file it under luck. Ore in the hold. Kit stays locked until hangar.</p>
        <div className="relative z-[80] mt-4 grid gap-2 pt-4">
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
              className="pointer-events-none absolute left-1/2 top-[28%] -translate-x-1/2 text-3xl font-bold"
              style={{ color: f.good ? "#5ee0d0" : "#9a4030" }}
            >
              {f.text}
            </div>
          ))}
        <Hud hp={hpPct} energy={enPct} companion={dungeon.chp / dungeon.cmax} />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-xs text-cyan">
          Veldt-9 · 1/1
          <div className="text-muted">{dungeon.log}{dungeon.aiming ? " · LANCE AIM" : ""}</div>
        </div>
        <div className="absolute right-2 top-3 z-20 flex flex-col items-end gap-2">
          <div className="scope-plate">
            <RadarHud dungeon={dungeon} pilot={pilot} />
          </div>
          <Plate
            qa="drop-cam"
            className="!px-2 !py-2 text-center text-[10px] tracking-widest uppercase"
            onClick={() => {
              if (dungeon.aiming) return;
              setDropCam(dropCam === "far" ? "close" : "far");
            }}
          >
            {dungeon.aiming ? "Scope" : dropCam === "far" ? "Close" : "Far"}
          </Plate>
          <div className="sub-rail">
            <Plate qa="menu-gasket" className="!px-1 !py-2" onClick={() => setMenu(menu === "gasket" ? null : "gasket")}>Gasket</Plate>
            <Plate qa="menu-pack" className="!px-1 !py-2" onClick={() => setMenu(menu === "pack" ? null : "pack")}>Pack</Plate>
            <Plate qa="menu-map" className="!px-1 !py-2" onClick={() => setMenu(menu === "map" ? null : "map")}>Map</Plate>
          </div>
        </div>
        <div className="absolute bottom-24 right-1 z-10">
          <div className="iso-pad">
            <button type="button" className="iso-dir n" aria-label="North" onClick={() => stepPad(2)}><span className="chev" /></button>
            <button type="button" className="iso-dir w" aria-label="West" onClick={() => stepPad(3)}><span className="chev" /></button>
            <button type="button" className="iso-dir e" aria-label="East" onClick={() => stepPad(1)}><span className="chev" /></button>
            <button type="button" className="iso-dir s" aria-label="South" onClick={() => stepPad(0)}><span className="chev" /></button>
          </div>
        </div>
        <div className="p-3 pt-1">
          {isRanged(pilot.loadout) && (
            <div className="mb-1 grid grid-cols-2 gap-2">
              <div />
              <Plate qa="shoot" className="gun-plate mx-auto" onClick={() => void loadPlay().then((p) => afterAct(p.shootRepeat(dungeon, pilot, fx)))}>
                Shoot!
              </Plate>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Plate onClick={() => void loadPlay().then((p) => afterAct(p.skillNanobot(dungeon, pilot, fx)))}>{SKILLGRAMS.sg001!.name}</Plate>
            <Plate onClick={() => void loadPlay().then((p) => afterAct(p.skillCharge(dungeon, pilot, fx)))}>{SKILLGRAMS.sg002!.name}</Plate>
            {isRanged(pilot.loadout) && (
              <Plate
                className="aim-slim"
                onClick={() => {
                  if (!dungeon.aiming) sfxScope();
                  dungeon.aiming = true;
                  dungeon.log = "Lance: pick a tile.";
                  setDungeon({ ...dungeon });
                }}
              >
                Aim
              </Plate>
            )}
            {hasTwoHandMelee(pilot.loadout) && (
              <Plate onClick={() => void loadPlay().then((p) => afterAct(p.swingAttack(dungeon, pilot, fx)))}>Attack</Plate>
            )}
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
                    void loadPlay().then((p) => {
                      p.startWithdraw(dungeon);
                      setMenu(null);
                      setDungeon({ ...dungeon });
                    });
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
              {pilot.survivalBonus > 0 ? <p className="locked mt-1">Survival +{pilot.survivalBonus} (filters)</p> : null}
              <p className="locked mt-1">Parts locked off-ship</p>
              <p className="locked">one core · class locked this drop</p>
              <div className="mt-3 grid gap-2">
                <Plate onClick={() => void loadPlay().then((p) => { p.setGasketMode(dungeon, "follow"); setDungeon({ ...dungeon }); })}>Follow</Plate>
                <Plate onClick={() => void loadPlay().then((p) => { p.setGasketMode(dungeon, "hold"); setDungeon({ ...dungeon }); })}>Hold</Plate>
                <Plate onClick={() => void loadPlay().then((p) => { p.setGasketMode(dungeon, "mount"); setDungeon({ ...dungeon }); })}>Mount rear</Plate>
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
              <p className="mt-3 text-xs engraved">Wits</p>
              <p className="text-sm">
                Survival {statsOf(pilot).survival}
                {pilot.survivalBonus ? ` · +${pilot.survivalBonus} filters` : ""}
              </p>
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
      c.width = 120;
      c.height = 120;
      p.drawRadar(ctx, dungeon, pilot);
    });
    return () => {
      alive = false;
    };
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




