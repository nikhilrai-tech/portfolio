"use client";
import { LOCALE_COOKIE } from "@/i18n/config";

/** Remembers the choice and reloads into the other locale, keeping the current section. */
export function switchLocale(locale: string) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  // A full navigation on purpose: each locale has its own root layout (html lang, fonts).
  window.location.assign(new URL(`/${locale}${window.location.hash}`, window.location.origin));
}
