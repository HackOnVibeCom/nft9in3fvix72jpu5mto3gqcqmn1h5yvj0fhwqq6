import Link from "next/link";
import { BarChart3, FolderGit2, LayoutDashboard, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/auth-buttons";
import { requireUser } from "@/lib/session";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <div className="min-h-screen"><header className="border-b border-zinc-800"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12"><Brand /><SignOutButton /></div></header><div className="mx-auto grid max-w-7xl md:min-h-[calc(100vh-89px)] md:grid-cols-[210px_1fr]"><aside className="border-b border-zinc-800 p-5 md:border-r md:border-b-0 md:py-9"><p className="mb-4 hidden px-3 text-[10px] tracking-widest text-zinc-600 md:block">WORKSPACE</p><nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto md:flex-col">{[{ href: "/dashboard", icon: LayoutDashboard, label: "Overview" }, { href: "/dashboard/projects", icon: FolderGit2, label: "Projects" }, { href: "/dashboard/portfolio", icon: UserRound, label: "Portfolio" }, { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" }].map(({ href, icon: Icon, label }) => <Link key={href} href={href} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm text-zinc-400 hover:bg-surface hover:text-white"><Icon size={17} />{label}</Link>)}</nav></aside><main className="min-w-0 px-6 py-10 lg:px-12">{children}</main></div></div>;
}
