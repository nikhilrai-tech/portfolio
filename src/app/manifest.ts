import type { MetadataRoute } from "next";
import { person } from "@/content/profile";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${person.name} · Head of Information Technology`,
    short_name: person.name,
    description: "IT, cloud, DevOps and security: the work and career of Nikhil Rai.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0c0f",
    theme_color: "#0a0c0f",
    lang: "en",
    categories: ["portfolio", "technology", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Experience", url: "/en#experience" },
      { name: "Contact", url: "/en#contact" },
      { name: "हिन्दी", url: "/hi" },
    ],
  };
}
