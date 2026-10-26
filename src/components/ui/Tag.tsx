export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <li className="border-line text-muted rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] leading-5">
      {children}
    </li>
  );
}
