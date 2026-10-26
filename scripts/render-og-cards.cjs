// Renders public/og/card-{en,hi} from scripts/og-card.html. Needs playwright-core and Chrome:
//   node scripts/render-og-cards.cjs "$PWD/scripts/og-card.html" "$PWD/public/images/portrait.jpg" <domain> /tmp/og
// then save /tmp/og-<lang>.png as public/og/card-<lang>.jpg (about quality 86, kept under 200 KB for WhatsApp).
const { chromium } = require("playwright-core");
(async () => {
  const [file, photo, url, out] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const lang of ["en", "hi"]) {
    await p.goto(`file://${file}?lang=${lang}&url=${encodeURIComponent(url)}&photo=${encodeURIComponent("file://" + photo)}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const fonts = await p.evaluate(() => ["800 40px 'Bricolage Grotesque'", "500 20px 'IBM Plex Mono'", "400 20px 'IBM Plex Sans Devanagari'"].map((f) => document.fonts.check(f)));
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}-${lang}.png` });
    console.log(lang, "fonts loaded:", fonts.join(","));
  }
  await b.close();
})();
