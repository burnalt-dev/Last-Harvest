/** Bag. Drop tables stay last-harvest-items. */

export type Bag = Record<string, number>;

export function emptyBag(): Bag {
  return {};
}

export function add(bag: Bag, id: string, n = 1) {
  bag[id] = (bag[id] ?? 0) + n;
}

export function count(bag: Bag, id: string) {
  return bag[id] ?? 0;
}

export function spend(bag: Bag, id: string, n = 1) {
  const have = bag[id] ?? 0;
  if (have < n) return false;
  bag[id] = have - n;
  if (bag[id] === 0) delete bag[id];
  return true;
}

export const NAMES: Record<string, string> = {
  r001: "Ironwood Splinter",
  r002: "Spore Resin",
  r003: "Tribal Tooth",
  r004: "Bloom-ore",
};

export function resources(bag: Bag) {
  return Object.entries(bag).filter(([id]) => id.startsWith("r"));
}

export function usables(bag: Bag) {
  return Object.entries(bag).filter(([id]) => id.startsWith("i"));
}
