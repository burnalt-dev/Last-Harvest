"use client";

import { useEffect, useRef, useState } from "react";
import { img, preloadBay, preloadLoadout } from "./art";
import { TH, TW } from "./iso";
import { BAY, BAY_SLOTS, PIECE_LABEL, bayLoadout, type AnimPose, type BaySlot } from "./parts";
import { idleDirsFor } from "./solace/compose";
import { Plate } from "./ui/Plate";

function blitGrass(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const tiles = img("tiles/forest");
  const dw = TW * 1.28;
  const dh = TH * 2.55;
  if (tiles) {
    const cw = tiles.width / 2;
    const ch = tiles.height / 2;
    ctx.drawImage(tiles, 0, 0, cw, ch, (x - dw / 2) | 0, (y - dh * 0.62) | 0, dw, dh);
  }
  ctx.strokeStyle = "rgba(230, 220, 180, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - TH / 2);
  ctx.lineTo(x + TW / 2, y);
  ctx.lineTo(x, y + TH / 2);
  ctx.lineTo(x - TW / 2, y);
  ctx.closePath();
  ctx.stroke();
}

export function MechParts({ onBack }: { onBack: () => void }) {
  const [slot, setSlot] = useState<BaySlot>("legs");
  const [head, setHead] = useState("");
  const [body, setBody] = useState("");
  const [legs, setLegs] = useState("p017");
  const [arms, setArms] = useState("");
  const [weapon, setWeapon] = useState("");
  const [dir, setDir] = useState(0);
  const [pose] = useState<AnimPose>("idle");
  const dungeonRef = useRef<HTMLCanvasElement>(null);
  const loadout = bayLoadout(head, body, legs, arms, weapon);
  const loadoutRef = useRef(loadout);
  const dirRef = useRef(dir);
  const poseRef = useRef(pose);
  loadoutRef.current = loadout;
  dirRef.current = dir;
  poseRef.current = pose;

  useEffect(() => {
    void preloadBay();
  }, []);

  useEffect(() => {
    void preloadLoadout(loadout);
    void import("./solace/compose").then((m) => m.clearCompositeCache());
  }, [head, body, legs, arms, weapon]);

  useEffect(() => {
    const dgn = dungeonRef.current;
    if (!dgn) return;
    const dtx = dgn.getContext("2d");
    if (!dtx) return;
    let raf = 0;
    let stop = false;
    void import("./solace/compose").then(({ drawComposite }) => {
      const loop = () => {
        if (stop) return;
        if (dgn.width !== 360) {
          dgn.width = 360;
          dgn.height = 300;
        }
        const l = loadoutRef.current;
        const d = dirRef.current;
        const p = poseRef.current;
        dtx.imageSmoothingEnabled = false;
        dtx.fillStyle = "#121a14";
        dtx.fillRect(0, 0, 360, 300);
        blitGrass(dtx, 180, 210);
        drawComposite(dtx, l, d, 180, 228, 1.45, p, 0);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const idOf = (s: BaySlot) =>
    s === "head" ? head : s === "body" ? body : s === "legs" ? legs : s === "arms" ? arms : weapon;

  const apply = (which: BaySlot, id: string) => {
    if (which === "head") setHead(id);
    if (which === "body") setBody(id);
    if (which === "legs") setLegs(id);
    if (which === "arms") setArms(id);
    if (which === "weapon") setWeapon(id);
  };

  const cycleSlotPart = (s: BaySlot, d: number) => {
    const list = BAY[s];
    if (!list.length) return;
    let i = list.indexOf(idOf(s) as never);
    if (i < 0) i = 0;
    apply(s, list[(i + d + list.length) % list.length]!);
    setSlot(s);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const i = BAY_SLOTS.indexOf(slot);
        setSlot(BAY_SLOTS[(i - 1 + BAY_SLOTS.length) % BAY_SLOTS.length]!);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const i = BAY_SLOTS.indexOf(slot);
        setSlot(BAY_SLOTS[(i + 1) % BAY_SLOTS.length]!);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cycleSlotPart(slot, -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        cycleSlotPart(slot, 1);
      } else if (e.key === "q" || e.key === "Q" || e.key === "e" || e.key === "E") {
        const dirs = idleDirsFor(loadoutRef.current);
        const i = Math.max(0, dirs.indexOf(dirRef.current));
        const step = e.key === "q" || e.key === "Q" ? -1 : 1;
        setDir(dirs[(i + step + dirs.length) % dirs.length]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const currentId = idOf(slot);

  return (
    <main className="relative z-[80] flex h-dvh flex-col bg-bg p-4">
      <p className="engraved text-xs">NS-grey appearance bay</p>
      <h1 className="mt-1 text-3xl font-bold">Mech Test</h1>
      <div className="mt-2">
        <p className="font-mono text-[10px] text-muted">Dungeon 3/4</p>
        <canvas ref={dungeonRef} className="h-56 w-full" style={{ imageRendering: "pixelated" }} />
      </div>
      <p className="mt-2 font-mono text-2xl text-cyan">{currentId || "no live part"}</p>
      <p className="font-mono text-xs text-muted">
        {head || "—"} · {body || "—"} · {legs || "—"} · {arms || "—"} · {weapon || "—"} · {["S ↓←", "E ↓→", "N ↑→", "W ↑←"][dir]}
      </p>
      <p className="font-mono text-[10px] text-muted">N ↑→ E ↓→ S ↓← W ↑←</p>
      <div className="mt-3 grid gap-2">
        {BAY_SLOTS.filter((s) => BAY[s].length > 0).map((s) => (
          <div key={s} className="grid grid-cols-[1fr_3rem_3rem] gap-2">
            <Plate className={slot === s ? "text-cyan" : ""} onClick={() => setSlot(s)}>
              Piece · {PIECE_LABEL[s]}
            </Plate>
            <Plate onClick={() => cycleSlotPart(s, -1)}>←</Plate>
            <Plate onClick={() => cycleSlotPart(s, 1)}>→</Plate>
          </div>
        ))}
        {BAY_SLOTS.every((s) => BAY[s].length === 0) && (
          <p className="font-mono text-sm text-cyan">Bay empty — pack S+N before opening Mech Test (S46).</p>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Plate
          onClick={() => {
            const dirs = idleDirsFor(loadout);
            const i = Math.max(0, dirs.indexOf(dir));
            setDir(dirs[(i - 1 + dirs.length) % dirs.length]!);
          }}
        >
          Turn L
        </Plate>
        <Plate
          onClick={() => {
            const dirs = idleDirsFor(loadout);
            const i = Math.max(0, dirs.indexOf(dir));
            setDir(dirs[(i + 1) % dirs.length]!);
          }}
        >
          Turn R
        </Plate>
      </div>
      <Plate className="mt-4" onClick={onBack}>
        Title
      </Plate>
    </main>
  );
}

