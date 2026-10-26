import { cacheLife } from "next/cache";
import type { Locale } from "@/i18n/config";
import type { Profile } from "@/content/profile";
import { person } from "@/content/profile";
import { getContributions, getRecentRepos, type Day } from "@/lib/github";
import { ArrowUpRight } from "@/components/ui/Icons";

const CELL = 11;
const GAP = 3;
const SHADES = ["var(--line)", "22%", "45%", "70%", "100%"];

function stats(days: Day[]) {
  let total = 0;
  let active = 0;
  let best = 0;
  let run = 0;
  for (const d of days) {
    total += d.count;
    if (d.count > 0) {
      active++;
      run++;
      best = Math.max(best, run);
    } else run = 0;
  }
  return { total, active, best };
}

// Live GitHub activity: last year's contribution calendar plus recently pushed repos.
// Rendered on the server and cached for an hour; degrades to a profile link if GitHub is down.
export default async function Activity({
  labels,
  locale,
}: {
  labels: Profile["activity"];
  locale: Locale;
}) {
  "use cache";
  cacheLife("hours");
  const [days, repos] = await Promise.all([getContributions(), getRecentRepos()]);

  if (!days) {
    return (
      <p className="text-muted">
        {labels.offline}{" "}
        <a href={person.links.github} className="text-accent underline underline-offset-4">
          {labels.profile}
        </a>
      </p>
    );
  }

  // Columns are weeks (Sunday first), like GitHub's own calendar.
  const first = new Date(days[0].date + "T00:00:00Z").getUTCDay();
  const weeks = Math.ceil((days.length + first) / 7);
  const width = weeks * (CELL + GAP) - GAP;
  const height = 7 * (CELL + GAP) - GAP;
  const { total, active, best } = stats(days);
  const nf = new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN");
  const rtf = new Intl.RelativeTimeFormat(locale === "hi" ? "hi" : "en", { numeric: "auto" });
  const ago = (hours: number) =>
    hours < 24 ? rtf.format(-hours, "hour") : rtf.format(-Math.round(hours / 24), "day");
  const fill = (level: number) =>
    level === 0
      ? SHADES[0]
      : `color-mix(in srgb, var(--accent) ${SHADES[level]}, var(--surface-2))`;

  return (
    <div className="border-line bg-surface/70 rounded-3xl border p-6 backdrop-blur-md md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-accent flex items-center gap-2">
            <span className="relative flex size-1.5">
              <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-60" />
              <span className="bg-accent relative inline-flex size-1.5 rounded-full" />
            </span>
            {labels.heading}
          </p>
          <p className="text-muted mt-1 font-mono text-xs">{labels.updated}</p>
        </div>
        <dl className="flex gap-8">
          {[
            [nf.format(total), labels.total],
            [nf.format(active), labels.days],
            [nf.format(best), labels.streak],
          ].map(([v, l]) => (
            <div key={l}>
              <dd className="display text-3xl">{v}</dd>
              <dt className="text-muted max-w-[9rem] text-xs leading-snug">{l}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="no-scrollbar mt-6 overflow-x-auto" dir="rtl">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="max-w-none md:h-auto md:w-full"
          role="img"
          aria-label={`${nf.format(total)} ${labels.total}`}
        >
          {days.map((d, i) => {
            const slot = i + first;
            return (
              <rect
                key={d.date}
                x={Math.floor(slot / 7) * (CELL + GAP)}
                y={(slot % 7) * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2.5}
                style={{ fill: fill(d.level) }}
              >
                <title>{`${d.count} · ${d.date}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <p className="text-muted mt-3 flex items-center justify-end gap-1.5 font-mono text-[0.65rem]">
        {labels.less}
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="inline-block size-2.5 rounded-[3px]"
            style={{ background: fill(l) }}
          />
        ))}
        {labels.more}
      </p>

      {repos && repos.length > 0 && (
        <>
          <p className="label text-muted mt-8 mb-3">{labels.recent}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {repos.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-line hover:border-accent group flex h-full flex-col rounded-2xl border p-4 transition-colors"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display group-hover:text-accent truncate text-lg font-semibold tracking-tight">
                      {r.name}
                    </span>
                    <ArrowUpRight className="text-muted size-3.5 shrink-0" />
                  </span>
                  <span className="text-fg/75 mt-1 line-clamp-2 text-sm">{r.description}</span>
                  <span className="text-muted mt-auto flex items-center gap-3 pt-3 font-mono text-[0.7rem]">
                    {r.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="bg-cool size-2 rounded-full" />
                        {r.language}
                      </span>
                    )}
                    {r.stars > 0 && <span>★ {r.stars}</span>}
                    <span>{ago(r.hoursAgo)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
