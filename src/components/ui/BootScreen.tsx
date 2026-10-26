"use client";
import { useEffect, useRef } from "react";

const LINES = [
  "$ ssh nikhil@infra.ap-south-1",
  "> resolving edge ............... ok",
  "> terraform apply .............. ✓",
  "> kubectl rollout status ........ ✓",
  "> loading portfolio [en|hi] ..... ✓",
  "> all systems operational",
];

// Boot overlay shown on the first visit of a session. Rendered on the server so it covers the
// very first paint; CSS hides it on its own after a few seconds if this script never runs.
export default function BootScreen({ skipLabel }: { skipLabel: string }) {
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("booting") || root.classList.contains("boot-done")) return;
    const started = performance.now();
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    let raf = 0;
    let shown = 0;

    const finish = () => {
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem("booted", "1");
      } catch {
        // Private mode: the intro simply plays again next time.
      }
      root.classList.add("boot-done");
      // Keep "booting" so the hero's delayed entrance timing never changes mid-animation.
      window.setTimeout(() => root.classList.add("boot-gone"), 900);
    };

    const step = () => {
      const elapsed = performance.now() - started;
      // Ease toward 90% while loading, then run to 100% once the page is ready.
      const target = loaded && elapsed > 1500 ? 100 : Math.min(90, (elapsed / 1500) * 90);
      shown += (target - shown) * 0.12;
      if (pct.current) pct.current.textContent = String(Math.round(shown)).padStart(3, "0");
      if (shown > 99.4) return finish();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const skip = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div id="boot" aria-hidden className="boot">
      <div className="boot-inner">
        <p className="label text-muted flex items-center justify-between">
          <span>NR · boot</span>
          <button
            type="button"
            className="hover:text-fg pointer-events-auto transition-colors"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
          >
            {skipLabel} ⎋
          </button>
        </p>
        <ol className="mt-10 space-y-2 font-mono text-[0.8rem] md:text-sm">
          {LINES.map((line, i) => (
            <li
              key={line}
              className={`boot-line ${i === LINES.length - 1 ? "text-accent" : "text-fg/80"}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              {line}
            </li>
          ))}
        </ol>
        <div className="mt-auto flex items-end justify-between gap-6">
          <p className="display text-[clamp(4rem,16vw,11rem)] leading-none">
            <span ref={pct}>000</span>
            <span className="text-accent">%</span>
          </p>
          <p className="label text-muted hidden pb-3 sm:block">
            Nikhil Rai · IT &amp; Infrastructure
          </p>
        </div>
        <span className="boot-bar" />
      </div>
    </div>
  );
}
