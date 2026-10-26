import Image from "next/image";
import type { Profile } from "@/content/profile";
import { photos } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const speeds = [0.05, 0.12, 0.08, 0.15, 0.06, 0.1];

export default function Photography({ profile }: { profile: Profile }) {
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
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photos.map((photo, i) => (
            <li key={photo.src} className="mb-4 break-inside-avoid">
              <div data-parallax={speeds[i % speeds.length]} className="overflow-hidden rounded-2xl bg-surface">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="h-auto w-full"
                />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
