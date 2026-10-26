type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "primary" | "ghost" };

export default function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  const base =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-ink hover:brightness-110"
      : "border border-line-strong text-fg hover:border-fg";
  return (
    <a className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </a>
  );
}
