"use client";
import { toggleTheme } from "@/lib/theme";

export default function ThemeToggle({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={label}
      title={label}
      className="border-line text-muted hover:border-line-strong hover:text-fg grid size-9 place-items-center rounded-full border transition-colors"
    >
      {/* Half-filled disc: reads as "contrast" in both themes, so no hydration guesswork. */}
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
      </svg>
    </button>
  );
}
