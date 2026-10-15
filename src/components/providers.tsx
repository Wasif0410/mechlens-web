"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";

/**
 * Page-wide motion settings. Motion honours the visitor's reduced-motion preference (movement off,
 * fades only), and Lenis eases scrolling unless reduced motion is on (its default). Anchor links
 * land at each section's scroll-margin-top, which clears the fixed header.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.1, anchors: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
