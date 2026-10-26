import { lang } from "next/root-params";
import { defaultLocale, hasLocale } from "@/i18n/config";
import LensFallback from "@/components/three/LensFallback";
import Button from "@/components/ui/Button";

const copy = {
  en: {
    title: "Out of focus.",
    body: "This frame doesn't exist. The page may have moved.",
    home: "Back home",
  },
  hi: {
    title: "फ़ोकस से बाहर।",
    body: "यह फ़्रेम मौजूद नहीं है। हो सकता है पेज हट गया हो।",
    home: "होम पर जाएँ",
  },
};

export default async function NotFound() {
  const value = await lang();
  const locale = hasLocale(value) ? value : defaultLocale;
  const t = copy[locale];
  return (
    <main className="grid min-h-[100svh] place-items-center px-4 text-center">
      <div>
        <LensFallback className="mx-auto size-40 blur-[1.5px]" />
        <p className="label text-accent mt-8">404</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,8vw,5rem)]">{t.title}</h1>
        <p className="text-muted mx-auto mt-4 max-w-md">{t.body}</p>
        <Button href={`/${locale}`} className="mt-8">
          {t.home}
        </Button>
      </div>
    </main>
  );
}
