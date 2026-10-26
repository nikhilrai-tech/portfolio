import type { Locale } from "@/i18n/config";
import type { Profile } from "@/content/profile";
import { notes, readingMinutes } from "@/content/notes";
import Container from "@/components/ui/Container";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import LinkedInPosts from "@/components/ui/LinkedInPosts";

export default function Notes({ profile, locale }: { profile: Profile; locale: Locale }) {
  const { notes: t } = profile;
  const fmt = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium" });
  return (
    <section id="notes" data-section="notes" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader id="notes" label={t.label} heading={t.heading} intro={t.intro} />
        {t.englishOnly && <p className="label text-muted -mt-8 mb-10">{t.englishOnly}</p>}
        <ul className="grid gap-4 md:grid-cols-3">
          {notes.map((note) => (
            <li key={note.slug} data-reveal>
              <a
                href={`/${locale}/notes/${note.slug}`}
                data-cursor={t.read}
                className="border-line bg-surface/80 hover:border-accent group flex h-full flex-col rounded-3xl border p-6 backdrop-blur-md transition-colors md:p-7"
              >
                <span className="text-muted font-mono text-xs">
                  {fmt.format(new Date(note.date + "T00:00:00Z"))} · {readingMinutes(note)}{" "}
                  {t.minutes}
                </span>
                <span className="display group-hover:text-accent mt-6 text-2xl transition-colors md:text-[1.7rem]">
                  {note.title}
                </span>
                <span className="text-fg/75 mt-3 text-[0.95rem]">{note.summary}</span>
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </ul>
                <span className="label text-accent mt-auto flex items-center gap-1.5 pt-6">
                  {t.read}
                  <ArrowUpRight />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <LinkedInPosts labels={profile.linkedin} />
      </Container>
    </section>
  );
}
