"use client";
import type Lenis from "lenis";

// The page's Lenis instance, so features like the journey player can scroll programmatically
// with the same smoothing. Null under reduced motion (native scroll is used then).
let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

/** Scrolls to a y position; `duration` in seconds, linear when `linear` is set. */
export function scrollToY(y: number, duration: number, linear = false) {
  if (lenis) {
    lenis.scrollTo(y, {
      duration,
      easing: linear ? (t) => t : undefined,
      lock: false,
      force: true,
    });
  } else {
    window.scrollTo({ top: y, behavior: duration > 0 ? "smooth" : "auto" });
  }
}

export function stopScroll() {
  if (lenis) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
}
