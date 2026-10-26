import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { JourneyVisual } from "@/components/journey/Visuals";
import JourneyFilm from "@/components/journey/JourneyFilm";

// The career as a short film. Without JS (or with reduced motion) the chapters simply stack;
// JourneyFilm turns them into a pinned, scroll-scrubbed sequence with a play button.
export default function Journey({ profile }: { profile: Profile }) {
  const { journey } = profile;
  const chapters = journey.scenes.map((s) => `${s.year} · ${s.company}`);

  return (
    <section id="journey" data-section="journey" className="relative">
      <Container className="pt-28 md:pt-36">
        <SectionHeader id="journey" label={journey.label} heading={journey.heading} />
      </Container>

      <div data-film className="film">
        <div className="film-stage">
          <div
            data-shape-anchor
            data-shape-fill="1.2"
            data-shape-opacity="0.18"
            aria-hidden
            className="pointer-events-none absolute inset-0"
          />

          {journey.scenes.map((scene, i) => (
            <article key={scene.year + scene.company} data-scene={i} className="film-scene">
              <Container className="grid h-full items-center gap-6 md:grid-cols-12 md:gap-10">
                <div
                  data-visual
                  className="order-first aspect-[600/420] w-full max-md:mx-auto max-md:max-h-[28svh] max-md:w-auto md:order-last md:col-span-7"
                >
                  <JourneyVisual kind={scene.visual} />
                </div>
                <div className="md:col-span-5">
                  <p data-bit className="label text-muted">
                    {journey.chapter} {String(i + 1).padStart(2, "0")} · {scene.sector}
                  </p>
                  <p
                    data-year
                    className="display text-accent mt-2 text-[clamp(4.5rem,13vw,11rem)] leading-[0.9]"
                  >
                    {scene.year}
                  </p>
                  <h3 data-bit className="display mt-3 text-3xl md:text-4xl">
                    {scene.company}
                  </h3>
                  <p data-bit className="text-fg/80 mt-3 max-w-md text-base md:text-lg">
                    {scene.line}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {scene.tools.map((t) => (
                      <li
                        key={t}
                        data-tool
                        className="border-line-strong bg-surface/80 rounded-full border px-3 py-1 font-mono text-xs backdrop-blur-sm"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Container>
            </article>
          ))}

          <article data-scene="outro" className="film-scene">
            <Container className="flex h-full flex-col items-center justify-center text-center">
              <p data-bit className="display text-[clamp(2.75rem,8vw,7rem)] leading-none">
                {journey.outro.heading}
              </p>
              <p data-bit className="text-muted mt-5 max-w-xl text-lg">
                {journey.outro.body}
              </p>
              <a
                data-bit
                href="#contact"
                data-magnetic
                className="bg-accent text-accent-ink mt-8 inline-flex h-12 items-center rounded-full px-6 text-sm font-medium"
              >
                {journey.outro.cta}
              </a>
            </Container>
          </article>

          {/* CI/CD pipeline that lights up stage by stage as the story plays. */}
          <ol aria-hidden className="film-pipeline">
            {journey.pipeline.map((stage, i) => (
              <li key={stage} data-stage={i}>
                <span className="dot" />
                <span>{stage}</span>
              </li>
            ))}
          </ol>

          <JourneyFilm
            chapters={chapters}
            labels={{ play: journey.play, pause: journey.pause, replay: journey.replay }}
          />
        </div>
      </div>
    </section>
  );
}
