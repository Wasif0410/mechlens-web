"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { type GogglesView, POSTER_SIZE } from "./poster";

const GogglesCanvas = dynamic(() => import("./goggles-canvas"), { ssr: false });

/**
 * A canvas at exactly poster size on a transparent page, so posters can sit on any background.
 * For the product view, `progress` fixes the scroll position the pose is taken from. Sets
 * `data-ready` on itself once the model has settled. `mask` renders the lens mask instead.
 */
export function PosterStage({ view, progress, mask = false }: { view: GogglesView; progress?: number; mask?: boolean }) {
  const { width, height } = POSTER_SIZE[view];
  const progressRef = useRef(progress ?? 0);
  return (
    <>
      <style>{"html, body { background: transparent !important; } body::after { display: none; }"}</style>
      <div id="poster" style={{ width, height }} className="relative">
        <GogglesCanvas
          view={view}
          mask={mask}
          progressRef={progress === undefined ? undefined : progressRef}
          onReady={() => {
            // The product pose eases into place; give it time to settle before capture.
            window.setTimeout(() => document.getElementById("poster")?.setAttribute("data-ready", "true"), progress === undefined ? 0 : 2500);
          }}
        />
      </div>
    </>
  );
}
