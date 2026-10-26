import { lang } from "next/root-params";
import { defaultLocale, hasLocale } from "@/i18n/config";
import Button from "@/components/ui/Button";

const copy = {
  en: {
    title: "Route not found.",
    body: "The request reached the edge, but no service answers on this path.",
    home: "Back to the homepage",
  },
  hi: {
    title: "रूट नहीं मिला।",
    body: "रिक्वेस्ट एज तक पहुँची, पर इस पाथ पर कोई सर्विस जवाब नहीं देती।",
    home: "होम पेज पर जाएँ",
  },
};

export default async function NotFound() {
  const value = await lang();
  const locale = hasLocale(value) ? value : defaultLocale;
  const t = copy[locale];
  return (
    <main className="grid min-h-[100svh] place-items-center px-4 text-center">
      <div>
        <p className="display text-accent text-[clamp(6rem,22vw,14rem)] leading-none">404</p>
        <p className="label text-muted mt-6 font-mono">HTTP/2 404 · x-served-by: edge</p>
        <h1 className="display mt-6 text-[clamp(2rem,6vw,4rem)]">{t.title}</h1>
        <p className="text-muted mx-auto mt-4 max-w-md">{t.body}</p>
        <Button href={`/${locale}`} className="mt-8">
          {t.home}
        </Button>
      </div>
    </main>
  );
}
