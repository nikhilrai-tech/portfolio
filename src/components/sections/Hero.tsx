import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { ArrowDown } from "@/components/ui/Icons";

export default function Hero({ profile }: { profile: Profile }) {
  const { hero } = profile;
  const [first, ...rest] = person.name.split(" ");
  let i = 0;
  const rise = () => ({ className: "rise", style: { "--i": i++ } as React.CSSProperties });

  return (
    <section
      id="intro"
      data-section="intro"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-24 pb-20"
    >
      {/* The particle globe sits on this box, between the two halves of the name. */}
      <div
        data-shape-anchor
        data-shape-fill="0.95"
        data-shape-opacity="0.85"
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(118vw,88svh)] -translate-x-1/2 -translate-y-[54%]"
      />

      <Container className="relative flex flex-col items-center text-center">
        <p className="label text-accent">
          <span {...rise()}>{hero.eyebrow}</span>
        </p>
        {hero.status && (
          <p className="border-line bg-bg/60 text-fg/85 mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span {...rise()}>{hero.status}</span>
          </p>
        )}

        {/* Desktop: NIKHIL RAI. on one line over the globe. Phones: two big stacked lines. */}
        <h1 className="display mt-8 flex w-full flex-col items-center text-[clamp(4.5rem,24vw,8rem)] leading-[0.86] md:flex-row md:justify-center md:gap-[0.3em] md:text-[clamp(4rem,11.5vw,13rem)] md:leading-none">
          <span data-hero-split="-1">
            <span {...rise()}>{first.toUpperCase()}</span>
          </span>
          <span data-hero-split="1">
            <span {...rise()}>
              {rest.join(" ").toUpperCase()}
              <span className="text-accent">.</span>
            </span>
          </span>
        </h1>

        <p className="text-muted mt-8 font-mono text-sm">
          <span {...rise()}>{hero.role}</span>
        </p>
        <p className="measure text-fg/85 mt-4 max-w-2xl text-lg md:text-xl">
          <span {...rise()}>{hero.intro}</span>
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <span {...rise()}>
            <Button href="#work" data-magnetic>
              {hero.primaryCta}
            </Button>
          </span>
          <span {...rise()}>
            <Button href="#contact" variant="ghost" data-magnetic>
              {hero.secondaryCta}
            </Button>
          </span>
        </div>

        <dl className="border-line mt-12 grid w-full max-w-2xl grid-cols-3 gap-4 border-t pt-6">
          {hero.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span data-count className="display block text-3xl md:text-5xl">
                  {fact.value}
                </span>
                <span className="text-muted mt-1 block text-xs leading-snug md:text-sm">
                  {fact.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <a
        href="#about"
        className="label text-muted hover:text-fg absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 transition-colors md:flex"
      >
        {hero.scroll}
        <ArrowDown />
      </a>
    </section>
  );
}
