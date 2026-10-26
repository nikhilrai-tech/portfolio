// Server-friendly wrapper: ScrollEffects picks up the data attribute and drives the motion.
export default function Parallax({
  speed = 0.1,
  children,
  className,
}: {
  speed?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-parallax={speed} className={className}>
      {children}
    </div>
  );
}
