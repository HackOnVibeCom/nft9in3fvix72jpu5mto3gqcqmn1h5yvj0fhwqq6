import { z } from "zod";
import { projectUser, jsonError, sameOrigin } from "@/lib/project-api";
import { githubApi, githubJson, isPublicOwnedRepo, manifestsFor, parseRepo, resolveGithubIdentity } from "@/lib/projects";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401);
  const query = z.object({ page: z.coerce.number().int().min(1).max(100).default(1), q: z.string().max(100).default("") }).safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return jsonError("Invalid search or page.");
  try {
    const identity = await resolveGithubIdentity(user.id); if (!identity) return jsonError("Your linked GitHub account could not be verified. Sign in again.", 409); const login = identity.login;
    const data = await githubJson<unknown[]>(`${githubApi}/users/${encodeURIComponent(login)}/repos?type=owner&sort=updated&per_page=100&page=${query.data.page}`);
    const repos = data.map(parseRepo).filter(r => isPublicOwnedRepo(r, login) && (!query.data.q || r.name.toLowerCase().includes(query.data.q.toLowerCase())));
    const imported = await getDb().project.findMany({ where: { ownerId: user.id }, select: { githubRepositoryId: true } });
    return Response.json({ repositories: repos.map(r => ({ id: String(r.id), name: r.name, fullName: r.full_name, description: r.description, language: r.language, stars: r.stargazers_count, updatedAt: r.updated_at, imported: imported.some(p => p.githubRepositoryId === String(r.id)) })), hasNextPage: data.length === 100 });
  } catch (e) { return jsonError(e instanceof Error ? e.message : "Could not load repositories.", 502); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Cross-origin request rejected.", 403);
  const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401);
  const parsed = z.object({ repositoryId: z.string().regex(/^\d{1,20}$/) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid repository.");
  const db = getDb();
  try {
    const identity = await resolveGithubIdentity(user.id); if (!identity) return jsonError("Your linked GitHub account could not be verified. Sign in again.", 409); const login = identity.login;
    let repo: ReturnType<typeof parseRepo> | undefined;
    for (let page = 1; page <= 5 && !repo; page++) {
      const list = await githubJson<unknown[]>(`${githubApi}/users/${encodeURIComponent(login)}/repos?type=owner&sort=updated&per_page=100&page=${page}`);
      repo = list.map(parseRepo).find(r => String(r.id) === parsed.data.repositoryId);
      if (list.length < 100) break;
    }
    if (!repo || repo.private || repo.owner.login.toLowerCase() !== login.toLowerCase()) return jsonError("That public repository could not be verified as yours.", 403);
    const existing = await db.project.findUnique({ where: { ownerId_githubRepositoryId: { ownerId: user.id, githubRepositoryId: String(repo.id) } } });
    if (existing) return Response.json({ project: existing, duplicate: true }, { status: 200 });
    const [langs, readme, manifests, commits] = await Promise.all([githubJson<Record<string, number>>(`${githubApi}/repos/${repo.full_name}/languages`).catch(() => ({})), import("@/lib/projects").then(m => m.readmeFor(repo!.full_name)), manifestsFor(repo.full_name), githubJson<Array<{ sha: string; commit: { message: string; author: { date: string } | null } }>>(`${githubApi}/repos/${repo.full_name}/commits?author=${encodeURIComponent(login)}&per_page=10`).catch(() => [])]);
    const contributionEvidence = commits.slice(0, 10).map(c => ({ sha: c.sha.slice(0, 12), message: c.commit.message.slice(0, 200), date: c.commit.author?.date ?? null, source: "public commit API; author attribution is GitHub-provided and not independently verified" }));
    const project = await db.project.create({ data: { ownerId: user.id, githubRepositoryId: String(repo.id), name: repo.name, fullName: repo.full_name, description: repo.description, url: repo.html_url, primaryLanguage: repo.language, languages: langs, stars: repo.stargazers_count, forks: repo.forks_count, readme, manifests, contributionEvidence, repositoryCreatedAt: new Date(repo.created_at), repositoryUpdatedAt: new Date(repo.updated_at) } });
    return Response.json({ project }, { status: 201 });
  } catch (e) { if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") { const existing = await db.project.findUnique({ where: { ownerId_githubRepositoryId: { ownerId: user.id, githubRepositoryId: parsed.data.repositoryId } } }); if (existing) return Response.json({ project: existing, duplicate: true }); } return jsonError(e instanceof Error ? e.message : "Import failed.", 502); }
}
