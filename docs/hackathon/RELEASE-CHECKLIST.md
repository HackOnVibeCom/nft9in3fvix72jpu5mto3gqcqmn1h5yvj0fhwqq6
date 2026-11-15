# Release and submission record

## Completed production release

- All five development phases are complete.
- Production application release `c232453` is deployed on Vercel: <https://skillloop-gamma.vercel.app>.
- All four production Prisma migrations were applied successfully.
- Automated verification passed: 100 unit tests and 22 Playwright tests.
- Production acceptance passed all 10/10 checks.
- Genuine GitHub OAuth referral registration was verified in staging and production. Existing-user repeat sign-in did not create duplicate conversions; GitHub username and avatar synchronization were verified.

## Completed HackOnVibe submission

HackOnVibe confirmed acceptance on November 15, 2026. The submitted live application and recorded demonstration video were accepted, and all five questionnaire answers were completed.

- Live application: <https://skillloop-gamma.vercel.app>
- Demonstration video: <https://youtu.be/bjkDj-HEb9A>
- “Publish to GitHub” milestone: Completed.
- Submission status: Accepted by HackOnVibe on November 15, 2026.

HackOnVibe confirmed that external Vercel hosting is acceptable for this server-rendered application. The historically failing organizer deployment workflow does not affect judging eligibility. The organizer workflow `.github/workflows/deploy.yml` remains unchanged.

**Judging, results, and awards are not marked complete here.** Await HackOnVibe's official judging outcome; acceptance of the submission is not a competition result.

## Historical deployment notes

The organizer workflow's publication verification has failed historically. The official repository push succeeded, HackOnVibe marked “Publish to GitHub” Completed, and the organizers confirmed external Vercel hosting is acceptable. The production release was deployed from a clean Git archive of commit `c232453`, completed in 53 seconds, with `releaseCommit` metadata.

Historical engineering notes in [HANDOFF.md](./HANDOFF.md) describe earlier staging-only and pre-deployment states. They are retained as engineering history; the completed production release and accepted-submission records above supersede their earlier pending status.

## Operational recommendations

These are ongoing product/operations considerations, not release or submission blockers:

- Investigate the repeat-CTA-click discrepancy observed during staging acceptance. A repeat click increased the count in the same browser session.
- Keep in mind analytics views and clicks are pseudonymous browser-days, not verified unique people; bot filtering is user-agent based.
- Request rate limiting is best-effort and per process.
- Cookie changes can affect visitor deduplication.
- Referral registration deduplication passed; referred-user publication outcomes are not tracked.
- Public repository metadata does not independently prove individual authorship.
- Referral attribution uses the last valid CTA click within 30 days.

## Preserved files and deployment workflow

The organizer workflow, `hello.txt`, `index.html`, and the original README content are preserved. No production database operation or redeployment is part of this documentation update; no commit or push has been made.
