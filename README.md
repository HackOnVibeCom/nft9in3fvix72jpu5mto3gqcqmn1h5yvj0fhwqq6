# HackOnVibe — team project

Your team's project repo. Push here → Cloudflare Pages CI/CD builds & deploys → it goes live on your team's address.

**Test the pipeline first:** edit `index.html` (a "Hello World" is enough), commit to `main` (or open a PR), and watch it appear on your live URL. That confirms the whole chain works.

Then build your AI-assisted micro-product. Static site works out of the box; add a build step if you need one.

---

## SkillLoop — Phase 1

Next.js App Router foundation with GitHub OAuth, database sessions and a private portfolio draft. Repository import, AI analysis, publishing, referrals and analytics are upcoming.

### Local setup

Use Node **20.19+** and npm. The organizer workflow uses Node 20, `npm ci` (fallback `npm install`) and `npm run build`, so this project intentionally uses npm with a lockfile rather than pnpm.

1. Run `npm ci` and copy `.env.example` to `.env.local`.
2. In Neon, create a PostgreSQL database. Put the pooled TLS connection string in `DATABASE_URL` and direct TLS connection string in `DIRECT_URL`. Keep both server-side.
3. Create a **GitHub OAuth App** in GitHub Settings → Developer settings → OAuth Apps. Local homepage: `http://localhost:3000`; callback: `http://localhost:3000/api/auth/callback/github`. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Use a separate OAuth App for production. Requested scopes are only `read:user user:email`; no repository scope.
4. Set `NEXTAUTH_URL=http://localhost:3000`. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
5. Export these variables into your shell before Prisma CLI commands. Next.js loads `.env.local`, but Prisma CLI does not. Alternatively, keep a local ignored `.env` for the CLI. Never commit either file.
6. Run `npm run db:validate`, `npm run db:migrate`, then `npm run dev`.

The initial SQL migration is checked in. `npm run db:migrate` applies pending migrations using `DIRECT_URL`; it does not reset data. For later schema changes use `npx prisma migrate dev --name <description>` against a development database only. `npm run db:generate` regenerates the client without connecting to a database.

### Production on HackOnVibe

Keep the organizer deployment workflow unchanged. It detects the root Next.js dependency and absence of static export, then queues its isolated SSR container on the team domain. The workflow mentions a platform-owned `Dockerfile.nextjs-ssr`, but its contents and runtime provisioning scripts are not in this repository. This app provides `npm run build`, `npm start` (runs the standalone server, binds `0.0.0.0`, honors `PORT`) and packaged standalone assets for compatibility. Do not serve the root `index.html` as the Next.js app; it is retained as the original contribution.

Set these environment variables **in the organizer's server container environment**, not the browser or repository: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. Use the HTTPS team origin for `NEXTAUTH_URL`, and register `<team-origin>/api/auth/callback/github` in the production OAuth App. Apply `npm run db:migrate` with deployment credentials before serving authenticated traffic. Migration is deliberately separate from build and startup.

`npm run build` requires neither production secrets nor live database connectivity. Runtime authentication initializes lazily. Without credentials, public pages render, sign-in explains setup is incomplete, and dashboard routes redirect to login. Confirm with the organizers how runtime secrets are injected and migrations are run; those mechanisms are outside the checked-in workflow. No Vercel configuration is required.

### Checks and manual verification

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run db:validate` (requires syntactically valid database URLs in the shell; does not connect)
- `npm run build`
- `npx playwright install chromium` once, then `npm run test:e2e` after building

With real Neon and GitHub credentials: apply the migration, sign in, confirm GitHub username/avatar and exactly one unpublished portfolio, sign out and confirm dashboard access redirects. Sign in again and verify the draft is retained. Check the production callback, HTTPS session cookies, expired sessions and container restart persistence. Unit tests use mocked database operations; they do not verify a live database or OAuth flow.

### Phase 2 AI project analysis

Set `GEMINI_API_KEY` in the server-side environment to enable AI project analysis. `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`. If the key is missing or Gemini cannot return valid structured output, SkillLoop uses its deterministic metadata analysis. Never put the Gemini key in browser code or commit it to the repository.
