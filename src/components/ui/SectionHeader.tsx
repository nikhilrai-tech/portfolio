import type { SectionId } from "@/content/profile";
import { sections } from "@/lib/sections";

export default function SectionHeader({
  id,
  label,
  heading,
  intro,
}: {
  id: SectionId;
  label: string;
  heading: string;
  intro?: string;
}) {
  const index = String(sections.indexOf(id) + 1).padStart(2, "0");
  return (
    <header className="mb-12 md:mb-16">
      <p className="label text-accent flex items-center gap-3">
        <span>{index}</span>
        <span aria-hidden className="bg-accent/60 h-px w-8" />
        <span>{label}</span>
      </p>
      <h2 className="display mt-5 text-[clamp(2.25rem,6vw,4.75rem)]">{heading}</h2>
      {intro && <p className="measure text-muted mt-5 text-lg">{intro}</p>}
    </header>
  );
}
