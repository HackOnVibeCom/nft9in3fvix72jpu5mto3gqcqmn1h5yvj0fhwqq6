import { LockKeyhole, ArrowUpRight, UserRound } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ensurePortfolio } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
export default async function Dashboard() {
  const user = await requireUser();
  const portfolio = await ensurePortfolio(getDb(), user);
  const db=getDb();
  const [projectCount,approvedCount,selectedCount]=await Promise.all([db.project.count({where:{ownerId:user.id}}),db.project.count({where:{ownerId:user.id,analysis:{is:{approved:true}}}}),db.portfolioProject.count({where:{portfolioId:portfolio.id}})]);
  return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Welcome, {user.name || user.githubUsername || "developer"}.</h1><p className="mt-3 text-sm text-zinc-500">Your public work, ready to take shape.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Imported projects",projectCount],["Approved descriptions",approvedCount],["Featured projects",selectedCount]].map(([label,value])=><div key={label} className="rounded-xl border border-zinc-800 bg-surface/60 p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div><div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-surface/60 p-6">{user.image ? /* OAuth avatar is verified against GitHub's avatar host. */
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="Your GitHub avatar" width={52} height={52} className="size-13 rounded-full" referrerPolicy="no-referrer" /> : <div className="flex size-13 items-center justify-center rounded-full bg-indigo-400/10"><UserRound className="text-accent" /></div>}<div><h2 className="font-medium">{portfolio.displayName}</h2><p className="mt-1 text-sm text-zinc-500">{user.githubUsername ? `@${user.githubUsername}` : "GitHub connected"}</p></div><span className="ml-auto flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400"><LockKeyhole size={12} />{portfolio.published?"Published":"Draft"}</span></div><div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/dashboard/portfolio">{portfolio.published?"Edit portfolio":"Build your portfolio"} <ArrowUpRight size={15}/></Link></Button>{portfolio.published&&portfolio.publishedSlug&&<Button asChild variant="outline"><Link href={`/p/${portfolio.publishedSlug}`} target="_blank">Visit public portfolio <ArrowUpRight size={15}/></Link></Button>}</div><p className="mt-6 text-xs leading-6 text-zinc-600">Analytics are coming in a future phase.</p></>;
}
