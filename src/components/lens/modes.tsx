"use client";

import { AnimatePresence, type MotionValue, motion, useMotionValueEvent, useTransform } from "motion/react";
import { useState } from "react";
import { Lock, Tag, glass } from "./hud";
import { OnPhoto } from "./photo-frame";
import { type Box, brakeParts, engineBayParts, photos } from "./photos";

/**
 * The three modes, each played over a photo as the visitor scrolls. Every mark and panel takes the
 * mode's own progress `t` (0 to 1) and fades out over the last stretch, ready for the next mode.
 */
export const modes = [
  {
    id: "help",
    label: "Help",
    title: "Ask about what you’re looking at.",
    body: "Press the button and ask in plain words. The answer appears beside the part, for this exact car.",
  },
  {
    id: "guide",
    label: "Guide",
    title: "One step at a time, in view.",
    body: "Work through a job step by step, with each step shown on the part it’s about.",
  },
  {
    id: "inspection",
    label: "Inspection",
    title: "Checks that log themselves.",
    body: "Walk through an inspection hands-free. Each item is marked as you look at it and say “next”.",
  },
] as const;

export type ModeId = (typeof modes)[number]["id"];

/** Visible in [from, to] of the mode, fading in over `fade` before and out over the mode's end. */
function useWindow(t: MotionValue<number>, from: number, to = 0.9, fade = 0.07) {
  return useTransform(t, [from, from + fade, to, Math.min(1, to + 0.08)], [0, 1, 1, 0]);
}

/** Tracks which of several thresholds `t` has passed (0 before the first). */
function useStep(t: MotionValue<number>, thresholds: number[]) {
  // Start from t's current value: a still frame (reduced motion) never changes, so never updates.
  const [step, setStep] = useState(() => thresholds.filter((threshold) => t.get() >= threshold).length);
  useMotionValueEvent(t, "change", (value) => {
    setStep(thresholds.filter((threshold) => value >= threshold).length);
  });
  return step;
}

const panel = `${glass} border-l-2 border-signal px-4 py-3 sm:px-5 sm:py-4`;
const eyebrow = "font-mono text-[10px] tracking-[0.1em] text-signal sm:text-[11px]";

/* --- Help -------------------------------------------------------------------------------------- */

export function HelpMarks({ t }: { t: MotionValue<number> }) {
  const lock = useTransform(t, [0.16, 0.38], [0, 1]);
  const lockOpacity = useWindow(t, 0.16);
  const tag = useWindow(t, 0.38);
  const cap = useWindow(t, 0.5);
  const { aspect } = photos.engineBay;
  return (
    <>
      <OnPhoto box={engineBayParts.dipstick} aspect={aspect}>
        <Lock lock={lock} opacity={lockOpacity} />
        <Tag label="ENGINE OIL DIPSTICK" side="left" opacity={tag} />
      </OnPhoto>
      <OnPhoto box={engineBayParts.oilCap} aspect={aspect}>
        <motion.span
          aria-hidden="true"
          style={{ opacity: cap }}
          className="absolute inset-[18%] rounded-full border-2 border-signal drop-shadow-[0_0_6px_rgb(0_0_0/0.7)]"
        />
        <Tag label="OIL FILLER CAP" side="left" opacity={cap} />
      </OnPhoto>
    </>
  );
}

export function HelpPanel({ t }: { t: MotionValue<number> }) {
  const question = useWindow(t, 0.06);
  const answer = useWindow(t, 0.46);
  return (
    <div aria-hidden="true" className="grid gap-3">
      <motion.p style={{ opacity: question }} className={`${glass} w-fit rounded-full px-4 py-2 text-[14px] text-bone sm:text-[15px]`}>
        “Where do I check the oil?”
      </motion.p>
      <motion.div style={{ opacity: answer }} className={panel}>
        <p className={eyebrow}>ENGINE OIL DIPSTICK</p>
        <p className="mt-2 text-[15px] leading-snug text-bone sm:text-base">
          Pull the yellow dipstick with the engine off, on level ground. Top up through the filler cap.
        </p>
        <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-ash">SOURCE: SERVICE INFORMATION</p>
      </motion.div>
    </div>
  );
}

/* --- Guide ------------------------------------------------------------------------------------- */

const guideSteps = [
  { title: "Let the engine cool.", body: "Never open the coolant cap on a hot engine." },
  { title: "Find the coolant reservoir.", body: "The translucent tank at the left of the bay." },
  { title: "Top up to the line.", body: "With the coolant specified for this vehicle, between the marks on the tank." },
  { title: "Refit the cap.", body: "Turn it until it seats, then check for leaks." },
];
const GUIDE_THRESHOLDS = [0.1, 0.32, 0.54, 0.74];

export function GuideMarks({ t }: { t: MotionValue<number> }) {
  // The reservoir locks when step 2 begins, and stays locked through the rest of the job.
  const lock = useTransform(t, [GUIDE_THRESHOLDS[1], GUIDE_THRESHOLDS[1] + 0.12], [0, 1]);
  const opacity = useWindow(t, GUIDE_THRESHOLDS[1]);
  const tag = useWindow(t, GUIDE_THRESHOLDS[1] + 0.1);
  return (
    <OnPhoto box={engineBayParts.coolant} aspect={photos.engineBay.aspect}>
      <Lock lock={lock} opacity={opacity} />
      <Tag label="COOLANT RESERVOIR" side="right" opacity={tag} />
    </OnPhoto>
  );
}

export function GuidePanel({ t }: { t: MotionValue<number> }) {
  const step = Math.max(1, useStep(t, GUIDE_THRESHOLDS));
  const opacity = useWindow(t, 0.04);
  const current = guideSteps[step - 1];
  return (
    <motion.div aria-hidden="true" style={{ opacity }} className={`${panel} w-full`}>
      <div className="flex items-center justify-between gap-4">
        <p className={eyebrow}>COOLANT TOP-UP</p>
        <p className="font-mono text-[10px] tracking-[0.08em] text-ash tabular-nums sm:text-[11px]">
          STEP {step} OF {guideSteps.length}
        </p>
      </div>
      <div className="mt-3 flex gap-1.5">
        {guideSteps.map((item, index) => (
          <span key={item.title} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${index < step ? "bg-signal" : "bg-white/15"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mt-4 text-lg leading-tight text-bone sm:text-xl">{current.title}</p>
          <p className="mt-1.5 text-[14px] leading-snug text-ash sm:text-[15px]">{current.body}</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* --- Inspection -------------------------------------------------------------------------------- */

const inspectionItems: Array<{ label: string; tag: string; box: Box; side: "left" | "right" }> = [
  { label: "Disc surface", tag: "BRAKE DISC", box: brakeParts.disc, side: "left" },
  { label: "Pad wear", tag: "PADS", box: brakeParts.pads, side: "right" },
  { label: "Caliper and slides", tag: "CALIPER", box: brakeParts.caliper, side: "right" },
  { label: "Brake hose", tag: "BRAKE HOSE", box: brakeParts.hose, side: "right" },
];
export const INSPECTION_THRESHOLDS = [0.12, 0.32, 0.52, 0.72];
const INSPECTION_DONE = 0.86;

const inspectionCentres = inspectionItems.map((item) => {
  const height = 1000 / photos.brake.aspect;
  return { fx: (item.box.x + item.box.w / 2) / 1000, fy: (item.box.y + item.box.h / 2) / height };
});

/**
 * Where the brake photo's focal point is through the mode (it matters on narrow screens, where the
 * view can pan): on each item while it's checked, moving to the next just before that one locks.
 */
const PAN = 0.07;
export const inspectionFocus = {
  input: INSPECTION_THRESHOLDS.flatMap((threshold, index) => (index === 0 ? [threshold] : [threshold - PAN, threshold])),
  fx: inspectionCentres.flatMap((centre, index) => (index === 0 ? [centre.fx] : [inspectionCentres[index - 1].fx, centre.fx])),
  fy: inspectionCentres.flatMap((centre, index) => (index === 0 ? [centre.fy] : [inspectionCentres[index - 1].fy, centre.fy])),
};

function InspectionMark({ t, index }: { t: MotionValue<number>; index: number }) {
  const start = INSPECTION_THRESHOLDS[index];
  const end = INSPECTION_THRESHOLDS[index + 1] ?? INSPECTION_DONE;
  const lock = useTransform(t, [start, start + 0.08], [0, 1]);
  const opacity = useTransform(t, [start - 0.02, start + 0.03, end - 0.01, end + 0.03], [0, 1, 1, 0]);
  const item = inspectionItems[index];
  return (
    <OnPhoto box={item.box} aspect={photos.brake.aspect}>
      <Lock lock={lock} opacity={opacity} />
      <Tag label={item.tag} side={item.side} opacity={opacity} />
    </OnPhoto>
  );
}

export function InspectionMarks({ t }: { t: MotionValue<number> }) {
  return (
    <>
      {inspectionItems.map((item, index) => (
        <InspectionMark key={item.tag} t={t} index={index} />
      ))}
    </>
  );
}

export function InspectionPanel({ t }: { t: MotionValue<number> }) {
  // Items before the current one are logged; past INSPECTION_DONE, all of them are.
  const reached = useStep(t, [...INSPECTION_THRESHOLDS, INSPECTION_DONE]);
  const opacity = useWindow(t, 0.04, 0.94, 0.06);
  const logged = Math.max(0, reached - 1);
  return (
    <motion.div aria-hidden="true" style={{ opacity }} className={`${panel} w-full`}>
      <div className="flex items-center justify-between gap-4">
        <p className={eyebrow}>FRONT LEFT BRAKE</p>
        <p className="font-mono text-[10px] tracking-[0.08em] text-ash tabular-nums sm:text-[11px]">
          {logged} OF {inspectionItems.length} LOGGED
        </p>
      </div>
      <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
        {inspectionItems.map((item, index) => {
          const done = index < logged;
          const current = index === reached - 1 && reached <= inspectionItems.length;
          return (
            <li key={item.tag} className="flex items-center gap-3 py-2.5">
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-300 ${done ? "border-signal bg-signal" : current ? "border-signal" : "border-white/30"}`}
              >
                {done && (
                  <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
                    <path d="M2.5 6.5l2.2 2.2L9.5 3.8" fill="none" stroke="var(--color-night)" strokeWidth={1.8} />
                  </svg>
                )}
              </span>
              <span className={`text-[14px] transition-colors duration-300 sm:text-[15px] ${done || current ? "text-bone" : "text-ash"}`}>{item.label}</span>
              <span className="ml-auto font-mono text-[10px] tracking-[0.08em] text-ash">{done ? "LOGGED" : current ? "LOOKING" : ""}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[13px] text-ash">Say “next” to log each item.</p>
    </motion.div>
  );
}
