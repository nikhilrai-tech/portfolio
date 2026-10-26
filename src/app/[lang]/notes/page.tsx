import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getProfile } from "@/content/profile";
import { notes, readingMinutes } from "@/content/notes";
import ArticleHeader from "@/components/ui/ArticleHeader";

export async function generateMetadata({ params }: PageProps<"/[lang]/notes">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getProfile(lang).notes;
  return {
    title: `${t.label} · Nikhil Rai`,
    description: t.intro,
    alternates: { canonical: `/${lang}/notes` },
  };
}

export default async function NotesIndex({ params }: PageProps<"/[lang]/notes">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const profile = getProfile(lang);
  const t = profile.notes;
  return (
    <>
      <ArticleHeader
        profile={profile}
        locale={lang}
        back={{ href: `/${lang}#notes`, label: "Nikhil Rai" }}
      />
      <main id="main" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <p className="label text-accent">{t.label}</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,7vw,4.5rem)]">{t.heading}</h1>
        <p className="text-muted mt-4 text-lg">{t.intro}</p>
        {t.englishOnly && <p className="label text-muted mt-3">{t.englishOnly}</p>}
        <ol className="divide-line border-line mt-12 divide-y border-y">
          {notes.map((note) => (
            <li key={note.slug} className="py-8">
              <a href={`/${lang}/notes/${note.slug}`} className="group block">
                <span className="text-muted font-mono text-xs">
                  {note.date} · {readingMinutes(note)} {t.minutes}
                </span>
                <span className="display group-hover:text-accent mt-2 block text-3xl transition-colors">
                  {note.title}
                </span>
                <span className="text-fg/75 mt-2 block">{note.summary}</span>
              </a>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
