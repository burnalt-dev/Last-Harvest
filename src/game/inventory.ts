/** Bag. Drop tables stay last-harvest-items. */

export type Bag = Record<string, number>;

export function emptyBag(): Bag {
  return {};
}

export function add(bag: Bag, id: string, n = 1) {
  bag[id] = (bag[id] ?? 0) + n;
}

export const NAMES: Record<string, string> = {
  r001: "Ironwood Splinter",
  r004: "Bloom-ore",
};

export function resources(bag: Bag) {
  return Object.entries(bag).filter(([id]) => id.startsWith("r"));
}

export function usables(bag: Bag) {
  return Object.entries(bag).filter(([id]) => id.startsWith("i"));
}
