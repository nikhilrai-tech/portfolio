"use client";
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

// One place for every scroll-linked effect. Sections stay server components and opt in with
// data attributes:
//   data-parallax="0.1"  moves the element vertically at that speed (portrait, photos)
//   data-drift="1|-1"    slides big outline words sideways, in opposite directions
//   data-reveal          fades the element in from 24px below, once
// Only transform and opacity are animated, and nothing runs under prefers-reduced-motion.
export default function ScrollEffects() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.1;
        gsap.fromTo(
          el,
          { yPercent: speed * 100 },
          {
            yPercent: speed * -100,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
        const dir = Number(el.dataset.drift) || 1;
        gsap.fromTo(
          el,
          { xPercent: -8 * dir },
          {
            xPercent: 8 * dir,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return null;
}
