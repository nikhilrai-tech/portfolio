export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.7rem] leading-5 text-muted">
      {children}
    </li>
  );
}
