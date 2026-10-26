"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToY, stopScroll } from "@/lib/scroller";

const RUNTIME = 48; // seconds the story takes when played like a video
const PER_SCENE = 110; // scroll length per scene, in % of the viewport

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Turns the journey section into a pinned, scroll-scrubbed film with a small video player.
// Lives inside .film-stage and drives the server-rendered scenes around it.
export default function JourneyFilm({
  chapters,
  labels,
}: {
  chapters: string[];
  labels: { play: string; pause: string; replay: string };
}) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stage = root.current?.closest<HTMLElement>(".film-stage");
    const film = stage?.closest<HTMLElement>("[data-film]");
    if (!stage || !film) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.documentElement.classList.add("film-on");
      setEnabled(true);
      const scenes = Array.from(stage.querySelectorAll<HTMLElement>("[data-scene]"));
      const stages = Array.from(stage.querySelectorAll<HTMLElement>("[data-stage]"));
      gsap.set(scenes, { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      scenes.forEach((scene, i) => {
        const last = i === scenes.length - 1;
        const q = gsap.utils.selector(scene);
        tl.addLabel(`scene${i}`);
        tl.to(scene, { autoAlpha: 1, duration: 0.25 }, ">");
        tl.from(q("[data-year]"), { yPercent: 70, opacity: 0, duration: 0.5 }, "<");
        tl.from(q("[data-bit]"), { y: 28, opacity: 0, duration: 0.4, stagger: 0.08 }, "<0.1");

        const draws = q(".draw");
        if (draws.length) {
          gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 });
          tl.to(
            draws,
            { strokeDashoffset: 0, duration: 0.8, stagger: 0.02, ease: "power1.inOut" },
            "<",
          );
        }
        const pops = q(".pop:not(.blocked)");
        if (pops.length)
          tl.from(
            pops,
            {
              scale: 0,
              opacity: 0,
              transformOrigin: "50% 50%",
              duration: 0.35,
              stagger: 0.05,
              ease: "back.out(2)",
            },
            "<0.2",
          );
        const bars = q(".bar");
        if (bars.length)
          tl.from(
            bars,
            { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, stagger: 0.05 },
            "<0.2",
          );
        const pods = q(".pod");
        if (pods.length)
          tl.from(
            pods,
            {
              scale: 0,
              opacity: 0,
              transformOrigin: "50% 50%",
              duration: 0.25,
              stagger: 0.06,
              ease: "back.out(2)",
            },
            "<0.3",
          );
        q(".mover").forEach((m) => {
          const route = scene.querySelector<SVGPathElement>(m.dataset.route ?? "");
          if (!route) return;
          tl.fromTo(
            m,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.9,
              ease: "none",
              motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] },
            },
            "<0.1",
          );
        });
        const blocked = q(".blocked");
        if (blocked.length) {
          tl.from(
            blocked,
            {
              scale: 0,
              opacity: 0,
              transformOrigin: "50% 50%",
              duration: 0.3,
              ease: "back.out(3)",
            },
            ">",
          );
          tl.to(q(".mover"), { opacity: 0, duration: 0.15 }, "<");
        }
        tl.from(q("[data-tool]"), { x: 60, opacity: 0, duration: 0.35, stagger: 0.06 }, "<0.1");

        // Light the pipeline as the story goes: two stages for the first chapter, then one each.
        const lit = i === 0 ? [0, 1] : [i + 1];
        lit.forEach((s) => stages[s] && tl.to(stages[s], { "--lit": 1, duration: 0.3 }, "<"));

        tl.to({}, { duration: 0.9 }); // hold, so each chapter can be read
        if (!last) tl.to(scene, { autoAlpha: 0, y: -40, duration: 0.35, ease: "power2.in" });
      });

      const st = ScrollTrigger.create({
        trigger: film,
        start: "top top",
        end: () => `+=${scenes.length * PER_SCENE}%`,
        pin: stage,
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
        onLeave: () => setPlaying(false),
        // Lets floating buttons step aside on phones while the film is on screen.
        onToggle: (self) => document.documentElement.classList.toggle("film-active", self.isActive),
      });
      trigger.current = st;

      return () => {
        st.kill();
        tl.kill();
        trigger.current = null;
        document.documentElement.classList.remove("film-on", "film-active");
        setEnabled(false);
      };
    });
    return () => mm.revert();
  }, []);

  // Any manual scroll input pauses playback, like grabbing a video's scrubber.
  useEffect(() => {
    if (!playing) return;
    const pause = () => {
      stopScroll();
      setPlaying(false);
    };
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchstart", pause, { passive: true });
    window.addEventListener("keydown", pause);
    return () => {
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchstart", pause);
      window.removeEventListener("keydown", pause);
    };
  }, [playing]);

  const play = () => {
    const st = trigger.current;
    if (!st) return;
    if (playing) {
      stopScroll();
      setPlaying(false);
      return;
    }
    navigator.vibrate?.(8);
    const from = progress >= 0.995 || window.scrollY < st.start - 4 ? 0 : progress;
    if (from === 0) window.scrollTo(0, st.start + 1);
    setPlaying(true);
    // Let the jump to the start settle before the long linear scroll begins.
    requestAnimationFrame(() => scrollToY(st.end, RUNTIME * (1 - from), true));
  };

  const jump = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    stopScroll();
    setPlaying(false);
    const y = st.start + ((st.end - st.start) * i) / (chapters.length + 1) + 8;
    scrollToY(y, 1.1);
  };

  const done = progress >= 0.995;
  const label = playing ? labels.pause : done ? labels.replay : labels.play;
  const active = Math.min(chapters.length, Math.floor(progress * (chapters.length + 1)));

  return (
    <div ref={root} className={`film-player ${enabled ? "" : "hidden"}`}>
      <button
        type="button"
        onClick={play}
        aria-label={label}
        data-magnetic
        className="bg-accent text-accent-ink grid size-11 shrink-0 place-items-center rounded-full transition active:scale-95"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        )}
      </button>
      <span className="label text-fg hidden !text-[0.65rem] sm:inline">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {[...chapters, "→"].map((c, i) => {
          const segStart = i / (chapters.length + 1);
          const fill = Math.min(1, Math.max(0, (progress - segStart) * (chapters.length + 1)));
          return (
            <button
              key={c}
              type="button"
              onClick={() => jump(i)}
              title={c}
              aria-label={c}
              className="group relative h-6 flex-1"
            >
              <span className="bg-line-strong absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full">
                <span
                  className="bg-accent block h-full origin-left"
                  style={{ transform: `scaleX(${fill})` }}
                />
              </span>
              <span
                className={`label absolute inset-x-0 -top-5 hidden truncate pr-2 text-left !text-[0.58rem] lg:block ${i === active ? "text-fg" : "text-muted"}`}
              >
                {c}
              </span>
            </button>
          );
        })}
      </div>
      <span className="text-muted shrink-0 font-mono text-xs tabular-nums">
        {fmt(progress * RUNTIME)} / {fmt(RUNTIME)}
      </span>
    </div>
  );
}
