import { notFound } from "next/navigation";
import { Clock3, LockKeyhole } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ensurePortfolio } from "@/lib/portfolio";
import { getDb } from "@/lib/db";
const sections = {
  projects: { title: "Projects", description: "GitHub repository import and AI-assisted project analysis are coming in a future phase." },
  portfolio: { title: "Portfolio", description: "Your unpublished draft has been created. Editing and public publishing are coming soon." },
  analytics: { title: "Analytics", description: "Portfolio views, sharing insights and referral attribution are coming in a future phase." },
};
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const user = await requireUser();
  const { section } = await params;
  if (!(section in sections)) notFound();
  const content = sections[section as keyof typeof sections];
  const portfolio = section === "portfolio" ? await ensurePortfolio(getDb(), user) : null;
  return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">{content.title}</h1><div className="mt-9 rounded-xl border border-zinc-800 bg-surface/60 p-8"><Clock3 className="mb-5 text-accent" /><h2 className="text-xl font-medium">Coming soon</h2><p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">{content.description}</p>{portfolio && <dl className="mt-7 space-y-4 border-t border-zinc-800 pt-6 text-sm"><div><dt className="text-zinc-500">Display name</dt><dd className="mt-1">{portfolio.displayName}</dd></div><div><dt className="text-zinc-500">Reserved slug</dt><dd className="mt-1 font-mono text-accent">{portfolio.slug}</dd></div><div className="flex items-center gap-2 text-zinc-500"><LockKeyhole size={14} />Unpublished · Only visible to you</div></dl>}</div></>;
}
