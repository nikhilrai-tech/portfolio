"use client";
import { useEffect, useState } from "react";
import { canInstall, promptInstall } from "@/lib/install";

// Only appears when the browser says the site can be installed (Chromium on desktop/Android).
export default function InstallButton({ label }: { label: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const on = () => setReady(canInstall());
    on();
    window.addEventListener("install:ready", on);
    window.addEventListener("install:done", on);
    return () => {
      window.removeEventListener("install:ready", on);
      window.removeEventListener("install:done", on);
    };
  }, []);
  if (!ready) return null;
  return (
    <button
      type="button"
      onClick={() => promptInstall()}
      className="border-line-strong hover:border-fg inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          d="M12 3v12M7 10l5 5 5-5M5 21h14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
