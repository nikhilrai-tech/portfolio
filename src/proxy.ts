import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { notes } from "@/content/notes";

const noteSlugs = new Set(notes.map((n) => n.slug));

// Picks the best supported locale from the Accept-Language header, honouring q-values.
function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => hasLocale(r.base))?.base as Locale | undefined;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasPrefix) {
    // Unknown note slugs: send them to the catch-all route, which answers with a real 404.
    // (dynamicParams = false is not available with Cache Components.)
    const note = /^\/(en|hi)\/notes\/([^/]+)\/?$/.exec(pathname);
    if (note && !noteSlugs.has(note[2])) {
      request.nextUrl.pathname = `/${note[1]}/__missing`;
      return NextResponse.rewrite(request.nextUrl);
    }
    return;
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    (cookie && hasLocale(cookie) ? cookie : undefined) ??
    fromAcceptLanguage(request.headers.get("accept-language")) ??
    defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, metadata routes and any file with an extension.
  matcher: ["/((?!_next|api|.*\\..*|opengraph-image|twitter-image|icon|apple-icon).*)"],
};
