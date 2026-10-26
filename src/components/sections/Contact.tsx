import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import CopyEmail from "@/components/ui/CopyEmail";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Contact({ profile }: { profile: Profile }) {
  const { contact, ui } = profile;
  const elsewhere = [
    { label: "LinkedIn", href: person.links.linkedin },
    { label: "GitHub", href: person.links.github },
    { label: "Instagram", href: person.links.instagram },
  ];

  return (
    <section id="contact" data-section="contact" className="relative pt-28 md:pt-40">
      <Container>
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
