"use client";

import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PauseButton } from "@/components/pause-button";
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

/**
 * Steps through the phases while `active` (on screen and not paused); `cycle` counts completed
 * loops. Stopping keeps the time left in the current phase, so the loop resumes where it was.
 */
function useLoop(active: boolean, reduced: boolean): { phase: Phase; cycle: number } {
  const [state, setState] = useState<{ phase: Phase; cycle: number }>({ phase: 0, cycle: 0 });
  const timingRef = useRef({ key: "", remaining: 0 });
  useEffect(() => {
    if (reduced || !active) return;
    const key = `${state.cycle}-${state.phase}`;
    if (timingRef.current.key !== key) timingRef.current = { key, remaining: PHASE_TIMES[state.phase] };
    const started = performance.now();
    let fired = false;
    const timer = window.setTimeout(() => {
      fired = true;
      setState(({ phase, cycle }) =>
        phase === 3 ? { phase: 0, cycle: cycle + 1 } : { phase: (phase + 1) as Phase, cycle },
      );
    }, timingRef.current.remaining);
    return () => {
      window.clearTimeout(timer);
      if (!fired) timingRef.current.remaining = Math.max(0, timingRef.current.remaining - (performance.now() - started));
    };
  }, [state.phase, state.cycle, active, reduced]);
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

/**
 * The timeline: the current step's bar fills over the step's duration. It holds while the loop is
 * stopped and carries on when it resumes, in step with the loop's timer.
 */
function Timeline({
  stepIndex,
  cycle,
  playing,
  reduced,
  className,
}: {
  stepIndex: number;
  cycle: number;
  playing: boolean;
  reduced: boolean;
  className: string;
}) {
  return (
    <ol className={className}>
      {steps.map((step, index) => {
        const done = reduced || index < stepIndex;
        const filling = !reduced && index === stepIndex;
        return (
          <li key={step.title}>
            <div className="h-0.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
              {/*
                No scale class while filling: Tailwind's scale utilities set the `scale` property,
                which would multiply the animated transform and hold the bar at zero.
              */}
              <span
                key={`${cycle}-${index}`}
                style={
                  filling
                    ? { animation: `fill-x ${step.duration}ms linear forwards`, animationPlayState: playing ? "running" : "paused" }
                    : undefined
                }
                className={`block h-full origin-left bg-signal ${filling ? "" : done ? "scale-x-100" : "scale-x-0"}`}
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
  );
}

export function InUse() {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { margin: "-20% 0px -20% 0px" });
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const playing = inView && !paused;
  const { phase, cycle } = useLoop(playing, reduced);
  // Idle: look. Asked: ask. Locked on and answered: the answer.
  const stepIndex = Math.min(phase, 2);
  // The view opens out from a framed picture to the full width of the screen as it scrolls in.
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "start 0.12"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [24, 0]);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="overflow-x-clip py-32 sm:py-40">
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
      </div>

      <figure className="mt-16 sm:mt-20">
        {/* Full width, but never taller than the screen. */}
        <div ref={frameRef} className="mx-auto w-full max-w-[calc(100svh*16/9)]">
          <motion.div
            style={reduced ? undefined : { scale, borderRadius }}
            className="relative aspect-[16/9] overflow-hidden bg-steel"
          >
            <div className={`absolute inset-0 animate-slow-zoom ${playing ? "" : "[animation-play-state:paused]"}`}>
              <Shot name="pov" sizes="100vw" />
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
                  className={`absolute bottom-4 left-4 max-w-[80%] rounded-full bg-night/70 px-4 py-2 text-[13px] text-bone backdrop-blur-md sm:bottom-6 sm:left-6 sm:max-w-[70%] lg:bottom-40 lg:left-8 sm:text-[15px] ${phase === 3 ? "max-sm:hidden" : ""}`}
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
                  className="absolute right-3 bottom-3 left-3 border-l-2 border-signal bg-night/80 py-2 pr-3 pl-3 backdrop-blur-md sm:top-8 sm:right-auto sm:bottom-auto sm:left-8 sm:max-w-[19rem] sm:py-3 sm:pr-4 sm:pl-4"
                >
                  <p className="font-mono text-[10px] tracking-[0.08em] text-signal sm:text-[11px]">AIR FILTER HOUSING</p>
                  <p className="mt-1 text-[13px] leading-snug text-bone sm:mt-2 sm:text-[15px]">
                    Intake air passes through the filter inside it before it reaches the engine.
                  </p>
                  <p className="mt-3 hidden font-mono text-[10px] tracking-[0.06em] text-ash sm:block">
                    SOURCE: SERVICE INFORMATION
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* On wide screens, the timeline and the pause control sit in the view, like a player's controls. */}
            <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-night/90 via-night/60 to-transparent px-8 pt-20 pb-7 lg:block">
              <div className="mx-auto flex max-w-[1256px] items-end gap-8">
                <Timeline
                  stepIndex={stepIndex}
                  cycle={cycle}
                  playing={playing}
                  reduced={reduced}
                  className="grid flex-1 grid-cols-3 gap-6"
                />
                {!reduced && (
                  <PauseButton paused={paused} onToggle={() => setPaused((value) => !value)} label="the demo" className="mb-1" />
                )}
              </div>
            </div>
            {!reduced && (
              <PauseButton
                paused={paused}
                onToggle={() => setPaused((value) => !value)}
                label="the demo"
                className="absolute top-3 right-3 lg:hidden"
              />
            )}
          </motion.div>
        </div>
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          {/* Below that, it sits under the view. */}
          <Timeline
            stepIndex={stepIndex}
            cycle={cycle}
            playing={playing}
            reduced={reduced}
            className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-4 lg:hidden"
          />
          <figcaption className="mt-8 text-sm text-ash">
            An illustration of the heads-up view, drawn over a real engine bay.
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
