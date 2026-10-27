"use client";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/content/profile";

type State = "idle" | "sending" | "sent" | "error" | "limited" | "invalid";

export default function ContactForm({ labels, email }: { labels: Profile["form"]; email: string }) {
  const [state, setState] = useState<State>("idle");
  const started = useRef(0);
  const topicRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    started.current = Date.now();
    // "Send a brief" on a service card picks the matching topic.
    const pick = (e: Event) => {
      const topic = (e as CustomEvent<string>).detail;
      if (topicRef.current && topic in labels.topics) topicRef.current.value = topic;
    };
    window.addEventListener("contact:topic", pick);
    return () => window.removeEventListener("contact:topic", pick);
  }, [labels.topics]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setState("sending");
    navigator.vibrate?.(8);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, t: started.current }),
      });
      if (res.ok) {
        setState("sent");
        form.reset();
        return;
      }
      if (res.status === 429) return setState("limited");
      if (res.status === 422) return setState("invalid");
      throw new Error(String(res.status));
    } catch {
      // Not configured or failed: hand the message to the visitor's own mail app.
      setState("error");
      const topic = labels.topics[data.topic as keyof typeof labels.topics];
      const subject = encodeURIComponent(
        `${topic && data.topic !== "other" ? `${topic}: ` : ""}Hello from ${data.name || "your portfolio"}`,
      );
      const body = encodeURIComponent(`${data.message ?? ""}\n\n— ${data.name ?? ""}`);
      window.setTimeout(
        () => (window.location.href = `mailto:${email}?subject=${subject}&body=${body}`),
        900,
      );
    }
  };

  const field =
    "border-line bg-bg/60 focus:border-accent placeholder:text-muted w-full rounded-2xl border px-4 py-3 text-base outline-none transition-colors focus-visible:outline-none";
  const status: Partial<Record<State, string>> = {
    sent: labels.sent,
    error: labels.error,
    limited: labels.limited,
    invalid: labels.invalid,
  };

  return (
    <form
      id="brief"
      onSubmit={submit}
      className="border-line bg-surface/70 rounded-3xl border p-6 backdrop-blur-md md:p-8"
      noValidate
    >
      <p className="display text-2xl md:text-3xl">{labels.heading}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">{labels.name}</span>
          <input
            name="name"
            required
            maxLength={80}
            autoComplete="name"
            placeholder={labels.name}
            className={field}
          />
        </label>
        <label className="block">
          <span className="sr-only">{labels.email}</span>
          <input
            name="email"
            type="email"
            required
            maxLength={120}
            autoComplete="email"
            inputMode="email"
            placeholder={labels.email}
            className={field}
          />
        </label>
        <label className="relative block sm:col-span-2">
          <span className="sr-only">{labels.topic}</span>
          <select
            ref={topicRef}
            name="topic"
            defaultValue=""
            className={`${field} appearance-none`}
          >
            <option value="" disabled>
              {labels.topic}
            </option>
            {Object.entries(labels.topics).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="text-muted pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
          >
            ▾
          </span>
        </label>
        <label className="block sm:col-span-2">
          <span className="sr-only">{labels.message}</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
            placeholder={labels.message}
            className={`${field} resize-y`}
          />
        </label>
        {/* Honeypot: hidden from people, irresistible to bots. */}
        <label className="hidden" aria-hidden>
          company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          data-magnetic
          className="bg-accent text-accent-ink inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition hover:brightness-110 disabled:opacity-60"
        >
          {state === "sending" ? labels.sending : labels.send}
        </button>
        <p
          aria-live="polite"
          className={`text-sm ${state === "sent" ? "text-cool" : state === "idle" || state === "sending" ? "text-muted" : "text-accent"}`}
        >
          {status[state] ?? labels.note}
        </p>
      </div>
    </form>
  );
}
