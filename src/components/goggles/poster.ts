/**
 * Poster sizes in CSS pixels (the files are rendered at twice this), plus the part names the
 * product scene labels. Kept free of three.js so page sections can import it without pulling the
 * 3D code into the first page load; the 3D scene settings live in scene.ts.
 */

export type GogglesView = "hero" | "product";

export const POSTER_SIZE: Record<GogglesView, { width: number; height: number }> = {
  hero: { width: 1100, height: 900 },
  product: { width: 1200, height: 900 },
};

export type PartName = "camera" | "button" | "lens";
