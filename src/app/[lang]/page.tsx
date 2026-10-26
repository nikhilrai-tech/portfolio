import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getProfile } from "@/content/profile";
import { sections } from "@/lib/sections";
import Header from "@/components/ui/Header";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Work from "@/components/sections/Work";
import Stack from "@/components/sections/Stack";
import Photography from "@/components/sections/Photography";
import Contact from "@/components/sections/Contact";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const profile = getProfile(lang);

  return (
    <>
      <Header profile={profile} locale={lang} sections={sections} />
      <main id="main" className="relative z-10">
        <Hero profile={profile} />
        <About profile={profile} />
        <Experience profile={profile} />
        <Work profile={profile} />
        <Stack profile={profile} />
        <Photography profile={profile} />
        <Contact profile={profile} />
      </main>
    </>
  );
}
