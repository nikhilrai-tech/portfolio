import type { Photo, Testimonial } from "./types";

// Language-independent facts. Text that a visitor reads lives in en.ts / hi.ts.
export const person = {
  name: "Nikhil Rai",
  email: "nikhilrai662@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    linkedin: "https://www.linkedin.com/in/nikhil-rai-551219183/",
    github: "https://github.com/nikhilrai-tech",
    instagram: "https://instagram.com/officialraisahabh",
  },
  portrait: { src: "/images/portrait.jpg", width: 470, height: 588 },
  // Set to undefined to hide the download button.
  resume: "/Nikhil-Rai-Resume.pdf" as string | undefined,
} as const;

// Files live in /public/images/photography. The section stays hidden while this list is empty.
export const photos: Photo[] = [
  {
    src: "/images/photography/nik2.jpg",
    width: 1027,
    height: 1489,
    alt: {
      en: "Nikhil in a black suit at a conference",
      hi: "एक कॉन्फ़्रेंस में काले सूट में निखिल",
    },
  },
  {
    src: "/images/photography/nik3.jpg",
    width: 1047,
    height: 1119,
    alt: {
      en: "Black and white mirror portrait of Nikhil",
      hi: "निखिल का ब्लैक एंड व्हाइट मिरर पोर्ट्रेट",
    },
  },
  {
    src: "/images/photography/nik4.jpg",
    width: 855,
    height: 1441,
    alt: { en: "Nikhil at an evening event, wearing a lanyard", hi: "शाम के एक इवेंट में निखिल" },
  },
  {
    src: "/images/photography/nik5.jpg",
    width: 1085,
    height: 1062,
    alt: { en: "Nikhil on a campus walkway", hi: "कैंपस के गलियारे में निखिल" },
  },
];

// Words for the scrolling marquees. Technology names read the same in every language.
export const marquee = {
  primary: ["Infrastructure", "Cloud", "DevOps", "Security", "Kubernetes", "Terraform", "Python"],
  secondary: ["Azure", "AWS", "DigitalOcean", "Docker", "Jenkins", "Kafka", "Grafana", "Sentry"],
};

// LinkedIn posts shown in Notes. Topics are the post's own hashtags. Cards open the post on
// LinkedIn. To show a post inline, paste the src from LinkedIn's "⋯ → Embed this post" code into
// `embed`; it then loads only when a visitor taps it.
export const linkedinPosts: { urn: string; url: string; tags: string[]; embed?: string }[] = [
  {
    urn: "urn:li:share:7517878181916368896",
    url: "https://www.linkedin.com/posts/nikhil-rai-551219183_ai-aiagents-llm-share-7517878181916368896-PgM7",
    tags: ["AI", "AI agents", "LLM"],
  },
  {
    urn: "urn:li:share:7480871490364645376",
    url: "https://www.linkedin.com/posts/nikhil-rai-551219183_systemdesign-iot-mqtt-share-7480871490364645376-YLy8",
    tags: ["System design", "IoT", "MQTT"],
  },
  {
    urn: "urn:li:ugcPost:7196711116641619970",
    url: "https://www.linkedin.com/posts/nikhil-rai-551219183_iitkanpur-cyber3ra-automationinpython-ugcPost-7196711116641619970-lY28",
    tags: ["IIT Kanpur", "Cyber3ra", "Automation in Python"],
  },
];

// LinkedIn recommendations (copied word for word, with permission). The section stays hidden while empty.
export const testimonials: Testimonial[] = [];

export const stacks = {
  vtv: [
    "Django",
    "Wagtail",
    "Docker",
    "Kubernetes",
    "DigitalOcean",
    "Jenkins",
    "SonarQube",
    "Sentry",
    "BetterStack",
  ],
  aiVarta: ["Django", "Docker", "Jenkins", "SonarQube", "Razorpay", "DigitalOcean", "PostgreSQL"],
  securiumx: [
    "React",
    "Vue.js",
    "Django",
    "PostgreSQL",
    "Azure",
    "Jenkins",
    "SonarQube",
    "Razorpay",
    "Sentry",
    "BetterStack",
  ],
  persius: [
    "HTML",
    "JS",
    "CSS",
    "Bootstrap",
    "Django",
    "Ajax",
    "Celery",
    "Redis",
    "AWS",
    "Razorpay",
    "MySQL",
    "Docker",
    "RabbitMQ",
    "Grafana",
    "SonarQube",
    "Terraform",
    "Jenkins",
  ],
  aethrone: ["Django", "MySQL", "React", "Docker", "Jenkins", "SonarQube", "DigitalOcean"],
  noc: ["Python", "Django", "PostgreSQL", "REST API", "Jenkins", "Docker"],
};

export const productLinks = {
  vtv: "https://www.vtvgujarati.com/",
  aiVarta: "https://aivarta.in/",
  securiumx: "https://www.securiumx.com/",
  persius: "https://persius.in/",
  aethrone: "https://www.aethroneaerospace.com/",
};

export const companyLinks = {
  simdaas: "https://www.simdaas.com/",
};

export const repos = {
  seatbelt: {
    repo: "https://github.com/nikhilrai-tech/seatbelt-for-AI-agents",
    homepage: "https://pypi.org/project/seatbelt-guard/",
  },
  ownerlens: { repo: "https://github.com/nikhilrai-tech/cloud-ownerlens" },
  scamsaathi: {
    repo: "https://github.com/nikhilrai-tech/ScamSaathi",
    homepage: "https://nikhilrai-tech.github.io/ScamSaathi/",
  },
  vnv: { repo: "https://github.com/nikhilrai-tech/Scenario-Based-VnV-Tool" },
  trading: { repo: "https://github.com/nikhilrai-tech/Stock-Trading-Simulator" },
};

export const stackItems = {
  languages: ["Python", "JavaScript"],
  frameworks: ["Django", "Django REST Framework", "Wagtail", "React", "Vue.js"],
  frontend: ["HTML", "CSS", "Bootstrap", "Vuetify"],
  data: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis"],
  messaging: ["Kafka", "RabbitMQ", "Celery"],
  cloud: ["Azure", "AWS", "DigitalOcean"],
  platform: [
    "Docker",
    "Kubernetes",
    "Terraform",
    "Jenkins",
    "SonarQube",
    "Nginx",
    "Gunicorn",
    "Linux",
    "GitHub",
  ],
  observability: ["Grafana", "Prometheus", "Sentry", "BetterStack"],
  tooling: ["REST API", "JWT", "Razorpay", "Postman", "Python unittest", "Web Scraping"],
};
