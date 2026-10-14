import Image from "next/image";
import anatomyPoster from "@/assets/goggles-anatomy.png";
import { POSTER_SIZE, type PartName, projectAnchor } from "@/components/goggles/scene";

const { width, height } = POSTER_SIZE.anatomy;

const parts: Array<{ name: PartName; title: string; body: string }> = [
  {
    name: "camera",
    title: "Forward camera",
    body: "Sits at the centre of your brow and sees what you’re looking at, so there’s nothing to point or photograph.",
  },
  {
    name: "microphones",
    title: "Microphones",
    body: "Pick up your question in plain words while you keep working.",
  },
  {
    name: "button",
    title: "Push-to-talk button",
    body: "On the right side, where your hand finds it without looking. Press it to ask.",
  },
  {
    name: "light",
    title: "Status light",
    body: "Glows yellow while MechLens is listening, so you can tell when it’s on.",
  },
];

export function Anatomy() {
  return (
    <section id="product" aria-labelledby="product-title" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <h2
            id="product-title"
            className="text-[clamp(2.125rem,4.4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]"
          >
            Everything it needs is built in.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            A camera at your brow, microphones for your voice and one button to ask. Your phone
            stays in your pocket.
          </p>
        </div>

        <figure style={{ aspectRatio: `${width} / ${height}`, maxWidth: width }} className="relative mx-auto mt-4 w-full sm:-mt-12">
          <Image
            src={anatomyPoster}
            alt="The MechLens goggles from the front right, with the forward camera, microphones, push-to-talk button and status light marked."
            sizes={`(max-width: ${width}px) 100vw, ${width}px`}
            className="size-full object-contain"
          />
          {/* Markers sit just above each part; on small screens the numbered list below stands alone. */}
          {parts.map((part, index) => {
            const { left, top } = projectAnchor("anatomy", part.name);
            return (
              <span
                key={part.name}
                aria-hidden="true"
                style={{ left: `${left}%`, top: `${top}%` }}
                className="absolute hidden size-7 -translate-x-1/2 -translate-y-[130%] items-center justify-center rounded-full bg-surface text-[13px] font-semibold text-ink shadow-[0_2px_8px_rgb(18_21_25/0.18)] ring-1 ring-ink/10 sm:flex"
              >
                {index + 1}
              </span>
            );
          })}
        </figure>

        <ol className="mt-6 grid gap-x-10 gap-y-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {parts.map((part, index) => (
            <li key={part.name}>
              <h3 className="flex items-baseline gap-3 text-lg font-semibold tracking-[-0.01em]">
                <span className="text-sm font-semibold text-ink-muted tabular-nums">{index + 1}</span>
                {part.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{part.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
