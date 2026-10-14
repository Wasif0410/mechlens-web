"use client";

import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import { Component, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { GogglesView } from "./scene";

const GogglesCanvas = dynamic(() => import("./goggles-canvas"), { ssr: false });

let webglSupport: boolean | undefined;

/** Whether this browser can draw WebGL. Checked once; the probe context is released at once. */
function supportsWebGL(): boolean {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      webglSupport = Boolean(gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const noSubscription = () => () => {};

/** Renders nothing if the 3D view throws, so the poster underneath stays in place. */
class FallbackToPoster extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Shows the pre-rendered poster straight away, then swaps in the live, draggable model once the
 * page is idle, the viewer is on screen and the model is drawn. If WebGL is missing or fails, the
 * poster stays.
 */
export function GogglesViewer({
  view,
  poster,
  alt,
  sizes,
  aspectRatio,
  maxWidth,
  caption,
  preload = false,
}: {
  view: GogglesView;
  poster: StaticImageData;
  alt: string;
  sizes: string;
  aspectRatio: string;
  maxWidth: number;
  /** Shown under the model. "Drag to turn it." is added once the live model is showing. */
  caption: string;
  preload?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useSyncExternalStore(noSubscription, supportsWebGL, () => false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let idle: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && idle === undefined) {
          // Load the 3D code after the page has settled, not in the middle of hydration.
          idle =
            typeof window.requestIdleCallback === "function"
              ? window.requestIdleCallback(() => setMounted(true), { timeout: 2000 })
              : window.setTimeout(() => setMounted(true), 300);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (idle !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
    };
  }, []);

  const live = webgl && mounted && !failed;
  const showing = live && ready;

  return (
    <>
      <div ref={ref} style={{ aspectRatio, maxWidth }} className="relative mx-auto w-full">
        <Image
          src={poster}
          alt={alt}
          preload={preload}
          sizes={sizes}
          className={`size-full object-contain transition-opacity duration-700 ${showing ? "opacity-0" : "opacity-100"}`}
        />
        {live && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${showing ? "opacity-100" : "opacity-0"}`}
            aria-hidden="true"
          >
            <FallbackToPoster onError={() => setFailed(true)}>
              <GogglesCanvas
                view={view}
                interactive
                active={visible}
                onReady={() => setReady(true)}
                onContextLost={() => setFailed(true)}
              />
            </FallbackToPoster>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-ink-muted">
        {caption}
        {showing ? " Drag to turn it." : ""}
      </p>
    </>
  );
}
