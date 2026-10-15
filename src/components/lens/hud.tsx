"use client";

import { type MotionValue, motion, useTransform } from "motion/react";

/**
 * Corner brackets around a part, in the amber of the heads-up overlay. `lock` runs from 0 (loose,
 * searching) to 1 (locked onto the part); place inside an OnPhoto box.
 */
export function Lock({ lock, opacity }: { lock: MotionValue<number>; opacity: MotionValue<number> }) {
  const out = useTransform(lock, [0, 1], [26, 0]);
  const back = useTransform(out, (value) => -value);
  const corner = "absolute size-4 border-signal sm:size-5";
  return (
    <motion.div aria-hidden="true" style={{ opacity }} className="absolute inset-0 drop-shadow-[0_0_6px_rgb(0_0_0/0.7)]">
      <motion.span style={{ x: back, y: back }} className={`${corner} top-0 left-0 border-t-2 border-l-2`} />
      <motion.span style={{ x: out, y: back }} className={`${corner} top-0 right-0 border-t-2 border-r-2`} />
      <motion.span style={{ x: out, y: out }} className={`${corner} right-0 bottom-0 border-r-2 border-b-2`} />
      <motion.span style={{ x: back, y: out }} className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
    </motion.div>
  );
}

/** A part's name beside it, joined by a short line, like the labels in the product scene. */
export function Tag({ label, side, opacity }: { label: string; side: "left" | "right"; opacity: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap max-sm:hidden drop-shadow-[0_0_6px_rgb(0_0_0/0.9)] ${side === "right" ? "left-full ml-3" : "right-full mr-3 flex-row-reverse"}`}
    >
      <span className="h-px w-6 bg-signal/80 sm:w-8" />
      <span className="font-mono text-[10px] tracking-[0.1em] text-signal sm:text-[11px]">{label}</span>
    </motion.div>
  );
}

/** The dark glass the heads-up panels sit on. */
export const glass = "bg-night/75 backdrop-blur-md";
