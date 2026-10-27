import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import Button from "@/components/ui/Button";

export default function SponsorCard({ labels }: { labels: Profile["sponsor"] }) {
  if (!person.sponsor) return null;
  return (
    <div className="border-line flex flex-col gap-6 border-t pt-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="display text-2xl md:text-3xl">{labels.heading}</p>
        <p className="measure text-muted mt-3">{labels.body}</p>
      </div>
      <Button
        href={person.sponsor}
        target="_blank"
        rel="noreferrer"
        variant="ghost"
        data-magnetic
        className="shrink-0 self-start md:self-auto"
      >
        <span aria-hidden className="text-accent">
          ♥
        </span>
        {labels.button}
      </Button>
    </div>
  );
}
