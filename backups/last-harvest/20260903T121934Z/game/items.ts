/** last-harvest-items — catalogs + rolls. Flavor stubs until Ivan rewrites. */

export const RESOURCES: Record<string, { name: string }> = {
  r001: { name: "Ironwood Splinter" },
  r002: { name: "Spore Resin" },
  r003: { name: "Tribal Tooth" },
  r004: { name: "Bloom-ore" },
};

export function rollVeldt(): "r001" | "r004" {
  return Math.random() < 0.6 ? "r004" : "r001";
}

export function rollShiny(biome: string): { energy: number; id: "r001" | "r004" } {
  return { energy: 6, id: biome === "forest" ? rollVeldt() : "r001" };
}

export function rollKill(kind: string): "r001" | "r004" | null {
  if (kind === "smith" || kind === "big") {
    if (Math.random() < 0.7) return Math.random() < 0.65 ? "r004" : "r001";
    return null;
  }
  if (kind === "small") {
    if (Math.random() < 0.4) return rollVeldt();
    return null;
  }
  return null;
}
