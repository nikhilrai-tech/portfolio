import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { person } from "@/content/profile";
import { notes } from "@/content/notes";

// Home, notes index and every note, in each language, with hreflang alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap =>
    locales.map((l) => ({
      url: `${person.siteUrl}/${l}${path}`,
      lastModified,
      changeFrequency: "monthly",
      priority: l === "en" ? priority : priority * 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((x) => [x, `${person.siteUrl}/${x}${path}`])),
      },
    }));
  return [
    ...entry("", 1),
    ...entry("/notes", 0.7),
    ...notes.flatMap((n) => entry(`/notes/${n.slug}`, 0.6, n.date)),
  ];
}
