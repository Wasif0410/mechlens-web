"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/reveal";
import { preselectRole } from "@/lib/waitlist";

/**
 * A service floor from above: six bays with cars on lifts. Technicians wearing MechLens get their
 * answers where they stand (the amber pulses); the senior technician stays on their own job; every
 * answer comes from the same verified source (the hub in the aisle). Coordinates are in the
 * 1200 × 560 viewBox.
 */
const bays = [
  { x: 40, y: 40, nose: "down", tech: { x: 330, y: 150 }, wearer: true, delay: 0 },
  { x: 420, y: 40, nose: "down", tech: { x: 710, y: 120 }, wearer: true, delay: 1.1 },
  { x: 800, y: 40, nose: "down", tech: { x: 1090, y: 160 }, wearer: false, delay: 0 },
  { x: 40, y: 310, nose: "up", tech: { x: 330, y: 420 }, wearer: true, delay: 2.2 },
  { x: 420, y: 310, nose: "up", tech: { x: 710, y: 450 }, wearer: false, delay: 0 },
  { x: 800, y: 310, nose: "up", tech: { x: 1090, y: 400 }, wearer: true, delay: 0.6 },
] as const;

const BAY = { w: 360, h: 210 };
const HUB = { x: 600, y: 280 };

/** A car seen from above, on a two-post lift, nose towards the aisle. */
function Car({ cx, cy, nose }: { cx: number; cy: number; nose: "up" | "down" }) {
  const w = 104;
  const h = 176;
  const x = cx - w / 2;
  const y = cy - h / 2;
  // The windscreen sits on the nose side.
  const screenY = nose === "down" ? y + h - 62 : y + 28;
  return (
    <g>
      {/* Lift posts either side of the car. */}
      <rect x={x - 26} y={cy - 12} width={12} height={24} rx={2} fill="rgb(255 255 255 / 0.14)" />
      <rect x={x + w + 14} y={cy - 12} width={12} height={24} rx={2} fill="rgb(255 255 255 / 0.14)" />
      {[
        [x - 7, y + 26],
        [x + w - 3, y + 26],
        [x - 7, y + h - 54],
        [x + w - 3, y + h - 54],
      ].map(([wx, wy]) => (
        <rect key={`${wx}-${wy}`} x={wx} y={wy} width={10} height={28} rx={3} fill="#0d0e10" stroke="rgb(255 255 255 / 0.18)" />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={30} fill="#1a1d21" stroke="rgb(255 255 255 / 0.2)" strokeWidth={1.5} />
      <rect x={x + 14} y={screenY} width={w - 28} height={34} rx={10} fill="rgb(255 255 255 / 0.06)" />
      <rect x={x + 18} y={cy - 26} width={w - 36} height={52} rx={8} fill="rgb(255 255 255 / 0.03)" />
    </g>
  );
}

const floorTitle =
  "A service floor from above: six bays with cars on lifts. Four technicians wearing MechLens get answers where they stand, all from one verified source; the senior technician stays on their own job.";

/** The floor plan's contents, drawn in the 1200 × 560 landscape coordinates. */
function Floor() {
  return (
    <>
      {/* Floor, bay lines and the aisle. */}
      <rect x={20} y={20} width={1160} height={520} rx={18} fill="rgb(255 255 255 / 0.015)" stroke="rgb(255 255 255 / 0.08)" />
      <line x1={40} y1={280} x2={1160} y2={280} stroke="rgb(242 183 5 / 0.25)" strokeWidth={2} strokeDasharray="18 14" />
      {bays.map((bay) => (
        <g key={`${bay.x}-${bay.y}`}>
          <path
            d={`M${bay.x} ${bay.y}V${bay.y + BAY.h}M${bay.x + BAY.w} ${bay.y}V${bay.y + BAY.h}`}
            stroke="rgb(255 255 255 / 0.1)"
            strokeWidth={2}
          />
          <Car cx={bay.x + BAY.w / 2 - 20} cy={bay.y + BAY.h / 2} nose={bay.nose} />
        </g>
      ))}

      {/* Every answer comes from the same verified source. */}
      {bays
        .filter((bay) => bay.wearer)
        .map((bay) => (
          <line
            key={`link-${bay.x}-${bay.y}`}
            x1={HUB.x}
            y1={HUB.y}
            x2={bay.tech.x}
            y2={bay.tech.y}
            stroke="rgb(242 183 5 / 0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 8"
            style={{ animation: "dash-flow 1.6s linear infinite" }}
          />
        ))}
      <rect x={HUB.x - 16} y={HUB.y - 16} width={32} height={32} rx={7} fill="var(--color-night)" stroke="var(--color-signal)" strokeWidth={2} />
      <rect x={HUB.x - 6} y={HUB.y - 6} width={12} height={12} fill="var(--color-signal)" />

      {/* Technicians. Wearers pulse each time a question is answered. */}
      {bays.map((bay) => (
        <g key={`tech-${bay.x}-${bay.y}`}>
          {bay.wearer && (
            <circle
              cx={bay.tech.x}
              cy={bay.tech.y}
              r={14}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth={2}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `ping-ring 3.2s ease-out ${bay.delay}s infinite`,
              }}
            />
          )}
          <circle cx={bay.tech.x} cy={bay.tech.y} r={10} fill="var(--color-bone)" fillOpacity={bay.wearer ? 1 : 0.55} />
        </g>
      ))}
    </>
  );
}

const legend = [
  {
    mark: "pulse",
    title: "Apprentices keep moving",
    body: "They work through unfamiliar jobs on their own, asking as they go.",
  },
  {
    mark: "dot",
    title: "Seniors stay on their own work",
    body: "Fewer routine questions pulling your most experienced technicians off the car.",
  },
  {
    mark: "hub",
    title: "One standard across the floor",
    body: "Every technician gets the same sourced information for the same vehicle.",
  },
] as const;

function LegendMark({ mark }: { mark: (typeof legend)[number]["mark"] }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      {mark === "pulse" && (
        <>
          <circle cx={12} cy={12} r={10} fill="none" stroke="var(--color-signal)" strokeOpacity={0.5} />
          <circle cx={12} cy={12} r={4.5} fill="var(--color-bone)" />
        </>
      )}
      {mark === "dot" && <circle cx={12} cy={12} r={4.5} fill="var(--color-bone)" fillOpacity={0.55} />}
      {mark === "hub" && (
        <>
          <rect x={5} y={5} width={14} height={14} rx={3} fill="none" stroke="var(--color-signal)" />
          <rect x={9.5} y={9.5} width={5} height={5} fill="var(--color-signal)" />
        </>
      )}
    </svg>
  );
}

export function Shops() {
  const planRef = useRef<HTMLDivElement>(null);
  const inView = useInView(planRef, { margin: "-10% 0px" });

  return (
    <section id="shops" aria-labelledby="shops-title" className="relative overflow-hidden pt-32 pb-12 sm:pt-44 sm:pb-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-24">
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
          <div ref={planRef} className={`relative ${inView ? "" : "[&_*]:[animation-play-state:paused]"}`}>
            {/* Landscape from small screens up; on phones the same floor turned upright, so it stays legible. */}
            <svg viewBox="0 0 1200 560" className="hidden w-full sm:block" role="img" aria-labelledby="floor-title-wide">
              <title id="floor-title-wide">{floorTitle}</title>
              <Floor />
            </svg>
            <svg viewBox="0 0 560 1200" className="mx-auto block w-full max-w-[26rem] sm:hidden" role="img" aria-labelledby="floor-title-tall">
              <title id="floor-title-tall">{floorTitle}</title>
              <g transform="translate(560 0) rotate(90)">
                <Floor />
              </g>
            </svg>
          </div>
          <figcaption className="sr-only">An illustration, not a real shop.</figcaption>
        </figure>

        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {legend.map((item) => (
            <li key={item.title} className="flex gap-4">
              <LegendMark mark={item.mark} />
              <div>
                <h3 className="text-[17px] font-medium tracking-[-0.01em]">{item.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ash">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
