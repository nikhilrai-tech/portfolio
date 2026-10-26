"use client";
import { useState } from "react";

// Native share sheet where the browser has one (phones), otherwise copies the link.
export default function ShareButton({
  title,
  text,
  url,
  label,
  copiedLabel,
}: {
  title: string;
  text: string;
  url: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    navigator.vibrate?.(8);
    const data = { title, text, url };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={share}
      data-magnetic
      className="bg-accent text-accent-ink inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition hover:brightness-110 active:scale-[0.98]"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
