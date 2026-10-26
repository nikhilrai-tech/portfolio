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
              className="border-line grid gap-6 border-t py-12 md:grid-cols-12 md:gap-10 md:py-16"
            >
              <div className="md:col-span-4">
                <div className="md:sticky md:top-28">
                  <p className="text-muted font-mono text-sm">{role.period}</p>
                  <p className="display mt-3 text-2xl md:text-3xl">
                    {role.companyHref ? (
                      <a
                        href={role.companyHref}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-accent inline-flex items-center gap-2"
                      >
                        {role.company}
                        <ArrowUpRight className="size-4" />
                      </a>
                    ) : (
                      role.company
                    )}
                  </p>
                  {role.place && <p className="text-muted mt-1 text-sm">{role.place}</p>}
                  {role.current && (
                    <p className="label border-accent/40 text-accent mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 !text-[0.65rem]">
                      <span className="bg-accent size-1.5 rounded-full" aria-hidden />
                      {experience.current}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-8">
                <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {role.title}
                </h3>
                {role.promotedFrom && (
                  <p className="text-muted mt-1 font-mono text-xs">
                    {experience.joinedAs} {role.promotedFrom.title} · {role.promotedFrom.period}
                  </p>
                )}
                <ul className="text-fg/85 mt-5 space-y-3">
                  {role.bullets.map((b) => (
                    <li key={b.slice(0, 40)} className="relative pl-6">
                      <span
                        aria-hidden
                        className="bg-accent absolute top-[0.72em] left-0 h-px w-3"
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {role.products && role.products.length > 0 && (
                  <div className="mt-8">
                    <p className="label text-muted">{experience.keyProducts}</p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {role.products.map((product) => (
                        <li
                          key={product.name}
                          className="border-line bg-surface/60 rounded-2xl border p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-display text-lg font-semibold tracking-tight">
                              {product.name}
                            </p>
                            {product.href && (
                              <a
                                href={product.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${experience.visit} ${product.name}`}
                                className="border-line text-muted hover:border-accent hover:text-accent grid size-8 shrink-0 place-items-center rounded-full border transition-colors"
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

        <div
          data-reveal
          className="border-line grid gap-4 border-y py-10 md:grid-cols-12 md:gap-10"
        >
          <p className="label text-muted md:col-span-4">{experience.education.label}</p>
          <div className="md:col-span-8">
            <p className="font-display text-xl font-semibold tracking-tight">
              {experience.education.degree}
            </p>
            <p className="text-muted mt-1">
              {experience.education.school} · {experience.education.year}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
