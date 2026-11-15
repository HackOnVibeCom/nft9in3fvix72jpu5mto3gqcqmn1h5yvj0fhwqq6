# Release checklist

## Remaining manual acceptance

- [ ] In the positively identified `phase4-staging` branch, verify portfolio/snapshot/project-selection preservation, unique legacy referral codes, and event/conversion constraints.
- [ ] Confirm the older Phase 3 application can insert a portfolio using the database default referral code (compatibility is inferred from the additive migration; not independently exercised here).
- [ ] Complete real GitHub OAuth: new user with valid referral, existing user, denied/failed OAuth, self referral, expired/tampered cookie, unpublished source, repeated/concurrent conversion.
- [ ] Compare dashboard figures to staging rows and confirm owner isolation with a second account.
- [ ] Inspect initial multi-tab view behavior. The browser identifier is set by an asynchronous client event, so concurrent first requests may each mint an identifier; current database deduplication cannot merge those first requests. Treat counts as browser-day estimates.
- [ ] Check target production's OAuth, Gemini configuration, and current deployment manually without exposing secret values.

## Database deployment sequence

1. Review the migration in `prisma/migrations/20261114010000_analytics_referrals/`; it is additive and intended to preserve existing portfolio rows.
2. Back up/confirm the intended production database and connection target outside this workspace. Never use the local `.env` as a production migration target by accident.
3. Apply `npm run db:migrate` only from an isolated release environment whose `DATABASE_URL` has been positively verified as the intended target. This sprint did not run this command.
4. Verify migration status and portfolio/referral constraints against the target, then deploy the compatible application.
5. Smoke-test published portfolio read, authenticated dashboard, analytics, referral redirect, and sign-in. If rolling back app code, keep the additive schema: the Phase 3 app ignores the new tables/column, while the default referral code supports inserts from older code.

Staging Phase 4 migration application was reported by the project owner. This workspace did not independently connect to or query staging.

## Git and deployment

After review, example commands:

```sh
git diff --check
git status --short
git diff
git add <reviewed-phase-4-files>
git commit -m "feat: add portfolio analytics and referral attribution"
git add <reviewed-phase-5-files> docs/hackathon
git commit -m "feat: polish portfolio growth and hackathon readiness"
git push origin main
```

The organizer `.github/workflows/deploy.yml` has an existing failed workflow history per project context. It has not been modified. The owner’s separate manual Vercel deployment approach is: review/link the intended Vercel project, configure secrets in Vercel (never in source), build/deploy with the Vercel CLI or dashboard, and verify the resulting URL and logs. Confirm current project linkage and instructions before running deployment. No deployment was performed in this sprint.

## Verification and rollback

- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run db:validate`, `npm run build`, `npm run test:e2e`, `npm audit`, `npm audit --omit=dev`, and `git diff --check`.
- Smoke-test GitHub OAuth, repository import, project approval, portfolio publish/update/unpublish, referral CTA, and owner analytics.
- For an application regression, redeploy the last accepted application commit `7ae45a2` using the owner-controlled Vercel process. Keep the additive migration in place; do not drop tables or columns during app rollback.
- Capture a short screen recording following [DEMO.md](./DEMO.md). Keep test accounts and secrets out of frame.
- Complete [SUBMISSION.md](./SUBMISSION.md)'s checklist and submit manually before the deadline.
