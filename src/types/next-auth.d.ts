import type { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface User { githubUsername?: string | null }
  interface Session { user: { id: string; githubUsername?: string | null } & DefaultSession["user"] }
}
