import { projectUser, jsonError } from "@/lib/project-api";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() { const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401); const projects = await getDb().project.findMany({ where: { ownerId: user.id }, select: { id: true, name: true, fullName: true, description: true, url: true, primaryLanguage: true, languages: true, stars: true, forks: true, repositoryUpdatedAt: true, importedAt: true, analysis: { select: { title: true, summary: true, approvedTitle: true, approvedSummary: true, source: true, approved: true } } }, orderBy: { importedAt: "desc" } }); return Response.json({ projects }); }
