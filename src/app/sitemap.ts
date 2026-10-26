import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { person } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, `${person.siteUrl}/${l}`]));
  return locales.map((l) => ({
    url: `${person.siteUrl}/${l}`,
    changeFrequency: "monthly",
    priority: l === "en" ? 1 : 0.8,
    alternates: { languages },
  }));
}
