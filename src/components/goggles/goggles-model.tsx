"use client";

import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";
import {
  BROW_FRONT,
  BROW_Y,
  POD,
  accentGeometry,
  browGeometry,
  frameGeometry,
  sealGeometry,
  lensParts,
  onWrap,
  strapGeometry,
} from "./geometry";

/** Brand accent: workshop yellow, used on the parts you act on. */
const SIGNAL = brand.signal;

function createMaterials(lens: { mask: THREE.Texture; tint: THREE.Texture }) {
  return {
    frame: new THREE.MeshPhysicalMaterial({
      color: "#454c54",
      roughness: 0.5,
      metalness: 0.05,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
    }),
    shell: new THREE.MeshPhysicalMaterial({
      color: "#16191d",
      roughness: 0.36,
      metalness: 0.1,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
    }),
    // Smoked glass: the tint is painted, the clearcoat adds live highlights as the model turns.
    // The mask cuts it to the visor outline; the frame hides the cut.
    lens: new THREE.MeshPhysicalMaterial({
      map: lens.tint,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
      alphaMap: lens.mask,
      alphaTest: 0.5,
    }),
    seal: new THREE.MeshStandardMaterial({ color: "#111316", roughness: 0.95 }),
    strap: new THREE.MeshStandardMaterial({ color: "#24272b", roughness: 0.85 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#06080b",
      roughness: 0.06,
      metalness: 0.4,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    }),
    iris: new THREE.MeshPhysicalMaterial({ color: "#1d3044", roughness: 0.12, metalness: 0.6, clearcoat: 1 }),
    ring: new THREE.MeshStandardMaterial({ color: "#9aa1a9", roughness: 0.28, metalness: 0.9 }),
    hole: new THREE.MeshStandardMaterial({ color: "#040506", roughness: 1 }),
    signal: new THREE.MeshStandardMaterial({
      color: SIGNAL,
      emissive: SIGNAL,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    }),
  };
}

type Materials = ReturnType<typeof createMaterials>;

/** A small part placed on the wrapped surface, facing outward. */
function OnSurface({ x, y, z, children }: { x: number; y: number; z: number; children: React.ReactNode }) {
  const { position, yaw } = onWrap(x, y, z);
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {children}
    </group>
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

function StatusLight({ m }: { m: Materials }) {
  return (
    <OnSurface x={0.1} y={BROW_Y + 0.01} z={BROW_FRONT}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.signal}>
        <cylinderGeometry args={[0.0065, 0.0065, 0.006, 16]} />
      </mesh>
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

/** A side module, where the strap attaches. The right one carries the push-to-talk button. */
function SidePod({ side, m }: { side: 1 | -1; m: Materials }) {
  return (
    <group position={[side * POD.x, POD.y, POD.z]} rotation={[0, side * POD.yaw, 0]}>
      <RoundedBox args={POD.size} radius={0.035} smoothness={5} material={m.shell} />
      {side === 1 && (
        <group position={[POD.size[0] / 2 + 0.002, 0.015, 0.03]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh material={m.signal}>
            <torusGeometry args={[0.03, 0.0045, 16, 48]} />
          </mesh>
          <mesh material={m.frame}>
            <cylinderGeometry args={[0.025, 0.025, 0.012, 40]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function GogglesModel() {
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
  const m = useMemo(() => createMaterials(parts.lens), [parts]);

  useEffect(
    () => () => {
      Object.values(parts).forEach((part) => {
        if (part instanceof THREE.BufferGeometry) part.dispose();
      });
      parts.lens.geometry.dispose();
      parts.lens.mask.dispose();
      parts.lens.tint.dispose();
      Object.values(m).forEach((material) => material.dispose());
    },
    [parts, m],
  );

  return (
    <group>
      <mesh geometry={parts.frame} material={m.frame} />
      <mesh geometry={parts.seal} material={m.seal} />
      <mesh geometry={parts.lens.geometry} material={m.lens} />
      <mesh geometry={parts.brow} material={m.shell} />
      <mesh geometry={parts.accent} material={m.signal} />
      <mesh geometry={parts.strap} material={m.strap} />
      <Camera m={m} />
      <StatusLight m={m} />
      <MicrophoneGrille x={-0.38} m={m} />
      <MicrophoneGrille x={0.38} m={m} />
      <SidePod side={1} m={m} />
      <SidePod side={-1} m={m} />
    </group>
  );
}
