import Image from "next/image";
import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Viewfinder from "@/components/ui/Viewfinder";

export default function About({ profile }: { profile: Profile }) {
  const { about } = profile;
  return (
    <section id="about" data-section="about" className="relative overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none mb-10 select-none md:mb-16">
        <p data-drift="-1" className="outline-word text-[clamp(6rem,22vw,20rem)]">
          CODE&nbsp;CODE&nbsp;CODE
        </p>
      </div>

      <Container className="relative grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div data-parallax="0.08">
            <Viewfinder caption={about.caption}>
              <Image
                src={person.portrait.src}
                width={person.portrait.width}
                height={person.portrait.height}
                alt={about.portraitAlt}
                sizes="(min-width: 768px) 36vw, 90vw"
                className="size-full object-cover"
                priority={false}
              />
            </Viewfinder>
          </div>
        </div>

        <div className="md:col-span-7 md:pt-10 lg:pl-8">
          <SectionHeader id="about" label={about.label} heading={about.heading} />
          <div className="measure space-y-5 text-lg text-fg/85">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </Container>

      <div aria-hidden className="pointer-events-none mt-16 select-none md:mt-24">
        <p data-drift="1" className="outline-word -translate-x-1/3 text-[clamp(6rem,22vw,20rem)]">
          LENS&nbsp;LENS&nbsp;LENS
        </p>
      </div>
    </section>
  );
}
