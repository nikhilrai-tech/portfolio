import type { Locale } from "@/i18n/config";
import type { Profile, SectionId } from "@/content/profile";
import { person } from "@/content/profile";
import LanguageSwitch from "./LanguageSwitch";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

export default function Header({
  profile,
  locale,
  sections,
}: {
  profile: Profile;
  locale: Locale;
  sections: SectionId[];
}) {
  const links = sections
    .filter((id) => id !== "intro")
    .map((id) => ({ id, label: profile.nav[id] }));

  return (
    <header className="border-line bg-bg/75 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <a href="#intro" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="border-line-strong group-hover:border-accent group-hover:text-accent grid size-9 place-items-center rounded-full border font-mono text-[0.7rem] tracking-wider transition-colors"
          >
            NR
          </span>
          <span className="font-display sr-only text-[0.95rem] font-semibold tracking-tight sm:not-sr-only">
            {person.name}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-muted hover:text-fg rounded-full px-3 py-1.5 text-sm transition-colors"
            >
              <span data-scramble>{link.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch current={locale} label={profile.ui.language} />
          <ThemeToggle label={profile.ui.theme} />
          <MobileMenu links={links} menuLabel={profile.ui.menu} closeLabel={profile.ui.close} />
        </div>
      </div>
    </header>
  );
}
