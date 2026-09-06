import { newPilot, type Pilot } from "./pilot";
import { starterLoadout, type Loadout } from "./parts";
import type { Difficulty, Stance } from "./data";

export const SAVE_KEY = "last-harvest-pilot";

/** LAS-10 probe. Flip false (or follow-up paste) after QA. */
export const WITS_KEY_PROBE = true;

export function probeWitsKeys(src: string, blob: object): string {
  const keys = Object.keys(blob);
  const rec = blob as Record<string, unknown>;
  const hasWits = Object.prototype.hasOwnProperty.call(rec, "wits");
  const hasPer = Object.prototype.hasOwnProperty.call(rec, "per");
  const line = `STATS_KEYS: ${keys.join(",")} hasWits=${hasWits} hasPer=${hasPer} src=${src}`;
  if (WITS_KEY_PROBE) console.log(line);
  return line;
}

/** Walk a blob. Map leftover Wits primary `per` → `wits` and drop `per`. No dual keys. */
export function migrateWits(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw.map(migrateWits);
  if (!raw || typeof raw !== "object") return raw;
  const o = { ...(raw as Record<string, unknown>) };
  if (Object.prototype.hasOwnProperty.call(o, "per")) {
    if (o.wits == null) o.wits = o.per;
    delete o.per;
  }
  for (const k of Object.keys(o)) o[k] = migrateWits(o[k]);
  return o;
}

function asPilot(raw: unknown): Pilot {
  const base = newPilot();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const next: Pilot = { ...base };
  if (typeof o.level === "number") next.level = o.level;
  if (typeof o.stur === "number") next.stur = o.stur;
  if (typeof o.avo === "number") next.avo = o.avo;
  if (typeof o.wits === "number") next.wits = o.wits;
  if (typeof o.survivalBonus === "number") next.survivalBonus = o.survivalBonus;
  if (typeof o.hp === "number") next.hp = o.hp;
  if (typeof o.max === "number") next.max = o.max;
  if (typeof o.weapon === "string") next.weapon = o.weapon as Stance;
  if (o.loadout && typeof o.loadout === "object") next.loadout = o.loadout as Loadout;
  else next.loadout = starterLoadout();
  if (Array.isArray(o.skillgrams) && o.skillgrams.length >= 2) {
    next.skillgrams = [String(o.skillgrams[0]), String(o.skillgrams[1])];
  }
  if (typeof o.name === "string") next.name = o.name;
  if (o.stash && typeof o.stash === "object") next.stash = o.stash as Pilot["stash"];
  if (o.difficulty === "story" || o.difficulty === "default") next.difficulty = o.difficulty as Difficulty;
  if (typeof o.primerDone === "boolean") next.primerDone = o.primerDone;
  return next;
}

export function loadPilot(): Pilot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const migrated = migrateWits(parsed);
    const pilot = asPilot(migrated);
    writePilot(pilot);
    return pilot;
  } catch {
    return null;
  }
}

export function writePilot(pilot: Pilot) {
  if (typeof localStorage === "undefined") return;
  const clean = migrateWits(pilot) as Pilot;
  localStorage.setItem(SAVE_KEY, JSON.stringify(clean));
}
