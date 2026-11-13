# SkillLoop Phase 1

Preserve organizer files, hello.txt, index.html, existing Git history and the original README text. Never modify .github/workflows/deploy.yml. Do not commit or push without user review.

Use npm (organizer CI), Next.js App Router with Node runtime, and one Prisma/PostgreSQL database. Keep credentials server-side. Builds must work without secrets or database connectivity. No static export or Vercel deployment configuration.

Run lint, typecheck, unit tests, Prisma validation and build; run Playwright smoke tests when available. Do not claim live OAuth verification without credentials. Keep Phase 2 features explicitly upcoming.
