# Release and submission readiness

## Final release record

The project owner reports that the production release is complete:

- Application release: commit `c232453`.
- Production URL: <https://skillloop-gamma.vercel.app>.
- Deployment: successful Vercel production deployment from a clean Git archive of `c232453`; deployment completed in 53 seconds and included `releaseCommit` metadata.
- Database: all four Prisma migrations were applied to production.
- Production acceptance: 10/10 checks passed, confirmed by the project owner.
- Genuine GitHub OAuth referral registration was verified in staging and production. Existing-user repeat sign-in did not create duplicate conversions. GitHub username and avatar synchronization were also verified.
- HackOnVibe's “Publish to GitHub” milestone is marked Completed.

These are project-owner-provided release results. This workspace did not access the production database or Vercel deployment records. The live site and example page could not be independently fetched with the available browsing tool during this documentation audit.

## Historical deployment notes

The organizer workflow `.github/workflows/deploy.yml` has historically failed its publication verification. The official repository push nevertheless succeeded, and HackOnVibe marks “Publish to GitHub” Completed. The organizers previously recommended external Vercel hosting for server-rendered applications; the application is hosted at the production URL above. The organizer workflow is preserved and was not modified.

Historical engineering notes in [HANDOFF.md](./HANDOFF.md) describe earlier staging-only and pre-deployment states. Those notes are retained as history; the final release record above supersedes their pending-release statements.

## Remaining human actions

- Record the five-minute product demonstration using [DEMO.md](./DEMO.md), then upload it and replace the placeholder in [SUBMISSION.md](./SUBMISSION.md).
- Complete the HackOnVibe questionnaire using the reusable answers in [SUBMISSION.md](./SUBMISSION.md). The authenticated questionnaire fields have not been inspected, so map the answers to the actual fields yourself.
- Review the final materials and submit the entry before the dashboard deadline: November 15, 2026, 11:59 PM WAT. Submission and demo recording remain outstanding; neither is marked complete here.

## Preserved known product limitations

- Analytics counts are pseudonymous browser-days, not verified unique people; bot filtering is user-agent based.
- Request rate limiting is best-effort and per process.
- Cookie changes can affect visitor deduplication. A repeat CTA click increased the count within one browser session during staging acceptance; that discrepancy remains for future investigation.
- Referral registration deduplication passed. Referred-user portfolio publication outcomes are not tracked.
- Public repository metadata does not independently prove individual authorship.
- Referral attribution uses the last valid CTA click within 30 days.

## Workflow and files

The release process did not require changing the organizer workflow. `hello.txt`, `index.html`, and the original README text are also preserved. This documentation audit changes only files in `docs/hackathon/`; it does not run migrations, access or modify production data, redeploy, commit, push, or submit the project.
