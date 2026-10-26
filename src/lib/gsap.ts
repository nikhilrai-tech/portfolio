"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

// Register plugins once; every client module imports gsap from here.
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
// Phones resize the viewport as the address bar hides; do not re-measure pins for that.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, MotionPathPlugin };
