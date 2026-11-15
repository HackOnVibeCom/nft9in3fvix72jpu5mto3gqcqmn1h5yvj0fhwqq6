import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ value: undefined as string | undefined, options: undefined as unknown, portfolio: { id: "p1", userId: "owner", published: true, publishedSlug: "jane" } as null | { id: string; userId: string; published: boolean; publishedSlug: string | null }, create: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => state.value ? { value: state.value } : undefined, set: (_key: string, value: string, options: unknown) => { state.value = value || undefined; state.options = options; } }) }));
vi.mock("../src/lib/db", () => ({ getDb: () => ({ portfolio: { findUnique: async () => state.portfolio }, referralConversion: { create: state.create } }) }));
import { consumeReferralForSignIn, referralValidationStatus, signReferral, verifyReferral } from "../src/lib/referrals";
beforeEach(() => { state.value = undefined; state.options = undefined; state.portfolio = { id: "p1", userId: "owner", published: true, publishedSlug: "jane" }; state.create.mockReset().mockResolvedValue({}); vi.stubEnv("NEXTAUTH_SECRET", "test-referral-secret"); });
describe("referral attribution", () => {
  it("signs stable identifiers, rejects tampering and rejects signed expired values", () => {
    const signed = signReferral("code-123");
    expect(verifyReferral(signed)).toBe("code-123");
    expect(verifyReferral(signed.replace("code-123", "code-456"))).toBeNull();
    expect(verifyReferral(signReferral("code-123", Math.floor(Date.now() / 1000) - 1))).toBeNull();
    expect(verifyReferral("code-123.invalid")).toBeNull();
  });
  it("validates UUID referral codes without changing them", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const signed = signReferral(uuid);
    expect(referralValidationStatus(signed)).toBe("valid");
    expect(verifyReferral(signed)).toBe(uuid);
  });
  it("records attribution only for a new user and clears it after successful sign-in", async () => {
    state.value = signReferral("code-123");
    await consumeReferralForSignIn("new-user", true);
    expect(state.create).toHaveBeenCalledWith({ data: { portfolioId: "p1", referredUserId: "new-user" } });
    expect(state.value).toBeUndefined();
    expect(state.options).toMatchObject({ maxAge: 0, httpOnly: true, sameSite: "lax" });
  });
  it("clears stale attribution for existing users without recording a conversion", async () => {
    state.value = signReferral("code-123");
    await consumeReferralForSignIn("existing-user", false);
    expect(state.create).not.toHaveBeenCalled();
    expect(state.value).toBeUndefined();
  });
  it("does not record self-referrals, invalid cookies, or unpublished portfolios", async () => {
    state.value = signReferral("code-123");
    await consumeReferralForSignIn("owner", true);
    expect(state.create).not.toHaveBeenCalled();
    state.value = signReferral("code-123");
    state.portfolio = { ...state.portfolio!, published: false };
    await consumeReferralForSignIn("new-user", true);
    expect(state.create).not.toHaveBeenCalled();
    state.value = "tampered";
    state.portfolio = { ...state.portfolio!, published: true };
    await consumeReferralForSignIn("another-user", true);
    expect(state.create).not.toHaveBeenCalled();
  });
  it("treats duplicate conversion conflicts as idempotent and clears the cookie", async () => {
    state.value = signReferral("code-123");
    state.create.mockRejectedValue({ code: "P2002" });
    await expect(consumeReferralForSignIn("new-user", true)).resolves.toBeUndefined();
    expect(state.value).toBeUndefined();
  });
  it("treats concurrent conversion attempts as idempotent", async () => {
    state.value = signReferral("code-123");
    state.create.mockResolvedValueOnce({}).mockRejectedValueOnce({ code: "P2002" });
    await expect(Promise.all([consumeReferralForSignIn("same-user", true), consumeReferralForSignIn("same-user", true)])).resolves.toHaveLength(2);
    expect(state.create).toHaveBeenCalledTimes(2);
  });
  it("clears attribution after a storage failure so it cannot be misapplied later", async () => {
    state.value = signReferral("code-123");
    state.create.mockRejectedValue(new Error("database unavailable"));
    await expect(consumeReferralForSignIn("new-user", true)).rejects.toThrow("database unavailable");
    expect(state.value).toBeUndefined();
  });
});
