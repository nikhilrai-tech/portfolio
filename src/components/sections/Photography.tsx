import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Profile } from "@/content/profile";
import { photos } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const speeds = [0.05, 0.12, 0.08, 0.15, 0.06, 0.1];

export default function Photography({ profile, locale }: { profile: Profile; locale: Locale }) {
  if (photos.length === 0) return null;
  const { photography } = profile;
  return (
    <section id="photography" data-section="photography" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader
          id="photography"
          label={photography.label}
          heading={photography.heading}
          intro={photography.intro}
        />
        <ul className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <li key={photo.src} className={i % 2 === 1 ? "mt-10 lg:mt-24" : undefined}>
              <figure
                data-parallax={speeds[i % speeds.length]}
                className="bg-surface overflow-hidden rounded-2xl"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt[locale]}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 24vw, 46vw"
                  className="h-auto w-full transition-transform duration-700 hover:scale-[1.03]"
                />
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
