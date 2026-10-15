"use client";

import { motion } from "motion/react";

/**
 * A section headline that settles into place once, the first time it scrolls into view. With
 * reduced motion it only fades (MotionConfig in providers.tsx); without JavaScript it is shown
 * as is (the noscript rule in the root layout).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
