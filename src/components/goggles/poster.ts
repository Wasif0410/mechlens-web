/**
 * Poster sizes in CSS pixels (the files are rendered at twice this), plus the part names the
 * product scene labels. Kept free of three.js so page sections can import it without pulling the
 * 3D code into the first page load; the 3D scene settings live in scene.ts.
 */

export type GogglesView = "front" | "product";

export const POSTER_SIZE: Record<GogglesView, { width: number; height: number }> = {
  front: { width: 1600, height: 900 },
  product: { width: 1200, height: 900 },
};

export type PartName = "camera" | "microphone" | "button" | "lens";

/**
 * How far through the product scene the last beat arrives; it holds for the rest, so the goggles
 * stay apart for a while before the scene lets go. Shared by the 3D pose and the copy.
 */
export const PRODUCT_HOLD = 0.85;

/** The product scene's position among its beats (0 to beats - 1) for a scroll progress. */
export function beatPosition(progress: number, beats: number): number {
  return Math.min(1, Math.max(0, progress / PRODUCT_HOLD)) * (beats - 1);
}
