"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-lg px-6 py-24"><h1 className="text-2xl font-semibold">Your workspace couldn’t load.</h1><p className="my-5 text-sm leading-6 text-zinc-400">Please try again. If this continues, the app owner may need to check database configuration.</p><Button onClick={reset}>Try again</Button></div>;
}
