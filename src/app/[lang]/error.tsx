"use client";
import { useParams } from "next/navigation";

// Small inline copy: this file must stay independent of the content modules so it can render
// even when they are what failed.
const copy = {
  en: {
    title: "Something broke.",
    body: "A part of the page failed to load. Trying again usually fixes it.",
    retry: "Try again",
    home: "Homepage",
  },
  hi: {
    title: "कुछ टूट गया।",
    body: "पेज का एक हिस्सा लोड नहीं हो पाया। दोबारा कोशिश करने से अक्सर ठीक हो जाता है।",
    retry: "फिर से कोशिश करें",
    home: "होम पेज",
  },
};

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useParams<{ lang: string }>();
  const t = lang === "hi" ? copy.hi : copy.en;
  return (
    <main className="grid min-h-[100svh] place-items-center px-4 text-center">
      <div>
        <p className="display text-accent text-[clamp(5rem,20vw,12rem)] leading-none">500</p>
        <p className="label text-muted mt-6">incident · auto-recovery available</p>
        <h1 className="display mt-6 text-[clamp(2rem,6vw,4rem)]">{t.title}</h1>
        <p className="text-muted mx-auto mt-4 max-w-md">{t.body}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-accent text-accent-ink h-12 rounded-full px-6 text-sm font-medium"
          >
            {t.retry}
          </button>
          <a
            href={`/${lang === "hi" ? "hi" : "en"}`}
            className="border-line-strong inline-flex h-12 items-center rounded-full border px-6 text-sm font-medium"
          >
            {t.home}
          </a>
        </div>
      </div>
    </main>
  );
}
