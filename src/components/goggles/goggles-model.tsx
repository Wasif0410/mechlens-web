"use client";

import { Billboard, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";
import {
  BROW_FRONT,
  BROW_Y,
  POD,
  accentGeometry,
  browGeometry,
  frameGeometry,
  lensParts,
  onWrap,
  sealGeometry,
  strapGeometry,
} from "./geometry";
import { BUTTON_LOCAL, EXPLODE, type ExplodingPart } from "./scene";

const SIGNAL = brand.signal;

/** Dark materials that read through their highlights: the scene is lit mostly from behind. */
function createMaterials(lens: { mask: THREE.Texture; tint: THREE.Texture; hud: THREE.Texture }) {
  return {
    frame: new THREE.MeshPhysicalMaterial({
      color: "#3a4047",
      roughness: 0.38,
      metalness: 0.25,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
    }),
    shell: new THREE.MeshPhysicalMaterial({
      color: "#1b1e22",
      roughness: 0.3,
      metalness: 0.6,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
    }),
    // Smoked glass: the tint is painted, the clearcoat picks up the strip lights as it turns.
    lens: new THREE.MeshPhysicalMaterial({
      map: lens.tint,
      roughness: 0.06,
      metalness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.6,
      alphaMap: lens.mask,
      alphaTest: 0.5,
    }),
    hud: new THREE.MeshBasicMaterial({
      map: lens.hud,
      alphaMap: lens.mask,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    seal: new THREE.MeshStandardMaterial({ color: "#0c0d0f", roughness: 0.95 }),
    strap: new THREE.MeshStandardMaterial({ color: "#1a1c1f", roughness: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#05070a",
      roughness: 0.05,
      metalness: 0.4,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    }),
    iris: new THREE.MeshPhysicalMaterial({ color: "#20374f", roughness: 0.1, metalness: 0.6, clearcoat: 1 }),
    ring: new THREE.MeshStandardMaterial({ color: "#a7aeb6", roughness: 0.25, metalness: 0.95 }),
    hole: new THREE.MeshStandardMaterial({ color: "#030405", roughness: 1 }),
    signal: new THREE.MeshStandardMaterial({
      color: SIGNAL,
      emissive: SIGNAL,
      emissiveIntensity: 1.6,
      roughness: 0.4,
      toneMapped: false,
    }),
    // The stripe along the brow: a quiet amber inlay, not a light.
    inlay: new THREE.MeshStandardMaterial({
      color: "#b98a0a",
      emissive: SIGNAL,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.6,
    }),
  };
}

type Materials = Record<keyof ReturnType<typeof createMaterials>, THREE.Material>;

/**
 * Materials for the lens mask: the lens in plain white, every other part invisible but still
 * hiding what's behind it, so the render shows exactly the part of the lens you can see.
 */
function createMaskMaterials(lens: { mask: THREE.Texture }): Materials {
  const hidden = new THREE.MeshBasicMaterial({ colorWrite: false });
  const white = new THREE.MeshBasicMaterial({ color: "#ffffff", alphaMap: lens.mask, alphaTest: 0.5, toneMapped: false });
  return {
    frame: hidden,
    shell: hidden,
    lens: white,
    hud: hidden,
    seal: hidden,
    strap: hidden,
    glass: hidden,
    iris: hidden,
    ring: hidden,
    hole: hidden,
    signal: hidden,
    inlay: hidden,
  };
}

/** A soft amber halo texture, for the status light and the button ring. */
function glowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(242, 183, 5, 0.9)");
    g.addColorStop(0.25, "rgba(242, 183, 5, 0.35)");
    g.addColorStop(1, "rgba(242, 183, 5, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/** A small part placed on the wrapped surface, facing outward. */
function OnSurface({ x, y, z, children }: { x: number; y: number; z: number; children: React.ReactNode }) {
  const { position, yaw } = onWrap(x, y, z);
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {children}
    </group>
  );
}

function Glow({ texture, size }: { texture: THREE.Texture | null; size: number }) {
  // No halo in the lens mask.
  if (!texture) return null;
  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

/** The forward camera at the centre of the brow: it sees what the wearer sees. */
function Camera({ m }: { m: Materials }) {
  return (
    <OnSurface x={0} y={BROW_Y} z={BROW_FRONT}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.004]} material={m.ring}>
        <cylinderGeometry args={[0.044, 0.044, 0.012, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.008]} material={m.glass}>
        <cylinderGeometry args={[0.034, 0.034, 0.012, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0145]} material={m.iris}>
        <cylinderGeometry args={[0.013, 0.013, 0.002, 32]} />
      </mesh>
    </OnSurface>
  );
}

function StatusLight({ m, glow }: { m: Materials; glow: THREE.Texture | null }) {
  return (
    <OnSurface x={0.1} y={BROW_Y + 0.01} z={BROW_FRONT}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.signal}>
        <cylinderGeometry args={[0.0065, 0.0065, 0.006, 16]} />
      </mesh>
      <group position={[0, 0, 0.01]}>
        <Glow texture={glow} size={0.09} />
      </group>
    </OnSurface>
  );
}

function MicrophoneGrille({ x, m }: { x: number; m: Materials }) {
  return (
    <>
      {[-0.022, 0, 0.022].map((dx) => (
        <OnSurface key={dx} x={x + dx} y={BROW_Y + 0.012} z={BROW_FRONT}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={m.hole}>
            <cylinderGeometry args={[0.005, 0.005, 0.004, 12]} />
          </mesh>
        </OnSurface>
      ))}
    </>
  );
}

/**
 * A side module, where the strap attaches. The one on the wearer's right (-x) carries the
 * push-to-talk button; the ring faces outward.
 */
function SidePod({ side, m, glow }: { side: 1 | -1; m: Materials; glow: THREE.Texture | null }) {
  return (
    <group position={[side * POD.x, POD.y, POD.z]} rotation={[0, side * POD.yaw, 0]}>
      <RoundedBox args={POD.size} radius={0.035} smoothness={5} material={m.shell} />
      {side === -1 && (
        <group position={BUTTON_LOCAL} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={m.signal}>
            <torusGeometry args={[0.03, 0.0045, 16, 48]} />
          </mesh>
          <mesh material={m.frame}>
            <cylinderGeometry args={[0.025, 0.025, 0.012, 40]} />
          </mesh>
          <group position={[0, 0.012, 0]}>
            <Glow texture={glow} size={0.16} />
          </group>
        </group>
      )}
    </group>
  );
}

type PartGroups = Partial<Record<ExplodingPart, THREE.Group | null>>;

/** A part that moves as one when the goggles come apart; GogglesModel positions it every frame. */
function Moving({ part, partsRef, children }: { part: ExplodingPart; partsRef: React.RefObject<PartGroups>; children: React.ReactNode }) {
  return (
    <group
      ref={(group) => {
        partsRef.current[part] = group;
      }}
    >
      {children}
    </group>
  );
}

export type GogglesModelProps = {
  /** Brightness of the heads-up overlay on the lens, 0 to 1. Read every frame. */
  hudRef?: React.RefObject<number>;
  /** How far apart the parts are, 0 (assembled) to 1 (see EXPLODE). Read every frame. */
  explodeRef?: React.RefObject<number>;
  /** Render only the visible lens, in white, for the lens mask poster. */
  mask?: boolean;
};

export function GogglesModel({ hudRef, explodeRef, mask = false }: GogglesModelProps) {
  const hudMeshRef = useRef<THREE.Mesh>(null);
  const hudPlacedRef = useRef(false);
  const partsRef = useRef<PartGroups>({});
  const parts = useMemo(
    () => ({
      frame: frameGeometry(),
      seal: sealGeometry(),
      lens: lensParts(),
      brow: browGeometry(),
      accent: accentGeometry(),
      strap: strapGeometry(),
    }),
    [],
  );
  const m = useMemo(() => (mask ? createMaskMaterials(parts.lens) : createMaterials(parts.lens)), [parts, mask]);
  const glowMap = useMemo(() => glowTexture(), []);
  const glow = mask ? null : glowMap;

  useFrame((_, delta) => {
    const material = hudMeshRef.current?.material;
    if (material instanceof THREE.MeshBasicMaterial) {
      const target = hudRef?.current ?? 0;
      material.opacity = hudPlacedRef.current ? THREE.MathUtils.damp(material.opacity, target, 7, delta) : target;
      hudPlacedRef.current = true;
    }
    const apart = explodeRef?.current ?? 0;
    for (const part of Object.keys(EXPLODE) as ExplodingPart[]) {
      const [x, y, z] = EXPLODE[part];
      partsRef.current[part]?.position.set(x * apart, y * apart, z * apart);
    }
  });

  useEffect(
    () => () => {
      for (const part of [parts.frame, parts.seal, parts.brow, parts.accent, parts.strap]) part.dispose();
      parts.lens.geometry.dispose();
      parts.lens.hudGeometry.dispose();
      parts.lens.mask.dispose();
      parts.lens.tint.dispose();
      parts.lens.hud.dispose();
      glowMap.dispose();
      Object.values(m).forEach((material) => material.dispose());
    },
    [parts, m, glowMap],
  );

  return (
    <group>
      <mesh geometry={parts.frame} material={m.frame} />
      <Moving part="seal" partsRef={partsRef}>
        <mesh geometry={parts.seal} material={m.seal} />
      </Moving>
      <Moving part="lens" partsRef={partsRef}>
        {/* In the mask the lens draws after every other part, so the parts in front of it hide it. */}
        <mesh geometry={parts.lens.geometry} material={m.lens} renderOrder={mask ? 1 : 0} />
        <mesh ref={hudMeshRef} geometry={parts.lens.hudGeometry} material={m.hud} renderOrder={2} visible={!mask} />
      </Moving>
      <Moving part="brow" partsRef={partsRef}>
        <mesh geometry={parts.brow} material={m.shell} />
        <mesh geometry={parts.accent} material={m.inlay} />
        <Camera m={m} />
        <StatusLight m={m} glow={glow} />
        <MicrophoneGrille x={-0.38} m={m} />
        <MicrophoneGrille x={0.38} m={m} />
      </Moving>
      <Moving part="strap" partsRef={partsRef}>
        <mesh geometry={parts.strap} material={m.strap} />
      </Moving>
      <Moving part="podLeft" partsRef={partsRef}>
        <SidePod side={1} m={m} glow={glow} />
      </Moving>
      <Moving part="podRight" partsRef={partsRef}>
        <SidePod side={-1} m={m} glow={glow} />
      </Moving>
    </group>
  );
}
