"use client";
import { useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";

export default function CopyEmail({
  email,
  copyLabel,
  copiedLabel,
}: {
  email: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="border-line-strong hover:border-fg relative inline-flex h-12 min-w-36 items-center justify-center overflow-hidden rounded-full border px-6 text-sm font-medium transition-colors"
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={copied ? "done" : "idle"}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={copied ? "text-accent" : undefined}
          >
            {copied ? copiedLabel : copyLabel}
          </m.span>
        </AnimatePresence>
      </LazyMotion>
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
