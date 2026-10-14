"use client";

import dynamic from "next/dynamic";
import { POSTER_SIZE, type GogglesView } from "./scene";

const GogglesCanvas = dynamic(() => import("./goggles-canvas"), { ssr: false });

/**
 * A canvas at exactly poster size on a transparent page, so posters can sit on any background.
 * Sets `data-ready` on itself once the model is drawn.
 */
export function PosterStage({ view }: { view: GogglesView }) {
  const { width, height } = POSTER_SIZE[view];
  return (
    <>
      <style>{"html, body { background: transparent !important; }"}</style>
      <div id="poster" style={{ width, height }} className="relative">
        <GogglesCanvas
          view={view}
          onReady={() => document.getElementById("poster")?.setAttribute("data-ready", "true")}
        />
      </div>
    </>
  );
}
