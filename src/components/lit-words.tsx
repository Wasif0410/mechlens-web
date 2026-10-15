"use client";

import { type MotionValue, motion, useTransform } from "motion/react";

function Word({ word, progress, from, to }: { word: string; progress: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(progress, [from, to], [0.18, 1]);
  return <motion.span style={{ opacity }}>{word}</motion.span>;
}

/**
 * Text whose words light up one after another as `progress` moves through `range`, so it reads at
 * the pace you scroll. Words stay real text separated by spaces, so it reads normally to screen
 * readers; without JavaScript a rule in the layout shows it fully lit.
 */
export function LitWords({ text, progress, range }: { text: string; progress: MotionValue<number>; range: [number, number] }) {
  const words = text.split(" ");
  const step = (range[1] - range[0]) / words.length;
  return (
    <span data-lit="">
      {words.map((word, index) => (
        <span key={index}>
          <Word word={word} progress={progress} from={range[0] + index * step} to={range[0] + (index + 1) * step} />
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
