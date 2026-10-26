import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import { ArrowUpRight } from "@/components/ui/Icons";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import TiltCard from "@/components/motion/TiltCard";
import Activity from "@/components/sections/Activity";
import type { Locale } from "@/i18n/config";

export default function Work({ profile, locale }: { profile: Profile; locale: Locale }) {
  const { work, roles, projects, experience } = profile;
  const products = roles.flatMap((role) =>
    (role.products ?? []).map((product) => ({ ...product, company: role.company })),
  );

  return (
    <section id="work" data-section="work" className="relative pt-28 pb-28 md:pb-40 lg:pt-0">
      {/* Phones and tablets: header above a swipeable card row. */}
      <Container className="lg:hidden">
        <SectionHeader id="work" label={work.label} heading={work.heading} intro={work.intro} />
        <p className="label text-muted -mt-4 mb-5 flex items-center justify-between">
          <span>{work.productsHeading}</span>
          <span className="text-accent flex items-center gap-2">
            {String(products.length).padStart(2, "0")}
            <span aria-hidden className="swipe-hint">
              ⟶
            </span>
          </span>
        </p>
      </Container>

      {/* Large screens: this panel pins and the track scrolls sideways (see ScrollEffects). */}
      <div
        data-hscroll
        className="relative lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden"
      >
        <div
          data-shape-anchor
          data-shape-fill="1.25"
          data-shape-opacity="0.4"
          aria-hidden
          className="pointer-events-none absolute inset-0"
        />
        <ul
          data-hscroll-track
          className="no-scrollbar relative flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:w-max lg:snap-none lg:items-stretch lg:gap-6 lg:overflow-visible lg:pr-[12vw] lg:pb-0 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]"
        >
          <li className="hidden flex-col justify-center lg:flex lg:w-[30rem] lg:shrink-0 lg:pr-8">
            <SectionHeader id="work" label={work.label} heading={work.heading} intro={work.intro} />
            <p className="label text-muted -mt-6 flex items-center gap-3">
              {work.productsHeading}
              <span aria-hidden className="bg-accent h-px w-16" />
              <span aria-hidden className="text-accent">
                →
              </span>
            </p>
          </li>

          {products.map((product, i) => (
            <li
              key={product.name}
              data-reveal
              className="w-[84vw] max-w-[24rem] shrink-0 snap-start lg:w-[25rem] lg:max-w-none"
            >
              <TiltCard className="border-line bg-surface/85 flex h-full flex-col rounded-3xl border p-6 backdrop-blur-md md:p-7 lg:max-h-[74svh] lg:overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-muted font-mono text-xs">
                    {String(i + 1).padStart(2, "0")} · {product.company}
                  </span>
                  {product.href && (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor={work.visit}
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
      </div>

      <Container>
        <h3 className="label text-muted mt-20 mb-6 lg:mt-24">{work.openSourceHeading}</h3>
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
                data-cursor={work.source}
                className="display group-hover:text-accent inline-flex items-center gap-2 text-2xl transition-colors md:col-span-4 md:text-3xl"
              >
                <span data-scramble>{project.name}</span>
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

        <div className="mt-16">
          <Activity labels={profile.activity} locale={locale} />
        </div>
      </Container>
    </section>
  );
}
