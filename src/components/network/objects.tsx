"use client";

import { type MotionValue, motion, useTransform } from "motion/react";

/*
 * The objects in the verified-answers story, all about one job on the car from the opening scene:
 * a coolant top-up on a Toyota Corolla Sport with the 1.2-liter turbo (8NR-FTS). Each takes the
 * story's progress and reveals itself over its own stretch of it.
 */

export const VEHICLE = [
  ["MAKE", "TOYOTA"],
  ["MODEL", "COROLLA SPORT"],
  ["YEAR", "2019"],
  ["ENGINE", "8NR-FTS  1.2 L TURBO"],
] as const;

/** A stamped vehicle plate: the exact vehicle a record belongs to. */
export function VehiclePlate({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative rounded-md bg-[linear-gradient(135deg,#3a3e44_0%,#24272c_45%,#30343a_100%)] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_24px_48px_-24px_rgb(0_0_0/0.8)] ${className}`}
    >
      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`absolute ${position} size-1.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#9aa0a6,#3a3e44)]`}
        />
      ))}
      <dl className="grid grid-cols-[4.75rem_1fr] gap-y-2 font-mono text-[12px] tracking-[0.12em]">
        {VEHICLE.map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-ash">{key}</dt>
            <dd className="text-bone [text-shadow:0_1px_0_rgb(0_0_0/0.6)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const FIELDS = [
  ["Complaint", "Coolant warning after a cold start."],
  ["Cause", "Level below MIN. No external leak found."],
  ["Correction", "Topped up with the specified coolant. Level checked cold."],
] as const;

/**
 * A repair order from a technician in the network, written the way shops write them: complaint,
 * cause, correction. `lines` reveals the three fields one after another; `stamp` lands the review
 * stamp.
 */
export function RepairOrder({
  lines,
  stamp,
  className = "",
}: {
  lines: MotionValue<number>;
  stamp: MotionValue<number>;
  className?: string;
}) {
  const stampScale = useTransform(stamp, [0, 1], [1.7, 1]);
  const stampRotate = useTransform(stamp, [0, 1], [-2, -8]);
  return (
    <div className={`relative rounded-md bg-[#e9e5dc] px-6 pt-5 pb-6 text-night shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] ${className}`}>
      <div className="flex items-baseline justify-between gap-4 border-b border-night/15 pb-3">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-night/70">REPAIR ORDER</p>
        <p className="text-[12px] text-night/60">Confirmed in the field</p>
      </div>
      <dl className="mt-1 divide-y divide-night/10 text-[14px]">
        {FIELDS.map(([key, value], index) => (
          <Field key={key} label={key} value={value} lines={lines} index={index} />
        ))}
      </dl>
      <motion.p
        aria-hidden="true"
        style={{ opacity: stamp, scale: stampScale, rotate: stampRotate }}
        className="absolute right-5 -bottom-4 rounded-md border-2 border-[#b07f00] bg-[#e9e5dc]/85 px-3 py-1 text-sm font-bold tracking-[0.18em] text-[#8a6400]"
      >
        REVIEWED
      </motion.p>
    </div>
  );
}

function Field({ label, value, lines, index }: { label: string; value: string; lines: MotionValue<number>; index: number }) {
  const opacity = useTransform(lines, [index / 3, (index + 0.6) / 3], [0, 1]);
  const y = useTransform(lines, [index / 3, (index + 0.6) / 3], [6, 0]);
  return (
    <motion.div style={{ opacity, y }} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
      <dt className="text-night/70">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </motion.div>
  );
}

/** The answer as the heads-up view shows it: from the reviewed record, with where it came from. */
export function Answer({ className = "" }: { className?: string }) {
  return (
    <div className={`border-l-2 border-signal bg-night/85 px-5 py-4 backdrop-blur-md ${className}`}>
      <p className="font-mono text-[11px] tracking-[0.08em] text-signal">COOLANT RESERVOIR</p>
      <p className="mt-2 text-[16px] leading-snug text-bone">
        Top up to the line with the engine cold, using the coolant specified for this vehicle.
      </p>
      <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-ash">SOURCE: REVIEWED FIELD REPORT</p>
    </div>
  );
}

/** What it says instead when a link in the chain is missing. */
export function NotSure({ className = "" }: { className?: string }) {
  return (
    <div className={`border-l-2 border-dashed border-white/40 bg-night/85 px-5 py-3 backdrop-blur-md ${className}`}>
      <p className="font-mono text-[11px] tracking-[0.08em] text-bone/80">NOT SURE</p>
      <p className="mt-1.5 text-[15px] leading-snug text-bone">I can’t confirm that for this engine yet.</p>
    </div>
  );
}
