"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toggleTheme } from "@/lib/theme";
import { canInstall, promptInstall } from "@/lib/install";
import { switchLocale } from "@/lib/locale-switch";

type Item = {
  id: string;
  group: "navigate" | "actions" | "links";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

type Props = {
  labels: {
    placeholder: string;
    empty: string;
    groups: { navigate: string; actions: string; links: string };
    actions: {
      theme: string;
      language: string;
      sound: string;
      copyEmail: string;
      resume: string;
      install: string;
      terminal: string;
      share: string;
      saveContact: string;
      shortcuts: string;
      print: string;
    };
    copied: string;
    open: string;
  };
  sections: { id: string; label: string }[];
  otherLocale: string;
  email: string;
  resume?: string;
  links: { label: string; href: string }[];
  share: { title: string; text: string; url: string };
  /** Label for the AI chat entry; omitted when the chat is not configured. */
  ask?: string;
};

/** Follows an in-page anchor the same way a click would, so smooth scrolling still applies. */
function goTo(id: string) {
  const a = document.createElement("a");
  a.href = `#${id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function CommandPalette({
  labels,
  sections,
  otherLocale,
  email,
  resume,
  links,
  share,
  ask,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const [installable, setInstallable] = useState(false);

  const close = useCallback(() => dialog.current?.close(), []);
  const open = useCallback(() => {
    if (!dialog.current || dialog.current.open) return;
    setQuery("");
    setActive(0);
    setNote("");
    setInstallable(canInstall());
    navigator.vibrate?.(8);
    dialog.current.showModal();
    requestAnimationFrame(() => input.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", open);
    };
  }, [open, close]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = sections.map((s, i) => ({
      id: `go-${s.id}`,
      group: "navigate",
      label: s.label,
      hint: String(i + 1).padStart(2, "0"),
      keywords: s.id,
      run: () => goTo(s.id),
    }));
    list.push(
      {
        id: "theme",
        group: "actions",
        label: labels.actions.theme,
        keywords: "dark light mode",
        run: () => toggleTheme(),
      },
      {
        id: "lang",
        group: "actions",
        label: labels.actions.language,
        keywords: "language hindi english bhasha",
        run: () => switchLocale(otherLocale),
      },
      {
        id: "sound",
        group: "actions",
        label: labels.actions.sound,
        keywords: "audio music",
        run: () => window.dispatchEvent(new Event("sound:toggle")),
      },
      {
        id: "copy",
        group: "actions",
        label: labels.actions.copyEmail,
        hint: email,
        keywords: "mail contact",
        run: () => {
          navigator.clipboard?.writeText(email).then(() => setNote(labels.copied));
        },
      },
      {
        id: "terminal",
        group: "actions",
        label: labels.actions.terminal,
        keywords: "shell cli console",
        run: () => {
          goTo("terminal");
          window.setTimeout(
            () =>
              document
                .querySelector<HTMLInputElement>("#terminal input")
                ?.focus({ preventScroll: true }),
            900,
          );
        },
      },
    );
    list.push(
      {
        id: "share",
        group: "actions",
        label: labels.actions.share,
        keywords: "link qr send whatsapp",
        run: () => {
          if (navigator.share) navigator.share(share).catch(() => {});
          else navigator.clipboard?.writeText(share.url);
        },
      },
      {
        id: "vcard",
        group: "actions",
        label: labels.actions.saveContact,
        keywords: "vcf phone address book",
        run: () => {
          const a = document.createElement("a");
          a.href = "/nikhil-rai.vcf";
          a.download = "Nikhil-Rai.vcf";
          a.click();
        },
      },
      {
        id: "shortcuts",
        group: "actions",
        label: labels.actions.shortcuts,
        hint: "?",
        keywords: "keys help",
        run: () => window.setTimeout(() => window.dispatchEvent(new Event("shortcuts:open")), 50),
      },
      {
        id: "print",
        group: "actions",
        label: labels.actions.print,
        keywords: "pdf paper",
        run: () => window.setTimeout(() => window.print(), 50),
      },
    );
    if (ask)
      list.push({
        id: "ask",
        group: "actions",
        label: `✦ ${ask}`,
        keywords: "ai chat question claude",
        run: () => window.setTimeout(() => window.dispatchEvent(new Event("ask:open")), 50),
      });
    if (resume)
      list.push({
        id: "resume",
        group: "actions",
        label: labels.actions.resume,
        keywords: "cv pdf",
        run: () => window.open(resume, "_blank"),
      });
    if (installable)
      list.push({
        id: "install",
        group: "actions",
        label: labels.actions.install,
        keywords: "pwa app",
        run: () => promptInstall(),
      });
    links.forEach((l) =>
      list.push({
        id: `link-${l.label}`,
        group: "links",
        label: l.label,
        hint: "↗",
        run: () => window.open(l.href, "_blank", "noopener"),
      }),
    );
    return list;
  }, [labels, sections, otherLocale, email, resume, links, installable, share, ask]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.label} ${i.keywords ?? ""} ${i.hint ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  const run = (item: Item | undefined) => {
    if (!item) return;
    item.run();
    // Keep the dialog open briefly so the "copied" note can be read.
    if (item.id === "copy") window.setTimeout(close, 900);
    else close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  };

  const groups = (["navigate", "actions", "links"] as const).filter((g) =>
    results.some((r) => r.group === g),
  );

  return (
    <dialog
      ref={dialog}
      aria-label={labels.open}
      onClick={(e) => e.target === dialog.current && close()}
      className="palette bg-surface/95 text-fg border-line-strong m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border p-0 shadow-[var(--shadow)] backdrop-blur-xl"
    >
      <div className="border-line flex items-center gap-3 border-b px-4">
        <span aria-hidden className="text-accent font-mono text-sm">
          ›
        </span>
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={labels.placeholder}
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `pal-${results[active].id}` : undefined}
          className="placeholder:text-muted h-14 w-full bg-transparent text-base outline-none focus-visible:outline-none"
        />
        <kbd className="label border-line text-muted rounded border px-1.5 py-0.5 !text-[0.6rem]">
          esc
        </kbd>
      </div>

      <ul id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
        {results.length === 0 && (
          <li className="text-muted px-3 py-6 text-center text-sm">{labels.empty}</li>
        )}
        {groups.map((g) => (
          <li key={g} role="presentation">
            <p className="label text-muted px-3 pt-3 pb-1 !text-[0.62rem]">{labels.groups[g]}</p>
            <ul role="presentation">
              {results
                .filter((r) => r.group === g)
                .map((item) => {
                  const index = results.indexOf(item);
                  const selected = index === active;
                  return (
                    <li
                      key={item.id}
                      id={`pal-${item.id}`}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => run(item)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        selected ? "bg-accent text-accent-ink" : "text-fg/90"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hint && (
                        <span
                          className={`truncate font-mono text-xs ${selected ? "text-accent-ink/80" : "text-muted"}`}
                        >
                          {item.hint}
                        </span>
                      )}
                    </li>
                  );
                })}
            </ul>
          </li>
        ))}
      </ul>
      <p
        aria-live="polite"
        className="border-line text-muted flex items-center justify-between border-t px-4 py-2 font-mono text-[0.65rem]"
      >
        <span>↑↓ · ↵</span>
        <span className="text-accent">{note}</span>
      </p>
    </dialog>
  );
}
