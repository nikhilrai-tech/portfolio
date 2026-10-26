import type { Locale } from "@/i18n/config";
import type { Profile } from "@/content/profile";
import LanguageSwitch from "./LanguageSwitch";
import ThemeToggle from "./ThemeToggle";

// Slim header for standalone pages (notes): home link, back link, language and theme.
export default function ArticleHeader({
  profile,
  locale,
  back,
}: {
  profile: Profile;
  locale: Locale;
  back: { href: string; label: string };
}) {
  return (
    <header className="border-line bg-bg/75 sticky top-0 z-50 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <a
            href={`/${locale}`}
            aria-label="Nikhil Rai"
            className="border-line-strong hover:border-accent hover:text-accent grid size-9 place-items-center rounded-full border font-mono text-[0.7rem] tracking-wider transition-colors"
          >
            NR
          </a>
          <a href={back.href} className="label text-muted hover:text-fg">
            ← {back.label}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitch current={locale} label={profile.ui.language} />
          <ThemeToggle label={profile.ui.theme} />
        </div>
      </div>
    </header>
  );
}
