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
import ScrollEffects from "@/components/motion/ScrollEffects";
import LensCanvas from "@/components/three/LensCanvas";
import Hud from "@/components/ui/Hud";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const profile = getProfile(lang);

  return (
    <>
      <LensCanvas />
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
      <ScrollEffects />
      <Hud
        sections={sections.map((id) => ({ id, label: profile.nav[id] }))}
        frameLabel={profile.ui.frame}
      />
    </>
  );
}
