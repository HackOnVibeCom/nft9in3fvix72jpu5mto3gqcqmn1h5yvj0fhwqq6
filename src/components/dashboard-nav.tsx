"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderGit2, LayoutDashboard, UserRound } from "lucide-react";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/projects", icon: FolderGit2, label: "Projects" },
  { href: "/dashboard/portfolio", icon: UserRound, label: "Portfolio" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto md:flex-col">{items.map(({ href, icon: Icon, label }) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 py-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300 ${active ? "bg-indigo-400/10 text-indigo-100" : "text-zinc-300 hover:bg-surface hover:text-white"}`}><Icon size={17} aria-hidden="true" />{label}</Link>;
  })}</nav>;
}
