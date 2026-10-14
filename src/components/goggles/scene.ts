import * as THREE from "three";
import { BROW_FRONT, BROW_Y, POD, onWrap } from "./geometry";

/**
 * Scene settings shared by the live canvas, the pre-rendered posters and the anatomy callouts,
 * so the callouts match the parts the model draws. After changing the model or a camera here,
 * re-render the posters (npm run posters).
 */

export type GogglesView = "hero" | "anatomy";

export const CAMERAS: Record<GogglesView, { position: [number, number, number]; fov: number }> = {
  hero: { position: [1.7, 0.64, 3.5], fov: 24 },
  anatomy: { position: [1.3, 0.38, 3.2], fov: 24 },
};

/** Where every camera looks: the visual centre of the goggles, pods included. */
export const TARGET: [number, number, number] = [0, 0.02, -0.24];

/** Poster sizes in CSS pixels; the files are rendered at twice this. */
export const POSTER_SIZE: Record<GogglesView, { width: number; height: number }> = {
  hero: { width: 1200, height: 600 },
  anatomy: { width: 1040, height: 650 },
};

function buttonPosition(): [number, number, number] {
  const local = new THREE.Vector3(POD.size[0] / 2 + 0.006, 0.015, 0.03);
  local.applyAxisAngle(new THREE.Vector3(0, 1, 0), POD.yaw);
  return [POD.x + local.x, POD.y + local.y, POD.z + local.z];
}

export const PART_ANCHORS = {
  camera: onWrap(0, BROW_Y, BROW_FRONT + 0.015).position,
  microphones: onWrap(-0.38, BROW_Y + 0.012, BROW_FRONT).position,
  light: onWrap(0.1, BROW_Y + 0.01, BROW_FRONT).position,
  button: buttonPosition(),
} as const;

export type PartName = keyof typeof PART_ANCHORS;

/** A part's position on a poster of the given view, as percentages from the top left. */
export function projectAnchor(view: GogglesView, part: PartName): { left: number; top: number } {
  const { width, height } = POSTER_SIZE[view];
  const settings = CAMERAS[view];
  const camera = new THREE.PerspectiveCamera(settings.fov, width / height, 0.1, 30);
  camera.position.set(...settings.position);
  camera.lookAt(...TARGET);
  camera.updateMatrixWorld();
  const point = new THREE.Vector3(...PART_ANCHORS[part]).project(camera);
  return { left: ((point.x + 1) / 2) * 100, top: ((1 - point.y) / 2) * 100 };
}
