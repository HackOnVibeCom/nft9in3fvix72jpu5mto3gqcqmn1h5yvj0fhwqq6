# SkillLoop engineering handoff

**Prepared:** November 14, 2026 (WAT)
**Production URL:** <https://skillloop-gamma.vercel.app>
**Latest accepted production commit (provided project context):** `7ae45a2`
**Working branch:** `main`; all work below is local and uncommitted.

### Confirmed OAuth event validation defect (latest)

- The genuine OAuth callback reported Zod issues for missing `profile.login` and `profile.avatar_url`. This is explained by the installed NextAuth 4.24.15 source: the GitHub provider maps raw data in `providers/github.js` to `{ id, name, email, image }`; `core/routes/callback.js` passes that mapped `profile` (alongside `account` and `isNewUser`) to `events.signIn`. The handler incorrectly parsed that object with the raw GitHub `githubProfileSchema`, throwing before referral processing.
- Removed raw-profile parsing from the event. Referral conversion now runs first, only for `isNewUser === true` when the callback's GitHub `providerAccountId` matches a persisted GitHub `Account` row for the same NextAuth user ID. Signed-cookie validation, published-source lookup, self-referral prevention and unique conversion semantics remain in `consumeReferralForSignIn`.
- Optional username/avatar synchronization now resolves through the persisted linked account and its server-side OAuth token. GitHub's `/user` response is validated and its numeric ID must match both the linked provider account and callback account. Profile sync and portfolio initialization failures are isolated from referral recording and do not abort authentication.
- The regression now drives the installed NextAuth callback handler with the mapped event profile (`id`, `name`, `email`, `image`) and no raw `login`/`avatar_url`, links the adapter account, then invokes the event with `isNewUser: true`; it asserts exactly one conversion for the persisted user ID. Auth tests also cover sync failure, existing-user exclusion, and linked-account mismatch.
- Genuine OAuth was successful according to the owner, and the supplied ZodError confirms the event validation failure. The new code has not yet been exercised in a fresh live OAuth attempt. No staging database was queried and no conversion was fabricated.

### Urgent referral acceptance update (November 15, 2026)

- The prior Secure-cookie adjustment did not resolve the reported staging acceptance failure. It is **not established as the runtime root cause**. The installed NextAuth v4.24.15 callback source does create/link a new OAuth user, create its database session, and then call `events.signIn` with `isNewUser`; Next.js 16 `cookies()` reads the active request's async-local request store. Neither source inspection nor the mocked callback lifecycle establishes what happened in the user's actual callback request.
- Owner reports a fresh Neon branch `phase4-referral-retest` with one CTA click and zero conversions. That branch and the reported drowsei/greatstanley rows have not been independently queried from this workspace.
- Added development-only, structured referral diagnostics at click validation and lookup, response cookie creation, callback request cookie presence, sign-in event new-user/user-ID consistency, `cookies()` presence and signature/expiry validation, published portfolio lookup, conversion insert/duplicate/error, and cookie cleanup. Output is value-free and errors are reduced to categories. It is disabled unless `NODE_ENV=development`.
- The click route now accepts UUID-shaped codes case-insensitively while preserving the exact code for signing and database lookup. Unit coverage exercises a UUID code. Existing lowercase codes remain unchanged.
- Added `tests/referral-diagnostics.test.ts`; the prior installed-callback regression remains a mock-persistence lifecycle test, **not** proof of genuine OAuth acceptance.
- **Independent staging row and new-user status remain unverified:** this workspace had no server on `localhost:3000` and no browser tabs. I did not inspect `.env`, connect to Neon, or query `greatstanley`; no database endpoint was contacted and no conversion was fabricated. The owner supplied the later runtime ZodError, documented above; a genuine post-fix staging OAuth retest is still required before acceptance is passed.

### Safe diagnostic retest

1. In a shell where the app credentials are provided without relying on `.env`, verify `DATABASE_URL` resolves to `ep-polished-dawn-b90a97mx.c-7.eu-central-1.aws.neon.tech`. Require `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET` to already be present; do not print their values. If the check fails, stop before starting the app.
2. Start `npm run dev` with `NODE_ENV=development` and `NEXTAUTH_URL=http://localhost:3000`. Use a disposable GitHub account that has never registered on this branch. Check DevTools Network for the referral click response's `Set-Cookie` attributes, confirm the cookie exists in browser storage (do not copy its value), then complete OAuth.
3. In terminal output, provide only JSON lines containing `"scope":"skillloop.referral"`. Expected progression is `click_request`, `click_portfolio_lookup`, `click_cookie_response`, `oauth_callback_request`, `nextauth_sign_in_event`, `sign_in_referral`, `referral_portfolio_lookup`, `conversion_insert`, `referral_cookie_cleanup`, and `analytics_conversion_aggregate`. Keep cookie values, full headers, environment output, user IDs, and OAuth data private.
4. Before using `greatstanley` as the new-user account, run a read-only query in the selected Neon branch to see whether its GitHub account already exists. If it does, use a genuinely new disposable account; do not delete or reset `greatstanley`. After successful OAuth, verify one conversion row for the new user and the drowsei portfolio in that same staging branch.

The logs report only cookie presence/validation, booleans, code shape, result categories, and sanitized error classes. They do not report cookie values, signatures, user IDs, referral codes, OAuth data, or connection strings.

## 1. Phase 4 acceptance status

### Verified in this workspace

- Analytics and referral Prisma schema and additive migration are present. Migration source adds a defaulted unique referral code, analytics and conversion tables, unique constraints, indexes, and cascading foreign keys; it contains no drop, truncate, or delete statements.
- Unit coverage includes daily deduplication, event validation and request bounds, throttling, owner-scoped metrics, referral signing/expiry/tampering, self-referral and unpublished-source rejection, existing-user handling, duplicate/concurrent idempotency, auth failure isolation, and migration shape.
- Public view tracker is only mounted by the public portfolio view. The private preview renders separately and does not send public analytics events.
- Sequential browser-day deduplication and rate-limit behavior are covered by tests. Analytics database failures are best effort.
- Analytics presentation labels views/clicks as browser-days, explains the denominator and estimate limitations, reports publication status, labels `$0 reported` as an assumption, and says referred-user publication outcomes are not tracked.

### Not independently verified

- The owner reported that migration `20261114010000_analytics_referrals` was applied successfully to Neon branch `phase4-staging`, and that an existing published portfolio and initial view/click metrics were preserved. The staging app was not running on `localhost:3000` in this session, and no staging connection was available, so I did not query the database or independently verify rows, snapshots, referral-code uniqueness, or constraint behavior.
- The owner later reported a referral test worked. I could not independently establish whether that test created a genuine new-user conversion. Do not present it as verified customer traction.
- Compatibility with the previously deployed Phase 3 application is supported by the additive migration and PostgreSQL default for older inserts, but was not exercised against a running old application.
- A simultaneous first visit in several tabs can race before the HTTP-only visitor cookie is set and mint multiple browser identifiers. Sequential refresh dedupe passes; the initial multi-tab observation is not enough to establish a confirmed defect. Counts remain browser-day estimates.
- No real GitHub OAuth signup, denied OAuth callback, or Gemini provider request was performed. Human OAuth acceptance is still a manual staging requirement.

No migration, seed, or destructive database command was run. Prisma validation is schema-only. The callback regression uses an in-memory adapter and mocked persistence; it did not connect to a database.

## 2. Phase 5 work delivered

- Replaced the small-only portfolio invitation with a responsive, high-visibility CTA describing SkillLoop's GitHub-to-portfolio and Gemini-assisted review workflow. Primary CTA and footer attribution both use the existing `/api/referrals/click?code=…` mechanism; the route signs and expires attribution. CTA has visible keyboard focus and a minimum 48px height.
- Updated the homepage to state what SkillLoop does, who it serves, how owners review AI-generated descriptions, and how portfolio sharing creates an organic discovery loop.
- Replaced the stale “Analytics are coming in a future phase” Overview message with conditional next steps based on project import, approval, and publication state.
- Added active/current-page dashboard navigation, keyboard focus styling, and minimum touch height.
- Improved public portfolio long-text wrapping, optional empty-project feedback, link relations, contrast, and external links. Canonical URL and Open Graph metadata remain based on the published slug/snapshot.
- Added Playwright assertions for landing-page messaging, shared CTA attribution URL, CTA visibility/focus, and mobile width.
- Captured full-page landing and public portfolio screenshots under ignored `test-results/` paths. These are test artifacts, not tracked docs or source assets.

## 3. Defects found and fixes

- **Stale Overview copy:** said analytics were planned despite the implemented dashboard. Replaced it with stage-aware guidance and a direct next action.
- **Low-visibility growth invitation:** primary acquisition invitation existed only as footer text. Added a prominent CTA section and kept footer attribution.
- **New Playwright setup/assertion issues:** first run found selector ambiguity, a test that had not published its fixture, and an over-specific landing text matcher. Corrected these tests; no application defect was indicated by those failures.
- **Visitor race:** simultaneous first-view cookie establishment can still create separate initial IDs. Evaluated and documented this remaining estimation limitation rather than changing the established identifier mechanism without live evidence.

No confirmed release-blocking security defect was found in the final focused source review.

The referral conversion issue is a functional release blocker until a genuine staging OAuth retest confirms the HTTP/HTTPS cookie behavior and the resulting conversion row.

## 4. Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | 100 passing tests across 21 files (includes installed NextAuth OAuth callback lifecycle regression with mapped profile data, GitHub identity mismatch, and profile-sync failure coverage) |
| `npm run db:validate` | Pass; no database connection or writes |
| `npm run build` | Pass; production Next build and standalone packaging |
| `npm run test:e2e` | 22 passing Playwright cases across desktop and mobile projects |
| `npm audit` | 0 vulnerabilities |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `git diff --check` | Pass |

The browser suite exercises unauthenticated public/login routes and mocked portfolio editing/publishing. It is not an authenticated production or staging test. Landing and public portfolio screenshots are in `test-results/` (ignored by Git).

### Focused security review

The focused working-tree diff security scan completed as scan `dc75c202-f499-449f-801d-ecde73df2677` (snapshot digest `3d0daf1102e9ff33a27d74cb307f9da7e6b0bb670fb013666389d225bdf081f9`). It reviewed the 16 security-relevant changed source files in the compact diff inventory and recorded zero candidates. A subsequent dashboard text-contrast-only class adjustment and test-only screenshot additions were made after that immutable scan snapshot; these do not change security behavior. This was a static source review backed by unit and browser tests, not a dynamic attack test. No live database or OAuth was accessed. The configured diff-scan preflight reported delegated review unavailable; the parent reviewed the changed inventory. Daybreak access was not granted for this account, which may prevent display of protected scan outputs; the structured scan still completed.

Known limitations remain: per-process in-memory request throttling is not a global quota; analytics writes may be lost during storage outages; browser-days are estimates; registration/click figures are not a same-person cohort; referral publication outcomes and a complete cost ledger are not tracked.

## 5. Submission materials

The complete submission set is in this folder:

- [PRODUCT.md](./PRODUCT.md)
- [ZERO-CAC.md](./ZERO-CAC.md)
- [DEMO.md](./DEMO.md)
- [SUBMISSION.md](./SUBMISSION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
- [HANDOFF.md](./HANDOFF.md)

The demo identifies staging figures as demo data and avoids claiming customers, revenue, live OAuth acceptance, or zero operating costs.

## 6. Files changed and created

### Modified

- `prisma/schema.prisma`
- `src/app/dashboard/[section]/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/p/[slug]/page.tsx`
- `src/app/page.tsx`
- `src/components/public-portfolio-view.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth.ts`
- `src/lib/projects.ts`
- `tests/auth.test.ts`
- `tests/github-identity.test.ts`
- `tests/e2e/portfolio-fixture.tsx`
- `tests/e2e/portfolio.spec.ts`
- `tests/e2e/smoke.spec.ts`

### Created

- `prisma/migrations/20261114010000_analytics_referrals/migration.sql`
- `src/app/api/analytics/event/route.ts`
- `src/app/api/referrals/click/route.ts`
- `src/components/dashboard-nav.tsx`
- `src/components/public-view-tracker.tsx`
- `src/lib/analytics-metrics.ts`
- `src/lib/analytics-rate-limit.ts`
- `src/lib/github-identity.ts`
- `src/lib/portfolio-analytics.ts`
- `src/lib/referral-diagnostics.ts`
- `src/lib/referrals.ts`
- `tests/analytics-events.test.ts`
- `tests/analytics-metrics.test.ts`
- `tests/analytics-migration.test.ts`
- `tests/analytics-rate-limit.test.ts`
- `tests/portfolio-analytics.test.ts`
- `tests/referral-click.test.ts`
- `tests/referral-auth-lifecycle.test.ts`
- `tests/referral-diagnostics.test.ts`
- `tests/referrals.test.ts`
- `docs/hackathon/{PRODUCT,ZERO-CAC,DEMO,SUBMISSION,ARCHITECTURE,RELEASE-CHECKLIST,HANDOFF}.md`

## 7. Morning release steps

1. Inspect this handoff and `docs/hackathon/RELEASE-CHECKLIST.md`; review every changed file and `git diff --check`.
2. In the owner-controlled staging session, positively verify the reported fresh `phase4-referral-retest` target before any database command. Confirm migration status and check portfolio snapshots, selections, referral codes, events, and conversions. Do not use local `.env` as a database target.
3. Complete the manual new-user and existing-user OAuth referral scenarios, including failed OAuth, self-referral, expiry/tampering, unpublished sources, and repeated/concurrent conversion. Use a consenting test account; do not claim success if human authentication cannot be completed.
4. Smoke-test mobile/desktop landing, import, analysis fallback/Gemini, owner review, private preview, publication, sharing, referral CTA, and dashboard analytics. Confirm the CTA reaches the existing referral route and published snapshots remain stable until republished.
5. Check production database and migration status independently. The Phase 4 migration was reported applied to staging only; do not apply it to production without verifying the intended target, reviewing the additive SQL, and confirming backup/release plan. Deploy schema before the app version that uses it.
6. If review is accepted, separate commits where practical:

   ```sh
   git add prisma/schema.prisma prisma/migrations/20261114010000_analytics_referrals src/app/api/analytics src/app/api/referrals src/lib/analytics-metrics.ts src/lib/analytics-rate-limit.ts src/lib/portfolio-analytics.ts src/lib/referrals.ts src/lib/auth.ts src/app/dashboard/'[section]'/page.tsx src/app/p/'[slug]'/page.tsx src/components/public-view-tracker.tsx tests/auth.test.ts tests/analytics-events.test.ts tests/analytics-metrics.test.ts tests/analytics-migration.test.ts tests/analytics-rate-limit.test.ts tests/portfolio-analytics.test.ts tests/referral-click.test.ts tests/referrals.test.ts
   git commit -m "feat: add portfolio analytics and referral attribution"
   git add src/app/page.tsx src/app/dashboard/page.tsx src/app/dashboard/layout.tsx src/components/dashboard-nav.tsx src/components/public-portfolio-view.tsx tests/e2e docs/hackathon
   git commit -m "feat: polish portfolio growth and hackathon readiness"
   git push origin main
   ```

   Adjust staging/index paths after reviewing the actual diff; never include `.env`, `hello.txt`, `index.html`, the original README, or `.github/workflows/deploy.yml`.
7. Use the separately maintained manual Vercel deployment process documented in [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md). The organizer workflow has a reported prior failure and was deliberately left untouched. Confirm the Vercel project and production environment before deployment. Apply production schema first, then deploy, then run smoke tests. Roll back application code to accepted commit `7ae45a2` if necessary; retain the additive migration during an app rollback.
8. Record the demo from [DEMO.md](./DEMO.md), verify the submission copy and repository link in [SUBMISSION.md](./SUBMISSION.md), and submit manually before **Sunday, November 15, 2026, 12:00 noon WAT**.

## 8. Required safety confirmations

- **No production database records were modified.**
- **No production migration was applied.**
- **No secrets, access tokens, or connection strings were exposed.** Environment-file values were not inspected or printed.
- **No organizer files were modified:** `.github/workflows/deploy.yml`, `hello.txt`, `index.html`, and the original `README.md` are unchanged.
- **Nothing was committed, pushed, or deployed.**
- **The hackathon submission was not submitted.**

## 9. Readiness assessment

**Local implementation: ready for owner review and staging acceptance.** The build, automated unit suite, browser suite, type checks, linter, schema validation, audits, and focused diff review pass. **Production release and hackathon submission are not yet verified or performed.** Complete the database-target checks, genuine OAuth acceptance, final human code review, manual Vercel deployment, and real production smoke checks before calling the release ready.

## Final staging acceptance — November 15, 2026

The post-fix genuine GitHub OAuth referral test passed
on the phase4-final-acceptance staging branch.

- New-user registration through the portfolio CTA recorded one conversion.
- Repeat sign-in preserved the conversion count at one.
- GitHub username and avatar synchronization worked.
- Existing published portfolio and projects were preserved.
- 100 unit tests and 22 Playwright tests passed.
- Final staging metrics: 2 view browser-days, 2 CTA click
  browser-days, 1 referred registration, 50% registration/click rate.

Known limitation: the repeat CTA click increased the count
within the same browser session. Click deduplication requires
further investigation. Registration deduplication passed.

These results are controlled staging acceptance evidence,
not production customer traction.

Phase 4 and Phase 5 are ready for production release.
Production migration, deployment and production acceptance
remain pending.

This update supersedes earlier pending referral acceptance notes.
