import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(() => { throw new Error("REDIRECT"); }) }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: vi.fn(), getAuthOptions: vi.fn(() => ({})) }));
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAuthConfigured } from "../src/lib/auth";
import { requireUser } from "../src/lib/session";
beforeEach(() => vi.clearAllMocks());
describe("dashboard authorization", () => {
  it("redirects before initializing services if unconfigured", async () => { vi.mocked(isAuthConfigured).mockReturnValue(false); await expect(requireUser()).rejects.toThrow("REDIRECT"); expect(getServerSession).not.toHaveBeenCalled(); expect(redirect).toHaveBeenCalledWith("/login"); });
  it("redirects unauthenticated visitors", async () => { vi.mocked(isAuthConfigured).mockReturnValue(true); vi.mocked(getServerSession).mockResolvedValue(null); await expect(requireUser()).rejects.toThrow("REDIRECT"); expect(redirect).toHaveBeenCalledWith("/login"); });
  it("returns the authenticated database user", async () => { vi.mocked(isAuthConfigured).mockReturnValue(true); const user = { id: "u", name: "Jane" }; vi.mocked(getServerSession).mockResolvedValue({ user, expires: "2099-01-01" }); expect(await requireUser()).toBe(user); });
});
