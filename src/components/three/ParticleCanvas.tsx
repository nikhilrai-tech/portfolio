"use client";
import { useEffect, useRef } from "react";
import { person, type SectionId } from "@/content/profile";
import type { Frame, Placement } from "./ParticleField";

// Which point cloud each section shows. Order matches the shape list built below.
const SHAPE: Record<SectionId, number> = {
  intro: 0, // globe with data arcs
  about: 1, // portrait in particles
  experience: 2, // server racks
  work: 3, // microservice mesh
  stack: 4, // kubernetes helm
  photography: 5, // star field
  contact: 6, // shield and padlock
};

// True only for GPU-backed WebGL. Software renderers would make the page janky, so those
// visitors get the static layout. Add ?gl=force to the URL to override while testing.
function hasHardwareWebGL() {
  try {
    if (new URLSearchParams(window.location.search).get("gl") === "force") return true;
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

function whenIdle(fn: () => void) {
  const start = () =>
    "requestIdleCallback" in window
      ? requestIdleCallback(fn, { timeout: 2500 })
      : setTimeout(fn, 1200);
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

function isLight() {
  const set = document.documentElement.dataset.theme;
  return set ? set === "light" : window.matchMedia("(prefers-color-scheme: light)").matches;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hasHardwareWebGL())
      return;
    let disposed = false;
    let cleanup = () => {};

    whenIdle(async () => {
      const [{ ParticleField }, shapes] = await Promise.all([
        import("./ParticleField"),
        import("./shapes"),
      ]);
      const canvas = canvasRef.current;
      if (disposed || !canvas) return;

      const small = window.innerWidth < 768;
      const count = small ? 2600 : 5200;
      const list = [
        shapes.globe(count),
        shapes.globe(count), // replaced by the portrait once the photo is decoded
        shapes.rack(count),
        shapes.mesh(count),
        shapes.helm(count),
        shapes.field(count),
        shapes.shield(count),
      ];
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));

      let field: InstanceType<typeof ParticleField> | null = null;
      const placementOf = (el: HTMLElement): Placement => {
        const anchor = el.querySelector<HTMLElement>("[data-shape-anchor]");
        const rect = anchor?.getBoundingClientRect();
        // No anchor, or one hidden at this breakpoint: a faint shape behind the whole viewport.
        if (!anchor || !rect || rect.width === 0) {
          return field!.placementFor(
            { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
            1.1,
            0.25,
          );
        }
        const fill = Number(anchor.dataset.shapeFill ?? 0.9);
        const opacity = Number(anchor.dataset.shapeOpacity ?? 1);
        return field!.placementFor(rect, fill, opacity);
      };

      // Current section = last one whose top passed 40% of the viewport. The next one morphs in
      // while its top travels from 95% to 40% of the viewport.
      const onFrame = (): Frame | null => {
        if (!field || sections.length === 0) return null;
        const vh = window.innerHeight;
        const tops = sections.map((s) => s.getBoundingClientRect().top);
        let a = 0;
        tops.forEach((top, i) => {
          if (top <= vh * 0.4) a = i;
        });
        const b = Math.min(a + 1, sections.length - 1);
        const mix = b === a ? 0 : Math.min(1, Math.max(0, (vh * 0.95 - tops[b]) / (vh * 0.55)));
        const id = (i: number) => sections[i].dataset.section as SectionId;
        return {
          a: SHAPE[id(a)] ?? 0,
          b: SHAPE[id(b)] ?? 0,
          mix,
          placeA: placementOf(sections[a]),
          placeB: placementOf(sections[b]),
        };
      };

      field = new ParticleField(canvas, list, {
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        onFrame,
      });
      field.resize(window.innerWidth, window.innerHeight);
      field.setTheme(isLight());
      field.start();
      document.documentElement.dataset.gl = "on";

      shapes
        .portrait(count, person.portrait.src)
        .then((p) => !disposed && field?.replaceShape(1, p));

      const onResize = () => field?.resize(window.innerWidth, window.innerHeight);
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        field?.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          -((e.clientY / window.innerHeight) * 2 - 1),
          true,
        );
      };
      const onLeave = (e: MouseEvent) => {
        if (!e.relatedTarget) field?.setPointer(0, 0, false);
      };
      // Phones: a finger works like the cursor while it is down, without blocking scroll.
      let release = 0;
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        window.clearTimeout(release);
        field?.setPointer(
          (t.clientX / window.innerWidth) * 2 - 1,
          -((t.clientY / window.innerHeight) * 2 - 1),
          true,
        );
      };
      const onTouchEnd = () => {
        release = window.setTimeout(() => field?.setPointer(0, 0, false), 700);
      };
      // Tilting the phone turns the particles a little, like looking around them.
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.beta == null || e.gamma == null) return;
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        field?.setTilt(clamp((e.beta - 45) / 45) * 0.28, clamp(e.gamma / 35) * 0.35);
      };
      const themeObserver = new MutationObserver(() => field?.setTheme(isLight()));
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      const onScheme = () => field?.setTheme(isLight());

      window.addEventListener("resize", onResize);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseout", onLeave);
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("deviceorientation", onTilt);
      mq.addEventListener("change", onScheme);
      cleanup = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("mouseout", onLeave);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("deviceorientation", onTilt);
        window.clearTimeout(release);
        mq.removeEventListener("change", onScheme);
        themeObserver.disconnect();
        field?.dispose();
        delete document.documentElement.dataset.gl;
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="gl-canvas pointer-events-none fixed inset-0 z-0 size-full"
    />
  );
}
