"use client";

import { Environment, Float, Lightformer, PresentationControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { AnchorProjector } from "./anchor-projector";
import { GogglesModel } from "./goggles-model";
import type { GogglesView, PartName } from "./poster";
import { CAMERAS, TARGET, productPose } from "./scene";

/**
 * A dark studio built from light panels (nothing is downloaded): long strip lights behind and to
 * the sides draw the silhouette, a dim soft box in front keeps the shadows readable, and a warm
 * panel low on the right echoes the amber accents. Straight on, that warm panel would sit in the
 * visor as a patch of colour where the hero's headline goes, so the front view leaves it out.
 */
function Studio({ warm }: { warm: boolean }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#060708"]} />
      <Lightformer form="rect" intensity={6} position={[0, 2.4, -4]} rotation-x={-Math.PI / 5} scale={[10, 0.5, 1]} />
      <Lightformer form="rect" intensity={3} position={[-5, 0.6, -0.5]} rotation-y={Math.PI / 2} scale={[3.5, 0.35, 1]} />
      {warm && (
        <Lightformer form="rect" intensity={2.2} position={[5, 0.2, 0.5]} rotation-y={-Math.PI / 2} scale={[3, 0.3, 1]} color="#ffd9a0" />
      )}
      <Lightformer form="rect" intensity={1.8} position={[0, 3, 4]} rotation-x={Math.PI / 2.6} scale={[6, 2, 1]} />
      {/* Two thin bars in front: the long highlights that run across the visor. */}
      <Lightformer form="rect" intensity={3} position={[-1.2, 1.5, 5]} scale={[9, 0.16, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[0.8, 0.4, 5]} scale={[9, 0.08, 1]} />
    </Environment>
  );
}

/** A faint pool of light under the goggles, as if they rest on a lit bench. */
function LightPool() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(236, 233, 226, 0.13)");
      g.addColorStop(0.4, "rgba(236, 233, 226, 0.04)");
      g.addColorStop(0.8, "rgba(236, 233, 226, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, -0.42, -0.2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      {/* Narrower than the view, so the falloff never meets the canvas edge. */}
      <planeGeometry args={[2, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/**
 * Turns the goggles, and takes them apart, to follow the scroll position of the product scene.
 * Runs before every other frame callback (priority -1), so the model and the labels read this
 * frame's pose.
 */
function ScrollPose({
  progressRef,
  hudRef,
  explodeRef,
  children,
}: {
  progressRef: React.RefObject<number>;
  hudRef: React.RefObject<number>;
  explodeRef: React.RefObject<number>;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const placedRef = useRef(false);
  useFrame((_, delta) => {
    const pose = productPose(progressRef.current);
    hudRef.current = pose.hud;
    const group = groupRef.current;
    if (!group) return;
    if (!placedRef.current) {
      // Start in the pose the poster shows, so the swap to the live model doesn't jump.
      group.rotation.set(pose.pitch, pose.yaw, 0);
      group.scale.setScalar(pose.scale);
      explodeRef.current = pose.explode;
      placedRef.current = true;
      return;
    }
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, pose.pitch, 5, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, pose.yaw, 5, delta);
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, pose.scale, 5, delta));
    explodeRef.current = THREE.MathUtils.damp(explodeRef.current, pose.explode, 5, delta);
  }, -1);
  return <group ref={groupRef}>{children}</group>;
}

export type GogglesCanvasProps = {
  view: GogglesView;
  /** Hero: drag anywhere on the canvas to turn the model; it springs back. */
  interactive?: boolean;
  /** Hero: let the model float gently. Off for reduced motion. */
  float?: boolean;
  /** Product scene: scroll progress, 0 to 1, read every frame. */
  progressRef?: React.RefObject<number>;
  /** Product scene: label elements to keep over their parts (see AnchorProjector). */
  labelsRef?: React.RefObject<Partial<Record<PartName, HTMLElement | null>>>;
  /** Stop rendering while the canvas is off screen. */
  active?: boolean;
  onReady?: () => void;
  /** The browser dropped the WebGL context (for example under GPU memory pressure). */
  onContextLost?: () => void;
  /** Posters only: render the lens mask (see GogglesModel). */
  mask?: boolean;
};

export default function GogglesCanvas({
  view,
  interactive = false,
  float = true,
  progressRef,
  labelsRef,
  active = true,
  onReady,
  onContextLost,
  mask = false,
}: GogglesCanvasProps) {
  const camera = CAMERAS[view];
  const hudRef = useRef(0);
  const explodeRef = useRef(0);
  const model = <GogglesModel hudRef={hudRef} explodeRef={explodeRef} mask={mask} />;

  let content: React.ReactNode = model;
  if (progressRef) {
    content = (
      <ScrollPose progressRef={progressRef} hudRef={hudRef} explodeRef={explodeRef}>
        {model}
        {labelsRef && <AnchorProjector labelsRef={labelsRef} explodeRef={explodeRef} />}
      </ScrollPose>
    );
  } else if (interactive) {
    content = (
      <PresentationControls global cursor snap speed={1.2} polar={[-0.15, 0.2]} azimuth={[-0.7, 0.7]}>
        {float ? (
          <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.25} floatingRange={[-0.02, 0.02]}>
            {model}
          </Float>
        ) : (
          model
        )}
      </PresentationControls>
    );
  }

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
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.3;
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
        {!mask && <Studio warm={view !== "front"} />}
        <ambientLight intensity={0.04} />
        {content}
        {!mask && <LightPool />}
      </Suspense>
    </Canvas>
  );
}
