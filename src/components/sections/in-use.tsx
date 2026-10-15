"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Shot } from "@/components/shot";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * The heads-up view, played as a short loop: the question, the outline locking onto the part,
 * then the answer. Coordinates are in the engine bay photo's own 1280 × 720 pixels; the outline
 * follows the hand annotation of the air filter box (975, 115 to 1190, 330).
 */
const PART = { x: 975, y: 115, w: 215, h: 215 };

type Phase = 0 | 1 | 2 | 3; // 0 looking, 1 asked, 2 locked on, 3 answered

const PHASE_TIMES: Record<Phase, number> = { 0: 900, 1: 1500, 2: 1300, 3: 4200 };

/** The timeline under the view: each step lasts as long as the phases it covers. */
const steps = [
  { title: "Look at the part", body: "The camera sees what you see.", duration: PHASE_TIMES[0] },
  { title: "Press and ask", body: "In plain words, hands on the car.", duration: PHASE_TIMES[1] },
  { title: "Get the answer", body: "For the exact vehicle, with its source.", duration: PHASE_TIMES[2] + PHASE_TIMES[3] },
];

/** Steps through the phases while the view is on screen; `cycle` counts completed loops. */
function useLoop(active: boolean, reduced: boolean): { phase: Phase; cycle: number } {
  const [state, setState] = useState<{ phase: Phase; cycle: number }>({ phase: 0, cycle: 0 });
  useEffect(() => {
    if (reduced || !active) return;
    const timer = window.setTimeout(
      () =>
        setState(({ phase, cycle }) =>
          phase === 3 ? { phase: 0, cycle: cycle + 1 } : { phase: (phase + 1) as Phase, cycle },
        ),
      PHASE_TIMES[state.phase],
    );
    return () => window.clearTimeout(timer);
  }, [state.phase, active, reduced]);
  return reduced ? { phase: 3, cycle: 0 } : state;
}

/** Corner brackets around the part. Starts loose and wide, then locks on. */
function Brackets({ locked }: { locked: boolean }) {
  const len = 34;
  const pad = locked ? 0 : 60;
  const x0 = PART.x - pad;
  const y0 = PART.y - pad;
  const x1 = PART.x + PART.w + pad;
  const y1 = PART.y + PART.h + pad;
  const d = [
    `M${x0} ${y0 + len}V${y0}H${x0 + len}`,
    `M${x1 - len} ${y0}H${x1}V${y0 + len}`,
    `M${x1} ${y1 - len}V${y1}H${x1 - len}`,
    `M${x0 + len} ${y1}H${x0}V${y1 - len}`,
  ].join("");
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--color-signal)"
      strokeWidth={4}
      initial={false}
      animate={{ d, opacity: locked ? 1 : 0.55 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

export function InUse() {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { margin: "-20% 0px -20% 0px" });
  const reduced = usePrefersReducedMotion();
  const { phase, cycle } = useLoop(inView, reduced);
  // Idle: look. Asked: ask. Locked on and answered: the answer.
  const stepIndex = Math.min(phase, 2);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="py-32 sm:py-40">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,28rem)] md:items-end">
          <Reveal>
            <h2 id="how-title" className="display-lg max-w-[13ch]">
              It sees what you see.
            </h2>
          </Reveal>
          <p className="lead">
            Look at a part, press the button and ask. MechLens is designed to outline what you’re
            looking at and answer for the vehicle in front of you.
          </p>
        </div>

        <figure className="mt-16 sm:mt-20">
          <div ref={frameRef} className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-steel">
            <div className="absolute inset-0 animate-slow-zoom">
              <Shot name="pov" sizes="(max-width: 1320px) 100vw, 1320px" />
              <div className="absolute inset-0 bg-night/45" />
              <svg viewBox="0 0 1280 720" className="absolute inset-0 size-full" aria-hidden="true">
                {/* The outline searches while the question is heard, then locks onto the part. */}
                <AnimatePresence>
                  {phase >= 1 && (
                    <motion.g
                      key="lock"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Brackets locked={phase >= 2} />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
            </div>

            {/* The question, as heard. On phones it makes way for the answer. */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.p
                  key="question"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute bottom-4 left-4 max-w-[80%] rounded-full bg-night/70 px-4 py-2 text-[13px] text-bone backdrop-blur-md sm:bottom-6 sm:left-6 sm:max-w-[70%] sm:text-[15px] ${phase === 3 ? "max-sm:hidden" : ""}`}
                >
                  “What’s the black box above the battery?”
                </motion.p>
              )}
            </AnimatePresence>

            {/* The answer, in the heads-up overlay. */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-3 bottom-3 left-3 border-l-2 border-signal bg-night/80 py-2 pr-3 pl-3 backdrop-blur-md sm:top-6 sm:right-auto sm:bottom-auto sm:left-6 sm:max-w-[19rem] sm:py-3 sm:pr-4 sm:pl-4"
                >
                  <p className="font-mono text-[10px] tracking-[0.08em] text-signal sm:text-[11px]">AIR FILTER HOUSING</p>
                  <p className="mt-1 text-[13px] leading-snug text-bone sm:mt-2 sm:text-[15px]">
                    Intake air passes through the filter inside it before it reaches the engine.
                  </p>
                  <p className="mt-3 hidden font-mono text-[10px] tracking-[0.06em] text-ash sm:block">
                    SOURCE: VERIFIED SERVICE INFORMATION
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* A player-style timeline: each step fills while it plays. */}
          <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-4">
            {steps.map((step, index) => {
              const done = reduced || index < stepIndex;
              const playing = !reduced && index === stepIndex;
              return (
                <li key={step.title}>
                  <div className="h-0.5 overflow-hidden rounded-full bg-white/12" aria-hidden="true">
                    <span
                      key={playing ? `${cycle}-${index}` : `idle-${index}`}
                      style={playing ? { animation: `fill-x ${step.duration}ms linear forwards` } : undefined}
                      className={`block h-full origin-left bg-signal ${done ? "scale-x-100" : "scale-x-0"}`}
                    />
                  </div>
                  <h3
                    className={`mt-4 text-[17px] font-medium tracking-[-0.01em] transition-colors duration-300 ${index === stepIndex || reduced ? "text-bone" : "text-ash"}`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-ash">{step.body}</p>
                </li>
              );
            })}
          </ol>
          <figcaption className="mt-8 text-sm text-ash">
            An illustration of the heads-up view, drawn over a real engine bay.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
