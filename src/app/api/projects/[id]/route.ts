import { z } from "zod";
import { getDb } from "@/lib/db";
import { projectUser, jsonError, sameOrigin } from "@/lib/project-api";
export const runtime = "nodejs";
const params = z.object({ id: z.string().min(1).max(40) });
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) { if (!sameOrigin(_request)) return jsonError("Cross-origin request rejected.", 403); const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401); const p = params.safeParse(await ctx.params); if (!p.success) return jsonError("Invalid project."); const result = await getDb().project.deleteMany({ where: { id: p.data.id, ownerId: user.id } }); return result.count ? Response.json({ ok: true }) : jsonError("Project not found.", 404); }
