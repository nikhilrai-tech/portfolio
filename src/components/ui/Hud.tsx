"use client";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type Section = { id: string; label: string };

// Status bar in the corner: which section is live, scroll progress and local time in India.
// Hidden over the hero, where it would sit on top of the stats.
export default function Hud({ sections }: { sections: Section[] }) {
  const root = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const mobileBar = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (pctRef.current) pctRef.current.textContent = `${Math.round(self.progress * 100)}%`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
        if (mobileBar.current) mobileBar.current.style.transform = `scaleX(${self.progress})`;
      },
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sections.findIndex((s) => s.id === entry.target.id);
          if (index < 0) continue;
          if (indexRef.current)
            indexRef.current.textContent = `${String(index + 1).padStart(2, "0")}/${String(sections.length).padStart(2, "0")}`;
          if (nameRef.current) nameRef.current.textContent = sections[index].label;
          root.current?.toggleAttribute("data-hidden", index === 0);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const tick = () =>
      clockRef.current && (clockRef.current.textContent = `IST ${fmt.format(new Date())}`);
    tick();
    const clock = window.setInterval(tick, 15000);
    return () => {
      st.kill();
      io.disconnect();
      window.clearInterval(clock);
    };
  }, [sections]);

  return (
    <>
      <span
        ref={mobileBar}
        aria-hidden
        className="bg-accent pointer-events-none fixed inset-x-0 top-16 z-50 block h-0.5 origin-left scale-x-0 sm:hidden"
      />
      <div
        ref={root}
        aria-hidden
        data-hidden
        className="border-line bg-bg/70 text-muted pointer-events-none fixed bottom-5 left-5 z-40 hidden overflow-hidden rounded-lg border font-mono text-[0.7rem] tracking-wider backdrop-blur-md transition-[opacity,transform] duration-500 data-[hidden]:translate-y-3 data-[hidden]:opacity-0 sm:block"
      >
        <div className="flex items-center gap-2.5 px-3 py-2">
          <span className="relative flex size-1.5">
            <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-accent relative inline-flex size-1.5 rounded-full" />
          </span>
          <span ref={indexRef} className="text-accent">
            01/{String(sections.length).padStart(2, "0")}
          </span>
          <span ref={nameRef} className="text-fg uppercase">
            {sections[0]?.label}
          </span>
          <span className="text-line-strong">·</span>
          <span ref={pctRef}>0%</span>
          <span className="text-line-strong">·</span>
          <span ref={clockRef} />
        </div>
        <span ref={barRef} className="bg-accent block h-px origin-left scale-x-0" />
      </div>
    </>
  );
}
