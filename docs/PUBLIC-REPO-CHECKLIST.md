# Going public: checklist

What was checked before this repository was opened up, and what the owner does around the switch. Useful as a
template for anyone publishing their own portfolio repo.

## Already checked

| Check | Result |
| --- | --- |
| Secrets in the **whole git history** (API keys, tokens, private keys, `.env` files) | None. Only `.env.example` (empty template) is tracked. |
| `.env*` and `.vercel/` ignored | Yes (`.gitignore`). |
| Keys stored outside the repo | Vercel environment variables: `RESEND_API_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL`. |
| Commit authorship | Every commit is authored and committed by the owner's own identity. |
| Phone number or home address in code | Not in any source file. **The resume PDF contains a phone number** (see below). |
| Code license | MIT ([LICENSE](../LICENSE)); personal content excluded ([CONTENT-LICENSE.md](../CONTENT-LICENSE.md)). |
| Community files | CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR templates. |
| CI | Lint, typecheck and production build on every PR ([ci.yml](../.github/workflows/ci.yml)); Dependabot weekly. |

## Before you flip the switch

- [ ] **Resume.** `public/Nikhil-Rai-Resume.pdf` includes a phone number. It is already public on the site, but a public
      repo also puts it in git history forever. Replace it with a copy without the number if that matters to you.
- [ ] **Rotate keys that were ever pasted anywhere** (chat, screenshots, issues): create new ones in Resend and Google AI
      Studio, update them in Vercel, then delete the old ones.
- [ ] Restrict the Gemini key to the Generative Language API in Google Cloud, and set a spend limit if you add billing.

## Right after it is public

- [ ] **Settings → General → Social preview**: upload `docs/media/social-preview.jpg` (1280×640) so shared links look good.
- [ ] **Settings → Branches**: protect `main` (require the CI check, no force-push).
- [ ] **Settings → Code security**: enable Dependabot alerts, secret scanning and push protection (free for public repos).
- [ ] **About** (repo home, gear icon): description, website link and topics, if not already set.
- [ ] Pin the repo on your GitHub profile and link it from the profile README.
- [ ] Optional: delete merged feature branches (Settings → General → "Automatically delete head branches" for the future).

## Getting it seen

- Post the live demo with the morph GIF on LinkedIn and X; link the repo and the most interesting note.
- Submit to showcases people browse: Awwwards / CSS Design Awards (site), and "awesome" lists for Next.js, three.js and
  portfolios (repo).
- Write one note per interesting technique (particle morph, scroll film, free AI chat) and share each separately.
- Answer issues quickly; a responsive maintainer gets more stars than a perfect README.
