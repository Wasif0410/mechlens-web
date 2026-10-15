"use client";

import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type Point = { x: number; y: number };

/**
 * A job drawn as a route: from the car on the lift to the job done, with a detour for every
 * question. Two layouts of the same drawing: horizontal on wide screens, vertical on phones.
 * Coordinates are in each layout's viewBox; label positions are the detours' apexes.
 */
type Layout = {
  viewBox: { width: number; height: number };
  route: string;
  direct: string;
  start: Point;
  end: Point;
  apexes: [Point, Point, Point];
  /** Where along the drawn route each apex falls, 0 to 1. */
  reachAt: [number, number, number];
};

const wide: Layout = {
  viewBox: { width: 1200, height: 440 },
  route: "M40 330 H200 C200 130 340 130 340 330 H520 C520 90 680 90 680 330 H860 C860 150 1000 150 1000 330 H1160",
  direct: "M40 330 H1160",
  start: { x: 40, y: 330 },
  end: { x: 1160, y: 330 },
  apexes: [
    { x: 270, y: 180 },
    { x: 600, y: 150 },
    { x: 930, y: 195 },
  ],
  reachAt: [0.2, 0.5, 0.8],
};

const narrow: Layout = {
  viewBox: { width: 360, height: 900 },
  route: "M40 40 V150 C210 150 210 290 40 290 V410 C225 410 225 570 40 570 V690 C200 690 200 820 40 820 V870",
  direct: "M40 40 V870",
  start: { x: 40, y: 40 },
  end: { x: 40, y: 870 },
  apexes: [
    { x: 168, y: 220 },
    { x: 179, y: 490 },
    { x: 160, y: 755 },
  ],
  reachAt: [0.22, 0.52, 0.8],
};

const detours = [
  { title: "Search the manual", question: "Which coolant does this engine take?" },
  { title: "Ask a senior technician", question: "Where’s the cam sensor on this one?" },
  { title: "Find a video", question: "Is this the upstream O2 sensor?" },
];

/** The route draws over the first 65% of the scroll, then the direct line; the end holds. */
const ROUTE_END = 0.65;

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function DetourLabel({
  layout,
  index,
  progress,
  side,
}: {
  layout: Layout;
  index: number;
  progress: MotionValue<number>;
  side: "above" | "right";
}) {
  const at = layout.reachAt[index] * ROUTE_END;
  const opacity = useTransform(progress, [at - 0.04, at + 0.02], [0, 1]);
  const y = useTransform(progress, [at - 0.04, at + 0.02], [8, 0]);
  const apex = layout.apexes[index];
  const detour = detours[index];
  return (
    <motion.div
      style={{ left: pct(apex.x, layout.viewBox.width), top: pct(apex.y, layout.viewBox.height), opacity, y }}
      className={`absolute w-max ${side === "above" ? "max-w-[13rem] -translate-x-1/2 -translate-y-[calc(100%+18px)] text-center" : "max-w-[8.75rem] translate-x-3 -translate-y-1/2"}`}
    >
      <p className="text-[15px] font-medium text-bone sm:text-base">{detour.title}</p>
      <p className="mt-1 text-[13px] leading-snug text-ash sm:text-sm">“{detour.question}”</p>
    </motion.div>
  );
}

function Route({ layout, progress, className, side }: { layout: Layout; progress: MotionValue<number>; className: string; side: "above" | "right" }) {
  const routeLength = useTransform(progress, [0.02, ROUTE_END], [0, 1]);
  const directLength = useTransform(progress, [ROUTE_END + 0.03, 0.88], [0, 1]);
  const directLabel = useTransform(progress, [0.84, 0.92], [0, 1]);
  // Once the direct line arrives, the detours step back.
  const routeDim = useTransform(progress, [ROUTE_END + 0.03, 0.88], [1, 0.4]);
  const { width, height } = layout.viewBox;
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        {/* The route as it really goes: faint in full, drawn bright as you scroll. */}
        <path d={layout.route} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={2} />
        <motion.path
          d={layout.route}
          fill="none"
          stroke="rgb(236 233 226 / 0.55)"
          strokeWidth={2}
          style={{ pathLength: routeLength, opacity: routeDim }}
        />
        {layout.apexes.map((apex) => (
          <circle key={apex.x} cx={apex.x} cy={apex.y} r={4} fill="var(--color-night)" stroke="rgb(236 233 226 / 0.55)" strokeWidth={2} />
        ))}
        {/* The job with the answer in your line of sight: straight through. */}
        <motion.path
          d={layout.direct}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ pathLength: directLength, filter: "drop-shadow(0 0 6px rgb(242 183 5 / 0.55))" }}
        />
        <circle cx={layout.start.x} cy={layout.start.y} r={6} fill="var(--color-bone)" />
        <circle cx={layout.end.x} cy={layout.end.y} r={6} fill="var(--color-bone)" />
      </svg>

      {detours.map((detour, index) => (
        <DetourLabel key={detour.title} layout={layout} index={index} progress={progress} side={side} />
      ))}

      <p
        style={{ left: pct(layout.start.x, width), top: pct(layout.start.y, height) }}
        className={`absolute text-sm whitespace-nowrap text-ash ${side === "above" ? "translate-y-5" : "translate-x-4 -translate-y-1/2"}`}
      >
        Car on the lift
      </p>
      <p
        style={{ left: pct(layout.end.x, width), top: pct(layout.end.y, height) }}
        className={`absolute text-sm whitespace-nowrap text-ash ${side === "above" ? "-translate-x-full translate-y-5" : "translate-x-4 -translate-y-1/2"}`}
      >
        Job done
      </p>
      <motion.p
        style={{
          left: pct(side === "above" ? width / 2 : layout.end.x, width),
          top: pct(layout.end.y, height),
          opacity: directLabel,
        }}
        className={`absolute text-sm font-medium text-signal ${side === "above" ? "-translate-x-1/2 translate-y-5" : "max-w-[16rem] translate-x-4 translate-y-4"}`}
      >
        With MechLens: the answer comes to the car
      </motion.p>
    </div>
  );
}

export function Problem() {
  const wideRef = useRef<HTMLElement>(null);
  const narrowRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // Wide screens: the section pins and the route draws in place as you scroll through it.
  const { scrollYProgress: wideProgress } = useScroll({ target: wideRef, offset: ["start start", "end end"] });
  // Phones: the vertical route draws as it passes through the screen.
  const { scrollYProgress: narrowProgress } = useScroll({ target: narrowRef, offset: ["start 0.8", "end 0.55"] });
  const finished = useTransform(wideProgress, () => 1);

  return (
    <section
      ref={wideRef}
      aria-labelledby="problem-title"
      className={`relative ${reduced ? "" : "md:h-[260vh]"}`}
    >
      <div
        className={`overflow-hidden py-32 sm:py-40 ${reduced ? "" : "md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center md:py-0"}`}
      >
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end">
            <Reveal>
              <h2 id="problem-title" className="display-lg max-w-[14ch]">
                Every job stops for a question.
              </h2>
            </Reveal>
            <p className="lead">
              A part you don’t recognise, a spec you can’t remember, a variant you’re not sure of.
              Each answer means a detour away from the car.
            </p>
          </div>

          <div className="mt-16 md:mt-[clamp(3rem,9vh,6rem)]">
            <Route layout={wide} progress={reduced ? finished : wideProgress} side="above" className="hidden md:block" />
            <div ref={narrowRef} className="md:hidden">
              <Route layout={narrow} progress={reduced ? finished : narrowProgress} side="right" className="mx-auto max-w-[360px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
