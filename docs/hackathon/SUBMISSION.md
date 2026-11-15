# HackOnVibe submission answers

Final reusable project information for the **HackOnVibe November 2026** submission. The questionnaire, demonstration video, and live application were accepted by HackOnVibe on November 15, 2026. This records submission acceptance only; it does not claim that judging has concluded or that the team won.

## Project name

SkillLoop

## Team

Great Elites

## Challenge

Zero-CAC IT Product

## One-sentence pitch

SkillLoop turns public GitHub projects into polished, owner-reviewed developer portfolios that help developers explain and share their work.

## Problem statement

Developers often have useful public work but no concise way to explain a project's purpose, decisions, and evidence. A repository list or résumé can leave that context hidden, while writing project case studies takes time.

## Target audience

Developers who want to present their public software projects to recruiters, clients, collaborators, peers, or developer communities.

## Solution

SkillLoop connects through GitHub OAuth, imports public repositories tied to the authenticated account, and uses repository evidence to draft project descriptions. The developer can edit and approve every description, select projects, preview privately, and publish a shareable portfolio.

## Main features

- Secure GitHub OAuth and private workspace.
- Public GitHub repository importing and project evidence collection.
- Gemini-assisted project analysis, with a metadata fallback; user review, editing, and approval.
- Portfolio editing, project selection and ordering, private preview, publishing, and shareable public pages.
- Built-in referral CTA and signed last-valid-click attribution for eligible new registrations.
- Owner-scoped, privacy-conscious analytics for browser-day views/clicks and unique referred registrations.

## Zero-CAC acquisition mechanism

A developer imports projects, creates and publishes a portfolio, then shares it. Visitors can discover SkillLoop through the portfolio's built-in CTA and register to create their own portfolio. Signed attribution connects eligible new registrations to the latest valid click for up to 30 days. This demonstrates an implemented organic acquisition mechanism; it does not prove sustainable zero-CAC growth at scale. `$0 reported` paid spend is not a claim of zero hosting, AI, infrastructure, or operating costs.

## Customer journey

GitHub sign-in → import public repositories → review and approve project descriptions → select projects and edit the portfolio → preview privately → publish and share → visitors follow the portfolio CTA → eligible new developers register and can publish portfolios of their own.

## Technology stack

Next.js App Router, React, TypeScript, NextAuth, GitHub OAuth and API, optional server-side Gemini API, Prisma, PostgreSQL (Neon in production), and Vercel hosting. Automated coverage uses Vitest and Playwright.

## Meaningful AI integration

When configured, Gemini produces structured project descriptions from public repository evidence. AI output is a draft: developers can inspect, edit, and approve it before publication. If the provider is unavailable, the application uses a metadata-based fallback. The product does not claim that AI independently verifies authorship or mastery.

## Security and privacy

Authentication uses GitHub OAuth. Provider credentials and tokens, AI keys, and database credentials remain server-side. Only public repositories are imported. Public portfolio content is published by the owner; private drafts require authentication. Referral attribution uses a signed, expiring HttpOnly cookie and rejects invalid cookies, unpublished sources, self-referrals, existing users, and duplicate conversions. Analytics uses pseudonymous browser-day identifiers and is not represented as verified people-level tracking.

## Business and monetization potential

No revenue, paying customers, partnership, or validated market demand is claimed. Potential future revenue could come from custom domains, advanced portfolio presentation, or team and career-service plans. These are hypotheses for future validation, not current paid features or committed pricing. Hosting, AI, and operating costs remain even when paid acquisition spend is `$0 reported`.

## Competitive differentiation

SkillLoop combines public project evidence, AI-assisted but owner-controlled storytelling, private preview and publish snapshots, and a referral CTA in one developer workflow. Public GitHub metadata does not independently establish individual authorship; owners remain responsible for their descriptions and portfolio choices.

## Implemented functionality and future improvements

**Implemented:** GitHub OAuth, public repository import, AI-assisted analysis and fallback, owner editing/approval, portfolio editing and project selection, private preview, public publishing/sharing, referral attribution, and owner analytics.

**Future improvements:** investigate repeat-click count discrepancies; improve bot and multi-instance rate-limit handling; add referral publication outcome and cohort analysis; build a complete acquisition cost ledger; and validate monetization options. No referred-user publication outcome or complete CAC ledger is currently tracked.

## Live application and example portfolio

- Production application: <https://skillloop-gamma.vercel.app>
- Example public portfolio: <https://skillloop-gamma.vercel.app/p/drowsei>

## Official repository

<https://github.com/HackOnVibeCom/nft9in3fvix72jpu5mto3gqcqmn1h5yvj0fhwqq6>

## Testing and release status

Reported final automated checks: 100 unit tests across 21 files, 22 Playwright tests, lint, typecheck, Prisma validation, and production build passed. The final application release is reported as commit `c232453`; a clean archive was deployed to Vercel production. All four Prisma migrations were reported applied to production, and the project owner confirmed 10/10 production acceptance checks. Genuine GitHub OAuth referral registration was verified in staging and production. These are release/acceptance results, not evidence of customer traction. The live endpoints and deployment metadata could not be independently checked from this documentation audit.

## Demonstration video

[Watch the five-minute SkillLoop demonstration](https://youtu.be/bjkDj-HEb9A)

## Submission status

HackOnVibe accepted the questionnaire, demonstration video, and live application on November 15, 2026. The “Publish to GitHub” milestone is completed. Judging has not been reported as concluded, and no competition result is claimed.
