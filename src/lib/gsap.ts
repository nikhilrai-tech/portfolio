"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once; every client module imports gsap from here.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
