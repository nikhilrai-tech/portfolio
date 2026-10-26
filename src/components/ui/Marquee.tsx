// Big scrolling words between sections. ScrollEffects speeds them up and skews them with
// scroll velocity; without JS they simply sit still.
export default function Marquee({
  words,
  direction = 1,
  outline = false,
}: {
  words: string[];
  direction?: 1 | -1;
  outline?: boolean;
}) {
  const row = (copy: number) => (
    <p
      key={copy}
      className={`display flex shrink-0 items-center gap-[0.35em] pr-[0.35em] text-[clamp(3.25rem,9vw,8.5rem)] whitespace-nowrap ${
        outline ? "outline-word" : "text-fg/90"
      }`}
    >
      {words.map((w) => (
        <span key={w} className="flex items-center gap-[0.35em]">
          {w}
          <span className="text-accent text-[0.45em]" style={{ WebkitTextStroke: 0 }}>
            ✦
          </span>
        </span>
      ))}
    </p>
  );
  return (
    <div
      aria-hidden
      data-marquee={direction}
      className="relative overflow-hidden py-4 select-none md:py-8"
    >
      <div data-marquee-track className="flex w-max will-change-transform">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
