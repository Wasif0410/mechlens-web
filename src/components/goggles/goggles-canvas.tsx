"use client";

import { Environment, Lightformer, PresentationControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { GogglesModel } from "./goggles-model";
import { CAMERAS, type GogglesView, TARGET } from "./scene";

/** Studio lighting from local light panels, so no environment map is downloaded. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* A dim studio wall behind the lights, so glossy surfaces never reflect pure black. */}
      <color attach="background" args={["#3a424b"]} />
      <Lightformer form="rect" intensity={2.6} position={[0, 4, 0.5]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[-4.5, 1, 1.5]} rotation-y={Math.PI / 2} scale={[4, 1.4, 1]} />
      <Lightformer form="rect" intensity={2} position={[4.5, 0.4, 0.5]} rotation-y={-Math.PI / 2} scale={[4, 0.5, 1]} />
      <Lightformer form="ring" intensity={0.7} position={[1.5, 2.5, 5]} scale={2.5} />
      {/* A wide soft panel in front and above, for the long highlight across the visor. */}
      <Lightformer form="rect" intensity={1.1} position={[-1.2, 2.2, 4.5]} scale={[7, 1.2, 1]} />
      <Lightformer form="rect" intensity={0.45} position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[8, 8, 1]} color="#dfe3e8" />
    </Environment>
  );
}

/** A soft elliptical floor shadow under the visor (the strap is left out on purpose). */
function FloorShadow() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(18, 21, 25, 0.42)");
      gradient.addColorStop(0.45, "rgba(18, 21, 25, 0.18)");
      gradient.addColorStop(1, "rgba(18, 21, 25, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, -0.4, -0.12]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[2.3, 0.95]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

export type GogglesCanvasProps = {
  view: GogglesView;
  /** Drag anywhere on the canvas to turn the model. It springs back when released. */
  interactive?: boolean;
  /** Stop rendering while the canvas is off screen. */
  active?: boolean;
  onReady?: () => void;
  /** The browser dropped the WebGL context (for example under GPU memory pressure). */
  onContextLost?: () => void;
};

export default function GogglesCanvas({
  view,
  interactive = false,
  active = true,
  onReady,
  onContextLost,
}: GogglesCanvasProps) {
  const camera = CAMERAS[view];
  const model = <GogglesModel />;
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true }}
      // Vertical swipes keep scrolling the page on touch screens; sideways drags turn the model.
      style={{ touchAction: "pan-y" }}
      onCreated={({ camera: cam, gl }) => {
        cam.lookAt(...TARGET);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onContextLost?.();
          },
          { once: true },
        );
        // Report readiness once the first frames are on screen.
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <Suspense fallback={null}>
        <Studio />
        {interactive ? (
          <PresentationControls global cursor snap speed={1.3} polar={[-0.15, 0.25]} azimuth={[-0.8, 0.8]}>
            {model}
          </PresentationControls>
        ) : (
          model
        )}
        <FloorShadow />
      </Suspense>
    </Canvas>
  );
}
