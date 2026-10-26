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
import ParticleCanvas from "@/components/three/ParticleCanvas";
import Marquee from "@/components/ui/Marquee";
import { marquee, person } from "@/content/profile";
import Hud from "@/components/ui/Hud";
import Cursor from "@/components/motion/Cursor";
import BootScreen from "@/components/ui/BootScreen";
import SoundToggle from "@/components/ui/SoundToggle";
import CommandPalette from "@/components/ui/CommandPalette";
import ServiceWorker from "@/components/ui/ServiceWorker";
import Shortcuts from "@/components/ui/Shortcuts";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const profile = getProfile(lang);

  const other = lang === "en" ? "hi" : "en";
  // Structured data so search engines understand who this page is about.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: profile.roles[0].title,
    worksFor: {
      "@type": "Organization",
      name: profile.roles[0].company,
      url: profile.roles[0].companyHref,
    },
    email: `mailto:${person.email}`,
    url: `${person.siteUrl}/${lang}`,
    image: `${person.siteUrl}${person.portrait.src}`,
    nationality: "India",
    knowsAbout: profile.stack.groups.flatMap((g) => g.items).slice(0, 30),
    sameAs: Object.values(person.links),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BootScreen skipLabel={profile.ui.skipIntro} />
      <ParticleCanvas />
      <Header profile={profile} locale={lang} sections={sections} />
      <main id="main" className="relative z-10">
        <Hero profile={profile} />
        <About profile={profile} />
        <Marquee words={marquee.primary} />
        <Marquee words={marquee.secondary} direction={-1} outline />
        <Experience profile={profile} />
        <Work profile={profile} />
        <Stack profile={profile} />
        <Photography profile={profile} locale={lang} />
        <Contact profile={profile} locale={lang} />
      </main>
      <ScrollEffects />
      <Cursor />
      <ServiceWorker offlineLabel={profile.ui.offline} />
      <CommandPalette
        labels={profile.palette}
        sections={sections.map((id) => ({ id, label: profile.nav[id] }))}
        otherLocale={other}
        email={person.email}
        resume={person.resume}
        links={[
          { label: "GitHub", href: person.links.github },
          { label: "LinkedIn", href: person.links.linkedin },
          { label: "Instagram", href: person.links.instagram },
        ]}
        share={{
          title: profile.meta.title,
          text: profile.share.text,
          url: `${person.siteUrl}/${lang}`,
        }}
      />
      <Shortcuts title={profile.shortcuts.title} items={profile.shortcuts.items} />
      <SoundToggle
        labels={{ on: profile.ui.soundOn, off: profile.ui.soundOff, hint: profile.ui.soundHint }}
      />
      <Hud sections={sections.map((id) => ({ id, label: profile.nav[id] }))} />
    </>
  );
}
