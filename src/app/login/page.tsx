import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { GitHubSignIn } from "@/components/auth-buttons";
import { isAuthConfigured } from "@/lib/auth";
export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";
const errors: Record<string, string> = {
  Configuration: "Sign-in is not available yet. The app owner needs to finish authentication setup.",
  OAuthAccountNotLinked: "This email is already linked to another account. Use the GitHub account you originally signed in with.",
  AccessDenied: "Access was not granted. Please try signing in again.",
  OAuthSignin: "Could not connect to GitHub. Please try again.",
  OAuthCallback: "GitHub sign-in could not be completed. Please try again.",
};
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = isAuthConfigured();
  return <div className="flex min-h-screen flex-col"><header className="mx-auto w-full max-w-7xl px-6 py-7 lg:px-12"><Brand /></header><main className="flex flex-1 items-center justify-center px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white"><ArrowLeft size={14} />Back to home</Link><div className="rounded-2xl border border-zinc-800 bg-surface/60 p-8 sm:p-10"><div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10"><ShieldCheck className="text-accent" size={25} /></div><p className="mb-2 text-xs text-accent">YOUR NEXT CHAPTER</p><h1 className="text-3xl font-semibold tracking-tight">Welcome to SkillLoop.</h1><p className="mb-8 mt-3 text-sm leading-6 text-zinc-400">Your best work is already on GitHub.<br />Let’s give it a place to shine.</p>{(!configured || error) && <p role="alert" className="mb-5 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm leading-6 text-amber-200">{!configured ? errors.Configuration : errors[error!] || "Sign-in could not be completed. Please try again."}</p>}<GitHubSignIn disabled={!configured} /><div className="mt-7 space-y-3 border-t border-zinc-800 pt-6">{["Secure sign-in through GitHub", "No private repository access", "Your portfolio starts unpublished"].map(text => <p key={text} className="flex items-center gap-2.5 text-xs text-zinc-500"><Check size={13} className="text-accent" />{text}</p>)}</div></div><p className="mt-6 text-center text-xs text-zinc-600">Built around your work. Always under your control.</p></div></main></div>;
}
