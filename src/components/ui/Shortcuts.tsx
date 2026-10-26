"use client";
import { useEffect, useRef } from "react";

// "?" opens a small sheet listing the keyboard shortcuts (ignored while typing).
export default function Shortcuts({
  title,
  items,
}: {
  title: string;
  items: { keys: string; label: string }[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => dialog.current && !dialog.current.open && dialog.current.showModal();
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, [contenteditable]");
      if (e.key === "?" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("shortcuts:open", open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("shortcuts:open", open);
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="palette bg-surface/95 text-fg border-line-strong m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border p-6 shadow-[var(--shadow)] backdrop-blur-xl"
    >
      <p className="label text-accent">{title}</p>
      <ul className="mt-5 space-y-3">
        {items.map((it) => (
          <li key={it.keys} className="flex items-center justify-between gap-6 text-sm">
            <span className="text-fg/90">{it.label}</span>
            <kbd className="border-line text-muted rounded-md border px-2 py-0.5 font-mono text-xs">
              {it.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
