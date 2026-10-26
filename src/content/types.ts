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
  "intro" | "about" | "experience" | "journey" | "work" | "stack" | "photography" | "contact";

export type JourneyScene = {
  year: string;
  sector: string;
  company: string;
  line: string;
  tools: string[];
  /** Which illustration plays: network, security, cloud or autonomy. */
  visual: "network" | "security" | "cloud" | "autonomy";
};

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
    offline: string;
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
  palette: {
    open: string;
    placeholder: string;
    empty: string;
    groups: { navigate: string; actions: string; links: string };
    actions: {
      theme: string;
      language: string;
      sound: string;
      copyEmail: string;
      resume: string;
      install: string;
      terminal: string;
      share: string;
      saveContact: string;
      shortcuts: string;
      print: string;
    };
    copied: string;
  };
  terminal: { label: string; heading: string; hint: string };
  journey: {
    label: string;
    heading: string;
    play: string;
    pause: string;
    replay: string;
    chapter: string;
    pipeline: string[];
    scenes: JourneyScene[];
    outro: { heading: string; body: string; cta: string };
  };
  ask: {
    launcher: string;
    title: string;
    intro: string;
    placeholder: string;
    send: string;
    close: string;
    suggestions: string[];
    disclaimer: string;
    unavailable: string;
    limited: string;
  };
  form: {
    heading: string;
    name: string;
    email: string;
    message: string;
    send: string;
    sending: string;
    sent: string;
    error: string;
    limited: string;
    invalid: string;
    note: string;
  };
  activity: {
    heading: string;
    total: string;
    days: string;
    streak: string;
    recent: string;
    updated: string;
    less: string;
    more: string;
    offline: string;
    profile: string;
  };
  share: {
    heading: string;
    body: string;
    button: string;
    copied: string;
    save: string;
    scan: string;
    install: string;
    text: string;
  };
  shortcuts: { title: string; items: { keys: string; label: string }[] };
  error: { title: string; body: string; retry: string };
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
