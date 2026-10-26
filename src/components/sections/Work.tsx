import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import TiltCard from "@/components/motion/TiltCard";

export default function Work({ profile }: { profile: Profile }) {
  const { work, roles, projects, experience } = profile;
  const products = roles.flatMap((role) =>
    (role.products ?? []).map((product) => ({ ...product, company: role.company })),
  );

  return (
    <section id="work" data-section="work" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader id="work" label={work.label} heading={work.heading} intro={work.intro} />

        <h3 className="label text-muted mb-6">{work.productsHeading}</h3>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <li key={product.name} data-reveal className="h-full">
              <TiltCard className="border-line bg-surface flex h-full flex-col rounded-3xl border p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-muted font-mono text-xs">
                    {String(i + 1).padStart(2, "0")} · {product.company}
                  </span>
                  {product.href && (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted hover:text-accent inline-flex items-center gap-1 text-xs transition-colors"
                    >
                      {work.visit}
                      <ArrowUpRight />
                    </a>
                  )}
                </div>
                <p className="display mt-8 text-[1.75rem] md:text-3xl">{product.name}</p>
                <p className="text-fg/80 mt-4 text-[0.95rem]">{product.blurb}</p>
                <ul aria-label={experience.stack} className="mt-6 flex flex-wrap gap-1.5">
                  {product.stack.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </ul>
                <details className="group mt-auto pt-6">
                  <summary className="label text-muted hover:text-fg flex cursor-pointer list-none items-center gap-2 transition-colors [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden
                      className="inline-block transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                    {experience.responsibilities}
                  </summary>
                  <ul className="text-fg/80 mt-4 space-y-2 text-sm">
                    {product.responsibilities.map((r) => (
                      <li key={r.slice(0, 40)} className="relative pl-5">
                        <span
                          aria-hidden
                          className="bg-accent absolute top-[0.7em] left-0 h-px w-2.5"
                        />
                        {r}
                      </li>
                    ))}
                  </ul>
                </details>
              </TiltCard>
            </li>
          ))}
        </ul>

        <h3 className="label text-muted mt-20 mb-6">{work.openSourceHeading}</h3>
        <ul className="divide-line border-line divide-y border-y">
          {projects.map((project) => (
            <li
              key={project.name}
              data-reveal
              className="group grid gap-4 py-7 md:grid-cols-12 md:items-baseline md:gap-8"
            >
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="display group-hover:text-accent inline-flex items-center gap-2 text-2xl transition-colors md:col-span-4 md:text-3xl"
              >
                {project.name}
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <p className="text-fg/80 md:col-span-5">{project.blurb}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:col-span-3 md:justify-end">
                <ul className="flex flex-wrap gap-1.5">
                  {project.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </ul>
                {project.homepage && (
                  <a
                    href={project.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="label text-accent inline-flex items-center gap-1 hover:underline"
                  >
                    {work.live}
                    <ArrowUpRight />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
