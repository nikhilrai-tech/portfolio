import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";

export default function Experience({ profile }: { profile: Profile }) {
  const { experience, roles } = profile;
  return (
    <section id="experience" data-section="experience" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader id="experience" label={experience.label} heading={experience.heading} />

        <ol className="relative">
          {roles.map((role) => (
            <li
              key={`${role.company}-${role.period}`}
              data-reveal
              className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:gap-10 md:py-16"
            >
              <div className="md:col-span-4">
                <div className="md:sticky md:top-28">
                  <p className="font-mono text-sm text-muted">{role.period}</p>
                  <p className="display mt-3 text-2xl md:text-3xl">
                    {role.companyHref ? (
                      <a href={role.companyHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                        {role.company}
                        <ArrowUpRight className="size-4" />
                      </a>
                    ) : (
                      role.company
                    )}
                  </p>
                  {role.place && <p className="mt-1 text-sm text-muted">{role.place}</p>}
                  {role.current && (
                    <p className="label mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 px-3 py-1 !text-[0.65rem] text-accent">
                      <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                      {experience.current}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-8">
                <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{role.title}</h3>
                <ul className="mt-5 space-y-3 text-fg/85">
                  {role.bullets.map((b) => (
                    <li key={b.slice(0, 40)} className="relative pl-6">
                      <span aria-hidden className="absolute top-[0.72em] left-0 h-px w-3 bg-accent" />
                      {b}
                    </li>
                  ))}
                </ul>

                {role.products && role.products.length > 0 && (
                  <div className="mt-8">
                    <p className="label text-muted">{experience.keyProducts}</p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {role.products.map((product) => (
                        <li key={product.name} className="rounded-2xl border border-line bg-surface/60 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-display text-lg font-semibold tracking-tight">{product.name}</p>
                            {product.href && (
                              <a
                                href={product.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${experience.visit} ${product.name}`}
                                className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
                              >
                                <ArrowUpRight />
                              </a>
                            )}
                          </div>
                          <ul aria-label={experience.stack} className="mt-4 flex flex-wrap gap-1.5">
                            {product.stack.slice(0, 6).map((t) => (
                              <Tag key={t}>{t}</Tag>
                            ))}
                            {product.stack.length > 6 && <Tag>+{product.stack.length - 6}</Tag>}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div data-reveal className="grid gap-4 border-y border-line py-10 md:grid-cols-12 md:gap-10">
          <p className="label text-muted md:col-span-4">{experience.education.label}</p>
          <div className="md:col-span-8">
            <p className="font-display text-xl font-semibold tracking-tight">{experience.education.degree}</p>
            <p className="mt-1 text-muted">
              {experience.education.school} · {experience.education.year}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
