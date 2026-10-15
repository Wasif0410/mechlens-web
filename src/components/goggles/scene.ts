import * as THREE from "three";
import { BROW_FRONT, BROW_Y, POD, onWrap } from "./geometry";
import { beatPosition, type GogglesView, type PartName } from "./poster";

/**
 * Scene settings shared by the live canvas and the pre-rendered posters, so a poster always
 * matches what the live model draws. After changing the model, a camera or the schedule below,
 * re-render the posters (npm run posters).
 *
 * The goggles face +z. The wearer's right is -x, where the push-to-talk button sits.
 */

export const CAMERAS: Record<GogglesView, { position: [number, number, number]; fov: number }> = {
  // Straight on, at eye level: the hero, where the headline sits inside the lens.
  front: { position: [0, 0.03, 3.3], fov: 22 },
  product: { position: [0, 0.22, 3.75], fov: 25 },
};

/** Where every camera looks: the visual centre of the goggles, pods included. */
export const TARGET: [number, number, number] = [0, 0.02, -0.24];

/**
 * The product scene: as the visitor scrolls (progress 0 to 1) the goggles turn to show each part,
 * then come apart. Each beat is the model's rotation about the vertical axis (positive turns the
 * wearer's right side towards the camera), its tilt towards the camera (positive shows more of
 * the top), its scale (smaller when apart, so every part fits), how bright the heads-up overlay
 * on the lens is, and how far apart the parts are.
 */
export const PRODUCT_BEATS = [
  { yaw: 0.32, pitch: 0, scale: 1, hud: 0, explode: 0 }, // camera at the brow
  { yaw: 0.98, pitch: 0, scale: 1, hud: 0, explode: 0 }, // push-to-talk button on the wearer's right
  { yaw: 0.22, pitch: 0, scale: 1, hud: 1, explode: 0 }, // the answer on the lens
  { yaw: 0.78, pitch: 0.18, scale: 0.8, hud: 1, explode: 1 }, // taken apart, every part in view
] as const;

export type ProductPose = { yaw: number; pitch: number; scale: number; hud: number; explode: number };

export function productPose(progress: number): ProductPose {
  const p = beatPosition(progress, PRODUCT_BEATS.length);
  const i = Math.min(PRODUCT_BEATS.length - 2, Math.floor(p));
  const t = THREE.MathUtils.smootherstep(p - i, 0, 1);
  const a = PRODUCT_BEATS[i];
  const b = PRODUCT_BEATS[i + 1];
  const lerp = (key: keyof ProductPose) => THREE.MathUtils.lerp(a[key], b[key], t);
  return { yaw: lerp("yaw"), pitch: lerp("pitch"), scale: lerp("scale"), hud: lerp("hud"), explode: lerp("explode") };
}

/**
 * Where each part moves when the goggles come apart, in model units at explode = 1: the lens
 * forward, the brow bar (camera, microphones, status light) up, the face seal and strap back, and
 * the side modules outward. The frame stays put.
 */
export const EXPLODE = {
  lens: [0, 0, 0.36],
  brow: [0, 0.3, 0.04],
  seal: [0, -0.02, -0.3],
  strap: [0, 0, -0.18],
  podLeft: [0.26, 0, -0.02],
  podRight: [-0.26, 0, -0.02],
} as const satisfies Record<string, readonly [number, number, number]>;

export type ExplodingPart = keyof typeof EXPLODE;

/** Centre of the push-to-talk button, on the outer face of the wearer's right pod. */
export const BUTTON_LOCAL: [number, number, number] = [-(POD.size[0] / 2 + 0.002), 0.015, 0.03];

function buttonPosition(): [number, number, number] {
  const local = new THREE.Vector3(BUTTON_LOCAL[0] - 0.004, BUTTON_LOCAL[1], BUTTON_LOCAL[2]);
  local.applyAxisAngle(new THREE.Vector3(0, 1, 0), -POD.yaw);
  return [-POD.x + local.x, POD.y + local.y, POD.z + local.z];
}

/** Model-space positions of the parts the product scene labels, and which part each moves with. */
export const PART_ANCHORS: Record<PartName, { position: [number, number, number]; movesWith: ExplodingPart }> = {
  // Just above the brow bar, so the labels never sit on the bar itself.
  camera: { position: onWrap(0, BROW_Y + 0.1, BROW_FRONT + 0.02).position, movesWith: "brow" },
  // Above the grille on the wearer's left (the far end of the bar when the goggles come apart);
  // there's a matching one on the right.
  microphone: { position: onWrap(0.38, BROW_Y + 0.1, BROW_FRONT + 0.02).position, movesWith: "brow" },
  button: { position: buttonPosition(), movesWith: "podRight" },
  // The right end (as seen from the front) of the outline and answer lines the heads-up overlay
  // draws on the lens, so the label runs over clear lens, away from the button on the other side.
  lens: { position: onWrap(-0.165, 0.07, 0.09).position, movesWith: "lens" },
};
