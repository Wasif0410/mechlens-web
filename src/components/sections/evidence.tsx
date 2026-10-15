"use client";

import { type MotionValue, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
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
            <dt className="text-ash/80">{key}</dt>
            <dd className="text-bone [text-shadow:0_1px_0_rgb(0_0_0/0.6),0_-1px_0_rgb(255_255_255/0.08)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The part, recognised on the real engine bay: a close crop with the outline locked on. */
function PartCrop() {
  return (
    <div className="relative aspect-[4/3] w-full max-w-[22rem] overflow-hidden rounded-md bg-steel">
      {/* The air filter box spans x 76–93% and y 16–46% of the photo; scale around its centre. */}
      <Image
        src={engineBay}
        alt=""
        fill
        sizes="22rem"
        className="origin-[84.5%_31%] scale-[2.6] object-cover object-[84.5%_31%] brightness-75"
      />
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden="true">
        <path
          d="M110 95V60H145M255 60H290V95M290 205V240H255M145 240H110V205"
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
      <p className="text-[11px] font-semibold tracking-[0.16em] text-night/60">SERVICE RECORD</p>
      <dl className="mt-4 divide-y divide-night/10 border-y border-night/10 text-[13px]">
        {fields.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[6.5rem_1fr] py-2">
            <dt className="text-night/55">{key}</dt>
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
    body: "Answers are tied to the year, make, model and engine, so information for a different variant stays out of yours.",
    object: () => <VehiclePlate />,
  },
  {
    title: "The part in front of you",
    body: "The camera recognises what you’re looking at. When it can’t tell, it asks for a better view instead of guessing.",
    object: () => <PartCrop />,
  },
  {
    title: "A reviewed record",
    body: "Specs, capacities and part numbers are drawn only from service information reviewed for that vehicle, never estimated.",
    object: (stamped: boolean) => <ServiceRecord stamped={stamped} />,
  },
  {
    title: "An answer you can check",
    body: "You hear the answer and see where it came from. If any link in the chain is missing, MechLens says so.",
    object: () => <Outcomes />,
  },
];

function Node({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const at = (index + 0.35) / steps.length;
  const fill = useTransform(progress, [at - 0.02, at + 0.02], ["rgba(255, 255, 255, 0.15)", "rgba(242, 183, 5, 1)"]);
  return (
    <motion.span
      aria-hidden="true"
      style={{ backgroundColor: fill }}
      className="absolute top-1.5 left-[calc(-2rem-5px)] size-[11px] rounded-full ring-4 ring-night lg:left-1/2 lg:-translate-x-1/2"
    />
  );
}

export function Evidence() {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.6", "end 0.6"] });
  const finished = useTransform(scrollYProgress, () => 1);
  const progress = reduced ? finished : scrollYProgress;
  const spine = useTransform(progress, [0, 1], [0, 1]);
  const [reached, setReached] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setReached(Math.floor(value * steps.length + 0.65));
  });
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

        <ol ref={ref} className="relative mt-24 space-y-24 pl-8 sm:mt-32 lg:space-y-32 lg:pl-0">
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
                <Node index={index} progress={progress} />
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
      </div>
    </section>
  );
}
