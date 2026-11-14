import { PortfolioEditor } from "@/components/portfolio-editor";
import { requireUser } from "@/lib/session";
import { getAppOrigin } from "@/lib/app-url";
export const dynamic = "force-dynamic";
export default async function PortfolioPage() { await requireUser(); return <><p className="mb-3 text-xs text-accent">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1><p className="mt-3 text-sm text-zinc-500">Shape your profile, choose approved projects and publish when it is ready.</p><PortfolioEditor appOrigin={getAppOrigin()} /></>; }
