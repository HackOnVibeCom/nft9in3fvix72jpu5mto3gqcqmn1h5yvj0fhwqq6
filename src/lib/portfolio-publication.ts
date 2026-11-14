import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
type Db = PrismaClient | Prisma.TransactionClient;
export async function removePublishedProjects(db: Db, projectIds: string[]) {
  if (!projectIds.length) return;
  const portfolios = await db.portfolio.findMany({ where: { selectedProjects: { some: { projectId: { in: projectIds } } } }, select: { id: true, publishedSlug: true, published: true, publishedSnapshot: true } });
  for (const portfolio of portfolios) {
    const snapshot = portfolio.publishedSnapshot as { projects?: Array<{ id: string }> } | null;
    if (portfolio.published && snapshot?.projects) {
      const projects = snapshot.projects.filter(project => !projectIds.includes(project.id));
      await db.portfolio.update({ where: { id: portfolio.id }, data: { published: projects.length > 0, publishedSlug: projects.length ? portfolio.publishedSlug : null, publishedSnapshot: { ...snapshot, projects } } });
      if (portfolio.publishedSlug) revalidatePath(`/p/${portfolio.publishedSlug}`);
    }
  }
  // Also remove stale draft selections so an ineligible project cannot be republished.
  await db.portfolioProject.deleteMany({ where: { projectId: { in: projectIds } } });
}
