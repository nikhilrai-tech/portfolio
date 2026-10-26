"use client";
import { useSyncExternalStore } from "react";

// Who's visiting (OTT-style profile), remembered per browser.
export type Viewer = "recruiter" | "engineer" | "founder" | "explorer";
const KEY = "viewer";
const EVENT = "viewer:change";

function read(): Viewer | "skipped" | null {
  try {
    return (localStorage.getItem(KEY) as Viewer | "skipped" | null) ?? null;
  } catch {
    return "skipped"; // storage blocked: don't keep asking
  }
}

export function setViewer(v: Viewer | "skipped" | null) {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

/** undefined on the server and during hydration, so nothing flashes before we know. */
export function useViewer() {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

// What each profile sees first, in order.
export const PICKS: Record<Viewer, string[]> = {
  recruiter: ["experience", "resume", "contact", "work", "ask"],
  engineer: ["journey", "notes", "terminal", "activity", "stack"],
  founder: ["work", "ask", "journey", "contact", "notes"],
  explorer: ["journey", "sound", "moments", "notes", "terminal"],
};
