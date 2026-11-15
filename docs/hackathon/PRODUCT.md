# SkillLoop

## Product overview

SkillLoop turns public GitHub work into a clear, reviewable developer portfolio. It is for developers who have built useful software and want to explain that work to recruiters, clients, collaborators, or peers.

## Problem and solution

A repository list rarely explains a project's purpose, decisions, or evidence. Writing case studies takes time. SkillLoop connects through GitHub OAuth, imports public repositories owned by the authenticated GitHub account, gathers available public context, and creates an AI-assisted project analysis. Developers can review, edit, and approve every description, then select projects and publish a shareable portfolio.

## Implemented product

- GitHub OAuth authentication and a private workspace.
- Public repository discovery and importing tied to the authenticated GitHub account.
- Repository metadata, language information, README/manifests, and available public contribution evidence.
- Gemini-assisted project analysis when configured, with a metadata-based fallback; owner review, editing, and approval before publication.
- Portfolio profile editing, approved project selection and ordering, private preview, publishing, updating, unpublishing, and share links.
- Public portfolio pages served from published snapshots.
- Built-in referral CTA, signed 30-day last-valid-click attribution, and unique conversion recording for new accounts.
- Owner-scoped analytics for pseudonymous browser-day views and CTA clicks, referred registrations, and publication status.

Repository metadata and GitHub-provided contribution data do not independently prove an individual's authorship or mastery. AI text is a draft for owner review, not an independent verification of project claims.

## Differentiation

SkillLoop brings repository evidence, owner-approved storytelling, and a publishable portfolio into one flow. Each public portfolio also offers visitors a way to create their own, making sharing part of the product's acquisition path.

## Technical architecture

Next.js App Router, React, TypeScript, NextAuth with GitHub OAuth, GitHub API, optional server-side Gemini analysis, Prisma, PostgreSQL (Neon in the hosted environment), and Vercel hosting. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Business model and future options

SkillLoop is a hackathon-stage product; no paid plan, revenue, customer count, or validated market demand is claimed here. Potential future options include custom domains, advanced presentation options, and team or career-service plans. These require validation and are not current features or committed pricing.
