import { z } from "zod";
import { getDb } from "@/lib/db";
import { projectUser, jsonError, sameOrigin } from "@/lib/project-api";
import { removePublishedProjects } from "@/lib/portfolio-publication";
export const runtime = "nodejs";
const params = z.object({ id: z.string().min(1).max(40) });
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) { if (!sameOrigin(_request)) return jsonError("Cross-origin request rejected.", 403); const user = await projectUser(); if (!user) return jsonError("Sign in to continue.", 401); const p = params.safeParse(await ctx.params); if (!p.success) return jsonError("Invalid project."); const db=getDb(); const project=await db.project.findFirst({where:{id:p.data.id,ownerId:user.id},select:{id:true}}); if(!project)return jsonError("Project not found.",404); try { await db.$transaction(async tx=>{await removePublishedProjects(tx,[project.id]); await tx.project.delete({where:{id:project.id}});},{isolationLevel:"Serializable"}); } catch(error) { if(error&&typeof error==="object"&&"code" in error&&error.code==="P2034")return jsonError("The project changed while it was being removed. Refresh and try again.",409); throw error; } return Response.json({ ok: true }); }
