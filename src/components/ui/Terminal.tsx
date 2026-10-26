"use client";
import { useEffect, useRef, useState } from "react";
import { toggleTheme } from "@/lib/theme";
import { switchLocale } from "@/lib/locale-switch";

type Line = { text: string; kind?: "cmd" | "ok" | "err" | "dim" | "accent"; href?: string };

export type TerminalData = {
  name: string;
  headline: string;
  company: string;
  email: string;
  resume?: string;
  locale: string;
  otherLocale: string;
  roles: { year: string; title: string; company: string; period: string }[];
  stack: { name: string; items: string[] }[];
  projects: { name: string; repo: string }[];
  links: { label: string; href: string }[];
  since: number;
};

const COMMANDS = [
  "help",
  "whoami",
  "experience",
  "stack",
  "projects",
  "contact",
  "socials",
  "resume",
  "uptime",
  "theme",
  "lang",
  "date",
  "ls",
  "cat",
  "clear",
  "sudo",
  "echo",
  "exit",
];

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

export default function Terminal({ data, hint }: { data: TerminalData; hint: string }) {
  const [lines, setLines] = useState<Line[]>([
    { text: "Last login: ttys001 from edge.ap-south-1", kind: "dim" },
    { text: hint, kind: "dim" },
  ]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const out = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    out.current?.scrollTo({ top: out.current.scrollHeight });
  }, [lines]);

  const exec = (raw: string): Line[] => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd.toLowerCase()) {
      case "":
        return [];
      case "help":
        return [
          { text: "available commands:", kind: "accent" },
          ...[
            ["whoami", "who runs this box"],
            ["experience", "career, newest first"],
            ["stack", "tools by group"],
            ["projects", "open-source work"],
            ["contact", "how to reach me"],
            ["socials", "elsewhere online"],
            ["resume", "download the resume"],
            ["uptime", "years in production"],
            ["theme", "toggle light / dark"],
            ["lang", `switch to ${data.otherLocale}`],
            ["clear", "clear the screen"],
          ].map(([c, d]) => ({ text: `  ${pad(c, 12)} ${d}` })),
          { text: "  (and a few that aren't listed)", kind: "dim" },
        ];
      case "whoami":
        return [
          { text: data.name, kind: "accent" },
          { text: `${data.headline} @ ${data.company}` },
          { text: "IT, cloud, DevOps and security. Python by default.", kind: "dim" },
        ];
      case "experience":
        return data.roles.map((r) => ({
          text: `${r.year}  ${pad(r.company, 20)} ${r.title}  (${r.period})`,
        }));
      case "stack":
        return data.stack.map((g) => ({
          text: `${pad(g.name.toLowerCase(), 16)} ${g.items.join(", ")}`,
        }));
      case "projects":
      case "ls":
        if (cmd === "ls" && arg) return [{ text: `ls: ${arg}: Permission denied`, kind: "err" }];
        return cmd === "ls"
          ? [{ text: "about.txt  experience/  projects/  resume.pdf  .secrets (nice try)" }]
          : data.projects.map((p) => ({
              text: `  ${p.name}  →  ${p.repo.replace("https://", "")}`,
              href: p.repo,
            }));
      case "cat":
        if (arg === "about.txt")
          return [{ text: `${data.name}. ${data.headline}. Based in India.` }];
        if (arg.startsWith(".secrets"))
          return [{ text: "cat: .secrets: Operation not permitted (good.)", kind: "err" }];
        return [{ text: `cat: ${arg || "missing operand"}: No such file`, kind: "err" }];
      case "contact":
        return [{ text: `mail  ${data.email}`, href: `mailto:${data.email}` }];
      case "socials":
        return data.links.map((l) => ({
          text: `  ${pad(l.label.toLowerCase(), 10)} ${l.href.replace("https://", "")}`,
          href: l.href,
        }));
      case "resume":
        if (!data.resume) return [{ text: "resume: not published yet", kind: "err" }];
        window.open(data.resume, "_blank");
        return [{ text: "opening resume.pdf …", kind: "ok" }];
      case "uptime": {
        const years = new Date().getFullYear() - data.since;
        return [
          {
            text: `up ${years} years, shipping to production since ${data.since}. load average: healthy`,
            kind: "ok",
          },
        ];
      }
      case "date":
        return [
          { text: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" },
        ];
      case "theme":
        toggleTheme();
        return [{ text: "theme toggled", kind: "ok" }];
      case "lang":
        window.location.hash = "terminal";
        switchLocale(data.otherLocale);
        return [{ text: `switching to ${data.otherLocale} …`, kind: "ok" }];
      case "echo":
        return [{ text: arg }];
      case "sudo":
        if (/hire/.test(arg))
          return [
            { text: "[sudo] password for recruiter: ********", kind: "dim" },
            { text: "access granted. opening a channel to Nikhil …", kind: "ok" },
            {
              text: `→ ${data.email}`,
              href: `mailto:${data.email}?subject=Let's%20talk`,
              kind: "accent",
            },
          ];
        if (/rm\s+-rf/.test(arg))
          return [
            {
              text: "nice try. this incident has been reported to the IT head (that's me).",
              kind: "err",
            },
          ];
        return [
          {
            text: `${data.name.split(" ")[0].toLowerCase()} is not in the sudoers file. This incident will be reported.`,
            kind: "err",
          },
        ];
      case "exit":
        input.current?.blur();
        return [{ text: "logout. (the site is still here, scroll on.)", kind: "dim" }];
      default:
        return [{ text: `command not found: ${cmd}. try "help"`, kind: "err" }];
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value;
    setValue("");
    cursor.current = -1;
    if (raw.trim()) history.current.unshift(raw);
    if (raw.trim().toLowerCase() === "clear") return setLines([]);
    setLines((l) => [...l, { text: raw, kind: "cmd" }, ...exec(raw)]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(
        -1,
        Math.min(history.current.length - 1, cursor.current + (e.key === "ArrowUp" ? 1 : -1)),
      );
      cursor.current = next;
      setValue(next === -1 ? "" : history.current[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMANDS.find((c) => c.startsWith(value.trim().toLowerCase()) && value.trim());
      if (match) setValue(match + " ");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const color = (k?: Line["kind"]) =>
    k === "err"
      ? "text-red-400"
      : k === "ok"
        ? "text-cool"
        : k === "accent"
          ? "text-accent"
          : k === "dim"
            ? "text-muted"
            : "text-fg/90";

  const prompt = (
    <span className="shrink-0">
      <span className="text-cool">nikhil@infra</span>
      <span className="text-muted">:</span>
      <span className="text-accent">~</span>
      <span className="text-muted">$ </span>
    </span>
  );

  return (
    <div
      className="border-line bg-bg/85 focus-within:border-accent/60 overflow-hidden rounded-2xl border font-mono text-[0.8rem] shadow-[var(--shadow)] backdrop-blur-md md:text-sm"
      onClick={() => input.current?.focus({ preventScroll: true })}
    >
      <div className="border-line flex items-center gap-2 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="text-muted ml-3 text-xs">nikhil@infra: ~ (zsh)</span>
      </div>
      <div
        ref={out}
        aria-live="polite"
        className="h-72 overflow-y-auto px-4 py-3 whitespace-pre-wrap md:h-80"
      >
        {lines.map((l, i) => (
          <div key={i} className={`break-words ${color(l.kind)}`}>
            {l.kind === "cmd" ? (
              <>
                {prompt}
                {l.text}
              </>
            ) : l.href ? (
              <a
                href={l.href}
                target={l.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className="hover:underline"
              >
                {l.text}
              </a>
            ) : (
              l.text
            )}
          </div>
        ))}
        <form onSubmit={submit} className="flex">
          {prompt}
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal command"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="caret-accent w-full bg-transparent outline-none focus-visible:outline-none"
          />
        </form>
      </div>
    </div>
  );
}
