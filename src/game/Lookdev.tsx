"use client";

import { useEffect, useState } from "react";
import { Plate } from "./ui/Plate";

type Roster = {
  pass: string;
  sheets: { file: string; label: string }[];
  picks: { n: number; name: string }[];
};

/** Title Concepts. Fetches roster + sheets only when this screen mounts. */
export function LookdevBoard({ onBack }: { onBack: () => void }) {
  const [roster, setRoster] = useState<Roster | null>(null);
  useEffect(() => {
    void fetch("/game/lookdev/roster.json")
      .then((r) => r.json())
      .then(setRoster)
      .catch(() => setRoster({ pass: "Empty", sheets: [], picks: [] }));
  }, []);
  return (
    <main className="relative z-[80] flex h-dvh flex-col overflow-auto bg-bg p-4">
      <p className="engraved text-xs">Concepts · current pass only</p>
      <h1 className="mt-2 text-3xl font-bold">{roster?.pass ?? "Concepts"}</h1>
      <div className="mt-4 grid gap-6">
        {roster?.sheets.map((s) => (
          <figure key={s.file}>
            <img
              src={`/game/lookdev/${s.file}`}
              alt={s.label}
              className="w-full border border-gold/40"
              style={{ imageRendering: "pixelated" }}
            />
            <figcaption className="mt-1 font-mono text-sm text-muted">{s.label}</figcaption>
          </figure>
        ))}
      </div>
      <ol className="mt-4 font-mono text-sm">
        {roster?.picks.map((p) => (
          <li key={p.n}>
            {p.n} {p.name}
          </li>
        ))}
      </ol>
      <Plate className="mt-6" qa="lookdev-back" onClick={onBack}>
        Title
      </Plate>
    </main>
  );
}
