"use client";
import type { ServiceId } from "@/content/types";
import { scrollToY } from "@/lib/scroller";

// Picks the topic in the contact form and glides down to it.
export default function BriefButton({
  topic,
  children,
}: {
  topic: ServiceId;
  children: React.ReactNode;
}) {
  const open = () => {
    window.dispatchEvent(new CustomEvent("contact:topic", { detail: topic }));
    const form = document.getElementById("brief");
    if (form) scrollToY(form.getBoundingClientRect().top + window.scrollY - 96, 1.1);
  };
  return (
    <button
      type="button"
      onClick={open}
      className="text-accent hover:text-fg inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
    >
      {children} <span aria-hidden>↓</span>
    </button>
  );
}
