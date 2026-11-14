import { notFound } from "next/navigation";
import { ProjectsPanel } from "@/components/projects-panel";
import { PortfolioEditor } from "@/components/portfolio-editor";
import { requireUser } from "@/lib/session";
import { getAppOrigin } from "@/lib/app-url";
const sections = {
  projects: { title: "Projects", description: "Import public repositories and create evidence-backed project descriptions." },
  portfolio: { title: "Portfolio", description: "Edit and publish your portfolio." },
  analytics: { title: "Analytics", description: "Portfolio views, sharing insights and referral attribution are coming in a future phase." },
};
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  await requireUser();
  const { section } = await params;
  if (!(section in sections)) notFound();
  const content = sections[section as keyof typeof sections];
  if (section === "projects") return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Projects</h1><p className="mt-3 text-sm text-zinc-500">Import public GitHub repositories and review their project analysis.</p><ProjectsPanel /></>;
  if (section === "portfolio") return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1><PortfolioEditor appOrigin={getAppOrigin()} /></>;
  return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">{content.title}</h1><div className="mt-9 rounded-xl border border-zinc-800 bg-surface/60 p-8"><h2 className="text-xl font-medium">Coming soon</h2><p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">{content.description}</p></div></>;
}
