"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Link = { id: string; label: string };

export default function MobileMenu({
  links,
  menuLabel,
  closeLabel,
}: {
  links: Link[];
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? closeLabel : menuLabel}
        className="grid size-9 place-items-center rounded-full border border-line text-fg"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 8h16M4 16h16"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-4 top-[4.25rem] rounded-2xl border border-line bg-surface/95 p-2 shadow-[var(--shadow)] backdrop-blur-lg"
          >
            {links.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base text-fg hover:bg-surface-2"
              >
                {link.label}
                <span className="font-mono text-xs text-muted">{String(i + 2).padStart(2, "0")}</span>
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
