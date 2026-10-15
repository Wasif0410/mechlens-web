import type { StaticImageData } from "next/image";
import brakeInspection from "@/assets/brake-inspection.jpg";
import engineBay from "@/assets/engine-bay-corolla.jpg";
import repairShop from "@/assets/repair-shop.jpg";

/**
 * The photographs the heads-up scenes are drawn over. Overlays use each photo's own coordinates,
 * scaled so the photo is 1000 units wide (its height is 1000 / aspect). Credits are in the footer.
 */
export type Photo = {
  src: StaticImageData;
  /** Width over height of the original. */
  aspect: number;
  alt: string;
};

export const photos = {
  engineBay: {
    src: engineBay,
    aspect: 5072 / 2800,
    alt: "The engine bay of a Toyota Corolla Sport with its 1.2-liter turbo engine, seen from where a technician stands: the coolant reservoir on the left, the oil filler cap and yellow dipstick in the middle, the battery on the right.",
  },
  brake: {
    src: brakeInspection,
    aspect: 3072 / 2304,
    alt: "A front brake with the wheel off: the brake disc and wheel studs, the caliper and pads on the left, and the brake hose above.",
  },
  shop: {
    src: repairShop,
    aspect: 3500 / 2334,
    alt: "A repair shop at night under strip lights: a car with its hood up beside a red tool cart, and an engine hanging from a hoist over the workbench.",
  },
} satisfies Record<string, Photo>;

/** A rectangle in a photo's overlay coordinates (1000 units wide). */
export type Box = { x: number; y: number; w: number; h: number };

/** Parts in the engine bay photo. */
export const engineBayParts = {
  dipstick: { x: 497, y: 205, w: 40, h: 34 },
  oilCap: { x: 433, y: 147, w: 44, h: 40 },
  coolant: { x: 45, y: 190, w: 148, h: 168 },
} satisfies Record<string, Box>;

/** Parts in the brake photo. */
export const brakeParts = {
  // The friction face on the upper part of the disc, between the caliper and the hub.
  disc: { x: 465, y: 175, w: 145, h: 100 },
  pads: { x: 360, y: 290, w: 60, h: 320 },
  // The caliper body, not its full height.
  caliper: { x: 180, y: 200, w: 280, h: 330 },
  // The hose where it meets the caliper.
  hose: { x: 168, y: 150, w: 120, h: 140 },
} satisfies Record<string, Box>;

/** Where a box's centre sits in its photo, as fractions of width and height. */
export function centre(box: Box, aspect: number): { fx: number; fy: number } {
  return { fx: (box.x + box.w / 2) / 1000, fy: (box.y + box.h / 2) / (1000 / aspect) };
}
