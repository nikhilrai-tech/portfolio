import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import LensFallback from "@/components/three/LensFallback";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { ArrowDown } from "@/components/ui/Icons";

export default function Hero({ profile }: { profile: Profile }) {
  const { hero } = profile;
  const [first, ...rest] = person.name.split(" ");
  let i = 0;
  const word = (text: string, extra = "") => (
    <span className={`rise ${extra}`} style={{ "--i": i++ } as React.CSSProperties}>
      {text}
    </span>
  );

  return (
    <section
      id="intro"
      data-section="intro"
      className="relative flex min-h-[100svh] flex-col justify-center pt-24 pb-16 lg:pt-28"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-12">
        {/* The 3D lens tracks any [data-lens-slot] box. On mobile this one sits above the text. */}
        <div
          id="lens-slot"
          data-lens-slot
          className="relative order-first mx-auto aspect-square w-[min(68vw,22rem)] lg:order-last lg:col-span-5 lg:w-full lg:max-w-[34rem]"
        >
          <LensFallback className="lens-fallback size-full drop-shadow-[0_40px_60px_rgb(0_0_0/0.45)]" />
        </div>

        <div className="relative z-10 lg:col-span-7">
          <p className="label text-accent">{word(hero.eyebrow)}</p>
          <h1 className="display mt-6 text-[clamp(3.5rem,12vw,10rem)]">
            {word(first)}
            <br />
            {word(rest.join(" "))}
            {word(".", "text-accent")}
          </h1>
          <p className="text-muted mt-6 font-mono text-sm">{word(hero.role)}</p>
          <p className="measure text-fg/85 mt-5 text-lg md:text-xl">{word(hero.intro)}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <span className="rise" style={{ "--i": i++ } as React.CSSProperties}>
              <Button href="#work">{hero.primaryCta}</Button>
            </span>
            <span className="rise" style={{ "--i": i++ } as React.CSSProperties}>
              <Button href="#contact" variant="ghost">
                {hero.secondaryCta}
              </Button>
            </span>
          </div>

          <dl className="border-line mt-12 grid max-w-xl grid-cols-3 gap-4 border-t pt-6">
            {hero.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="display block text-3xl md:text-4xl">{fact.value}</span>
                  <span className="text-muted mt-1 block text-xs leading-snug md:text-sm">
                    {fact.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
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
