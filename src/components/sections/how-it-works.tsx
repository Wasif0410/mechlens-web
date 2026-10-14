import Image from "next/image";
import engineBay from "@/assets/engine-bay.jpg";

const steps = [
  {
    title: "Look at the part",
    body: "No photos to take and nothing to point. The camera sees what you see.",
  },
  {
    title: "Ask out loud",
    body: "Press the button and ask in plain words. What is this? Where’s the cam sensor? What do I check next?",
  },
  {
    title: "Get a straight answer",
    body: "A short answer for the exact vehicle, with the source it came from. If MechLens isn’t sure, it says so.",
  },
];

/** The visor outline from the 3D model, as an SVG path in a 1600 × 624 box. */
const VISOR_PATH =
  "M800 22C1100 0 1300 4 1430 22C1545 37 1600 122 1600 242C1600 362 1592 432 1558 492C1505 584 1385 624 1250 624C1105 624 1025 602 960 537C900 462 862 387 800 387C738 387 700 462 640 537C575 602 495 624 350 624C215 624 95 584 42 492C8 432 0 362 0 242C0 122 55 37 170 22C300 4 500 0 800 22Z";

/** What the wearer sees: the engine bay through the visor, with the question and the answer. */
function WearerView() {
  return (
    <figure className="relative">
      <div className="relative">
        <svg viewBox="0 0 1600 624" className="absolute size-0" aria-hidden="true">
          <defs>
            <clipPath id="visor-clip" clipPathUnits="objectBoundingBox" transform="scale(0.000625 0.0016026)">
              <path d={VISOR_PATH} />
            </clipPath>
          </defs>
        </svg>
        <div className="relative aspect-[1600/624] w-full [clip-path:url(#visor-clip)]">
          <Image
            src={engineBay}
            alt="An engine bay seen through the goggles: a green battery at the right, below a black ribbed air filter box."
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-cover object-[50%_30%]"
          />
          {/*
            The part being asked about: the air filter box, at x 76.2–93% and y 16–45.8% of the
            photo. The photo covers the frame, so its height is 1.442 frames, shifted up by 30% of
            the overflow (object-position y 30%): y becomes 9.8–52.8% of the frame.
          */}
          <span
            aria-hidden="true"
            className="absolute top-[9.8%] left-[76.2%] h-[43%] w-[16.8%] rounded-lg border-2 border-signal shadow-[0_0_0_9999px_rgb(18_21_25/0.28)]"
          />
        </div>
      </div>

      <div className="relative -mt-6 grid gap-3 px-2 sm:-mt-10 sm:px-8">
        <p className="max-w-[22rem] justify-self-start rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-[15px] shadow-[0_8px_24px_rgb(18_21_25/0.10)] ring-1 ring-ink/5">
          <span className="block text-[13px] text-ink-muted">You</span>
          What’s the black box above the battery?
        </p>
        <div className="max-w-[26rem] justify-self-end rounded-2xl rounded-br-md bg-graphite px-5 py-4 text-on-graphite shadow-[0_12px_32px_rgb(18_21_25/0.22)]">
          <p className="flex items-center gap-2 text-[13px] text-on-graphite-muted">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            MechLens
          </p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.01em]">That’s the air filter housing.</p>
          <p className="mt-1 text-[15px] leading-relaxed text-on-graphite-muted">
            Intake air passes through the filter inside it before it reaches the engine.
          </p>
          <p className="mt-3 border-t border-graphite-line pt-3 text-[13px] text-on-graphite-muted">
            Source: verified service information, Nissan Sunny N16 (QG13DE)
          </p>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-sm text-ink-muted">An illustrated answer.</figcaption>
    </figure>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div>
          <h2
            id="how-title"
            className="text-[clamp(2.125rem,4.4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]"
          >
            Look. Ask. Get the answer.
          </h2>
          <ol className="mt-10 space-y-8">
            {steps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-x-4 border-t border-line pt-6">
                <span className="text-sm font-semibold text-ink-muted tabular-nums">0{index + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.015em]">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <WearerView />
      </div>
    </section>
  );
}
