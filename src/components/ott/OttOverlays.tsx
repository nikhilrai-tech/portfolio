"use client";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/content/profile";
import { setViewer, useViewer, type Viewer } from "@/lib/viewer";
import { goTo } from "./actions";

const WATCH = "watch";
type Watch = { id: string; pct: number; at: number };

const AVATAR: Record<Viewer, { from: string; glyph: string }> = {
  recruiter: {
    from: "var(--accent)",
    glyph: "M7 8a5 5 0 1 0 10 0A5 5 0 0 0 7 8zM4 21a8 8 0 0 1 16 0",
  },
  engineer: { from: "var(--cool)", glyph: "M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" },
  founder: { from: "#a78bfa", glyph: "M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z" },
  explorer: {
    from: "#34d399",
    glyph: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z",
  },
};

// OTT-style moments: "Who's visiting?" on a first visit, and "Continue watching" on a return.
export default function OttOverlays({
  labels,
  sections,
}: {
  labels: Profile["ott"];
  sections: { id: string; label: string }[];
}) {
  const viewer = useViewer();
  const [picker, setPicker] = useState(false);
  const [resume, setResume] = useState<Watch | null>(null);
  const first = useRef<HTMLButtonElement>(null);

  // Show the picker once the boot screen is out of the way.
  useEffect(() => {
    if (viewer !== null) return;
    const root = document.documentElement;
    let timer = 0;
    const ready = () => !root.classList.contains("booting") || root.classList.contains("boot-gone");
    const poll = () => {
      if (ready()) timer = window.setTimeout(() => setPicker(true), 700);
      else timer = window.setTimeout(poll, 300);
    };
    poll();
    return () => window.clearTimeout(timer);
  }, [viewer]);

  useEffect(() => {
    if (picker) requestAnimationFrame(() => first.current?.focus());
  }, [picker]);

  // Remember where the visitor is, and offer to pick it up on their next visit.
  useEffect(() => {
    let asked = false;
    try {
      asked = sessionStorage.getItem("resumeAsked") === "1";
      sessionStorage.setItem("resumeAsked", "1");
      const saved = JSON.parse(localStorage.getItem(WATCH) ?? "null") as Watch | null;
      if (
        !asked &&
        saved &&
        saved.id !== "intro" &&
        saved.pct > 0.08 &&
        saved.pct < 0.95 &&
        Date.now() - saved.at > 60_000
      ) {
        window.setTimeout(() => setResume(saved), 2600);
      }
    } catch {}

    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    let current = "intro";
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (current = e.target.id)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    let last = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - last < 1000) return;
      last = now;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      try {
        localStorage.setItem(
          WATCH,
          JSON.stringify({ id: current, pct: max > 0 ? window.scrollY / max : 0, at: now }),
        );
      } catch {}
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  const choose = (v: Viewer | "skipped") => {
    setViewer(v);
    setPicker(false);
    navigator.vibrate?.(10);
    // Explorer asked for the story with sound; the click is the gesture browsers need.
    if (v === "explorer") window.dispatchEvent(new Event("sound:toggle"));
  };

  useEffect(() => {
    if (!picker) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && choose("skipped");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picker]);

  const section = resume && sections.find((s) => s.id === resume.id);

  return (
    <>
      {picker && viewer === null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.whos}
          className="palette bg-bg/95 fixed inset-0 z-[90] grid place-items-center overflow-y-auto p-6 backdrop-blur-xl"
        >
          <div className="w-full max-w-4xl text-center">
            <p className="display text-[clamp(2.25rem,6vw,4.5rem)]">{labels.whos}</p>
            <p className="text-muted mx-auto mt-3 max-w-md">{labels.whosSub}</p>
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {(Object.keys(labels.profiles) as Viewer[]).map((v, i) => (
                <li key={v}>
                  <button
                    ref={i === 0 ? first : undefined}
                    type="button"
                    onClick={() => choose(v)}
                    className="group w-full focus-visible:outline-none"
                  >
                    <span
                      className="group-hover:ring-fg group-focus-visible:ring-fg mx-auto grid aspect-square w-full max-w-[11rem] place-items-center rounded-2xl ring-2 ring-transparent transition-[transform,box-shadow] duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(140deg, ${AVATAR[v].from}, color-mix(in srgb, ${AVATAR[v].from} 25%, var(--surface)))`,
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="size-1/2 text-[#0a0c0f]" aria-hidden>
                        <path
                          d={AVATAR[v].glyph}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="display group-hover:text-fg text-muted mt-3 block text-xl transition-colors">
                      {labels.profiles[v].name}
                    </span>
                    <span className="text-muted block text-xs">{labels.profiles[v].tagline}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => choose("skipped")}
              className="label border-line-strong text-muted hover:text-fg hover:border-fg mt-10 rounded-full border px-5 py-2.5"
            >
              {labels.skip}
            </button>
          </div>
        </div>
      )}

      {resume && section && !picker && (
        <div
          role="status"
          className="palette border-line-strong bg-surface/95 fixed bottom-5 left-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border shadow-[var(--shadow)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="label text-muted !text-[0.62rem]">{labels.continueTitle}</p>
              <p className="display mt-1 truncate text-lg">
                {section.label} · {Math.round(resume.pct * 100)}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setResume(null);
                goTo(resume.id);
              }}
              className="bg-fg text-bg inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium"
            >
              ▶ {labels.resume}
            </button>
            <button
              type="button"
              onClick={() => setResume(null)}
              aria-label={labels.dismiss}
              className="text-muted hover:text-fg grid size-8 place-items-center"
            >
              ✕
            </button>
          </div>
          <span className="bg-line block h-1">
            <span className="bg-accent block h-full" style={{ width: `${resume.pct * 100}%` }} />
          </span>
        </div>
      )}
    </>
  );
}
