"use client";
import { person } from "@/content/profile";

/** Follows an in-page anchor the same way a click would, so smooth scrolling applies. */
export function goTo(id: string) {
  const a = document.createElement("a");
  a.href = `#${id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// What tapping a "Top picks" poster does.
export const ACTIONS: Record<string, () => void> = {
  experience: () => goTo("experience"),
  resume: () => person.resume && window.open(person.resume, "_blank"),
  contact: () => goTo("contact"),
  journey: () => {
    goTo("journey");
    window.setTimeout(() => window.dispatchEvent(new Event("journey:play")), 1400);
  },
  notes: () => goTo("notes"),
  terminal: () => {
    goTo("terminal");
    window.setTimeout(
      () =>
        document.querySelector<HTMLInputElement>("#terminal input")?.focus({ preventScroll: true }),
      1200,
    );
  },
  activity: () => goTo("activity"),
  work: () => goTo("work"),
  ask: () => window.dispatchEvent(new Event("ask:open")),
  moments: () => goTo("photography"),
  sound: () => window.dispatchEvent(new Event("sound:toggle")),
  stack: () => goTo("stack"),
};
