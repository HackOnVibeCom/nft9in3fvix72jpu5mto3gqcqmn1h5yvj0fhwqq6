import Link from "next/link";
import { Command } from "lucide-react";
export function Brand() {
  return <Link href="/" aria-label="SkillLoop home" className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight"><span className="flex size-8 items-center justify-center rounded-lg bg-primary"><Command size={20} strokeWidth={2.5} /></span>SkillLoop<span className="ml-1 rounded border border-zinc-700 px-1.5 py-0.5 text-[9px] font-medium tracking-widest text-zinc-400">BETA</span></Link>;
}
