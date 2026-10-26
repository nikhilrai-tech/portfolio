"use client";

type Theme = "light" | "dark";

export function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Flips the theme and remembers it. Where View Transitions exist, the new theme spreads as a
 * circle from `origin` (usually the button that was pressed).
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced) return apply();

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  document.startViewTransition(apply).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 650,
        easing: "cubic-bezier(0.7, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}
