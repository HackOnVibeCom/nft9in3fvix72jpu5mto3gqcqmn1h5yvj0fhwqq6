import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { ensurePortfolio } from "@/lib/portfolio";
import { projectUser, jsonError, sameOrigin } from "@/lib/project-api";
import { safeHttpUrl } from "@/lib/validation";

export const runtime = "nodejs";
const schema = z.object({
  displayName: z.string().trim().min(1).max(80), headline: z.string().trim().max(160),
  biography: z.string().trim().max(2000), location: z.string().trim().max(100).nullable(),
  linkedinUrl: z.string().trim().max(2048).nullable(), websiteUrl: z.string().trim().max(2048).nullable(),
  slug: z.string().trim().min(2).max(48).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  projectIds: z.array(z.string().min(1).max(40)).max(50),
}).strict();
const reserved = new Set(["api", "dashboard", "login", "p", "_next", "skillloop", "admin", "auth"]);

export async function GET() {
  const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401);
  const db = getDb(); const portfolio = await ensurePortfolio(db, user);
  const [projects, selection] = await Promise.all([
    db.project.findMany({ where: { ownerId: user.id }, select: { id: true, name: true, fullName: true, url: true, primaryLanguage: true, languages: true, stars: true, forks: true, analysis: { select: { approved: true, approvedTitle: true, approvedSummary: true } } }, orderBy: { importedAt: "desc" } }),
    db.portfolioProject.findMany({ where: { portfolioId: portfolio.id }, orderBy: { position: "asc" }, select: { projectId: true } }),
  ]);
  return Response.json({ portfolio: { id: portfolio.id, displayName: portfolio.displayName, headline: portfolio.headline, biography: portfolio.biography, location: portfolio.location, linkedinUrl: portfolio.linkedinUrl, websiteUrl: portfolio.websiteUrl, slug: portfolio.slug, publishedSlug: portfolio.publishedSlug, published: portfolio.published, publishedAt: portfolio.publishedAt, githubUsername: user.githubUsername ?? null }, projects, projectIds: selection.map(item => item.projectId) });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return jsonError("Cross-origin request rejected.", 403);
  const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Check the portfolio fields and try again.");
  const input = parsed.data; if (reserved.has(input.slug)) return jsonError("That public URL is reserved.");
  for (const [label, value] of [["LinkedIn", input.linkedinUrl], ["Website", input.websiteUrl]] as const) if (value && !safeHttpUrl(value)) return jsonError(`${label} URL must use http or https.`);
  const db = getDb(); const portfolio = await ensurePortfolio(db, user);
  try {
    const saved = await db.$transaction(async tx => {
      const projects = await tx.project.findMany({ where: { id: { in: input.projectIds }, ownerId: user.id, analysis: { is: { approved: true, approvedTitle: { not: null }, approvedSummary: { not: null } } } }, select: { id: true } });
      if (projects.length !== new Set(input.projectIds).size) return false;
      await tx.portfolio.update({ where: { id: portfolio.id }, data: { displayName: input.displayName, headline: input.headline, biography: input.biography, location: input.location || null, linkedinUrl: input.linkedinUrl || null, websiteUrl: input.websiteUrl || null, slug: input.slug } });
      await tx.portfolioProject.deleteMany({ where: { portfolioId: portfolio.id } });
      if (input.projectIds.length) await tx.portfolioProject.createMany({ data: input.projectIds.map((projectId, position) => ({ portfolioId: portfolio.id, projectId, position })) });
      return true;
    }, { isolationLevel: "Serializable" });
    if (!saved) return jsonError("Only your projects with approved descriptions can be selected.");
  } catch (error) { if (error && typeof error === "object" && "code" in error && (error.code === "P2002" || error.code === "P2034")) return jsonError("The URL or project selection changed while saving. Refresh and try again.", 409); throw error; }
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Cross-origin request rejected.", 403);
  const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401);
  const body = z.object({ action: z.enum(["publish", "unpublish"]) }).strict().safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Invalid publishing action.");
  const db = getDb(); const portfolio = await ensurePortfolio(db, user);
  if (body.data.action === "unpublish") {
    await db.portfolio.update({ where: { id: portfolio.id }, data: { published: false, publishedSlug: null } });
    if (portfolio.publishedSlug) revalidatePath(`/p/${portfolio.publishedSlug}`); return Response.json({ ok: true });
  }
  try {
    // Read the current profile and selection in the same serializable transaction that writes
    // the immutable public snapshot. Concurrent draft/project changes cannot publish stale data.
    const result = await db.$transaction(async tx => {
      const current = await tx.portfolio.findUnique({ where: { id: portfolio.id }, include: { user: { select: { githubUsername: true, image: true } }, selectedProjects: { orderBy: { position: "asc" }, include: { project: { include: { analysis: true } } } } } });
      if (!current || current.displayName.trim().length < 1 || current.headline.trim().length < 1) return { error: "Add a display name and professional headline before publishing." };
      const eligible = current.selectedProjects.filter(({ project }) => project.ownerId === user.id && project.analysis?.approved && project.analysis.approvedTitle && project.analysis.approvedSummary);
      if (!eligible.length || eligible.length !== current.selectedProjects.length) return { error: "Select at least one eligible project with an approved description." };
      const avatarUrl = safeHttpUrl(current.user.image);
      const snapshot = { displayName: current.displayName, headline: current.headline, biography: current.biography, location: current.location, linkedinUrl: safeHttpUrl(current.linkedinUrl), websiteUrl: safeHttpUrl(current.websiteUrl), githubUsername: current.user.githubUsername, avatarUrl: avatarUrl && new URL(avatarUrl).hostname === "avatars.githubusercontent.com" ? avatarUrl : null, projects: eligible.map(({ project }) => ({ id: project.id, title: project.analysis!.approvedTitle!, summary: project.analysis!.approvedSummary!, url: safeHttpUrl(project.url), primaryLanguage: project.primaryLanguage, technologies: Object.keys(project.languages as Record<string, unknown> || {}), stars: project.stars, forks: project.forks, repositoryUpdatedAt: project.repositoryUpdatedAt?.toISOString() ?? null })) };
      await tx.portfolio.update({ where: { id: portfolio.id }, data: { published: true, publishedSlug: current.slug, publishedAt: new Date(), publishedSnapshot: snapshot } });
      return { slug: current.slug, oldSlug: current.publishedSlug };
    }, { isolationLevel: "Serializable" });
    if ("error" in result && result.error) return jsonError(result.error);
    if (result.oldSlug && result.oldSlug !== result.slug) revalidatePath(`/p/${result.oldSlug}`);
    revalidatePath(`/p/${result.slug}`); return Response.json({ ok: true, slug: result.slug });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error.code === "P2034" || error.code === "P2002")) return jsonError("The portfolio changed while publishing. Refresh and try again.", 409);
    throw error;
  }
}
