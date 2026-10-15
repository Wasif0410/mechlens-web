import { useSyncExternalStore } from "react";

/**
 * Screens big enough for a pinned scroll scene: at least tablet width and 640px tall. Keep in step
 * with the `pin` variant in src/app/globals.css, which applies the pinned layout in CSS.
 */
const QUERY = "(min-width: 48rem) and (min-height: 40rem)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Whether the screen gets pinned scroll scenes. Hydration-safe like usePrefersReducedMotion: the
 * server and the first client render assume a pinning screen, then React re-renders with the real
 * answer.
 */
export function usePinning(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
}
