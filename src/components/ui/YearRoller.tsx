"use client";
import { useEffect, useState } from "react";

type Chapter = { year: string; name: string };

// Odometer-style year: each digit is a strip of 0-9 that rolls to the active chapter's year.
export default function YearRoller({ chapters, label }: { chapters: Chapter[]; label: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const chapter = chapters[active] ?? chapters[0];
  return (
    <div>
      <p className="label text-muted">
        {label} {String(active + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
      </p>
      <p
        className="display text-accent mt-3 flex h-[1em] overflow-hidden text-[clamp(5rem,11vw,11rem)] leading-none"
        aria-label={chapter.year}
      >
        {chapter.year.split("").map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="relative inline-block h-[1em] w-[0.62em] overflow-hidden"
          >
            <span
              className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[900ms] ease-[cubic-bezier(0.7,0,0.2,1)]"
              style={{
                transform: `translateY(${-Number(d) * 10}%)`,
                transitionDelay: `${i * 70}ms`,
              }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1em] text-center">
                  {n}
                </span>
              ))}
            </span>
          </span>
        ))}
      </p>
      <p className="display mt-4 text-2xl md:text-3xl" aria-live="polite">
        {chapter.name}
      </p>
    </div>
  );
}
