"use client";

import { useState } from "react";
import heroPoster from "@/assets/goggles-hero.png";
import { POSTER_SIZE } from "@/components/goggles/poster";
import { GogglesViewer } from "@/components/goggles/goggles-viewer";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { preselectRole } from "@/lib/waitlist";

const { width, height } = POSTER_SIZE.hero;

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const [live, setLive] = useState(false);

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[720px] flex-col overflow-hidden lg:h-svh lg:justify-end"
    >
      {/* A soft light behind the goggles. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[8%] right-[-10%] size-[78vmin] rounded-full bg-[radial-gradient(circle,rgb(236_233_226/0.07),transparent_65%)]"
      />

      {/*
        The goggles: above the copy on small and medium screens; on wide screens, to the right of
        it. The wide-screen width is what's left after the copy column: the container's left edge,
        plus the headline's first line (about 5em of the display size), plus a gutter. The strap
        runs off the frame, so its end fades out.
      */}
      <div
        style={{ aspectRatio: `${width} / ${height}` }}
        className="relative mx-auto mt-20 w-full max-w-[640px] animate-rise-in [animation-delay:200ms] lg:absolute lg:top-1/2 lg:right-[2%] lg:mt-0 lg:w-[min(calc(98vw_-_max(2rem,50vw_-_628px)_-_5*min(7.2vw,6.75rem)_-_2.5rem),calc(82svh*11/9))] lg:max-w-none lg:-translate-y-[54%]"
      >
        <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_6%)]">
          <GogglesViewer
            poster={heroPoster}
            alt="The MechLens goggles, a concept design: a wraparound smoked visor in a graphite frame, with a camera at the centre of the brow and an amber-ringed button on the wearer’s right, lit from behind in a dark studio."
            sizes="(max-width: 1023px) 100vw, 56vw"
            preload
            canvas={{ view: "hero", interactive: true, float: !reduced }}
            onShowingChange={setLive}
          />
        </div>
        <p className="pointer-events-none absolute right-5 bottom-0 text-xs text-ash/80 sm:right-8 lg:-right-[1%]">
          Concept design{live ? ". Drag to turn it." : ""}
        </p>
      </div>

      {/* The copy lets drags through to the goggles; only the links take the pointer. */}
      <div className="pointer-events-none relative mx-auto w-full max-w-[1320px] px-5 pt-10 pb-14 sm:px-8 lg:pt-0 lg:pb-20">
        <h1 id="hero-title" className="display-xl max-w-[11ch]">
          <span className="block animate-rise-in [animation-delay:300ms]">The answer,</span>
          <span className="block animate-rise-in [animation-delay:380ms]">in your line of sight.</span>
        </h1>
        <p className="lead mt-8 max-w-[29rem] animate-rise-in [animation-delay:520ms]">
          MechLens is building AI goggles for automotive technicians. Look at a part, ask about it,
          and get verified repair information for the exact vehicle.
        </p>
        <div className="pointer-events-auto mt-10 flex w-fit animate-rise-in flex-wrap items-center gap-x-7 gap-y-4 [animation-delay:620ms]">
          <a href="#waitlist" className="button-primary">
            Join the waitlist
          </a>
          <a href="#waitlist" {...preselectRole("shop")} className="link-quiet">
            Talk to us about your shop
          </a>
        </div>
      </div>
    </section>
  );
}
