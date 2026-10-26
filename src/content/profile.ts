import type { Locale } from "@/i18n/config";
import { en } from "./en";
import { hi } from "./hi";
import type { Profile } from "./types";

export * from "./shared";
export type * from "./types";

const profiles: Record<Locale, Profile> = { en, hi };

export function getProfile(locale: Locale): Profile {
  return profiles[locale];
}
