import type { Photo } from "./types";

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
  // Set to "/resume.pdf" once a public copy without the phone number is in /public.
  resume: undefined as string | undefined,
} as const;

// Add 3 to 6 photos here (files in /public/images/photography). The section stays hidden while empty.
export const photos: Photo[] = [];

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
