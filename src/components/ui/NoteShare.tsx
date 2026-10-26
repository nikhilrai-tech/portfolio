import ShareButton from "./ShareButton";

// Share row under a note: the native share sheet, plus direct links for the usual places.
export default function NoteShare({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: { button: string; copied: string };
}) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const targets = [
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
  ];
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <ShareButton
        title={title}
        text={title}
        url={url}
        label={labels.button}
        copiedLabel={labels.copied}
      />
      {targets.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          className="border-line-strong hover:border-fg inline-flex h-12 items-center rounded-full border px-5 text-sm transition-colors"
        >
          {s.name}
        </a>
      ))}
    </div>
  );
}
