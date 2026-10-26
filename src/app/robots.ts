import type { MetadataRoute } from "next";
import { person } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${person.siteUrl}/sitemap.xml` };
}
