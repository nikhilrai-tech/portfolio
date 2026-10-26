import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import YearRoller from "@/components/ui/YearRoller";

// Career told as chapters: a sticky rolling year (and the server-rack particles) on the left,
// the roles scrolling past on the right.
export default function Experience({ profile }: { profile: Profile }) {
  const { experience, roles } = profile;
  return (
    <section id="experience" data-section="experience" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader id="experience" label={experience.label} heading={experience.heading} />

        <div className="grid gap-10 lg:grid-cols-12">
          <aside className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-24 flex h-[calc(100svh-8rem)] flex-col">
              <YearRoller
                label={experience.chapter}
                chapters={roles.map((r) => ({ year: r.year, name: r.chapter }))}
              />
              <div data-shape-anchor data-shape-fill="0.85" className="mt-6 min-h-0 flex-1" />
            </div>
          </aside>

          {/* Phones: a slim sticky bar under the header carries the rolling year. */}
          <div className="print-hidden border-line bg-bg/85 sticky top-16 z-20 -mx-4 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
            <YearRoller
              compact
              label={experience.chapter}
              chapters={roles.map((r) => ({ year: r.year, name: r.chapter }))}
            />
          </div>

          <ol className="lg:col-span-7">
            {roles.map((role, index) => (
              <li
                key={`${role.company}-${role.period}`}
                data-chapter={index}
                data-reveal
                className="border-line border-t py-12 first:border-t-0 first:pt-0 md:py-16"
              >
                <p className="label text-muted">
                  {experience.chapter} {String(index + 1).padStart(2, "0")} · {role.chapter}
                </p>

                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <p className="display text-3xl md:text-4xl">
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
                  <p className="text-muted font-mono text-sm">{role.period}</p>
                </div>

                <h3 className="font-display mt-3 flex flex-wrap items-center gap-3 text-xl font-semibold tracking-tight md:text-2xl">
                  {role.title}
                  {role.current && (
                    <span className="label border-accent/40 text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1 !text-[0.65rem]">
                      <span className="bg-accent size-1.5 animate-pulse rounded-full" aria-hidden />
                      {experience.current}
                    </span>
                  )}
                </h3>
                <p className="text-muted mt-1 text-sm">
                  {role.place}
                  {role.promotedFrom && (
                    <span className="font-mono text-xs">
                      {" "}
                      · {experience.joinedAs} {role.promotedFrom.title} · {role.promotedFrom.period}
                    </span>
                  )}
                </p>

                <ul className="text-fg/85 mt-6 space-y-3">
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
                          className="border-line bg-surface/70 rounded-2xl border p-5 backdrop-blur-sm"
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
              </li>
            ))}
          </ol>
        </div>

        <div
          data-reveal
          className="border-line mt-6 grid gap-4 border-y py-10 md:grid-cols-12 md:gap-10"
        >
          <p className="label text-muted md:col-span-5">{experience.education.label}</p>
          <div className="md:col-span-7">
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
