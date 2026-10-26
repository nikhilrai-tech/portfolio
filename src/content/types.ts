import type { Locale } from "@/i18n/config";

export type Product = {
  name: string;
  blurb: string;
  href?: string;
  stack: string[];
  responsibilities: string[];
};

export type Role = {
  /** Short theme for this stretch of the career, shown next to the rolling year. */
  chapter: string;
  /** Year shown in the timeline (when this chapter began). */
  year: string;
  title: string;
  company: string;
  companyHref?: string;
  place?: string;
  period: string;
  current?: boolean;
  /** Earlier title at the same company, shown under the current one. */
  promotedFrom?: { title: string; period: string };
  bullets: string[];
  products?: Product[];
};

export type Project = {
  name: string;
  blurb: string;
  repo: string;
  homepage?: string;
  tags: string[];
};

export type StackGroup = { name: string; items: string[] };

export type Photo = {
  src: string;
  alt: Record<Locale, string>;
  width: number;
  height: number;
};

export type SectionId =
  "intro" | "about" | "experience" | "work" | "stack" | "photography" | "contact";

export type Profile = {
  meta: { title: string; description: string };
  ui: {
    skip: string;
    menu: string;
    close: string;
    theme: string;
    language: string;
    backToTop: string;
    soundOn: string;
    soundOff: string;
    soundHint: string;
    skipIntro: string;
  };
  nav: Record<SectionId, string>;
  hero: {
    eyebrow: string;
    role: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    facts: { value: string; label: string }[];
    scroll: string;
  };
  about: {
    label: string;
    heading: string;
    paragraphs: string[];
    portraitAlt: string;
    caption: string;
  };
  experience: {
    label: string;
    heading: string;
    current: string;
    joinedAs: string;
    chapter: string;
    keyProducts: string;
    stack: string;
    responsibilities: string;
    visit: string;
    education: { label: string; degree: string; school: string; year: string };
  };
  roles: Role[];
  work: {
    label: string;
    heading: string;
    intro: string;
    productsHeading: string;
    openSourceHeading: string;
    visit: string;
    source: string;
    live: string;
    at: string;
  };
  projects: Project[];
  stack: { label: string; heading: string; intro: string; groups: StackGroup[] };
  photography: { label: string; heading: string; intro: string };
  contact: {
    label: string;
    heading: string;
    body: string;
    copy: string;
    copied: string;
    elsewhere: string;
    email: string;
    resume: string;
    footer: string;
  };
};
