"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import engineBay from "@/assets/engine-bay.jpg";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/* --- The objects at each step ------------------------------------------------------------------ */

/** A stamped vehicle plate: the exact vehicle every answer is tied to. */
function VehiclePlate() {
  const rows = [
    ["MAKE", "NISSAN"],
    ["MODEL", "SUNNY N16"],
    ["YEAR", "2011"],
    ["ENGINE", "QG13DE  1.3 L"],
  ];
  return (
    <div className="relative w-full max-w-[22rem] rounded-md bg-[linear-gradient(135deg,#3a3e44_0%,#24272c_45%,#30343a_100%)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_24px_48px_-24px_rgb(0_0_0/0.8)]">
      {[
        "top-2.5 left-2.5",
        "top-2.5 right-2.5",
        "bottom-2.5 left-2.5",
        "bottom-2.5 right-2.5",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`absolute ${pos} size-2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#9aa0a6,#3a3e44)]`}
        />
      ))}
      <dl className="grid grid-cols-[5.5rem_1fr] gap-y-2.5 font-mono text-[13px] tracking-[0.12em]">
        {rows.map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-ash">{key}</dt>
            <dd className="text-bone [text-shadow:0_1px_0_rgb(0_0_0/0.6),0_-1px_0_rgb(255_255_255/0.08)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The part, recognized on the real engine bay: a close crop with the outline locked on. */
function PartCrop() {
  return (
    <div className="relative aspect-[4/3] w-full max-w-[22rem] overflow-hidden rounded-md bg-steel">
      {/*
        The air filter box is centred at (1082, 222) in the 1280 × 720 photo. Covering this 4:3 frame
        with the photo aligned right puts it at 79.4% across and 30.9% down; the transform moves that
        point to the centre and zooms in around it (2.6× is the least zoom that still fills the frame).
      */}
      <Image
        src={engineBay}
        alt=""
        fill
        sizes="(max-width: 640px) 240vw, 920px"
        className="origin-[79.4%_30.9%] translate-x-[-29.4%] translate-y-[19.1%] scale-[2.6] object-cover object-[100%_31%] brightness-75"
      />
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden="true">
        <path
          d="M100 90V50H140M260 50H300V90M300 210V250H260M140 250H100V210"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={3}
        />
      </svg>
      <p className="absolute bottom-3 left-3 font-mono text-[11px] tracking-[0.08em] text-signal">AIR FILTER HOUSING</p>
    </div>
  );
}

/** A reviewed service record, stamped once the step is reached. */
function ServiceRecord({ stamped }: { stamped: boolean }) {
  const fields = [
    ["Component", "Air filter housing"],
    ["Applies to", "Nissan Sunny N16, QG13DE"],
    ["Source", "Service information"],
    ["Reviewed", "Before use"],
  ];
  return (
    <div className="relative w-full max-w-[22rem] rounded-md bg-[#e9e5dc] px-6 pt-5 pb-6 text-night shadow-[0_24px_48px_-24px_rgb(0_0_0/0.8)]">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-night/70">SERVICE RECORD</p>
      <dl className="mt-4 divide-y divide-night/10 border-y border-night/10 text-[13px]">
        {fields.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[6.5rem_1fr] py-2">
            <dt className="text-night/70">{key}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <motion.p
        aria-hidden="true"
        initial={false}
        animate={stamped ? { opacity: 1, scale: 1, rotate: -9 } : { opacity: 0, scale: 1.6, rotate: -2 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="absolute -right-3 -bottom-4 rounded-md border-2 border-[#b07f00] bg-[#e9e5dc]/80 px-3 py-1 text-sm font-bold tracking-[0.18em] text-[#8a6400]"
      >
        REVIEWED
      </motion.p>
    </div>
  );
}

/** The two ways it can end: an answer with its source, or a plain "not sure". */
function Outcomes() {
  return (
    <div className="grid w-full max-w-[26rem] gap-3">
      <div className="border-l-2 border-signal bg-night/70 py-3 pr-4 pl-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-signal">AIR FILTER HOUSING</p>
        <p className="mt-2 text-[15px] leading-snug text-bone">
          Intake air passes through the filter inside it before it reaches the engine.
        </p>
        <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-ash">SOURCE: SERVICE INFORMATION</p>
      </div>
      <p className="px-1 text-xs text-ash">or, when the record or the view isn’t clear enough</p>
      <div className="border-l-2 border-dashed border-white/35 bg-night/70 py-3 pr-4 pl-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-bone/80">NOT SURE</p>
        <p className="mt-2 text-[15px] leading-snug text-bone">Move closer so I can see the part.</p>
      </div>
    </div>
  );
}

/* --- The chain ---------------------------------------------------------------------------------- */

const steps = [
  {
    title: "The exact vehicle",
    body: "Every answer will be tied to the year, make, model and engine, so information for a different variant stays out of yours.",
    object: () => <VehiclePlate />,
  },
  {
    title: "The part in front of you",
    body: "The camera is designed to recognize what you’re looking at. When it can’t tell, it will ask for a better view instead of guessing.",
    object: () => <PartCrop />,
  },
  {
    title: "A reviewed record",
    body: "Specs, capacities and part numbers will come only from service information reviewed for that vehicle, never from an estimate.",
    object: (stamped: boolean) => <ServiceRecord stamped={stamped} />,
  },
  {
    title: "An answer you can check",
    body: "You’ll hear the answer and see where it came from. If any link in the chain is missing, MechLens will say so.",
    object: () => <Outcomes />,
  },
];

/** The line the spine is drawn to, as a fraction of the screen height from the top. */
const READING_LINE = 0.6;

/**
 * A step's node on the spine. It lights as the reading line crosses it, which is the moment the
 * drawn spine reaches it, and reports that so the step's object can react.
 */
function Node({ reduced, onReached }: { reduced: boolean; onReached: (reached: boolean) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${READING_LINE}`, `end ${READING_LINE}`] });
  const fill = useTransform(scrollYProgress, [0, 1], ["rgba(255, 255, 255, 0.15)", "rgba(242, 183, 5, 1)"]);
  useMotionValueEvent(scrollYProgress, "change", (value) => onReached(value >= 0.5));
  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      style={{ backgroundColor: reduced ? "rgb(242, 183, 5)" : fill }}
      className="absolute top-1.5 left-[calc(-2rem-5px)] size-[11px] rounded-full ring-4 ring-night lg:left-1/2 lg:-translate-x-1/2"
    />
  );
}

export function Evidence() {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${READING_LINE}`, `end ${READING_LINE}`] });
  const finished = useTransform(scrollYProgress, () => 1);
  const spine = reduced ? finished : scrollYProgress;
  // How many steps the spine has reached, counted from the top.
  const [reached, setReached] = useState(0);
  const stepsReached = reduced ? steps.length : reached;

  return (
    <section id="trust" aria-labelledby="trust-title" className="relative overflow-x-clip py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl lg:text-center">
          <Reveal>
            <h2 id="trust-title" className="display-lg">
              Verified answers, or a clear “not sure.”
            </h2>
          </Reveal>
          <p className="lead mx-auto mt-7 max-w-[34rem]">
            In a repair bay, a confident wrong answer costs more than no answer. MechLens is designed
            to build every answer from a chain you can check.
          </p>
        </div>

        {/* Gaps rather than margins between the steps, so the absolutely placed spine spans the whole list. */}
        <ol ref={ref} className="relative mt-24 flex flex-col gap-24 pl-8 sm:mt-32 lg:gap-32 lg:pl-0">
          {/* The spine: faint in full, drawn amber as you scroll. */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-0 w-px bg-white/10 lg:left-1/2" />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: spine }}
            className="absolute top-2 bottom-2 left-0 w-px origin-top bg-signal lg:left-1/2"
          />
          {steps.map((step, index) => {
            const flip = index % 2 === 1;
            return (
              <li key={step.title} className="relative grid gap-8 lg:grid-cols-2 lg:gap-24">
                <Node
                  reduced={reduced}
                  onReached={(isReached) =>
                    setReached((count) => (isReached ? Math.max(count, index + 1) : Math.min(count, index)))
                  }
                />
                <div className={`lg:pt-0 ${flip ? "lg:order-2 lg:pl-0" : "lg:text-right"}`}>
                  <p className="text-sm text-ash tabular-nums">Step {index + 1} of {steps.length}</p>
                  <h3 className="mt-2 text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-normal tracking-[-0.02em]">{step.title}</h3>
                  <p className={`lead mt-3 max-w-[26rem] ${flip ? "" : "lg:ml-auto"}`}>{step.body}</p>
                </div>
                <div className={`flex ${flip ? "lg:order-1 lg:justify-end" : ""}`}>
                  {step.object(stepsReached > index)}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-20 text-sm text-ash lg:text-center">
          An illustration: the vehicle, record and answers shown are examples.
        </p>
      </div>
    </section>
  );
}
