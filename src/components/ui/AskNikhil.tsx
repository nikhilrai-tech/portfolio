"use client";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/content/profile";

type Msg = { role: "user" | "assistant"; content: string };

// Floating "Ask about me" chat. Streams plain-text answers from /api/ask.
export default function AskNikhil({ labels, email }: { labels: Profile["ask"]; email: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("ask:open", show);
    return () => window.removeEventListener("ask:open", show);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => field.current?.focus({ preventScroll: true }));
  }, [open]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    navigator.vibrate?.(6);
    const history: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const append = (text: string) =>
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: copy[copy.length - 1].content + text,
        };
        return copy;
      });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10), lang: document.documentElement.lang }),
      });
      if (!res.ok || !res.body) {
        append(res.status === 429 ? labels.limited : labels.unavailable);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        append(decoder.decode(value, { stream: true }));
      }
    } catch {
      append(labels.unavailable);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ask-panel"
        data-magnetic
        className="border-accent/50 bg-bg/80 text-fg hover:border-accent fixed right-5 bottom-20 z-40 flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-[var(--shadow)] backdrop-blur-md transition-colors"
      >
        <span className="text-accent" aria-hidden>
          ✦
        </span>
        <span className="hidden sm:inline">{labels.launcher}</span>
        <span className="sr-only sm:hidden">{labels.launcher}</span>
      </button>

      {open && (
        <section
          id="ask-panel"
          aria-label={labels.title}
          className="palette border-line-strong bg-surface/95 fixed right-3 bottom-[8.25rem] z-50 flex h-[min(34rem,68svh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border shadow-[var(--shadow)] backdrop-blur-xl sm:right-5"
        >
          <header className="border-line flex items-center justify-between border-b px-5 py-3">
            <p className="font-display font-semibold tracking-tight">
              <span className="text-accent">✦</span> {labels.title}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.close}
              className="text-muted hover:text-fg grid size-8 place-items-center rounded-full"
            >
              ✕
            </button>
          </header>

          <div
            ref={list}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm"
          >
            {msgs.length === 0 && (
              <>
                <p className="text-muted">{labels.intro}</p>
                <div className="flex flex-col items-start gap-2 pt-1">
                  {labels.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="border-line hover:border-accent rounded-2xl border px-3 py-2 text-left transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {msgs.map((m, i) => (
              <p
                key={i}
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-accent text-accent-ink ml-auto"
                    : "bg-bg/70 border-line border"
                }`}
              >
                {m.content || (
                  <span className="text-muted inline-flex gap-1" aria-label="…">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:150ms]">●</span>
                    <span className="animate-pulse [animation-delay:300ms]">●</span>
                  </span>
                )}
              </p>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="border-line flex items-center gap-2 border-t p-3"
          >
            <input
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1200}
              placeholder={labels.placeholder}
              aria-label={labels.placeholder}
              className="placeholder:text-muted bg-bg/60 border-line focus:border-accent min-w-0 flex-1 rounded-full border px-4 py-2.5 text-base outline-none focus-visible:outline-none md:text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="bg-accent text-accent-ink h-10 shrink-0 rounded-full px-4 text-sm font-medium disabled:opacity-50"
            >
              {labels.send}
            </button>
          </form>
          <p className="text-muted px-5 pb-3 text-[0.68rem]">
            {labels.disclaimer}{" "}
            <a href={`mailto:${email}`} className="underline underline-offset-2">
              {email}
            </a>
          </p>
        </section>
      )}
    </>
  );
}
