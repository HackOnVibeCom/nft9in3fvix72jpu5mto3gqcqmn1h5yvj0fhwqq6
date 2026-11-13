"use client";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Github, Loader2, LogOut } from "lucide-react";
import { Button } from "./ui/button";
export function GitHubSignIn({ disabled = false }: { disabled?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return <><Button className="w-full" size="lg" disabled={disabled || pending} onClick={async () => { setPending(true); setError(false); try { await signIn("github", { callbackUrl: "/dashboard" }); } catch { setError(true); setPending(false); } }}>{pending ? <Loader2 className="animate-spin" size={18} /> : <Github size={18} />}{pending ? "Connecting to GitHub…" : "Sign in with GitHub"}</Button>{error && <p role="alert" className="mt-3 text-sm text-red-300">Could not connect. Please try again.</p>}</>;
}
export function SignOutButton() {
  return <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={16} />Sign out</Button>;
}
