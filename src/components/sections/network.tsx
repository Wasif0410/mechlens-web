"use client";

import { type MotionValue, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Answer, NotSure, RepairOrder, VehiclePlate } from "@/components/network/objects";
import { Reveal } from "@/components/reveal";
import { usePinning } from "@/lib/use-pinning";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const steps = [
  {
    title: "Confirmed on a real car",
    body: "A technician in the network writes up what they found and fixed: the complaint, the cause and the correction.",
  },
  {
    title: "Matched to the exact vehicle",
    body: "The record is tied to the year, model and engine, so a fix for one variant never reaches another.",
  },
  {
    title: "Reviewed before it’s used",
    body: "It’s checked against service information for that engine before MechLens can answer from it.",
  },
  {
    title: "In your line of sight",
    body: "You get the answer and where it came from. If any link is missing, MechLens says it isn’t sure.",
  },
];

/** Other engines the same model was sold with: their records stay out of this car's answers. */
const OTHER_VARIANTS = ["1.8 L 2ZR-FE", "2.0 L M20A-FKS"];

function Heading() {
  return (
    <>
      <Reveal>
        <h2 id="trust-title" className="display-lg max-w-[14ch]">
          Checked by people who fix cars.
        </h2>
      </Reveal>
      <p className="lead mt-6 max-w-[30rem]">
        MechLens is building a network of working technicians. Every answer is designed to come from
        what they’ve confirmed on real cars, matched to the exact vehicle and reviewed before MechLens
        says it.
      </p>
    </>
  );
}

function OtherVariant({ label, out }: { label: string; out: MotionValue<number> }) {
  const strike = useTransform(out, [0, 0.4], [0, 1]);
  const x = useTransform(out, [0.4, 1], [0, 40]);
  const opacity = useTransform(out, [0.4, 1], [1, 0]);
  return (
    <motion.div style={{ x, opacity }} className="relative flex items-center justify-between gap-4 rounded-md border border-white/12 bg-steel px-4 py-2.5">
      <span className="font-mono text-[11px] tracking-[0.1em] text-ash">{label}</span>
      <span className="text-[12px] text-ash">Different engine</span>
      <motion.span aria-hidden="true" style={{ scaleX: strike }} className="absolute inset-x-3 top-1/2 h-px origin-left bg-alert/70" />
    </motion.div>
  );
}

/**
 * Wide, tall screens: the section holds while one record is built up step by step, from a
 * technician's repair order to the answer in the heads-up view.
 */
function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (value) => setActive(Math.min(3, Math.max(0, Math.floor(value * 4)))));

  // Step 1: the repair order arrives and its fields fill in.
  const orderIn = useTransform(p, [0.02, 0.08], [0, 1]);
  const orderY = useTransform(p, [0.02, 0.08], [24, 0]);
  const lines = useTransform(p, [0.06, 0.22], [0, 1]);
  // Step 2: the vehicle plate docks; records for other engines are struck out and leave.
  const plateIn = useTransform(p, [0.27, 0.36], [0, 1]);
  const plateX = useTransform(p, [0.27, 0.36], [80, 0]);
  const variantsIn = useTransform(p, [0.29, 0.34], [0, 1]);
  const variantsOut = useTransform(p, [0.38, 0.48], [0, 1]);
  // Step 3: the review stamp lands; the check is noted.
  const stamp = useTransform(p, [0.52, 0.58], [0, 1]);
  const checked = useTransform(p, [0.56, 0.62], [0, 1]);
  // Step 4: the paperwork steps back and the answer comes forward.
  const recede = useTransform(p, [0.75, 0.83], [1, 0.14]);
  const recedeScale = useTransform(p, [0.75, 0.83], [1, 0.9]);
  const answerIn = useTransform(p, [0.78, 0.86], [0, 1]);
  const answerY = useTransform(p, [0.78, 0.86], [30, 0]);
  const notSure = useTransform(p, [0.88, 0.94], [0, 1]);
  const progress = useTransform(p, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative h-[440vh]">
      <div className="sticky top-0 h-svh pt-16">
        <div className="mx-auto grid h-full max-w-[1320px] grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-center gap-16 px-8 xl:gap-24">
          <div>
            <Heading />
            <ol className="relative mt-12 space-y-6 pl-6">
              <span aria-hidden="true" className="absolute top-1 bottom-1 left-0 w-px bg-white/12" />
              <motion.span aria-hidden="true" style={{ scaleY: progress }} className="absolute top-1 bottom-1 left-0 w-px origin-top bg-signal" />
              {steps.map((step, index) => (
                <li key={step.title}>
                  <p className={`text-[17px] font-medium tracking-[-0.01em] transition-colors duration-300 ${index === active ? "text-bone" : "text-ash"}`}>
                    <span className="mr-3 font-mono text-[12px] text-ash tabular-nums">{index + 1}</span>
                    {step.title}
                  </p>
                  <p className={`mt-1 overflow-hidden text-[15px] leading-relaxed text-ash transition-[max-height,opacity] duration-500 ${index === active ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* The record, built up as you scroll. */}
          <div aria-hidden="true" className="relative mx-auto h-[min(34rem,72svh)] w-full max-w-[40rem]">
            <motion.div style={{ opacity: recede, scale: recedeScale }} className="absolute inset-0 origin-top">
              <motion.div style={{ opacity: orderIn, y: orderY }} className="absolute top-[25%] left-0 w-[min(100%,30rem)]">
                <RepairOrder lines={lines} stamp={stamp} />
                <motion.p style={{ opacity: checked }} className="mt-8 flex items-center gap-2 text-[14px] text-ash">
                  <span className="size-1.5 rounded-full bg-signal" />
                  Checked against service information for the 8NR-FTS
                </motion.p>
              </motion.div>
              <motion.div style={{ opacity: plateIn, x: plateX }} className="absolute top-0 right-0 w-[min(70%,19rem)]">
                <VehiclePlate />
              </motion.div>
              <motion.div style={{ opacity: variantsIn }} className="absolute right-0 bottom-0 grid w-[min(70%,19rem)] gap-2">
                {OTHER_VARIANTS.map((label) => (
                  <OtherVariant key={label} label={label} out={variantsOut} />
                ))}
              </motion.div>
            </motion.div>
            <motion.div style={{ opacity: answerIn, y: answerY }} className="absolute top-[32%] right-0 left-[12%] grid gap-3">
              <Answer />
              <motion.div style={{ opacity: notSure }}>
                <p className="mb-2 text-[13px] text-ash">And when a link is missing:</p>
                <NotSure />
              </motion.div>
            </motion.div>
          </div>
        </div>
        <p className="absolute right-8 bottom-6 text-xs text-ash/80">An illustration: the vehicle, record and answer are examples.</p>
      </div>
    </div>
  );
}

/** Smaller screens and reduced motion: the same four steps, one after another. */
function Stacked() {
  const filled = useMotionValue(1);
  const unstamped = useMotionValue(0);
  const gone = useMotionValue(0.4);
  const objects = [
    <RepairOrder key="order" lines={filled} stamp={unstamped} />,
    <div key="match" className="grid gap-3">
      <VehiclePlate />
      {OTHER_VARIANTS.map((label) => (
        <OtherVariant key={label} label={label} out={gone} />
      ))}
    </div>,
    <RepairOrder key="reviewed" lines={filled} stamp={filled} />,
    <div key="answer" className="grid gap-3">
      <Answer />
      <p className="text-[13px] text-ash">And when a link is missing:</p>
      <NotSure />
    </div>,
  ];
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-32 sm:px-8 sm:py-40">
      <Heading />
      <ol className="mt-16 space-y-16">
        {steps.map((step, index) => (
          <li key={step.title} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-center md:gap-12">
            <div>
              <p className="font-mono text-[12px] text-ash tabular-nums">{index + 1}</p>
              <h3 className="mt-2 text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-normal tracking-[-0.02em]">{step.title}</h3>
              <p className="lead mt-3 max-w-[28rem]">{step.body}</p>
            </div>
            <div aria-hidden="true" className="max-w-[26rem]">{objects[index]}</div>
          </li>
        ))}
      </ol>
      <p className="mt-16 text-sm text-ash">An illustration: the vehicle, record and answer are examples.</p>
    </div>
  );
}

export function Network() {
  const reduced = usePrefersReducedMotion();
  const pinning = usePinning();
  return (
    <section id="trust" aria-labelledby="trust-title" className="relative overflow-x-clip">
      {pinning && !reduced ? <Pinned /> : <Stacked />}
    </section>
  );
}
