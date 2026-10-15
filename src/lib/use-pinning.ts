import { useSyncExternalStore } from "react";

/**
 * Screens with room for a held, two-column scroll scene: at least 1024px wide and 736px tall,
 * which is what the network scene's heading, introduction and four steps need.
 */
const QUERY = "(min-width: 64rem) and (min-height: 46rem)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Whether the screen gets held (pinned) scroll scenes. Hydration-safe: the server and the first
 * client render assume it doesn't, so sections render their stacked layout first; the sections
 * that use this sit well below the first screen, so switching layouts never moves what's in view.
 */
export function usePinning(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
