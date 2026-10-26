# Nikhil Rai · Portfolio

"Code meets Lens": a bilingual (English / हिन्दी) portfolio with a scroll-driven 3D camera lens,
parallax and a viewfinder HUD.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis ·
three.js + React Three Fiber + drei · Framer Motion

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
3. **Photos:** put files in `public/images/photography/` and list them in `photos` in `shared.ts`.
   The Photography section and its nav link appear automatically once the list has items.
4. **Resume:** add a copy *without the phone number* as `public/resume.pdf`, then set
   `resume: "/resume.pdf"` in `shared.ts`. The download button appears on its own.
5. **New language:** add the code to `src/i18n/config.ts`, add a `xx.ts` profile and register it in
   `src/content/profile.ts`.

## Deploying

Import the repo in Vercel (framework preset: Next.js, no extra settings). Every PR gets a preview URL;
`main` deploys to production. Add the custom domain under Project → Settings → Domains.

## How the pieces fit

| Where | What |
| --- | --- |
| `src/proxy.ts` | Sends `/` to `/en` or `/hi` (cookie first, then browser language) |
| `src/app/[lang]/` | Layout (fonts, theme, metadata), page, 404, OG image |
| `src/components/sections/` | Hero, About, Experience, Work, Stack, Photography, Contact |
| `src/components/motion/` | `ScrollEffects` (parallax, drift, reveal via `data-*` attributes), `TiltCard`, `SmoothScroll` |
| `src/components/three/` | `LensCanvas` (lazy loader, GPU check), `LensScene`, iris shader, SVG fallback |
| `src/components/ui/Hud.tsx` | f-stop, frame and section read-out |
| `src/lib/fstop.ts` | Maps scroll progress to f/1.4 → f/16 |

**Performance guardrails:** three.js loads in its own chunk after the page is idle, renders only when
something changes, stops when no lens is on screen, and is skipped entirely (SVG lens instead) for
`prefers-reduced-motion` and for software-only WebGL. Add `?lens=force` to the URL to force the 3D
lens while testing.
