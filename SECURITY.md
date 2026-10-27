# Security policy

Please report vulnerabilities privately to **nikhilrai662@gmail.com** (subject: `security: portfolio`), not in a public
issue. Include steps to reproduce and the impact you expect. You can expect a reply within a few days.

In scope: the code in this repository and the deployed site's API routes (`/api/contact`, `/api/ask`).
Out of scope: third-party services (Vercel, Resend, Google Gemini, Anthropic, LinkedIn, GitHub).

The site also publishes [`/.well-known/security.txt`](https://nikhil-rai-portfolio-xi.vercel.app/.well-known/security.txt).

## What is already in place

- No secrets in the repository: keys live in Vercel environment variables, `.env*` is git-ignored.
- Security headers: HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- API routes validate input, rate-limit per IP, and the contact form has a honeypot and a time trap.
- The AI chat only sees the site's own public content and refuses to share private details.
