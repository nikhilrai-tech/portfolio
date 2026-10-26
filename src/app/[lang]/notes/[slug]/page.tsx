import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getProfile, person } from "@/content/profile";
import { notes, readingMinutes } from "@/content/notes";
import ArticleHeader from "@/components/ui/ArticleHeader";
import RichText from "@/components/ui/RichText";
import { ArrowUpRight } from "@/components/ui/Icons";
import NoteShare from "@/components/ui/NoteShare";

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/notes/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const note = notes.find((n) => n.slug === slug);
  if (!note || !hasLocale(lang)) return {};
  const card = {
    url: `/og/card-${lang}.jpg`,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: note.title,
  };
  return {
    title: `${note.title} · Nikhil Rai`,
    description: note.summary,
    alternates: { canonical: `/${lang}/notes/${slug}` },
    openGraph: {
      type: "article",
      title: note.title,
      description: note.summary,
      publishedTime: note.date,
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.summary,
      images: [card],
    },
  };
}

export default async function NotePage({ params }: PageProps<"/[lang]/notes/[slug]">) {
  const { lang, slug } = await params;
  const note = notes.find((n) => n.slug === slug);
  if (!hasLocale(lang) || !note) notFound();
  const profile = getProfile(lang);
  const t = profile.notes;
  const others = notes.filter((n) => n.slug !== slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: note.title,
    description: note.summary,
    datePublished: note.date,
    author: { "@type": "Person", name: person.name, url: `${person.siteUrl}/${lang}` },
    isBasedOn: note.source,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ArticleHeader
        profile={profile}
        locale={lang}
        back={{ href: `/${lang}/notes`, label: t.back }}
      />
      <main id="main" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <article>
          <p className="text-muted font-mono text-xs">
            {note.date} · {readingMinutes(note)} {t.minutes} · {note.tags.join(" · ")}
          </p>
          <h1 className="display mt-4 text-[clamp(2.25rem,6vw,4rem)]">{note.title}</h1>
          <p className="text-fg/80 mt-5 text-xl leading-relaxed">{note.summary}</p>
          {t.englishOnly && <p className="label text-muted mt-4">{t.englishOnly}</p>}

          <div className="text-fg/85 mt-12 space-y-6 text-[1.06rem] leading-[1.8]">
            {note.body.map((block, i) => {
              if (block.type === "h2")
                return (
                  <h2 key={i} className="display text-fg pt-6 text-2xl md:text-3xl">
                    {block.text}
                  </h2>
                );
              if (block.type === "list")
                return (
                  <ul key={i} className="space-y-3">
                    {block.items.map((item) => (
                      <li key={item} className="relative pl-6">
                        <span
                          aria-hidden
                          className="bg-accent absolute top-[0.85em] left-0 h-px w-3"
                        />
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                );
              if (block.type === "code")
                return (
                  <pre
                    key={i}
                    className="border-line bg-surface overflow-x-auto rounded-2xl border p-5 font-mono text-sm leading-relaxed"
                  >
                    <code>{block.text}</code>
                  </pre>
                );
              if (block.type === "quote")
                return (
                  <blockquote key={i} className="border-accent text-fg border-l-2 pl-5 italic">
                    <RichText text={block.text} />
                  </blockquote>
                );
              return (
                <p key={i}>
                  <RichText text={block.text} />
                </p>
              );
            })}
          </div>

          <p className="border-line text-muted mt-14 border-t pt-6 text-sm">
            {t.source}:{" "}
            <a
              href={note.source}
              target="_blank"
              rel="noreferrer"
              className="text-accent inline-flex items-center gap-1 underline underline-offset-4"
            >
              {note.source.replace("https://", "")}
              <ArrowUpRight />
            </a>
          </p>
          <NoteShare
            url={`${person.siteUrl}/${lang}/notes/${note.slug}`}
            title={note.title}
            labels={{ button: profile.share.button, copied: profile.share.copied }}
          />
        </article>

        <nav aria-label={t.all} className="mt-16">
          <p className="label text-muted">{t.all}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {others.map((n) => (
              <li key={n.slug}>
                <a
                  href={`/${lang}/notes/${n.slug}`}
                  className="border-line hover:border-accent block h-full rounded-2xl border p-5 transition-colors"
                >
                  <span className="display block text-xl">{n.title}</span>
                  <span className="text-muted mt-1 block text-sm">{n.summary}</span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`/${lang}#contact`}
            className="bg-accent text-accent-ink mt-10 inline-flex h-12 items-center rounded-full px-6 text-sm font-medium"
          >
            {profile.journey.outro.cta}
          </a>
        </nav>
      </main>
    </>
  );
}
