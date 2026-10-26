import type { Profile } from "@/content/profile";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Stack({ profile }: { profile: Profile }) {
  const { stack } = profile;
  return (
    <section id="stack" data-section="stack" className="relative py-28 md:py-40">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <SectionHeader
              id="stack"
              label={stack.label}
              heading={stack.heading}
              intro={stack.intro}
            />
            {/* The Kubernetes helm forms here. */}
            <div
              data-shape-anchor
              data-shape-fill="0.85"
              className="mx-auto aspect-square w-full max-w-[24rem]"
            />
          </div>
        </div>

        <ul className="border-line bg-line grid gap-px self-start overflow-hidden rounded-3xl border sm:grid-cols-2 lg:col-span-7">
          {stack.groups.map((group, i) => (
            <li
              key={group.name}
              data-reveal
              className="bg-bg/90 p-6 backdrop-blur-sm sm:last:odd:col-span-2 md:p-8"
            >
              <p className="label text-muted flex items-center justify-between">
                <span>{group.name}</span>
                <span className="text-accent/80">{String(i + 1).padStart(2, "0")}</span>
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {group.items.map((item) => (
                  <li key={item} className="font-display text-fg/90 text-lg tracking-tight">
                    <span data-scramble>{item}</span>
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
