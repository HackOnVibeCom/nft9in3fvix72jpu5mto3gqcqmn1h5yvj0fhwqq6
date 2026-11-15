import { notFound } from "next/navigation";
import { ProjectsPanel } from "@/components/projects-panel";
import { PortfolioEditor } from "@/components/portfolio-editor";
import { requireUser } from "@/lib/session";
import { getAppOrigin } from "@/lib/app-url";
import { loadPortfolioAnalytics } from "@/lib/portfolio-analytics";
import { analyticsConversionRate } from "@/lib/analytics-metrics";
const sections = {
  projects: { title: "Projects", description: "Import public repositories and create evidence-backed project descriptions." },
  portfolio: { title: "Portfolio", description: "Edit and publish your portfolio." },
  analytics: { title: "Analytics", description: "Your public portfolio activity and referral conversions." },
};
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const user = await requireUser();
  const { section } = await params;
  if (!(section in sections)) notFound();
  const content = sections[section as keyof typeof sections];
  if (section === "projects") return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Projects</h1><p className="mt-3 text-sm text-zinc-300">Import public GitHub repositories and review their project analysis.</p><ProjectsPanel /></>;
  if (section === "portfolio") return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1><PortfolioEditor appOrigin={getAppOrigin()} /></>;
  if (section === "analytics") {
    const { portfolio, views, clicks, conversions, publishedCount } = await loadPortfolioAnalytics(user.id);
    const rate = analyticsConversionRate(clicks, conversions);
    const metrics = [["Portfolio views (browser-days)", views.toLocaleString()], ["CTA clicks (browser-days)", clicks.toLocaleString()], ["Unique referred registrations", conversions.toLocaleString()], ["Registration / CTA click rate", `${rate.toFixed(1)}%`]];
    return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Analytics</h1><p className="mt-3 text-sm text-zinc-300">Activity for your portfolio only. Platform wide statistics are not shown here.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <article key={label} className="rounded-xl border border-zinc-800 bg-surface/60 p-5"><p className="text-sm text-zinc-300">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></article>)}</div><div className="mt-6 grid gap-4 lg:grid-cols-2"><section className="rounded-xl border border-zinc-800 bg-surface/60 p-6"><h2 className="text-lg font-medium">Organic acquisition funnel</h2><ol className="mt-5 space-y-3 text-sm">{[["Portfolio view browser-days", views], ["CTA click browser-days", clicks], ["Unique referred registrations", conversions]].map(([label, value], i) => <li key={label} className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3"><span><span className="mr-3 text-xs text-accent">0{i + 1}</span>{label}</span><strong>{Number(value).toLocaleString()}</strong></li>)}</ol><p className="mt-4 text-xs text-zinc-400">Views and clicks count at most once per pseudonymous browser per UTC day. Registrations are unique referred accounts attributed to the last valid CTA click within 30 days. Rate = registrations ÷ deduplicated click browser-days; these are not independently verified people or a conversion cohort, and the rate can exceed 100% in edge cases.</p></section><section className="rounded-xl border border-zinc-800 bg-surface/60 p-6"><h2 className="text-lg font-medium">Portfolio and spend</h2><p className="mt-4 text-sm text-zinc-400">Your published portfolios: <strong className="text-white">{publishedCount}</strong> · Your status: <strong className="text-white">{portfolio?.published ? "Published" : "Unpublished"}</strong></p><p className="mt-4 text-sm text-zinc-400">Referred-user publication outcomes: <strong className="text-white">Not tracked</strong></p><p className="mt-4 text-sm text-zinc-400">Paid acquisition spend: <strong className="text-white">$0 reported</strong></p><p className="mt-2 text-xs leading-5 text-zinc-400">Business assumption for this dashboard: no paid acquisition spend has been entered. This does not represent hosting, infrastructure, or operating costs.</p></section></div></>;
  }
  return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">{content.title}</h1><div className="mt-9 rounded-xl border border-zinc-800 bg-surface/60 p-8"><h2 className="text-xl font-medium">Coming soon</h2><p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">{content.description}</p></div></>;
}
