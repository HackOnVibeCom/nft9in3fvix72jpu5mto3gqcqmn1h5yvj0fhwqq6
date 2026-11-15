# SkillLoop

## Product overview

SkillLoop helps developers turn public GitHub work into a clear, shareable portfolio. It is for developers who have built useful software but need a concise way to show what they made and explain their decisions to recruiters, clients, and collaborators.

## Problem and solution

Repository lists and technology keywords do not tell a complete story. Writing project case studies takes time, and a résumé alone can hide the practical evidence in a developer's code. SkillLoop imports repositories owned by the signed-in GitHub account, gathers public project context, drafts a description with Gemini when configured (using deterministic repository-metadata fallback otherwise), and asks the owner to review and approve it. Owners choose which approved projects to publish.

## Implemented features

- GitHub OAuth sign-in and a private workspace.
- Public, owner-verified repository discovery and import.
- Repository metadata, languages, README/manifests and available public contribution evidence.
- Gemini-assisted project descriptions with deterministic metadata fallback; owners edit and approve before publication.
- Draft portfolio profile, project selection and ordering, preview, publish, update, unpublish and share-link controls.
- Immutable published snapshot behavior for public portfolio presentation; drafts remain private.
- Owner-scoped portfolio view and referral analytics with daily browser deduplication.
- Signed, expiring 30-day referral attribution and idempotent new-user conversion recording.

## Differentiation

SkillLoop anchors portfolio claims in repositories and public evidence, then leaves final wording and publication approval with the developer. A public portfolio also carries a measured, optional invitation for its next visitor to create a portfolio, forming an organic sharing loop.

## Technical architecture

Next.js App Router runs on the Node runtime. NextAuth handles GitHub OAuth; the GitHub API supplies public repository details; Gemini is an optional server-side analysis provider. Prisma stores users, projects, portfolio drafts and snapshots, events, and referral conversions in PostgreSQL (Neon in hosted environments). Vercel hosts the deployed application. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Business model and future options

The current product is a hackathon-stage portfolio builder; no paid plan or revenue is currently represented. Possible future models include paid custom domains, advanced portfolio themes, private collaboration workflows, and team or career-service plans. These are possibilities for validation, not existing features or committed pricing.
