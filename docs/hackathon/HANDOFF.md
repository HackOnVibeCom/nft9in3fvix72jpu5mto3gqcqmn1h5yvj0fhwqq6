# SkillLoop release handoff

**Prepared:** November 15, 2026 (WAT)
**Team:** Great Elites
**Hackathon:** HackOnVibe November 2026 — Zero-CAC IT Product
**Production application:** <https://skillloop-gamma.vercel.app>
**Example portfolio:** <https://skillloop-gamma.vercel.app/p/drowsei>
**Official repository:** <https://github.com/HackOnVibeCom/nft9in3fvix72jpu5mto3gqcqmn1h5yvj0fhwqq6>

## Current release status

The project owner reports the final application release and production acceptance complete:

- All five development phases are implemented.
- Final application release commit: `c232453`.
- Vercel production deployment succeeded from a clean Git archive of that commit in 53 seconds, with `releaseCommit` metadata.
- All four Prisma migrations were applied to production.
- Production acceptance passed 10/10 checks, confirmed by the project owner.
- Genuine GitHub OAuth referral registration was verified in staging and production. Existing-user repeat sign-in did not create duplicate conversions; GitHub username/avatar synchronization was verified.
- HackOnVibe's “Publish to GitHub” milestone is marked Completed.
- Reported automated verification: 100 unit tests across 21 files, 22 Playwright tests, lint, typecheck, Prisma validation, and production build passed. Previous npm security audits reported zero vulnerabilities.

These final deployment and acceptance details are owner-provided release facts. This documentation audit did not access production, query databases, or inspect Vercel deployment records. The live URLs could not be independently fetched with the available browsing tool. The official repository URL is the supplied project URL.

**HackOnVibe acceptance:** The questionnaire, demonstration video, and live application were accepted on November 15, 2026. Demonstration video: <https://youtu.be/bjkDj-HEb9A>. This records acceptance of the submission materials; it does not claim that judging has concluded or that the team won.

## Product and growth summary

SkillLoop uses GitHub OAuth to import public repositories, gathers public project context, and provides Gemini-assisted analysis with a metadata fallback. Developers review, edit, and approve the descriptions, choose projects, preview a private draft, and publish a shareable portfolio. A built-in CTA supports a growth loop: developers share portfolios, visitors discover SkillLoop, and eligible new developers can register and create portfolios. Signed last-valid-click attribution expires after 30 days; existing accounts, self-referrals, unpublished sources, invalid cookies, and duplicate conversions are excluded.

This is an implemented acquisition mechanism, not proof of sustainable zero-CAC growth at scale. The displayed `$0 reported` paid spend is not zero total operating cost. Views and clicks are pseudonymous browser-days, not verified people.

## Historical referral defect and resolution

During the genuine GitHub OAuth referral test, the NextAuth 4.24.15 `events.signIn` handler attempted to parse its provider-mapped `profile` as a raw GitHub profile. The callback event profile contains mapped fields such as `id`, `name`, `email`, and `image`, not raw `login` and `avatar_url`; the resulting ZodError interrupted the handler before referral recording.

The handler now attributes a conversion from the persisted authenticated user ID only when `isNewUser` is true and the callback's GitHub provider account matches the linked database account. It validates the signed referral cookie and leaves the existing self-referral, publication, expiry, and idempotency checks in place. Optional GitHub username/avatar synchronization resolves from the trusted linked account and server-side token; identity IDs are compared. Profile synchronization and portfolio initialization failures are isolated from referral recording and do not abort otherwise valid authentication. The regression test uses the installed callback's mapped event profile without inventing raw GitHub fields.

The initial Secure-cookie adjustment did not resolve the earlier staging failure and was not the root cause. The eventual actual runtime ZodError identified the event-profile mismatch. A genuine post-fix OAuth referral registration was later reported verified in staging and production. Earlier staging diagnostic logs and manual retest instructions below the historical notes in previous handoffs are superseded by this final acceptance status.

## Acceptance and verification record

- 100 unit tests passed across 21 files.
- 22 Playwright tests passed.
- `npm run lint`, `npm run typecheck`, `npm run db:validate`, and `npm run build` passed.
- Previous `npm audit` and production dependency audit reported zero vulnerabilities.
- Production release and 10/10 acceptance are owner-confirmed. No claim is made that this workspace independently performed live production OAuth or database checks.
- Staging acceptance evidence previously reported: 2 view browser-days, 2 CTA click browser-days, 1 referred registration (50% registrations/click browser-day ratio). These are controlled test events, not customer counts, traction, or revenue.

## Known limitations

- Analytics views and clicks represent pseudonymous browser-days, not verified unique people.
- Bot filtering is user-agent based; request rate limiting is best-effort and per process.
- Visitor-cookie changes can affect deduplication. A repeat CTA click increased the count within the same browser session during staging acceptance; this remains a documented discrepancy for future investigation.
- Referral registration deduplication passed; referred-user publication outcomes are not tracked.
- Public repository metadata and GitHub-provided contribution data do not independently prove individual authorship.
- Attribution follows the last valid CTA click within 30 days.
- No complete acquisition cost ledger, verified people-level analytics, or commercial traction metrics are claimed.

## Documentation index

- [Product overview](./PRODUCT.md)
- [Zero-CAC growth and measurement](./ZERO-CAC.md)
- [Five-minute demonstration](./DEMO.md)
- [Submission answers](./SUBMISSION.md)
- [Architecture](./ARCHITECTURE.md)
- [Release readiness and remaining human actions](./RELEASE-CHECKLIST.md)

## Submission record

Questionnaire, demonstration video, and live application accepted by HackOnVibe on November 15, 2026. The project team has not claimed a competition win or that judging has concluded.
