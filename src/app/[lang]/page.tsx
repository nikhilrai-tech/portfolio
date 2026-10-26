import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getProfile, person } from "@/content/profile";
import { sections } from "@/lib/sections";
import Header from "@/components/ui/Header";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const profile = getProfile(lang);

  return (
    <>
      <Header profile={profile} locale={lang} sections={sections} />
      <main id="main" className="mx-auto max-w-7xl px-4 pt-40 sm:px-6 lg:px-10">
        <section id="intro">
          <p className="label text-accent">{profile.hero.eyebrow}</p>
          <h1 className="display mt-6 text-[clamp(3rem,11vw,9rem)]">{person.name}</h1>
        </section>
      </main>
    </>
  );
}
