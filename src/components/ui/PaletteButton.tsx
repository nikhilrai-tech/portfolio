"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};
// ⌘ on Apple devices, Ctrl elsewhere. The server renders ⌘ and the client corrects it.
const modKey = () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl");

export default function PaletteButton({ label }: { label: string }) {
  const mod = useSyncExternalStore(noop, modKey, () => "⌘");
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("palette:open"))}
      aria-label={label}
      title={label}
      className="label border-line text-muted hover:border-line-strong hover:text-fg hidden h-9 items-center gap-1 rounded-full border px-3 !text-[0.65rem] transition-colors md:inline-flex"
    >
      <span>{mod}</span>
      <span>K</span>
    </button>
  );
}
