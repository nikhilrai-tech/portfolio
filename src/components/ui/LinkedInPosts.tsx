"use client";
import { useState } from "react";
import type { Profile } from "@/content/profile";
import { linkedinPosts } from "@/content/profile";
import { ArrowUpRight } from "./Icons";

// LinkedIn posts as cards. "Open on LinkedIn" always works; posts with an official embed src can
// also be shown inline, loaded only on tap (no LinkedIn scripts or trackers before that).
export default function LinkedInPosts({ labels }: { labels: Profile["linkedin"] }) {
  const [shown, setShown] = useState<Record<string, boolean>>({});
  return (
    <div className="mt-20">
      <p className="label text-muted mb-6 flex items-center justify-between gap-4">
        <span>{labels.heading}</span>
        {linkedinPosts.some((p) => p.embed) && (
          <span className="!tracking-normal !normal-case">{labels.note}</span>
        )}
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {linkedinPosts.map((post) => (
          <li
            key={post.urn}
            className="border-line bg-surface/80 overflow-hidden rounded-3xl border backdrop-blur-md"
          >
            {post.embed && shown[post.urn] ? (
              <iframe
                src={post.embed}
                title={`${labels.by}: ${post.tags.join(", ")}`}
                loading="lazy"
                allowFullScreen
                className="h-[34rem] w-full bg-white"
              />
            ) : (
              <div className="flex h-full flex-col p-6">
                <span className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6 shrink-0 rounded-[4px] bg-[#0A66C2] p-1 text-white"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"
                    />
                  </svg>
                  <span className="text-muted text-sm">{labels.by}</span>
                </span>
                <p className="display mt-6 text-2xl leading-tight">
                  {post.tags.map((t) => (
                    <span key={t} className="mr-2 inline-block">
                      <span className="text-accent">#</span>
                      {t}
                    </span>
                  ))}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-8">
                  {post.embed && (
                    <button
                      type="button"
                      onClick={() => setShown((s) => ({ ...s, [post.urn]: true }))}
                      className="bg-accent text-accent-ink h-10 rounded-full px-4 text-sm font-medium"
                    >
                      {labels.load}
                    </button>
                  )}
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border-line-strong hover:border-fg inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors"
                  >
                    {labels.open}
                    <ArrowUpRight />
                  </a>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
