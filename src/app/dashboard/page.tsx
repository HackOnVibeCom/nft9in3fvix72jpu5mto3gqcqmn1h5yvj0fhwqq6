import { LockKeyhole, ArrowUpRight, UserRound } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ensurePortfolio } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const user = await requireUser();
  const db = getDb();
  const portfolio = await ensurePortfolio(db, user);
  const [projectCount, approvedCount, selectedCount] = await Promise.all([
    db.project.count({ where: { ownerId: user.id } }),
    db.project.count({ where: { ownerId: user.id, analysis: { is: { approved: true } } } }),
    db.portfolioProject.count({ where: { portfolioId: portfolio.id } }),
  ]);
  return <>
    <p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p>
    <h1 className="text-3xl font-semibold tracking-tight">Welcome, {user.name || user.githubUsername || "developer"}.</h1>
    <p className="mt-3 text-sm text-zinc-300">Turn public GitHub projects into a portfolio you can confidently share.</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Imported projects", projectCount], ["Approved descriptions", approvedCount], ["Featured projects", selectedCount]].map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-800 bg-surface/60 p-5"><p className="text-sm text-zinc-300">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-surface/60 p-6">{user.image ? /* OAuth avatar is verified against GitHub's avatar host. */
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.image} alt="Your GitHub avatar" width={52} height={52} className="size-13 rounded-full" referrerPolicy="no-referrer" /> : <div className="flex size-13 items-center justify-center rounded-full bg-indigo-400/10"><UserRound className="text-accent" /></div>}<div><h2 className="font-medium">{portfolio.displayName}</h2><p className="mt-1 text-sm text-zinc-300">{user.githubUsername ? `@${user.githubUsername}` : "GitHub connected"}</p></div><span className="ml-auto flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"><LockKeyhole size={12} />{portfolio.published ? "Published" : "Draft"}</span></div>
    <div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/dashboard/projects">{projectCount ? "Review projects" : "Import your first project"} <ArrowUpRight size={15} /></Link></Button><Button asChild variant="outline"><Link href="/dashboard/portfolio">{portfolio.published ? "Edit portfolio" : "Build your portfolio"} <ArrowUpRight size={15} /></Link></Button>{portfolio.published && portfolio.publishedSlug && <Button asChild variant="outline"><Link href={`/p/${portfolio.publishedSlug}`} target="_blank">Visit public portfolio <ArrowUpRight size={15} /></Link></Button>}</div>
    <div className="mt-6 rounded-xl border border-zinc-800 bg-surface/50 p-5"><p className="font-medium">Next steps</p><p className="mt-2 text-sm leading-6 text-zinc-300">{!projectCount ? "Import a public repository to get started." : !approvedCount ? "Generate a description, review it, and approve it for your portfolio." : !portfolio.published ? "Choose approved projects in Portfolio, then publish when the draft is ready." : "Share your portfolio link and follow views and referral activity in Analytics."}</p><Link className="mt-3 inline-flex min-h-11 items-center gap-2 rounded py-2 text-sm text-indigo-200 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300" href={!projectCount || !approvedCount ? "/dashboard/projects" : !portfolio.published ? "/dashboard/portfolio" : "/dashboard/analytics"}>{!projectCount || !approvedCount ? "Go to Projects" : !portfolio.published ? "Go to Portfolio" : "View Analytics"}<ArrowUpRight size={14} /></Link></div>
  </>;
}
