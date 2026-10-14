import heroPoster from "@/assets/goggles-hero.png";
import { GogglesViewer } from "@/components/goggles/goggles-viewer";
import { POSTER_SIZE } from "@/components/goggles/scene";
import { preselectRole } from "@/lib/waitlist";

const { width, height } = POSTER_SIZE.hero;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-[1240px] px-5 text-center sm:px-8">
        <h1
          id="hero-title"
          className="mx-auto max-w-5xl text-[clamp(2.75rem,4.7vw,4.25rem)] leading-[1.04] font-medium tracking-[-0.04em]"
        >
          AI goggles for automotive technicians.
        </h1>
        <p className="mx-auto mt-6 max-w-[42rem] animate-rise text-lg leading-relaxed text-balance text-ink-muted sm:text-xl">
          MechLens sees the part in front of you, hears your question, and answers with verified
          repair information for the exact vehicle. One press to ask, and your hands stay on the car.
        </p>
        <div className="mt-9 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:120ms]">
          <a href="#waitlist" className="button-primary">
            Join the waitlist
          </a>
          <a href="#waitlist" {...preselectRole("shop")} className="button-secondary">
            Talk to us about your shop
          </a>
        </div>
      </div>

      <div className="-mt-2 sm:-mt-10">
        <GogglesViewer
          view="hero"
          poster={heroPoster}
          alt="MechLens goggles: a wraparound smoked visor in a graphite frame, with a camera at the centre of the brow and a yellow-ringed button on the right side."
          preload
          sizes={`(max-width: ${width}px) 100vw, ${width}px`}
          aspectRatio={`${width} / ${height}`}
          maxWidth={width}
          caption="Concept design."
        />
      </div>
    </section>
  );
}
