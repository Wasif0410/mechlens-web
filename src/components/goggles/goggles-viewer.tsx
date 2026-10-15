"use client";

import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import { Component, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { GogglesCanvasProps } from "./goggles-canvas";

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

export function useWebGL(): boolean {
  return useSyncExternalStore(noSubscription, supportsWebGL, () => false);
}

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
 * Shows the pre-rendered poster straight away, then swaps in the live model once the page is
 * idle, the viewer is on screen and the model is drawn. If WebGL is missing or fails, the poster
 * stays. Fills its positioned parent. Without a `poster`, the parent supplies its own stills.
 */
export function GogglesViewer({
  poster,
  alt,
  sizes,
  preload = false,
  canvas,
  onShowingChange,
}: {
  poster?: StaticImageData;
  alt: string;
  sizes: string;
  preload?: boolean;
  canvas: Omit<GogglesCanvasProps, "active" | "onReady" | "onContextLost">;
  onShowingChange?: (showing: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
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

  useEffect(() => {
    onShowingChange?.(showing);
  }, [showing, onShowingChange]);

  return (
    <div ref={ref} className="absolute inset-0">
      {poster && (
        <Image
          src={poster}
          alt={alt}
          preload={preload}
          sizes={sizes}
          fill
          className={`object-contain transition-opacity duration-700 ${showing ? "opacity-0" : "opacity-100"}`}
        />
      )}
      {live && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${showing ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        >
          <FallbackToPoster onError={() => setFailed(true)}>
            <GogglesCanvas
              {...canvas}
              active={visible}
              onReady={() => setReady(true)}
              onContextLost={() => setFailed(true)}
            />
          </FallbackToPoster>
        </div>
      )}
    </div>
  );
}
