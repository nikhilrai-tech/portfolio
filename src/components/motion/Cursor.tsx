"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

/** Scrambles an element's text and resolves it left to right, like a decoder. */
function scramble(el: HTMLElement) {
  const original = el.dataset.scrambleText ?? el.textContent ?? "";
  // Splitting Devanagari by code unit would tear vowel signs off their letters.
  if (!/^[\x20-\x7E]*$/.test(original)) return;
  el.dataset.scrambleText = original;
  if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", original);
  let frame = 0;
  const total = Math.min(22, 8 + original.length);
  const step = () => {
    el.textContent = original
      .split("")
      .map((ch, i) =>
        ch === " " || frame / total > i / original.length
          ? ch
          : GLYPHS[(Math.random() * GLYPHS.length) | 0],
      )
      .join("");
    if (frame++ < total) el.dataset.scrambleRaf = String(requestAnimationFrame(step));
    else el.textContent = original;
  };
  cancelAnimationFrame(Number(el.dataset.scrambleRaf));
  step();
}

// Desktop-only pointer effects:
//   custom cursor: a dot plus a trailing ring that grows over links and shows [data-cursor] labels
//   [data-magnetic]: elements lean toward the pointer
//   [data-scramble]: text decodes on hover
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ok = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!ok.matches || !dot.current || !ring.current) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      root.classList.remove("cursor-hidden");
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        gsap.to(magnet, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.28,
          y: (e.clientY - (r.top + r.height / 2)) * 0.38,
          duration: 0.4,
          ease: "power3",
        });
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest<HTMLElement>(
        "a, button, summary, [data-cursor], input, textarea",
      );
      const text = interactive?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      ring.current!.dataset.state = interactive ? (text ? "label" : "link") : "";
      if (label.current) label.current.textContent = text;
      if (interactive?.matches("input, textarea")) ring.current!.dataset.state = "text";

      const m = target.closest<HTMLElement>("[data-magnetic]");
      if (m !== magnet) {
        if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        magnet = m;
      }
      const s =
        target.closest<HTMLElement>("a, button")?.querySelector<HTMLElement>("[data-scramble]") ??
        target.closest<HTMLElement>("[data-scramble]");
      if (s && s !== (e.relatedTarget as HTMLElement | null)?.closest("[data-scramble]"))
        scramble(s);
    };

    const onDown = () => ring.current!.classList.add("is-down");
    const onUp = () => ring.current!.classList.remove("is-down");
    const onLeave = (e: MouseEvent) => !e.relatedTarget && root.classList.add("cursor-hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseout", onLeave);
    return () => {
      root.classList.remove("has-cursor", "cursor-hidden");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="cursor-layer pointer-events-none fixed inset-0 z-[80] hidden">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
