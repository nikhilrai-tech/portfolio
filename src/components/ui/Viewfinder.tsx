// Camera viewfinder frame: corner brackets, an AF point and a caption strip.
export default function Viewfinder({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  const corner = "absolute size-6 border-accent";
  return (
    <figure className="relative">
      <div className="bg-surface relative overflow-hidden rounded-[1.25rem] shadow-[var(--shadow)]">
        <div className="aspect-[4/5]">{children}</div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-1 ring-black/10 ring-inset"
        />
        <span
          aria-hidden
          className="border-accent/80 pointer-events-none absolute top-[31%] left-1/2 size-10 -translate-x-1/2 rounded-sm border"
        />
      </div>
      <span aria-hidden className={`${corner} -top-3 -left-3 border-t-2 border-l-2`} />
      <span aria-hidden className={`${corner} -top-3 -right-3 border-t-2 border-r-2`} />
      <span aria-hidden className={`${corner} -bottom-3 -left-3 border-b-2 border-l-2`} />
      <span aria-hidden className={`${corner} -right-3 -bottom-3 border-r-2 border-b-2`} />
      {caption && (
        <figcaption className="label text-muted mt-6 flex items-center justify-between">
          <span>{caption}</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" aria-hidden />
            REC
          </span>
        </figcaption>
      )}
    </figure>
  );
}
