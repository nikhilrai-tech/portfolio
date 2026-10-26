// Scroll progress (0..1) drives the lens from wide open to stopped down.
export const F_MIN = 1.4;
export const F_MAX = 16;
const STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];

export function fNumber(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  return F_MIN * Math.pow(F_MAX / F_MIN, p);
}

/** The nearest full stop, for display. */
export function nearestStop(f: number) {
  return STOPS.reduce((best, s) => (Math.abs(Math.log(s / f)) < Math.abs(Math.log(best / f)) ? s : best));
}

/** Iris opening as a fraction of the blade housing radius. Area scales with 1/f². */
export function apertureFromF(f: number) {
  return 0.9 * (F_MIN / f) ** 0.8;
}

export function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}
