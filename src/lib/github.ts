import { cacheLife } from "next/cache";

export type Day = { date: string; level: number; count: number };
export type Repo = {
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
  /** Hours since the last push, measured when the data was fetched (cached for an hour). */
  hoursAgo: number;
};

const USER = "nikhilrai-tech";
const headers = {
  "User-Agent": "nikhilrai-portfolio",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

/**
 * Last year of public contributions, read from GitHub's profile calendar. Cached for an hour;
 * returns null if GitHub is unreachable so the page still renders.
 */
export async function getContributions(): Promise<Day[] | null> {
  "use cache";
  cacheLife("hours");
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, { headers });
    if (!res.ok) return null;
    const html = await res.text();
    const counts = new Map<string, number>();
    for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = /^(\d+) contribution/.exec(m[2].trim());
      counts.set(m[1], n ? Number(n[1]) : 0);
    }
    const days: Day[] = [];
    for (const m of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
      const tag = m[0];
      const date = /data-date="([^"]+)"/.exec(tag)?.[1];
      const level = Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0);
      const id = /id="([^"]+)"/.exec(tag)?.[1] ?? "";
      if (date) days.push({ date, level, count: counts.get(id) ?? 0 });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    return days.length ? days : null;
  } catch {
    return null;
  }
}

/** Most recently pushed public repos that have a description (forks and the profile repo skipped). */
export async function getRecentRepos(limit = 4): Promise<Repo[] | null> {
  "use cache";
  cacheLife("hours");
  try {
    const res = await fetch(
      `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=30&type=owner`,
      {
        headers: { ...headers, Accept: "application/vnd.github+json" },
      },
    );
    if (!res.ok) return null;
    const list = (await res.json()) as {
      name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      stargazers_count: number;
      pushed_at: string;
      fork: boolean;
      private: boolean;
    }[];
    const now = Date.now();
    return list
      .filter((r) => !r.fork && !r.private && r.description && r.name !== USER)
      .slice(0, limit)
      .map((r) => ({
        name: r.name,
        description: r.description!,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        hoursAgo: Math.max(0, Math.round((now - Date.parse(r.pushed_at)) / 3_600_000)),
      }));
  } catch {
    return null;
  }
}
