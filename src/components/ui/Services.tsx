import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Button from "@/components/ui/Button";
import BriefButton from "@/components/ui/BriefButton";

export default function Services({ labels }: { labels: Profile["services"] }) {
  if (labels.items.length === 0) return null;
  return (
    <div id="services" className="mb-20 scroll-mt-24 md:mb-28">
      <p className="label text-accent">{labels.label}</p>
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-3xl md:text-5xl">{labels.heading}</p>
          <p className="measure text-muted mt-4 text-lg">{labels.intro}</p>
        </div>
        {person.booking && (
          <Button
            href={person.booking}
            target="_blank"
            rel="noreferrer"
            data-magnetic
            className="shrink-0"
          >
            {labels.book}
          </Button>
        )}
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {labels.items.map((item) => (
          <li
            key={item.id}
            className="border-line bg-surface/70 hover:border-line-strong flex flex-col rounded-3xl border p-6 backdrop-blur-md transition-colors"
          >
            <p className="font-display text-xl tracking-tight">{item.title}</p>
            <p className="text-muted mt-3 text-sm leading-relaxed">{item.body}</p>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {item.includes.map((tag) => (
                <li
                  key={tag}
                  className="border-line text-muted rounded-full border px-2.5 py-1 text-xs"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <BriefButton topic={item.id}>{labels.brief}</BriefButton>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-muted mt-6 text-sm">{labels.note}</p>
    </div>
  );
}
