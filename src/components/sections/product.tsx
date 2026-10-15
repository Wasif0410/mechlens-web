"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import product1 from "@/assets/goggles-product-1.png";
import product2 from "@/assets/goggles-product-2.png";
import product3 from "@/assets/goggles-product-3.png";
import { GogglesViewer, useWebGL } from "@/components/goggles/goggles-viewer";
import { type PartName, POSTER_SIZE } from "@/components/goggles/poster";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const beats: Array<{
  part: PartName;
  label: string;
  /** Which side of the part the label sits on. */
  side: "left" | "right";
  title: string;
  body: string;
  poster: StaticImageData;
  alt: string;
}> = [
  {
    part: "camera",
    label: "CAMERA",
    side: "right",
    title: "A camera at your brow.",
    body: "It sits where your eyes are and sees the part you’re looking at. Nothing to point, nothing to photograph.",
    poster: product1,
    alt: "The goggles from the front left, with the camera at the centre of the brow.",
  },
  {
    part: "button",
    label: "PUSH TO TALK",
    side: "left",
    title: "Your voice, one button.",
    body: "Press the button on your right temple and ask in plain words. Your hands stay on the car.",
    poster: product2,
    alt: "The goggles turned to show the amber-ringed push-to-talk button on the wearer’s right.",
  },
  {
    part: "lens",
    label: "HEADS-UP VIEW",
    side: "left",
    title: "The answer, where you’re looking.",
    body: "MechLens is designed to outline the part on the lens and answer for the exact vehicle, with the source it came from.",
    poster: product3,
    alt: "The goggles from the front, with an amber outline and two lines of answer shown on the lens.",
  },
];

const { width, height } = POSTER_SIZE.product;

/** An amber callout. Its outer element is moved to the part's screen position every frame. */
function PartLabel({
  label,
  side,
  visible,
  elementRef,
}: {
  label: string;
  side: "left" | "right";
  visible: boolean;
  elementRef: (element: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={elementRef} className="pointer-events-none absolute top-0 left-0 will-change-transform">
      <div
        className={`flex items-center gap-2 whitespace-nowrap transition-opacity duration-500 ${side === "left" ? "-translate-x-[calc(100%-6px)] flex-row-reverse" : "-translate-x-1.5"} -translate-y-1/2 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <span className="relative flex size-3 shrink-0 items-center justify-center">
          <span className="absolute size-3 rounded-full border border-signal" />
          <span className="size-1 rounded-full bg-signal" />
        </span>
        <span className="h-px w-8 bg-signal/70" />
        <span className="font-mono text-[11px] tracking-[0.1em] text-signal">{label}</span>
      </div>
    </div>
  );
}

/** Wide screens: the goggles stay pinned and turn while three short statements pass. */
function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const labelsRef = useRef<Partial<Record<PartName, HTMLElement | null>>>({});
  const webgl = useWebGL();
  const [live, setLive] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progressRef.current = value;
    setActive(Math.min(beats.length - 1, Math.max(0, Math.round(value * (beats.length - 1)))));
  });

  return (
    <div ref={ref} style={{ height: `${beats.length * 100}vh` }} className="relative hidden lg:block">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          style={{ aspectRatio: `${width} / ${height}` }}
          className="absolute top-1/2 right-[3%] w-[min(58vw,calc(80svh*4/3))] -translate-y-[46%]"
        >
          {/* The three poses as stills: shown until the live model is drawn, or instead of it. */}
          {beats.map((beat, index) => (
            <Image
              key={beat.part}
              src={beat.poster}
              alt=""
              fill
              sizes="58vw"
              className={`object-contain transition-opacity duration-700 ${!live && index === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          {webgl && (
            <>
              <GogglesViewer
                alt=""
                sizes="58vw"
                canvas={{ view: "product", progressRef, labelsRef }}
                onShowingChange={setLive}
              />
              {beats.map((beat, index) => (
                <PartLabel
                  key={beat.part}
                  label={beat.label}
                  side={beat.side}
                  visible={live && index === active}
                  elementRef={(element) => {
                    labelsRef.current[beat.part] = element;
                  }}
                />
              ))}
            </>
          )}
        </div>

        <div className="relative mx-auto flex h-full max-w-[1320px] items-end px-8 pb-[15vh]">
          {/* All three beats for screen readers; the animated copy below is visual only. */}
          <ul className="sr-only">
            {beats.map((beat) => (
              <li key={beat.part}>
                <h3>{beat.title}</h3>
                <p>{beat.body}</p>
              </li>
            ))}
          </ul>
          <div className="max-w-[24rem]" aria-hidden="true">
            <ol className="mb-8 flex gap-2">
              {beats.map((beat, index) => (
                <li key={beat.part} className="h-0.5 w-10 overflow-hidden rounded-full bg-white/15">
                  <span
                    className={`block h-full bg-bone transition-transform duration-500 ease-out ${index <= active ? "translate-x-0" : "-translate-x-full"}`}
                  />
                </li>
              ))}
            </ol>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[clamp(1.75rem,2.8vw,2.5rem)] leading-[1.05] font-normal tracking-[-0.028em]">
                  {beats[active].title}
                </p>
                <p className="lead mt-4">{beats[active].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small and medium screens, and reduced motion: the same three beats, one after another. */
function Stacked({ always }: { always: boolean }) {
  return (
    <div className={`mx-auto max-w-[1320px] space-y-20 px-5 sm:px-8 ${always ? "" : "lg:hidden"}`}>
      {beats.map((beat) => (
        <div key={beat.part} className="grid gap-6 md:grid-cols-2 md:items-center md:gap-14">
          <div style={{ aspectRatio: `${width} / ${height}` }} className="relative">
            <Image src={beat.poster} alt={beat.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
          </div>
          <div>
            <h3 className="text-[clamp(1.75rem,6vw,2.5rem)] leading-[1.05] font-normal tracking-[-0.03em]">{beat.title}</h3>
            <p className="lead mt-4 max-w-[28rem]">{beat.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Product() {
  const reduced = usePrefersReducedMotion();
  return (
    <section id="product" aria-labelledby="product-title" className="relative pb-24 lg:pb-0">
      {/*
        On wide screens the heading sits over the first screen of the pinned scene and scrolls
        away as the goggles start to turn.
      */}
      <div
        className={`relative z-10 mx-auto max-w-[1320px] px-5 pt-32 pb-16 sm:px-8 ${reduced ? "" : "lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:pt-[14vh] lg:pb-0"}`}
      >
        <Reveal>
          <h2 id="product-title" className="display-lg max-w-[13ch]">
            Everything it needs is built in.
          </h2>
        </Reveal>
      </div>
      {reduced ? (
        <Stacked always />
      ) : (
        <>
          <Pinned />
          <Stacked always={false} />
        </>
      )}
    </section>
  );
}
