import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Devanagari,
} from "next/font/google";
import { hasLocale, locales } from "@/i18n/config";
import { getProfile, person } from "@/content/profile";
import { themeScript } from "@/lib/theme-script";
import SmoothScroll from "@/components/motion/SmoothScroll";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
const deva = IBM_Plex_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-deva",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getProfile(lang);
  return {
    metadataBase: new URL(person.siteUrl),
    title: meta.title,
    description: meta.description,
    authors: [{ name: person.name, url: person.links.github }],
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "profile",
      title: meta.title,
      description: meta.description,
      url: `/${lang}`,
      siteName: person.name,
      locale: lang === "hi" ? "hi_IN" : "en_IN",
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0f" },
    { media: "(prefers-color-scheme: light)", color: "#eceff2" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const profile = getProfile(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${bricolage.variable} ${plex.variable} ${plexMono.variable} ${deva.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus:translate-y-0"
        >
          {profile.ui.skip}
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
