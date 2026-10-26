import { person } from "@/content/profile";
import { en } from "@/content/en";
import { notes } from "@/content/notes";

// /llms.txt: a plain-language map of the site for AI assistants and answer engines
// (see llmstxt.org). Built from the same content as the pages, so it never drifts.
export function GET() {
  const site = person.siteUrl;
  const roles = en.roles.map((r) => `- ${r.title}, ${r.company} (${r.period})`).join("\n");
  const projects = en.projects.map((p) => `- [${p.name}](${p.repo}): ${p.blurb}`).join("\n");
  const noteLinks = notes
    .map((n) => `- [${n.title}](${site}/en/notes/${n.slug}): ${n.summary}`)
    .join("\n");
  const body = `# ${person.name}

> ${en.meta.description}

${en.hero.intro}

## Pages

- [Portfolio (English)](${site}/en): experience, the journey film, work, notes, stack and contact
- [पोर्टफ़ोलियो (हिन्दी)](${site}/hi): the same site in Hindi
- [Notes](${site}/en/notes): engineering write-ups
- [RSS feed](${site}/feed.xml)

## Experience

${roles}

## Open source

${projects}

## Notes

${noteLinks}

## Contact

- Email: ${person.email}
- LinkedIn: ${person.links.linkedin}
- GitHub: ${person.links.github}
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
