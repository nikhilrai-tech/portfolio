# Contributing

Thanks for taking a look! This is a personal portfolio, but the code is open so people can learn from it and reuse it.
Bug reports, accessibility and performance fixes, and clearer docs are all very welcome.

## Run it

```bash
npm ci
npm run dev          # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Node 22 or newer. No API keys are needed for local work: the chat falls back to instant answers and the contact
form falls back to the visitor's mail app.

## Pull requests

1. Fork, then branch from `main` (`fix/…`, `feat/…`, `docs/…`).
2. Keep each PR to one change and explain the why in the description; screenshots for anything visual
   (desktop and a 390 px phone).
3. CI runs lint, typecheck and a production build; it must pass.
4. Commit messages: `type: short summary` (`fix: journey player overlaps on small phones`).

## Ground rules

- Animate only `transform` and `opacity`; everything must still read well with `prefers-reduced-motion`.
- No tracking scripts, no new heavy UI kits.
- Text lives in `src/content/` (English and Hindi); components should not hard-code copy.
- Personal content is not open for reuse: see [CONTENT-LICENSE.md](CONTENT-LICENSE.md).

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
