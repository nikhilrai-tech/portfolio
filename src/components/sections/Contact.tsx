import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import CopyEmail from "@/components/ui/CopyEmail";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";
import Terminal from "@/components/ui/Terminal";
import ShareCard from "@/components/ui/ShareCard";
import ContactForm from "@/components/ui/ContactForm";
import Testimonials from "@/components/ui/Testimonials";
import Services from "@/components/ui/Services";
import SponsorCard from "@/components/ui/SponsorCard";
import type { Locale } from "@/i18n/config";

export default function Contact({ profile, locale }: { profile: Profile; locale: Locale }) {
  const { contact, ui, terminal } = profile;
  const elsewhere = [
    { label: "LinkedIn", href: person.links.linkedin },
    { label: "GitHub", href: person.links.github },
    { label: "Instagram", href: person.links.instagram },
  ];

  return (
    <section id="contact" data-section="contact" className="relative pt-28 md:pt-40">
      <Container>
        <Testimonials labels={profile.testimonials} />
        <Services labels={profile.services} />
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              id="contact"
              label={contact.label}
              heading={contact.heading}
              intro={contact.body}
            />
          </div>
          {/* Shield and padlock: a secure channel to reach out. */}
          <div
            data-shape-anchor
            data-shape-fill="0.85"
            aria-hidden
            className="hidden aspect-square w-full max-w-[22rem] justify-self-end lg:col-span-5 lg:block"
          />
        </div>

        <a
          href={`mailto:${person.email}`}
          data-cursor={contact.email}
          className="display decoration-line-strong hover:text-accent hover:decoration-accent block text-[clamp(1.75rem,6.5vw,5.5rem)] break-all underline decoration-1 underline-offset-[0.18em] transition-colors"
        >
          {person.email}
        </a>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={`mailto:${person.email}`} data-magnetic>
            {contact.email}
          </Button>
          <CopyEmail email={person.email} copyLabel={contact.copy} copiedLabel={contact.copied} />
          {person.resume && (
            <Button href={person.resume} variant="ghost" download data-magnetic>
              {contact.resume}
            </Button>
          )}
        </div>

        <div className="mt-12">
          <ContactForm labels={profile.form} email={person.email} />
        </div>

        <div id="terminal" className="mt-20 grid scroll-mt-24 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label text-accent">{terminal.label}</p>
            <p className="display mt-4 text-3xl md:text-4xl">{terminal.heading}</p>
            <p className="text-muted mt-3">{terminal.hint}</p>
          </div>
          <div className="lg:col-span-8">
            <Terminal
              hint={terminal.hint}
              data={{
                name: person.name,
                headline: profile.roles[0].title,
                company: profile.roles[0].company,
                email: person.email,
                resume: person.resume,
                locale,
                otherLocale: locale === "en" ? "hi" : "en",
                roles: profile.roles.map((r) => ({
                  year: r.year,
                  title: r.title,
                  company: r.company,
                  period: r.period,
                })),
                stack: profile.stack.groups,
                projects: profile.projects.map((p) => ({ name: p.name, repo: p.repo })),
                links: elsewhere,
                since: 2021,
              }}
            />
          </div>
        </div>

        <div className="mt-20">
          <ShareCard profile={profile} url={`${person.siteUrl}/${locale}`} />
        </div>

        <div className="mt-20">
          <SponsorCard labels={profile.sponsor} />
        </div>

        <div className="border-line mt-20 grid gap-6 border-t pt-8 md:grid-cols-12">
          <p className="label text-muted md:col-span-4">{contact.elsewhere}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-8">
            {elsewhere.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="me noreferrer"
                  className="font-display hover:text-accent inline-flex items-center gap-1.5 text-xl tracking-tight transition-colors"
                >
                  <span data-scramble>{link.label}</span>
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <footer className="border-line mt-24 border-t">
        <Container className="text-muted flex flex-col gap-3 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {person.name}. {contact.footer}
          </p>
          <a href="#intro" className="label hover:text-fg">
            {ui.backToTop} ↑
          </a>
        </Container>
      </footer>
    </section>
  );
}
