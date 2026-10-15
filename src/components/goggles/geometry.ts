import * as THREE from "three";
import { brand } from "@/lib/brand";

/**
 * Geometry for the MechLens goggles, built from one 2D outline: a wide visor with a nose notch.
 *
 * The visor wraps around a vertical cylinder of radius WRAP_RADIUS whose axis sits WRAP_RADIUS
 * behind the origin. A point drawn flat at (x, y) with depth z lands at angle x / WRAP_RADIUS on a
 * cylinder of radius WRAP_RADIUS + z (see `onWrap`).
 *
 * Every solid part is a sweep: a small rounded profile carried along a path, with the profile's
 * orientation set explicitly at each step. That keeps surfaces evenly tessellated, so they bend
 * smoothly around the face and shade without facets.
 *
 * Units are roughly decimetres: the visor is 1.6 wide.
 */

export const WRAP_RADIUS = 1.15;

/** Position and yaw of a point drawn flat at (x, y) with depth z, once wrapped. */
export function onWrap(x: number, y: number, z: number) {
  const theta = x / WRAP_RADIUS;
  const r = WRAP_RADIUS + z;
  return {
    position: [r * Math.sin(theta), y, r * Math.cos(theta) - WRAP_RADIUS] as [number, number, number],
    yaw: theta,
  };
}

function wrapPoint(x: number, y: number, z: number): THREE.Vector3 {
  const [px, py, pz] = onWrap(x, y, z).position;
  return new THREE.Vector3(px, py, pz);
}

/* --- Outline ----------------------------------------------------------------------------------- */

/** The visor outline, drawn clockwise from the top centre. */
function visorPath(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0.3);
  // right half
  s.bezierCurveTo(0.3, 0.322, 0.5, 0.318, 0.63, 0.3);
  s.bezierCurveTo(0.745, 0.285, 0.8, 0.2, 0.8, 0.08);
  s.bezierCurveTo(0.8, -0.04, 0.792, -0.11, 0.758, -0.17);
  s.bezierCurveTo(0.705, -0.262, 0.585, -0.302, 0.45, -0.302);
  s.bezierCurveTo(0.305, -0.302, 0.225, -0.28, 0.16, -0.215);
  s.bezierCurveTo(0.1, -0.14, 0.062, -0.065, 0, -0.065);
  // left half, mirrored
  s.bezierCurveTo(-0.062, -0.065, -0.1, -0.14, -0.16, -0.215);
  s.bezierCurveTo(-0.225, -0.28, -0.305, -0.302, -0.45, -0.302);
  s.bezierCurveTo(-0.585, -0.302, -0.705, -0.262, -0.758, -0.17);
  s.bezierCurveTo(-0.792, -0.11, -0.8, -0.04, -0.8, 0.08);
  s.bezierCurveTo(-0.8, 0.2, -0.745, 0.285, -0.63, 0.3);
  s.bezierCurveTo(-0.5, 0.318, -0.3, 0.322, 0, 0.3);
  return s;
}

type OutlinePoint = { point: THREE.Vector2; normal: THREE.Vector2 };

/** Evenly spaced points on the outline, each with its outward normal. */
function outline(samples = 260): OutlinePoint[] {
  const points = visorPath().getSpacedPoints(samples);
  points.pop(); // the last point repeats the first
  let area = 0;
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  });
  const clockwise = area < 0;
  return points.map((point, i) => {
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const tangent = new THREE.Vector2(next.x - prev.x, next.y - prev.y).normalize();
    const normal = clockwise
      ? new THREE.Vector2(-tangent.y, tangent.x)
      : new THREE.Vector2(tangent.y, -tangent.x);
    return { point, normal };
  });
}

/** The outline moved outward by `distance` (negative moves it inward). */
function offsetOutline(distance: number): THREE.Vector2[] {
  return outline().map(({ point, normal }) => point.clone().addScaledVector(normal, distance));
}

/* --- Sweeps ------------------------------------------------------------------------------------ */

/** A closed rounded-rectangle profile in section coordinates (u, v), counter-clockwise. */
function roundedProfile(u0: number, u1: number, v0: number, v1: number, r: number, steps = 6) {
  const corners: Array<[number, number, number]> = [
    [u1 - r, v0 + r, -Math.PI / 2],
    [u1 - r, v1 - r, 0],
    [u0 + r, v1 - r, Math.PI / 2],
    [u0 + r, v0 + r, Math.PI],
  ];
  const profile: Array<[number, number]> = [];
  for (const [cu, cv, start] of corners) {
    for (let k = 0; k <= steps; k++) {
      const a = start + (Math.PI / 2) * (k / steps);
      profile.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
    }
  }
  return profile;
}

/**
 * Builds a mesh from rings of vertices: ring i is the profile placed at step i of the path.
 * Profiles are closed loops; the path is closed or open (open ends are expected to taper to a
 * point or sit inside another part).
 */
function sweepMesh(rings: THREE.Vector3[][], closedPath: boolean, flip = false): THREE.BufferGeometry {
  const n = rings.length;
  const m = rings[0].length;
  const positions = new Float32Array(n * m * 3);
  rings.forEach((ring, i) =>
    ring.forEach((p, j) => {
      positions.set([p.x, p.y, p.z], (i * m + j) * 3);
    }),
  );
  const indices: number[] = [];
  const steps = closedPath ? n : n - 1;
  for (let i = 0; i < steps; i++) {
    const i2 = (i + 1) % n;
    for (let j = 0; j < m; j++) {
      const j2 = (j + 1) % m;
      const a = i * m + j;
      const b = i2 * m + j;
      const c = i2 * m + j2;
      const d = i * m + j2;
      if (flip) indices.push(a, d, b, b, d, c);
      else indices.push(a, b, d, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * A ring that follows the visor outline: the profile's u runs outward in the visor's plane and
 * its v runs in depth.
 */
function outlineRing(profile: Array<[number, number]>): THREE.BufferGeometry {
  const rings = outline().map(({ point, normal }) =>
    profile.map(([u, v]) => wrapPoint(point.x + normal.x * u, point.y + normal.y * u, v)),
  );
  return sweepMesh(rings, true);
}

/** Scale for a capsule end: 1 along the body, easing to 0 over the last `cap` of the length. */
function capsuleScale(distanceFromEnd: number, cap: number): number {
  if (distanceFromEnd >= cap) return 1;
  const t = 1 - distanceFromEnd / cap;
  return Math.sqrt(Math.max(0, 1 - t * t));
}

/* --- Frame, face seal -------------------------------------------------------------------------- */

/** Depth of the frame's front face. */
export const FRAME_FRONT = 0.12;

export function frameGeometry(): THREE.BufferGeometry {
  return outlineRing(roundedProfile(-0.05, 0.035, 0, FRAME_FRONT, 0.024));
}

export function sealGeometry(): THREE.BufferGeometry {
  return outlineRing(roundedProfile(-0.068, -0.004, -0.13, 0.01, 0.024));
}

/* --- Lens -------------------------------------------------------------------------------------- */

/** Depth of the lens surface, set back inside the frame opening. */
const LENS_Z = 0.065;

/**
 * The lens: a section of the wrap cylinder, cut to the visor outline by an alpha mask (the frame
 * covers the cut edge), with its smoked tint painted into a colour map.
 */
export function lensParts(): {
  geometry: THREE.BufferGeometry;
  hudGeometry: THREE.BufferGeometry;
  mask: THREE.CanvasTexture;
  tint: THREE.CanvasTexture;
  hud: THREE.CanvasTexture;
} {
  const edge = offsetOutline(-0.035);
  const xs = edge.map((p) => p.x);
  const ys = edge.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const radius = WRAP_RADIUS + LENS_Z;

  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    maxY - minY,
    160,
    1,
    true,
    minX / WRAP_RADIUS,
    (maxX - minX) / WRAP_RADIUS,
  );
  geometry.translate(0, (minY + maxY) / 2, -WRAP_RADIUS);

  // The heads-up overlay sits a hair in front of the lens, on the same section of the cylinder.
  const hudGeometry = new THREE.CylinderGeometry(
    radius + 0.003,
    radius + 0.003,
    maxY - minY,
    160,
    1,
    true,
    minX / WRAP_RADIUS,
    (maxX - minX) / WRAP_RADIUS,
  );
  hudGeometry.translate(0, (minY + maxY) / 2, -WRAP_RADIUS);

  const width = 2048;
  const height = Math.round((width * (maxY - minY)) / (maxX - minX));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    edge.forEach((p, i) => {
      const cx = ((p.x - minX) / (maxX - minX)) * width;
      const cy = ((maxY - p.y) / (maxY - minY)) * height;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.fill();
  }
  const mask = new THREE.CanvasTexture(canvas);
  mask.anisotropy = 8;
  return {
    geometry,
    hudGeometry,
    mask,
    tint: lensTint(width / 4, height / 4),
    hud: hudOverlay(width / 2, height / 2),
  };
}

/**
 * The heads-up overlay as seen from outside: amber corner brackets around a part and two short
 * lines of answer below them, over one eye.
 */
function hudOverlay(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = brand.signal;
    ctx.fillStyle = brand.signal;
    ctx.lineWidth = Math.max(2, width * 0.004);
    const bw = width * 0.16;
    const bh = height * 0.3;
    const x = width * 0.2;
    const y = height * 0.24;
    const arm = bw * 0.24;
    ctx.beginPath();
    ctx.moveTo(x, y + arm);
    ctx.lineTo(x, y);
    ctx.lineTo(x + arm, y);
    ctx.moveTo(x + bw - arm, y);
    ctx.lineTo(x + bw, y);
    ctx.lineTo(x + bw, y + arm);
    ctx.moveTo(x + bw, y + bh - arm);
    ctx.lineTo(x + bw, y + bh);
    ctx.lineTo(x + bw - arm, y + bh);
    ctx.moveTo(x + arm, y + bh);
    ctx.lineTo(x, y + bh);
    ctx.lineTo(x, y + bh - arm);
    ctx.stroke();
    const lineH = height * 0.022;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(x, y + bh + height * 0.06, bw * 1.2, lineH);
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x, y + bh + height * 0.06 + lineH * 2.2, bw * 0.8, lineH);
  }
  const hud = new THREE.CanvasTexture(canvas);
  hud.colorSpace = THREE.SRGBColorSpace;
  hud.anisotropy = 8;
  return hud;
}

/** Smoked glass, lighter at the top, with a soft diagonal sheen from the upper left. */
function lensTint(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, "#4b5765");
    base.addColorStop(0.45, "#1a222b");
    base.addColorStop(1, "#0a0d11");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const sheen = ctx.createLinearGradient(0, 0, width * 0.55, height);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0)");
    sheen.addColorStop(0.38, "rgba(255, 255, 255, 0)");
    sheen.addColorStop(0.5, "rgba(214, 226, 238, 0.22)");
    sheen.addColorStop(0.62, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
  }
  const tint = new THREE.CanvasTexture(canvas);
  tint.colorSpace = THREE.SRGBColorSpace;
  return tint;
}

/* --- Brow bar ---------------------------------------------------------------------------------- */

export const BROW_Y = 0.262;
const BROW_HALF_WIDTH = 0.61;
const BROW_HEIGHT = 0.1;
const BROW_DEPTH = 0.09;
/** Depth of the brow bar's front face. */
export const BROW_FRONT = FRAME_FRONT + 0.055;

/** The electronics bar across the brow. It follows the visor's curve and has rounded ends. */
export function browGeometry(): THREE.BufferGeometry {
  const profile = roundedProfile(-BROW_DEPTH / 2, BROW_DEPTH / 2, -BROW_HEIGHT / 2, BROW_HEIGHT / 2, 0.03);
  const steps = 160;
  const rings: THREE.Vector3[][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = -BROW_HALF_WIDTH + (2 * BROW_HALF_WIDTH * i) / steps;
    const scale = capsuleScale(BROW_HALF_WIDTH - Math.abs(x), 0.045);
    // u runs in depth (front at +BROW_DEPTH / 2), v runs up.
    rings.push(
      profile.map(([u, v]) =>
        wrapPoint(x, BROW_Y + v * scale, BROW_FRONT - BROW_DEPTH / 2 + u * scale),
      ),
    );
  }
  return sweepMesh(rings, false);
}

/** A thin accent line along the lower front edge of the brow bar. */
export function accentGeometry(): THREE.BufferGeometry {
  const y = BROW_Y - BROW_HEIGHT / 2 + 0.022;
  const z = BROW_FRONT + 0.0015;
  const reach = BROW_HALF_WIDTH - 0.06;
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 41 }, (_, i) => wrapPoint(-reach + (2 * reach * i) / 40, y, z)),
  );
  return new THREE.TubeGeometry(curve, 160, 0.0034, 8, false);
}

/* --- Side pods and strap ----------------------------------------------------------------------- */

/** The side modules run straight back from the ends of the frame. */
export const POD = {
  x: 0.79,
  y: 0.02,
  z: -0.4,
  size: [0.085, 0.19, 0.3] as [number, number, number],
  yaw: 0.1,
};

/** The head strap: a flat band from inside one pod, around the back of the head, to the other. */
export function strapGeometry(): THREE.BufferGeometry {
  const a = 0.86; // half width
  const b = 0.98; // reach behind the centre
  const centreZ = -0.88;
  const start = Math.asin(Math.min(1, POD.x / a));
  const profile = roundedProfile(-0.011, 0.011, -0.072, 0.072, 0.009, 3);
  const steps = 200;
  const rings: THREE.Vector3[][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = start + ((Math.PI * 2 - start * 2) * i) / steps;
    const centre = new THREE.Vector3(a * Math.sin(t), POD.y, centreZ + b * Math.cos(t));
    const out = new THREE.Vector3(b * Math.sin(t), 0, a * Math.cos(t)).normalize();
    rings.push(profile.map(([u, v]) => centre.clone().addScaledVector(out, u).setY(POD.y + v)));
  }
  return sweepMesh(rings, false);
}
