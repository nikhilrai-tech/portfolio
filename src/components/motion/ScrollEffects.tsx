"use client";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// One place for every scroll-linked effect. Sections stay server components and opt in with
// data attributes:
//   data-parallax="0.1"      moves the element vertically at that speed (photos)
//   data-reveal              fades the element in from 24px below, once
//   data-hero-split="1|-1"   hero name halves slide apart as you leave the hero
//   data-hero-zoom           hero portrait grows and fades as you leave the hero
//   data-marquee="1|-1"      endless word band; speed and skew follow scroll velocity
//   data-hscroll             pins on large screens while its [data-hscroll-track] moves sideways
//   data-count               counts a number up when it first appears
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
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
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

      const hero = document.getElementById("intro");
      if (hero) {
        const leave = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4 };
        gsap.utils.toArray<HTMLElement>("[data-hero-split]").forEach((el) => {
          gsap.to(el, {
            xPercent: 35 * Number(el.dataset.heroSplit),
            opacity: 0.15,
            ease: "none",
            scrollTrigger: leave,
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-hero-zoom]").forEach((el) => {
          gsap.to(el, {
            scale: 1.35,
            yPercent: 18,
            opacity: 0,
            ease: "none",
            scrollTrigger: leave,
          });
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.textContent);
        if (!Number.isFinite(target)) return;
        const from = target > 1000 ? target - 12 : 0;
        const state = { v: from };
        gsap.to(state, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          delay: 0.6,
          onUpdate: () => (el.textContent = String(Math.round(state.v))),
          scrollTrigger: { trigger: el, start: "top 95%", once: true },
        });
      });

      // Word bands run on their own and react to scroll speed and direction.
      const bands = gsap.utils.toArray<HTMLElement>("[data-marquee]").map((el) => {
        const track = el.querySelector<HTMLElement>("[data-marquee-track]")!;
        const dir = Number(el.dataset.marquee) || 1;
        const loop = gsap.fromTo(
          track,
          { xPercent: dir > 0 ? 0 : -50 },
          { xPercent: dir > 0 ? -50 : 0, duration: 38, ease: "none", repeat: -1 },
        );
        const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
        return { loop, skew };
      });
      let settle = 0;
      const velocity = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          const boost = 1 + Math.min(Math.abs(v) / 250, 7);
          bands.forEach(({ loop, skew }) => {
            loop.timeScale(boost * self.direction);
            skew(gsap.utils.clamp(-10, 10, v / -180));
          });
          window.clearTimeout(settle);
          settle = window.setTimeout(() => {
            bands.forEach(({ loop, skew }) => {
              gsap.to(loop, { timeScale: self.direction, duration: 0.8 });
              skew(0);
            });
          }, 140);
        },
      });

      return () => {
        velocity.kill();
        window.clearTimeout(settle);
      };
    });

    // Sideways product track: only on large screens, where there is room to pin.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((wrap) => {
        const track = wrap.querySelector<HTMLElement>("[data-hscroll-track]");
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return null;
}
