"use client";

import { motion, type MotionValue, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const text =
  "Every car on the lift is a different combination of model, year and engine, and the answer that’s right for one can be wrong for the next. MechLens is building the way technicians get the right one: in their line of sight, for the exact vehicle, without putting the tools down.";

const words = text.split(" ");

/** One word, lit as the reading position passes it. */
function Word({ word, index, progress }: { word: string; index: number; progress: MotionValue<number> }) {
  const start = index / words.length;
  const opacity = useTransform(progress, [start, start + 1 / words.length], [0.16, 1]);
  return <motion.span style={{ opacity }}>{word}</motion.span>;
}

/**
 * The company in one statement. Its words light up as it scrolls through the screen, so it reads
 * at the pace you scroll; with reduced motion it's simply there.
 */
export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  return (
    <section aria-label="What MechLens is building" className="py-32 sm:py-48">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <p
          ref={ref}
          data-lit=""
          className="max-w-[21em] text-[clamp(1.75rem,3.3vw,3rem)] leading-[1.14] font-normal tracking-[-0.026em]"
        >
          {reduced
            ? text
            : words.map((word, index) => (
                <span key={index}>
                  <Word word={word} index={index} progress={scrollYProgress} />
                  {index < words.length - 1 ? " " : ""}
                </span>
              ))}
        </p>
      </div>
    </section>
  );
}
