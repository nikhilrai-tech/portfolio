import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Stack({ profile }: { profile: Profile }) {
  const { stack } = profile;
  return (
    <section id="stack" data-section="stack" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader id="stack" label={stack.label} heading={stack.heading} intro={stack.intro} />
        <ul className="border-line bg-line grid gap-px overflow-hidden rounded-3xl border sm:grid-cols-2 lg:grid-cols-3 lg:[&>li:last-child:nth-child(3n+1)]:col-span-3 sm:max-lg:[&>li:last-child:nth-child(odd)]:col-span-2">
          {stack.groups.map((group, i) => (
            <li key={group.name} data-reveal className="bg-bg p-6 md:p-8">
              <p className="label text-muted flex items-center justify-between">
                <span>{group.name}</span>
                <span className="text-accent/80">{String(i + 1).padStart(2, "0")}</span>
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {group.items.map((item) => (
                  <li key={item} className="font-display text-fg/90 text-lg tracking-tight">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
