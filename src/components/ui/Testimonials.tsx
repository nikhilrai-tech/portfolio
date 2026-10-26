import type { Profile } from "@/content/profile";
import { testimonials } from "@/content/profile";
import { ArrowUpRight } from "./Icons";

// Real recommendations only (see shared.ts). Renders nothing until some are added.
export default function Testimonials({ labels }: { labels: Profile["testimonials"] }) {
  if (testimonials.length === 0) return null;
  return (
    <div className="mb-24">
      <p className="label text-accent">{labels.label}</p>
      <p className="display mt-4 text-3xl md:text-5xl">{labels.heading}</p>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {testimonials.map((t) => (
          <li key={t.name} data-reveal>
            <figure className="border-line bg-surface/80 flex h-full flex-col rounded-3xl border p-6 backdrop-blur-md md:p-8">
              <span aria-hidden className="display text-accent text-5xl leading-none">
                “
              </span>
              <blockquote className="text-fg/90 mt-2 text-lg">{t.quote}</blockquote>
              <figcaption className="mt-auto flex items-center justify-between gap-4 pt-6">
                <span>
                  <span className="font-display block font-semibold">{t.name}</span>
                  <span className="text-muted text-sm">{t.role}</span>
                </span>
                {t.href && (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.name}
                    className="text-muted hover:text-accent"
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
