# Submission copy

## Project name

SkillLoop

## One-line elevator pitch

Turn public GitHub projects into a polished, reviewable developer portfolio that can help the next developer get discovered.

## Short description

SkillLoop helps developers explain and share the work behind their skills. It imports public repositories, uses Gemini when configured to draft project descriptions (with a metadata-based fallback), and lets each developer review and approve the work before publishing a portfolio.

## Detailed description

Developers often have meaningful work on GitHub but no concise portfolio that tells its story. SkillLoop connects through GitHub OAuth, discovers repositories owned by that account, collects public project context, and drafts evidence-based descriptions. Developers retain control: they can edit and approve each description, choose featured projects, preview privately, and publish a snapshot when ready. Each public portfolio has an invitation for visitors to create their own portfolio, creating an organic sharing loop measured through privacy-conscious browser-day events and signed referral attribution.

## Problem and solution

Repository lists show code but leave context and communication to the developer. SkillLoop creates a professional presentation from public repository evidence and owner-approved descriptions, then makes it easy to share.

## Technical stack

Next.js App Router, React, TypeScript, NextAuth GitHub OAuth, GitHub API, optional Gemini analysis with deterministic fallback, Prisma, PostgreSQL/Neon, Vitest, Playwright, and Vercel hosting.

## Innovation

SkillLoop combines public repository context, AI-assisted but owner-approved storytelling, a private-to-public snapshot workflow, and referral attribution embedded in the portfolio-sharing journey.

## Zero-CAC growth mechanism

Portfolio owners share their pages. Viewers can use a prominent referral-aware invitation to make their own. Signed 30-day last-click attribution connects eligible new registrations to published portfolios; analytics count deduplicated view/click browser-days. This is an organic strategy, not proof that measured CAC or operating costs are zero. See [ZERO-CAC.md](./ZERO-CAC.md).

## Business model

No revenue or paid plan is claimed. Future possibilities include custom domains, premium presentation options, or team plans, subject to validation.

## Live application

<https://skillloop-gamma.vercel.app>

## Repository

<https://github.com/HackOnVibeCom/nft9in3fvix72jpu5mto3gqcqmn1h5yvj0fhwqq6>

## Known limitations

- OAuth and Gemini live availability depend on deployment credentials and were not independently verified in this local sprint.
- Browser-day analytics are estimates, not counts of verified people; attribution and click/registration denominators differ.
- Request throttling is process-local, not globally coordinated.
- Referral publication outcomes and a complete acquisition cost ledger are not tracked.
- The Phase 4 migration was reported applied to staging; it has not been applied to production by this work.

## Final submission checklist

- [ ] Confirm the demo URL and OAuth on the intended deployment.
- [ ] Confirm staging test data is labeled as staging and is not described as traction.
- [ ] Review final commit and deployment diff; preserve the organizer workflow and files.
- [ ] Record the demo using [DEMO.md](./DEMO.md), with no secrets or private data visible.
- [ ] Confirm the submission form text, repository visibility, and deadline requirements.
- [ ] Submit manually before Sunday, November 15, 2026, 12:00 noon WAT.
