import * as THREE from "three";
import { BROW_FRONT, BROW_Y, POD, onWrap } from "./geometry";
import type { GogglesView, PartName } from "./poster";

/**
 * Scene settings shared by the live canvas and the pre-rendered posters, so a poster always
 * matches what the live model draws. After changing the model, a camera or the schedule below,
 * re-render the posters (npm run posters).
 *
 * The goggles face +z. The wearer's right is -x, where the push-to-talk button sits.
 */

export const CAMERAS: Record<GogglesView, { position: [number, number, number]; fov: number }> = {
  hero: { position: [-1.62, 0.34, 2.95], fov: 26 },
  product: { position: [0, 0.22, 3.75], fov: 25 },
};

/** Where every camera looks: the visual centre of the goggles, pods included. */
export const TARGET: [number, number, number] = [0, 0.02, -0.24];

/**
 * The product scene: as the visitor scrolls (progress 0 to 1) the goggles turn to show each part.
 * Each beat is the model's rotation about the vertical axis (positive turns the wearer's right
 * side towards the camera) and how bright the heads-up overlay on the lens is.
 */
export const PRODUCT_BEATS = [
  { yaw: 0.32, hud: 0 }, // camera at the brow
  { yaw: 0.98, hud: 0 }, // push-to-talk button on the wearer's right
  { yaw: 0.22, hud: 1 }, // the answer on the lens
] as const;

export function productPose(progress: number): { yaw: number; hud: number } {
  const p = THREE.MathUtils.clamp(progress, 0, 1) * (PRODUCT_BEATS.length - 1);
  const i = Math.min(PRODUCT_BEATS.length - 2, Math.floor(p));
  const t = THREE.MathUtils.smootherstep(p - i, 0, 1);
  const a = PRODUCT_BEATS[i];
  const b = PRODUCT_BEATS[i + 1];
  return { yaw: THREE.MathUtils.lerp(a.yaw, b.yaw, t), hud: THREE.MathUtils.lerp(a.hud, b.hud, t) };
}

/** Centre of the push-to-talk button, on the outer face of the wearer's right pod. */
export const BUTTON_LOCAL: [number, number, number] = [-(POD.size[0] / 2 + 0.002), 0.015, 0.03];

function buttonPosition(): [number, number, number] {
  const local = new THREE.Vector3(BUTTON_LOCAL[0] - 0.004, BUTTON_LOCAL[1], BUTTON_LOCAL[2]);
  local.applyAxisAngle(new THREE.Vector3(0, 1, 0), -POD.yaw);
  return [-POD.x + local.x, POD.y + local.y, POD.z + local.z];
}

/** Model-space positions of the parts the product scene labels. */
export const PART_ANCHORS: Record<PartName, [number, number, number]> = {
  camera: onWrap(0, BROW_Y + 0.05, BROW_FRONT + 0.02).position,
  button: buttonPosition(),
  // The left edge (as seen from the front) of the outline the heads-up overlay draws on the lens.
  lens: onWrap(-0.47, 0.07, 0.09).position,
};
