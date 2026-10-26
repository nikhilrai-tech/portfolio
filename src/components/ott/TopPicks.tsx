"use client";
import type { Profile } from "@/content/profile";
import { PICKS, setViewer, useViewer } from "@/lib/viewer";
import RichText from "@/components/ui/RichText";
import { ACTIONS } from "./actions";

// Small line-art glyph per poster.
const GLYPH: Record<string, string> = {
  experience: "M4 18h16M6 18V9l6-4 6 4v9M10 18v-5h4v5",
  resume: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
  contact: "M4 6h16v12H4zM4 7l8 6 8-6",
  journey: "M8 5v14l11-7z",
  notes: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h4",
  terminal: "M4 5h16v14H4zM7 9l3 3-3 3M12 15h5",
  activity: "M4 14h3l2-6 3 10 2-6h6",
  work: "M4 7h16v12H4zM9 7V5h6v2",
  ask: "M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z",
  moments: "M4 7h4l2-2h4l2 2h4v12H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  sound: "M4 10h4l5-4v12l-5-4H4zM16 9a4 4 0 0 1 0 6M18 7a7 7 0 0 1 0 10",
  stack: "M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
};

export default function TopPicks({ labels }: { labels: Profile["ott"] }) {
  const viewer = useViewer();
  if (!viewer || viewer === "skipped") return null;
  const items = PICKS[viewer];

  return (
    <section
      aria-label={`${labels.picks} ${labels.profiles[viewer].name}`}
      className="relative z-10 pb-6"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="display text-xl md:text-2xl">
            {labels.picks} <span className="text-accent">{labels.profiles[viewer].name}</span>
          </p>
          <button
            type="button"
            onClick={() => setViewer(null)}
            className="label text-muted hover:text-fg"
          >
            {labels.change}
          </button>
        </div>
      </div>
      <ul className="no-scrollbar mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-2 pb-4 sm:scroll-px-6 sm:px-6 lg:snap-none lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
        {items.map((id, i) => {
          const item = labels.items[id as keyof Profile["ott"]["items"]];
          const playable = id === "journey" || id === "sound";
          return (
            <li key={id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => ACTIONS[id]?.()}
                className="group border-line hover:border-accent relative flex aspect-video w-[15rem] flex-col justify-end overflow-hidden rounded-2xl border p-4 text-left transition-[transform,border-color] duration-300 hover:z-10 hover:scale-[1.06] md:w-[17rem]"
                style={{
                  background: `radial-gradient(120% 90% at ${i % 2 ? "100%" : "0%"} 0%, color-mix(in srgb, ${
                    i % 2 ? "var(--cool)" : "var(--accent)"
                  } 28%, transparent), transparent 70%), var(--surface)`,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="text-fg/80 absolute top-4 right-4 size-9"
                  aria-hidden
                >
                  <path
                    d={GLYPH[id]}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="label text-accent absolute top-4 left-4 !text-[0.6rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-xl">{item.title}</span>
                <span className="text-muted mt-0.5 text-xs">
                  <RichText text={item.sub} />
                </span>
                <span className="bg-fg text-bg mt-3 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {playable ? "▶" : "↗"} {playable ? labels.play : labels.open}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
