import { FolderGit2, LockKeyhole, ArrowUpRight, UserRound } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ensurePortfolio } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
export default async function Dashboard() {
  const user = await requireUser();
  const portfolio = await ensurePortfolio(getDb(), user);
  return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Welcome, {user.name || user.githubUsername || "developer"}.</h1><p className="mt-3 text-sm text-zinc-500">This is where your next chapter starts.</p><div className="mt-9 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-surface/60 p-6">{user.image ? /* OAuth avatar is verified against GitHub's avatar host. */
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="Your GitHub avatar" width={52} height={52} className="size-13 rounded-full" referrerPolicy="no-referrer" /> : <div className="flex size-13 items-center justify-center rounded-full bg-indigo-400/10"><UserRound className="text-accent" /></div>}<div><h2 className="font-medium">{portfolio.displayName}</h2><p className="mt-1 text-sm text-zinc-500">{user.githubUsername ? `@${user.githubUsername}` : "GitHub connected"}</p></div><span className="ml-auto flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400"><LockKeyhole size={12} />Unpublished draft</span></div><section className="mt-6 rounded-xl border border-dashed border-zinc-800 px-6 py-14 text-center"><div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl border border-zinc-800 bg-surface"><FolderGit2 size={25} className="text-accent" /></div><h2 className="text-xl font-medium">Great work deserves a great home.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">Your private workspace is ready. GitHub project import and AI-assisted analysis are coming soon. There’s nothing to import just yet.</p><Button asChild variant="outline" className="mt-6"><Link href="/dashboard/portfolio">View portfolio draft <ArrowUpRight size={15} /></Link></Button></section><p className="mt-6 text-xs leading-6 text-zinc-600">Your portfolio stays private. Publishing, sharing and analytics will arrive in a future phase.</p></>;
}
