/** FM 3/4 camera sits. Shared by Bay + Drop. Radar slate still owns R5. */
export type DropView = "far" | "close" | "scope";

export const DROP_CAM = {
  far: { zoom: 11, ox: 2.6, oy: 6.6, oz: 8.4, look: 0 },
  close: { zoom: 16, ox: 1.65, oy: 3.9, oz: 4.9, look: 0 },
  scope: { zoom: 14, ox: 2.2, oy: 5.4, oz: 6.6, look: 2 },
} as const;
