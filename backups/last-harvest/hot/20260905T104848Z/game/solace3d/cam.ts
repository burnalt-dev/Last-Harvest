/** FM 3/4 camera sits. Shared by Bay + Drop. Radar slate still owns R5. */
export type DropView = "far" | "close" | "scope";

export const DROP_CAM = {
  far: { zoom: 11, ox: 2.6, oy: 6.6, oz: 8.4, look: 0 },
  close: { zoom: 16, ox: 1.65, oy: 3.9, oz: 4.9, look: 0 },
  /** Pulled out past far so Aim can pick distant vis tiles. Zoom 5 keeps ≥3 tiles N/E/S/W on portrait (aspect ≥0.62). Crate-centered. */
  scope: { zoom: 5, ox: 3.2, oy: 8.2, oz: 10.2, look: 0 },
} as const;
