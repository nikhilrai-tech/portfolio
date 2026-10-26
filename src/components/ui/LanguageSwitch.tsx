"use client";
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/i18n/config";

export default function LanguageSwitch({ current, label }: { current: Locale; label: string }) {
  const remember = (locale: Locale) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    // Keep the visitor on the same section after switching.
    // Same page and section in the other language: swap only the leading locale segment.
    const rest = window.location.pathname.replace(/^\/(en|hi)(?=\/|$)/, "");
    event.currentTarget.href = `/${locale}${rest}${window.location.hash}`;
  };

  return (
    <nav aria-label={label} className="border-line flex items-center rounded-full border p-0.5">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <a
            key={locale}
            href={`/${locale}`}
            hrefLang={locale}
            lang={locale}
            onClick={remember(locale)}
            aria-current={active ? "true" : undefined}
            title={localeLabels[locale].native}
            className={`label grid h-8 min-w-9 place-items-center rounded-full px-2 !text-[0.7rem] !tracking-wider transition-colors ${
              active ? "bg-fg text-bg" : "text-muted hover:text-fg"
            }`}
          >
            {localeLabels[locale].short}
          </a>
        );
      })}
    </nav>
  );
}
