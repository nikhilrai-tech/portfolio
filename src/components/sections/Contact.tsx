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
        <SectionHeader id="contact" label={contact.label} heading={contact.heading} intro={contact.body} />

        <a
          href={`mailto:${person.email}`}
          className="display block break-all text-[clamp(1.75rem,6.5vw,5.5rem)] underline decoration-line-strong decoration-1 underline-offset-[0.18em] transition-colors hover:text-accent hover:decoration-accent"
        >
          {person.email}
        </a>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={`mailto:${person.email}`}>Email</Button>
          <CopyEmail email={person.email} copyLabel={contact.copy} copiedLabel={contact.copied} />
          {person.resume && (
            <Button href={person.resume} variant="ghost" download>
              Resume
            </Button>
          )}
        </div>

        <div className="mt-20 grid gap-6 border-t border-line pt-8 md:grid-cols-12">
          <p className="label text-muted md:col-span-4">{contact.elsewhere}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-8">
            {elsewhere.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="me noreferrer"
                  className="inline-flex items-center gap-1.5 font-display text-xl tracking-tight transition-colors hover:text-accent"
                >
                  {link.label}
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <footer className="mt-24 border-t border-line">
        <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
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
