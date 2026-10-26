"use client";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { fNumber, nearestStop } from "@/lib/fstop";

type Section = { id: string; label: string };

// Viewfinder read-out: live f-stop from scroll, and which frame (section) is in view.
export default function Hud({ sections, frameLabel }: { sections: Section[]; frameLabel: string }) {
  const fRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (fRef.current) fRef.current.textContent = `f/${nearestStop(fNumber(self.progress))}`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
      },
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sections.findIndex((s) => s.id === entry.target.id);
          if (index < 0) continue;
          if (frameRef.current) frameRef.current.textContent = `${index + 1}/${sections.length}`;
          if (nameRef.current) nameRef.current.textContent = sections[index].label;
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      st.kill();
      io.disconnect();
    };
  }, [sections]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-5 left-5 z-40 hidden overflow-hidden rounded-lg border border-line bg-bg/70 font-mono text-[0.7rem] tracking-wider text-muted backdrop-blur-md sm:block"
    >
      <div className="flex items-center gap-2.5 px-3 py-2">
        <span className="size-1.5 rounded-full bg-accent" />
        <span ref={fRef} className="min-w-[3.2em] text-accent">
          f/1.4
        </span>
        <span className="text-line-strong">·</span>
        <span>
          {frameLabel} <span ref={frameRef}>1/{sections.length}</span>
        </span>
        <span className="text-line-strong">·</span>
        <span ref={nameRef} className="text-fg">
          {sections[0]?.label}
        </span>
      </div>
      <span ref={barRef} className="block h-px origin-left scale-x-0 bg-accent" />
    </div>
  );
}
