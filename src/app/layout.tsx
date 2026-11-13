import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "SkillLoop — Your code. Your proof.", template: "%s | SkillLoop" }, description: "Turn real GitHub projects into an evidence-backed developer portfolio. SkillLoop starts with the work you've already done." };
export const runtime = "nodejs";
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
