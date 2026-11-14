import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ensurePortfolio } from "@/lib/portfolio";
import { PrivatePortfolioPreviewView } from "@/components/private-portfolio-preview-view";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function PortfolioPreview(){const user=await requireUser();const db=getDb();const portfolio=await ensurePortfolio(db,user);const items=await db.portfolioProject.findMany({where:{portfolioId:portfolio.id,project:{ownerId:user.id,analysis:{is:{approved:true}}}},orderBy:{position:"asc"},include:{project:{include:{analysis:true}}}});return <PrivatePortfolioPreviewView displayName={portfolio.displayName} headline={portfolio.headline} location={portfolio.location} biography={portfolio.biography} projects={items.map(({project})=>({id:project.id,title:project.analysis?.approvedTitle??null,summary:project.analysis?.approvedSummary??null}))} />;}
