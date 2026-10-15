"use client";

import { type MotionValue, motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Lock } from "@/components/lens/hud";
import { OnPhoto, PhotoFrame } from "@/components/lens/photo-frame";
import { type Box, photos } from "@/components/lens/photos";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { preselectRole } from "@/lib/waitlist";

type Placement = "left" | "above";

/**
 * A real repair shop, with the heads-up view marking who MechLens is for: the technician at the
 * car, the senior technician at the engine on the hoist, and, framing the whole floor, the manager
 * responsible for every bay. Boxes are in the shop photo's coordinates (1000 units wide).
 */
const roles: Array<{ role: string; line: string; box: Box; placement: Placement }> = [
  {
    role: "Apprentices",
    line: "Take on unfamiliar jobs, with the answer at the car.",
    box: { x: 285, y: 318, w: 205, h: 62 },
    // To the left, over the tool cart: to the right it would meet the hoisted engine's frame.
    placement: "left",
  },
  {
    role: "Senior technicians",
    line: "Spend less time answering routine questions and more on the hard problems.",
    box: { x: 618, y: 212, w: 192, h: 140 },
    placement: "above",
  },
  {
    role: "Service managers",
    line: "One standard of information in every bay, for every car.",
    // The whole floor, inside the photo's edges.
    box: { x: 40, y: 150, w: 920, h: 470 },
    placement: "left",
  },
];

/** When each role's mark appears, through the photo's pass across the screen. */
const markAt = (index: number) => 0.2 + index * 0.13;

function Callout({ role, line, className, style }: { role: string; line: string; className: string; style: { opacity: MotionValue<number> } }) {
  return (
    <motion.div aria-hidden="true" style={style} className={`absolute hidden md:block ${className}`}>
      <span className="block w-[16rem] border-l-2 border-signal bg-night/80 px-4 py-3 backdrop-blur-md">
        <span className="block font-mono text-[11px] tracking-[0.1em] text-signal uppercase">{role}</span>
        <span className="mt-1.5 block text-[14px] leading-snug text-bone">{line}</span>
      </span>
    </motion.div>
  );
}

function RoleMark({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const start = markAt(index);
  const opacity = useTransform(progress, [start, start + 0.05], [0, 1]);
  const lock = useTransform(progress, [start, start + 0.1], [0, 1]);
  const { role, line, box, placement } = roles[index];
  const whole = index === roles.length - 1;
  return (
    <OnPhoto box={box} aspect={photos.shop.aspect}>
      <Lock lock={lock} opacity={opacity} />
      {whole ? (
        // The manager's view is the floor itself: the callout sits inside the frame, top left.
        <Callout role={role} line={line} style={{ opacity }} className="top-6 left-6" />
      ) : placement === "left" ? (
        <Callout role={role} line={line} style={{ opacity }} className="top-1/2 right-full mr-5 -translate-y-1/2" />
      ) : (
        <Callout role={role} line={line} style={{ opacity }} className="right-0 bottom-full mb-5" />
      )}
      {/* On phones, numbered marks; the list under the photo says what they mean. */}
      {/* The floor-wide frame runs off a phone's screen at the sides, so its number sits at the top centre. */}
      <motion.span
        aria-hidden="true"
        style={{ opacity }}
        className={`absolute -top-3 flex size-6 items-center justify-center rounded-full bg-signal font-mono text-[11px] text-night md:hidden ${whole ? "left-1/2 -translate-x-1/2" : "-left-3"}`}
      >
        {index + 1}
      </motion.span>
    </OnPhoto>
  );
}

export function Shops() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // From the photo's top entering the screen to its bottom leaving: a slow push in, marks one by one.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const settled = useMotionValue(1);
  const progress = reduced ? settled : scrollYProgress;
  const zoom = useTransform(progress, [0, 1], [1.12, 1]);

  return (
    <section id="shops" aria-labelledby="shops-title" className="relative overflow-x-clip pt-32 sm:pt-44">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-24">
        <Reveal>
          <h2 id="shops-title" className="display-lg max-w-[13ch]">
            Built for the whole service floor.
          </h2>
        </Reveal>
        <div>
          <p className="lead">
            For dealership service departments, independent shops and technician schools. Tell us
            about your team and we’ll follow up about a pilot.
          </p>
          <a href="#waitlist" {...preselectRole("shop")} className="button-primary mt-8">
            Talk to us about a pilot
          </a>
        </div>
      </div>

      <figure className="mt-20 sm:mt-24">
        <div ref={ref} className="relative aspect-[4/5] overflow-hidden [container-type:size] sm:aspect-[16/10] lg:aspect-[16/8]">
          {/* On phones the 4:5 frame draws the photo about 1.9 times the screen's width. */}
          <PhotoFrame photo={photos.shop} fx={0.47} fy={0.48} zoom={reduced ? 1 : zoom} sizes="(max-width: 639px) 190vw, 100vw">
            <div className="absolute inset-0 bg-night/25" />
            {roles.map((item, index) => (
              <RoleMark key={item.role} index={index} progress={progress} />
            ))}
          </PhotoFrame>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-night to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night to-transparent" />
        </div>
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          {/* What the marks say, as text: shown on phones, and for screen readers everywhere. */}
          <ol className="mt-8 grid gap-6 md:sr-only">
            {roles.map((item, index) => (
              <li key={item.role} className="flex gap-4">
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-signal font-mono text-[11px] text-night">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-[17px] font-medium tracking-[-0.01em]">{item.role}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-ash">{item.line}</span>
                </span>
              </li>
            ))}
          </ol>
          <figcaption className="mt-8 text-sm text-ash">
            An illustration of what MechLens is designed to do for each role, drawn over a real shop.
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
