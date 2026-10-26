"use client";
import { useEffect, useRef, useState } from "react";
import { getSound } from "@/lib/sound";

const KEY = "sound";

export default function SoundToggle({
  labels,
}: {
  labels: { on: string; off: string; hint: string };
}) {
  const [on, setOn] = useState(false);
  const [hint, setHint] = useState(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  const toggle = async (next: boolean) => {
    const sound = getSound();
    navigator.vibrate?.(12);
    // iOS only shares device tilt after a tap-time permission; the sound tap is a natural moment.
    const motion = (
      globalThis as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }
    ).DeviceOrientationEvent;
    if (next && motion?.requestPermission) motion.requestPermission().catch(() => {});
    if (next) await sound.start();
    else sound.stop();
    setOn(next);
    setHint(false);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  };

  useEffect(() => {
    const sound = getSound();
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}

    // Browsers only start audio after a gesture, so a saved "on" resumes on the first one.
    const resume = () => {
      if (saved === "on" && !sound.on) toggle(true);
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);

    // The command palette toggles sound through this event.
    const fromPalette = () => toggle(!sound.on);
    window.addEventListener("sound:toggle", fromPalette);

    // A one-time nudge after the intro, for visitors who have never chosen.
    const nudge = saved === null ? window.setTimeout(() => setHint(true), 3200) : 0;
    const unnudge = saved === null ? window.setTimeout(() => setHint(false), 9500) : 0;

    // Each section gets its own chord.
    const ids = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) sound.setSection(ids.indexOf(e.target as HTMLElement));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ids.forEach((el) => io.observe(el));

    // Interface ticks.
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const hit = t.closest("a, button, summary");
      if (hit && hit !== (e.relatedTarget as HTMLElement | null)?.closest("a, button, summary"))
        sound.tick("hover");
    };
    const press = (e: PointerEvent) =>
      (e.target as HTMLElement).closest("a, button, summary") && sound.tick("press");
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerdown", press);
    return () => {
      window.clearTimeout(nudge);
      window.clearTimeout(unnudge);
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("sound:toggle", fromPalette);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", press);
      io.disconnect();
    };
  }, []);

  // The bars follow the real output level while sound plays.
  useEffect(() => {
    if (!on) {
      bars.current.forEach((b) => b && (b.style.transform = ""));
      return;
    }
    const sound = getSound();
    let raf = 0;
    const draw = () => {
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleY(${0.18 + sound.level([1, 3, 6, 10][i]) * 0.95})`;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  const label = on ? labels.off : labels.on;
  return (
    <div className="floating-ui fixed right-5 bottom-5 z-40 flex items-center gap-3">
      <span
        aria-hidden
        className={`label border-line bg-bg/80 text-muted rounded-full border px-3 py-1.5 !text-[0.65rem] backdrop-blur-md transition-all duration-500 ${
          hint ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
        }`}
      >
        {labels.hint} ♪
      </span>
      <button
        type="button"
        onClick={() => toggle(!on)}
        aria-pressed={on}
        aria-label={label}
        title={label}
        data-magnetic
        className="border-line bg-bg/70 text-fg hover:border-accent grid size-11 place-items-center rounded-full border backdrop-blur-md transition-colors"
      >
        <span className="eq flex h-3.5 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} ref={(el) => void (bars.current[i] = el)} />
          ))}
        </span>
      </button>
    </div>
  );
}
