"use client";

import { useLenis } from "lenis/react";
import {
  AnimatePresence,
  type MotionStyle,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import frontView from "@/assets/goggles-front.png";
import lensMask from "@/assets/goggles-front-lens.png";
import {
  GuideMarks,
  GuidePanel,
  HelpMarks,
  HelpPanel,
  InspectionMarks,
  InspectionPanel,
  inspectionFocus,
  type ModeId,
  modes,
} from "@/components/lens/modes";
import { PhotoFrame } from "@/components/lens/photo-frame";
import { centre, engineBayParts, photos } from "@/components/lens/photos";
import { LitWords } from "@/components/lit-words";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { preselectRole } from "@/lib/waitlist";

/*
 * The opening of the page as one held scene: the goggles, front on, with the headline inside the
 * lens; scrolling pushes in until you're looking through the lens at an engine bay; then the three
 * modes play over what you see. Everything is driven by the scroll position (no timers).
 *
 * The goggles' box is sized from the stage (a size container): about the screen's width on
 * desktop, wider than a phone so the headline in the lens stays legible, and never taller than
 * the stage allows. The lens mask is a render of exactly the visible lens at the same framing, so
 * the engine bay can show through it while the box scales.
 */

/** How tall the scene is, in screen heights; it's pinned for all but the last one. */
const STORY_SCREENS = 6.4;

/** Scroll progress through the scene at which each part happens. */
const T = {
  heroCopyOut: [0.02, 0.07],
  pushIn: [0.03, 0.19],
  throughLens: [0.05, 0.12],
  reveal: [0.16, 0.21],
  intro: [0.21, 0.24, 0.3, 0.33],
  introWords: [0.22, 0.29] as [number, number],
  modesIn: [0.31, 0.34],
  modes: [
    [0.33, 0.555],
    [0.555, 0.78],
    [0.78, 1],
  ],
} as const;

/** How far the goggles scale up as you push into the lens, around this point of their box. */
const PUSH = { scale: 3, originX: 0.5, originY: 0.45 };

const GEOMETRY = {
  // On short screens (a phone on its side) the last term keeps room under the goggles for the buttons.
  "--bw": "min(max(min(96cqw, 160cqh), min(200cqw, 1100px)), 175cqh, calc(286cqh - 34rem))",
  "--bh": "calc(var(--bw) * 0.5625)",
  "--top": "calc((100cqh - var(--bh)) * 0.42)",
} as React.CSSProperties;

const helpFocus = centre(engineBayParts.dipstick, photos.engineBay.aspect);
const guideFocus = centre(engineBayParts.coolant, photos.engineBay.aspect);

const INTRO = "Look at a part and ask. MechLens is designed to work the way a job does, in three modes.";

/** The goggles, front on, with the headline in the lens as the heads-up view would show it. */
function Goggles({ style, textOpacity }: { style?: MotionStyle; textOpacity?: MotionValue<number> }) {
  return (
    <motion.div
      style={style}
      className="absolute top-(--top) left-1/2 h-(--bh) w-(--bw) -translate-x-1/2 animate-rise-in [container-type:inline-size]"
    >
      <Image
        src={frontView}
        alt="The MechLens goggles, a concept design, seen from the front: a wraparound smoked visor in a graphite frame, with a camera at the center of the brow."
        fill
        sizes="(max-width: 768px) 200vw, 96vw"
        preload
        className="object-contain"
      />
      {/* A slow highlight crossing the visor, kept to the lens by its mask. */}
      <div
        aria-hidden="true"
        style={{ maskImage: `url(${lensMask.src})`, WebkitMaskImage: `url(${lensMask.src})` }}
        className="absolute inset-0 overflow-hidden [mask-size:100%_100%] [-webkit-mask-size:100%_100%]"
      >
        <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-visor-sweep bg-[linear-gradient(100deg,transparent,rgb(236_233_226/0.07),transparent)]" />
      </div>
      {/* The headline sits in the band of lens between the brow bar and the nose bridge. */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute top-[36.5%] right-[24%] left-[24%] flex h-[16%] items-center justify-center text-center"
      >
        <span aria-hidden="true" className="absolute inset-0 max-sm:hidden">
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "right-0 bottom-0 border-r-2 border-b-2", "bottom-0 left-0 border-b-2 border-l-2"].map((corner) => (
            <span key={corner} className={`absolute size-[1.6cqw] animate-bracket-in border-signal ${corner}`} />
          ))}
        </span>
        <h1 id="hero-title" className="text-[4.4cqw] leading-[1.02] font-normal tracking-[-0.03em] text-bone">
          <span className="block animate-rise-in [animation-delay:500ms]">The answer,</span>
          <span className="block animate-rise-in [animation-delay:600ms]">in your line of sight.</span>
        </h1>
      </motion.div>
    </motion.div>
  );
}

function HeroCopy({ interactive }: { interactive: boolean }) {
  return (
    <div className={`mx-auto max-w-[36rem] px-5 text-center ${interactive ? "" : "pointer-events-none"}`}>
      <p className="lead animate-rise-in [animation-delay:750ms] [@media(max-height:500px)]:hidden lg:[@media(max-height:800px)]:hidden">
        MechLens is building AI goggles for automotive technicians. Look at a part, ask about it, and
        get verified repair information for the exact vehicle.
      </p>
      <div className="mt-6 flex animate-rise-in flex-wrap items-center justify-center gap-x-7 gap-y-3 [animation-delay:850ms]">
        <a href="#waitlist" tabIndex={interactive ? undefined : -1} className="button-primary">
          Join the waitlist
        </a>
        <a href="#waitlist" tabIndex={interactive ? undefined : -1} {...preselectRole("shop")} className="link-quiet">
          Talk to us about your shop
        </a>
      </div>
      <p className="mt-5 animate-rise-in text-xs text-ash/80 [animation-delay:950ms]">Concept design</p>
    </div>
  );
}

/** Mode name, title and one line, swapped as the modes change. */
function ModeCaption({ active }: { active: number }) {
  const mode = modes[active];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm text-bone/75">{mode.label} mode</p>
        <p className="mt-1.5 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.025em] text-bone">{mode.title}</p>
        <p className="mt-3 hidden max-w-[24rem] text-[15px] leading-relaxed text-bone/70 sm:block short:hidden">{mode.body}</p>
      </motion.div>
    </AnimatePresence>
  );
}

function ModeSwitch({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  return (
    <div role="group" aria-label="Modes" className="flex gap-1 rounded-full border border-white/15 bg-night/60 p-1 backdrop-blur-md">
      {modes.map((mode, index) => (
        <button
          key={mode.id}
          type="button"
          aria-pressed={index === active}
          onClick={() => onSelect(index)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${index === active ? "bg-bone text-night" : "text-ash hover:text-bone"}`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

/** The modes for screen readers: the animated panels are visual only. */
function ModesText() {
  return (
    <ul className="sr-only">
      {modes.map((mode) => (
        <li key={mode.id}>
          <h3>{mode.label} mode: {mode.title}</h3>
          <p>{mode.body}</p>
        </li>
      ))}
    </ul>
  );
}

function Live() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const push = useTransform(p, [...T.pushIn], [1, PUSH.scale], { ease: (x) => x * x * (3 - 2 * x) });
  const heroCopy = useTransform(p, [...T.heroCopyOut], [1, 0]);
  const throughLens = useTransform(p, [...T.throughLens], [0, 1]);
  const reveal = useTransform(p, [...T.reveal], [0, 1]);
  const goggles = useTransform(reveal, (value) => 1 - value);
  const intro = useTransform(p, [...T.intro], [0, 1, 1, 0]);
  const modesIn = useTransform(p, [...T.modesIn], [0, 1]);
  const [help, guide, inspection] = T.modes;
  const tHelp = useTransform(p, [...help], [0, 1]);
  const tGuide = useTransform(p, [...guide], [0, 1]);
  const tInspection = useTransform(p, [...inspection], [0, 1]);
  // Help to Guide: the camera moves across the same engine bay to the coolant reservoir.
  const engineFx = useTransform(p, [guide[0], guide[0] + 0.03], [helpFocus.fx, guideFocus.fx]);
  const engineFy = useTransform(p, [guide[0], guide[0] + 0.03], [helpFocus.fy, guideFocus.fy]);
  const engineZoom = useTransform(p, [guide[0], guide[0] + 0.03], [1, 1.08]);
  // Inspection: a different job, so a cut to the brake; the view follows the item being checked.
  const brake = useTransform(p, [inspection[0], inspection[0] + 0.025], [0, 1]);
  const brakeFx = useTransform(tInspection, inspectionFocus.input, inspectionFocus.fx);
  const brakeFy = useTransform(tInspection, inspectionFocus.input, inspectionFocus.fy);

  const [active, setActive] = useState(0);
  const [heroInteractive, setHeroInteractive] = useState(true);
  const [modesShown, setModesShown] = useState(false);
  useMotionValueEvent(p, "change", (value) => {
    setActive(value < guide[0] ? 0 : value < inspection[0] ? 1 : 2);
    setHeroInteractive(value < T.heroCopyOut[1]);
    setModesShown(value > T.modesIn[0]);
  });

  const select = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const distance = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY + (T.modes[index][0] + 0.02) * distance;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: "smooth" });
  };

  // The engine bay seen through the lens: fixed in place while the mask (the lens) grows over it.
  const lensStyle = {
    "--s": push,
    opacity: throughLens,
    maskImage: `url(${lensMask.src})`,
    WebkitMaskImage: `url(${lensMask.src})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "calc(var(--bw) * var(--s)) calc(var(--bh) * var(--s))",
    WebkitMaskSize: "calc(var(--bw) * var(--s)) calc(var(--bh) * var(--s))",
    maskPosition: `calc(50cqw - var(--bw) * var(--s) * ${PUSH.originX}) calc(var(--top) + var(--bh) * ${PUSH.originY} * (1 - var(--s)))`,
    WebkitMaskPosition: `calc(50cqw - var(--bw) * var(--s) * ${PUSH.originX}) calc(var(--top) + var(--bh) * ${PUSH.originY} * (1 - var(--s)))`,
  } as MotionStyle;

  return (
    <section
      ref={sectionRef}
      id="top"
      data-story=""
      aria-labelledby="hero-title"
      style={{ height: `${STORY_SCREENS * 100}svh` }}
      className="relative"
    >
      {/* The modes, for links in the navigation; tall so the header marks it while it plays. */}
      <div
        id="how-it-works"
        data-story-anchor=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ top: `${(T.modes[0][0] + 0.03) * (STORY_SCREENS - 1) * 100}svh` }}
      />
      <div className="sticky top-0 h-svh overflow-clip [container-type:size]">
        <div style={GEOMETRY} className="absolute inset-0">
          <div aria-hidden="true" className="absolute inset-x-0 top-[6%] mx-auto h-[70%] w-[90%] rounded-full bg-[radial-gradient(closest-side,rgb(236_233_226/0.06),transparent)]" />
          <Goggles
            style={{ scale: push, opacity: goggles, transformOrigin: `${PUSH.originX * 100}% ${PUSH.originY * 100}%` }}
            textOpacity={heroCopy}
          />

          <motion.div aria-hidden="true" style={lensStyle} className="absolute inset-0">
            <PhotoFrame photo={photos.engineBay} fx={helpFocus.fx} fy={helpFocus.fy} decorative>
              <div className="absolute inset-0 bg-night/45" />
            </PhotoFrame>
          </motion.div>

          <motion.div style={{ opacity: reveal }} className="absolute inset-0">
            <PhotoFrame photo={photos.engineBay} fx={engineFx} fy={engineFy} zoom={engineZoom}>
              <div className="absolute inset-0 bg-night/45" />
              <HelpMarks t={tHelp} />
              <GuideMarks t={tGuide} />
            </PhotoFrame>
            <motion.div style={{ opacity: brake }} className="absolute inset-0">
              <PhotoFrame photo={photos.brake} fx={brakeFx} fy={brakeFy}>
                <div className="absolute inset-0 bg-night/45" />
                <InspectionMarks t={tInspection} />
              </PhotoFrame>
            </motion.div>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/85 to-transparent" />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" />
          </motion.div>

          <motion.div style={{ opacity: heroCopy }} className="absolute inset-x-0 bottom-6 sm:bottom-10">
            <HeroCopy interactive={heroInteractive} />
          </motion.div>

          {/* The modes' introduction. */}
          <motion.div style={{ opacity: intro }} className="absolute inset-0 flex items-center">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/60 to-night/10" />
            <div className="relative mx-auto w-full max-w-[1320px] px-5 sm:px-8">
              <h2 className="display-lg max-w-[12ch]">It sees what you see.</h2>
              <p className="mt-6 max-w-[30rem] text-[clamp(1.25rem,2vw,1.6rem)] leading-snug tracking-[-0.01em] text-bone">
                <LitWords text={INTRO} progress={p} range={T.introWords} />
              </p>
            </div>
          </motion.div>

          {/* The modes: caption, heads-up panels and the switch; out of reach until they're shown. */}
          <ModesText />
          <motion.div style={{ opacity: modesIn }} inert={!modesShown} className="pointer-events-none absolute inset-0">
            <div className="mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-20 pb-6 sm:px-8 short:pt-16 short:pb-4 lg:pt-24 lg:pb-10">
              <div className="lg:order-2 lg:mt-auto">
                <ModeCaption active={active} />
              </div>
              <div className="relative mt-auto w-full max-w-[22rem] self-end short:absolute short:top-1/2 short:right-5 short:mt-0 short:max-w-[17rem] short:-translate-y-1/2 lg:absolute lg:top-1/2 lg:right-8 lg:mt-0 lg:max-w-[18rem] lg:-translate-y-1/2 xl:right-[max(2rem,calc((100%-1320px)/2+2rem))] xl:max-w-[22rem]">
                <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:self-end lg:[&>*]:self-center">
                  <HelpPanel t={tHelp} />
                  <GuidePanel t={tGuide} />
                  <InspectionPanel t={tInspection} />
                </div>
              </div>
              <div className="pointer-events-auto mt-5 flex justify-center short:mt-auto short:justify-start lg:order-3 lg:mt-8 lg:justify-start">
                <ModeSwitch active={active} onSelect={select} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* --- Reduced motion: the same story, still ------------------------------------------------------ */

function StillMode({ id, children, marks }: { id: ModeId; children: React.ReactNode; marks: React.ReactNode }) {
  const mode = modes.find((item) => item.id === id);
  if (!mode) return null;
  return (
    <li className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-12">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-md [container-type:size] sm:aspect-[16/9]">{marks}</div>
      </div>
      <div>
        <p className="text-sm text-ash">{mode.label} mode</p>
        <h3 className="mt-1.5 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-normal tracking-[-0.025em]">{mode.title}</h3>
        <p className="lead mt-3">{mode.body}</p>
        <div className="mt-6">{children}</div>
      </div>
    </li>
  );
}

function Still() {
  // Each mode shown at the moment that says the most: the answer, the reservoir found, the last item.
  const helpAt = useMotionValue(0.7);
  const guideAt = useMotionValue(0.5);
  const inspectionAt = useMotionValue(0.8);
  return (
    <section id="top" aria-labelledby="hero-title" className="relative">
      <div className="relative h-[max(42rem,100svh)] overflow-hidden [container-type:size]">
        <div style={GEOMETRY} className="absolute inset-0">
          <Goggles />
          <div className="absolute inset-x-0" style={{ top: "calc(var(--top) + var(--bh) * 0.8)" }}>
            <HeroCopy interactive />
          </div>
        </div>
      </div>
      <div id="how-it-works" className="mx-auto max-w-[1320px] px-5 py-32 sm:px-8">
        <h2 className="display-lg max-w-[12ch]">It sees what you see.</h2>
        <p className="lead mt-6 max-w-[30rem]">{INTRO}</p>
        <ul className="mt-16 space-y-20">
          <StillMode
            id="help"
            marks={
              <PhotoFrame photo={photos.engineBay} fx={helpFocus.fx} fy={helpFocus.fy}>
                <div className="absolute inset-0 bg-night/45" />
                <HelpMarks t={helpAt} />
              </PhotoFrame>
            }
          >
            <HelpPanel t={helpAt} />
          </StillMode>
          <StillMode
            id="guide"
            marks={
              <PhotoFrame photo={photos.engineBay} fx={guideFocus.fx} fy={guideFocus.fy} decorative>
                <div className="absolute inset-0 bg-night/45" />
                <GuideMarks t={guideAt} />
              </PhotoFrame>
            }
          >
            <GuidePanel t={guideAt} />
          </StillMode>
          <StillMode
            id="inspection"
            marks={
              <PhotoFrame photo={photos.brake} fx={0.5} fy={0.5}>
                <div className="absolute inset-0 bg-night/45" />
                <InspectionMarks t={inspectionAt} />
              </PhotoFrame>
            }
          >
            <InspectionPanel t={inspectionAt} />
          </StillMode>
        </ul>
      </div>
    </section>
  );
}

export function LensStory() {
  const reduced = usePrefersReducedMotion();
  return reduced ? <Still /> : <Live />;
}

