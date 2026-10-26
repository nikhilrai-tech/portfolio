"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// three.js and the scene load only after hydration, in their own chunk.
const LensScene = dynamic(() => import("./LensScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export type Pointer = { x: number; y: number };

export default function LensCanvas() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [maxDpr, setMaxDpr] = useState(2);
  const wrapper = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLElement | null>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-lens-slot]"));
    slot.current = slots[0] ?? null;
    if (reduced || !hasWebGL() || slots.length === 0) return;
    setMaxDpr(window.innerWidth < 860 ? 1.5 : 2);
    setEnabled(true);

    // The lens sits in whichever slot is most on screen (hero, then contact), fades with
    // how much of it is visible, and stops rendering when no slot is in view.
    const ratios = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));
        let best: Element | null = null;
        let ratio = 0;
        ratios.forEach((r, el) => {
          if (r > ratio) [best, ratio] = [el, r];
        });
        if (best) slot.current = best;
        if (wrapper.current) wrapper.current.style.opacity = String(Math.min(1, ratio * 1.4));
        setActive(ratio > 0.01);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    slots.forEach((el) => io.observe(el));

    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      delete document.documentElement.dataset.lens;
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={wrapper} aria-hidden className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300">
      <LensScene
        active={active}
        maxDpr={maxDpr}
        pointer={pointer}
        slot={slot}
        onReady={() => (document.documentElement.dataset.lens = "3d")}
      />
    </div>
  );
}
