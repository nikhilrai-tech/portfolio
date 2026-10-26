import { person } from "@/content/profile";
import { en } from "@/content/en";
import { notes } from "@/content/notes";

// RSS 2.0 feed of the notes, so people can follow new write-ups in any feed reader.
const esc = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );

export function GET() {
  const site = person.siteUrl;
  const items = [...notes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (n) => `    <item>
      <title>${esc(n.title)}</title>
      <link>${site}/en/notes/${n.slug}</link>
      <guid isPermaLink="true">${site}/en/notes/${n.slug}</guid>
      <pubDate>${new Date(n.date + "T09:00:00Z").toUTCString()}</pubDate>
      <description>${esc(n.summary)}</description>
${n.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${person.name} · ${en.notes.label}`)}</title>
    <link>${site}/en/notes</link>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(en.notes.intro)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
