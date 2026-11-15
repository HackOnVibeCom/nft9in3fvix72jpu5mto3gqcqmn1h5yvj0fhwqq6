# HackOnVibe — team project

Your team's project repo. Push here → Cloudflare Pages CI/CD builds & deploys → it goes live on your team's address.

**Test the pipeline first:** edit `index.html` (a "Hello World" is enough), commit to `main` (or open a PR), and watch it appear on your live URL. That confirms the whole chain works.

Then build your AI-assisted micro-product. Static site works out of the box; add a build step if you need one.

---

## SkillLoop

**Team:** Great Elites
**Challenge:** HackOnVibe November 2026 — Zero-CAC IT Product
**Production application:** [skillloop-gamma.vercel.app](https://skillloop-gamma.vercel.app)
**Example portfolio:** [skillloop-gamma.vercel.app/p/drowsei](https://skillloop-gamma.vercel.app/p/drowsei)
**Demonstration video:** [Watch the five-minute demo](https://youtu.be/bjkDj-HEb9A)

SkillLoop turns public GitHub projects into polished, owner-reviewed developer portfolios. Developers authenticate with GitHub, import public repositories, and use Gemini-assisted project analysis (with a metadata-based fallback) to draft descriptions they can edit and approve. They can customize a portfolio, choose and order approved projects, preview privately, and publish a shareable page.

Each published portfolio includes a referral CTA. Visitors can follow it to register and make their own portfolio; signed, 30-day last-valid-click attribution connects eligible new accounts to published portfolios. Owners can review pseudonymous browser-day views and CTA clicks alongside unique referred registrations. This is an implemented organic acquisition loop, not a claim of proven sustainable zero-CAC growth or zero operating costs.

### Technology

Next.js App Router, React, TypeScript, NextAuth with GitHub OAuth, GitHub API, optional server-side Gemini API, Prisma, PostgreSQL (Neon), and Vercel. Testing uses Vitest and Playwright. OAuth credentials, provider tokens, AI keys, and database access stay server-side.

### Release and verification

- Production application release commit: `c232453`.
- Four Prisma migrations successfully applied to production.
- 100 unit tests and 22 Playwright tests passed.
- 10/10 production acceptance checks confirmed by the project owner.
- SkillLoop is deployed externally on Vercel. HackOnVibe organizers confirmed external Vercel hosting is acceptable for this server-rendered application; the organizer workflow remains unchanged.

### Local setup

Use Node.js **20.19+** and npm. Copy `.env.example` to `.env.local`, install dependencies, and set the variables below in the server-side environment. Use a development database for local migration commands; do not point them at production unintentionally.

```sh
npm ci
cp .env.example .env.local
npm run db:validate
npm run db:migrate
npm run dev
```

Required configuration: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET`. Generate a local `NEXTAUTH_SECRET` with `openssl rand -base64 32`. Configure a GitHub OAuth App with callback `http://localhost:3000/api/auth/callback/github` for local use. `GEMINI_API_KEY` enables Gemini analysis; `GEMINI_MODEL` is optional. Next.js reads `.env.local`; export the database variables for Prisma CLI commands (or use an ignored `.env` file). Keep secrets out of source control. A production GitHub OAuth App should use the production callback URL.

### Project documentation

- [Product overview](docs/hackathon/PRODUCT.md)
- [Zero-CAC growth strategy](docs/hackathon/ZERO-CAC.md)
- [Five-minute demonstration script](docs/hackathon/DEMO.md)
- [Hackathon submission details](docs/hackathon/SUBMISSION.md)
- [Architecture](docs/hackathon/ARCHITECTURE.md)
- [Release and submission readiness](docs/hackathon/RELEASE-CHECKLIST.md)
- [Engineering handoff](docs/hackathon/HANDOFF.md)
