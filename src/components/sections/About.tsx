import Image from "next/image";
import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export default function About({ profile }: { profile: Profile }) {
  const { about } = profile;
  return (
    <section id="about" data-section="about" className="relative py-24 md:py-36">
      <Container className="relative grid items-center gap-14 md:grid-cols-12 md:gap-10">
        {/* The particles draw the portrait here; the photo shows when WebGL is off. */}
        <div className="md:col-span-5">
          <div
            data-shape-anchor
            data-shape-fill="1.22"
            className="relative mx-auto aspect-[4/5] w-full max-w-[26rem]"
          >
            <Image
              src={person.portrait.src}
              width={person.portrait.width}
              height={person.portrait.height}
              alt={about.portraitAlt}
              sizes="(min-width: 768px) 36vw, 90vw"
              className="shape-fallback size-full rounded-[1.25rem] object-cover"
            />
            <span className="label text-muted absolute -bottom-8 left-0">{about.caption}</span>
          </div>
        </div>

        <div className="md:col-span-7 lg:pl-8">
          <SectionHeader id="about" label={about.label} heading={about.heading} />
          <div className="measure text-fg/85 space-y-5 text-lg">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} data-reveal>
                {p}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
