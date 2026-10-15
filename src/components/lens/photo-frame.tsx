"use client";

import { type MotionStyle, type MotionValue, motion } from "motion/react";
import Image from "next/image";
import type { Box, Photo } from "./photos";

type Value = MotionValue<number> | number;

/**
 * A photo covering its container, which must be a size container (`container-type: size`), with
 * overlays drawn in the photo's own coordinates so they stay on their parts at any screen shape.
 * `fx` and `fy` are the point (as fractions of the photo) kept in view when the container is
 * narrower or shorter than the photo, and the point `zoom` scales around; animating them pans and
 * pushes in like a camera.
 */
export function PhotoFrame({
  photo,
  fx,
  fy,
  zoom = 1,
  sizes,
  decorative = false,
  children,
}: {
  photo: Photo;
  fx: Value;
  fy: Value;
  zoom?: Value;
  /** How wide the photo is drawn; by default as wide as it is when it covers the whole screen. */
  sizes?: string;
  /** The photo repeats one shown elsewhere, so it gets no text alternative. */
  decorative?: boolean;
  children?: React.ReactNode;
}) {
  // The photo's size when it covers the container, and the offsets that keep (fx, fy) in view.
  const width = `max(100cqw, 100cqh * ${photo.aspect})`;
  const height = `max(100cqw / ${photo.aspect}, 100cqh)`;
  const style = {
    "--fx": fx,
    "--fy": fy,
    width: `calc(${width})`,
    height: `calc(${height})`,
    left: `clamp(calc(100cqw - ${width}), calc(50cqw - var(--fx) * ${width}), 0px)`,
    top: `clamp(calc(100cqh - ${height}), calc(50cqh - var(--fy) * ${height}), 0px)`,
    scale: zoom,
    transformOrigin: "calc(var(--fx) * 100%) calc(var(--fy) * 100%)",
  } as MotionStyle;
  return (
    <motion.div className="absolute" style={style}>
      <Image
        src={photo.src}
        alt={decorative ? "" : photo.alt}
        fill
        sizes={sizes ?? `max(100vw, ${Math.round(photo.aspect * 100)}vh)`}
        className="object-cover"
      />
      {children}
    </motion.div>
  );
}

/** Positions a child over a box in a photo's coordinates (inside a PhotoFrame). */
export function OnPhoto({ box, aspect, children }: { box: Box; aspect: number; children: React.ReactNode }) {
  const height = 1000 / aspect;
  return (
    <div
      className="absolute"
      style={{
        left: `${box.x / 10}%`,
        top: `${(box.y / height) * 100}%`,
        width: `${box.w / 10}%`,
        height: `${(box.h / height) * 100}%`,
      }}
    >
      {children}
    </div>
  );
}
