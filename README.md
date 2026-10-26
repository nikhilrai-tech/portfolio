# Nikhil Rai · Portfolio

A bilingual (English / हिन्दी) portfolio for an IT & infrastructure lead: GPU particles that morph
into a globe, a portrait, server racks, a service mesh, a Kubernetes helm and a security shield as
you scroll, plus a boot screen, generative sound, a command menu, a working terminal and PWA support.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis ·
three.js (plain, lazy-loaded) · Framer Motion · Web Audio

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (redirects to /en or /hi)
npm run build      # production build, must pass before every PR
npm run lint
```

Set `NEXT_PUBLIC_SITE_URL` (for example `https://nikhilrai.dev`) in Vercel so canonical URLs, the
sitemap and the Open Graph image use the real domain.

## Changing content (handover)

1. **All text lives in `src/content/`.** `en.ts` is English, `hi.ts` is Hindi, and both follow the
   `Profile` type in `types.ts`, so TypeScript tells you if one language is missing a field.
2. Links, email, portrait, tech stacks and repo URLs that are the same in every language are in
   `shared.ts`.
3. **Photos:** put files in `public/images/photography/` and list them in `photos` in `shared.ts`
   (strip EXIF/GPS first). The Moments section and its nav link appear once the list has items.
4. **Resume:** replace `public/Nikhil-Rai-Resume.pdf`, or set `resume` in `shared.ts` to
   `undefined` to hide the download button.
5. **Career chapters:** each role in `en.ts` / `hi.ts` has a `chapter` name and a `year`; the
   rolling year in Experience reads them.
6. **New language:** add the code to `src/i18n/config.ts`, add a `xx.ts` profile and register it in
   `src/content/profile.ts`.

## Deploying

Import the repo in Vercel (framework preset: Next.js, no extra settings). Every PR gets a preview URL;
`main` deploys to production. Add the custom domain under Project → Settings → Domains.

## How the pieces fit

| Where | What |
| --- | --- |
| `src/proxy.ts` | Sends `/` to `/en` or `/hi` (cookie first, then browser language) |
| `src/app/[lang]/` | Layout (fonts, theme, metadata), page, 404, OG image |
| `src/app/manifest.ts`, `public/sw.js`, `public/offline.html` | PWA: install, offline cache and fallback |
| `src/components/sections/` | Hero, About, Experience, Work, Stack, Photography (Moments), Contact |
| `src/components/three/` | `ParticleCanvas` (GPU check, lazy load, section → shape), `ParticleField` (shader, cursor lines), `shapes.ts` |
| `src/components/motion/` | `ScrollEffects` (all `data-*` scroll effects), `Cursor`, `TiltCard`, `SmoothScroll` |
| `src/components/ui/` | `BootScreen`, `SoundToggle`, `CommandPalette`, `Terminal`, `Hud`, `YearRoller`, `Marquee` |
| `src/lib/sound.ts` | Generative Web Audio score (no audio files) |

**Where particles go:** any element with `data-shape-anchor` inside a `[data-section]` decides where
that section's shape sits (`data-shape-fill` for size, `data-shape-opacity` for strength). The
section → shape map is at the top of `ParticleCanvas.tsx`.

**Performance guardrails:** three.js loads in its own chunk once the page is idle and is skipped
entirely (static layout and photo instead) for `prefers-reduced-motion` and software-only WebGL. Add
`?gl=force` to the URL to force it while testing. The boot screen shows once per browser session.

**Keyboard:** `⌘K` / `Ctrl K` opens the command menu, `Esc` skips the boot screen, and the terminal
in Contact answers `help`.
