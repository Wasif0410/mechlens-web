"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { PartName } from "./poster";
import { EXPLODE, PART_ANCHORS } from "./scene";

const point = new THREE.Vector3();

/**
 * Moves plain DOM labels to the on-screen position of each labelled part, every frame, following
 * the part as the goggles come apart. Place it inside the group that turns with the model; each
 * label element is positioned absolutely over the canvas with its anchor point at the element's
 * top left corner.
 */
export function AnchorProjector({
  labelsRef,
  explodeRef,
}: {
  labelsRef: React.RefObject<Partial<Record<PartName, HTMLElement | null>>>;
  explodeRef: React.RefObject<number>;
}) {
  const markerRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  useFrame(() => {
    const marker = markerRef.current;
    if (!marker) return;
    // The scene updates world matrices during render, after this runs; update ours now so the
    // labels don't trail the model by a frame.
    marker.updateWorldMatrix(true, false);
    const apart = explodeRef.current;
    for (const part of Object.keys(PART_ANCHORS) as PartName[]) {
      const element = labelsRef.current[part];
      if (!element) continue;
      const { position, movesWith } = PART_ANCHORS[part];
      const [dx, dy, dz] = EXPLODE[movesWith];
      point
        .set(position[0] + dx * apart, position[1] + dy * apart, position[2] + dz * apart)
        .applyMatrix4(marker.matrixWorld)
        .project(camera);
      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  });
  return <group ref={markerRef} />;
}
