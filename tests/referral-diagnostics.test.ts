import { afterEach, describe, expect, it, vi } from "vitest";
import { referralCodeShape, referralDiagnostic, referralErrorCategory } from "../src/lib/referral-diagnostics";

afterEach(() => vi.unstubAllEnvs());

describe("referral runtime diagnostics", () => {
  it("writes structured stage data only in development", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    referralDiagnostic("sign_in_referral", { cookiePresent: true });
    expect(info).not.toHaveBeenCalled();
    vi.stubEnv("NODE_ENV", "development");
    referralDiagnostic("sign_in_referral", { cookiePresent: true });
    expect(info).toHaveBeenCalledWith(JSON.stringify({ scope: "skillloop.referral", stage: "sign_in_referral", cookiePresent: true }));
    info.mockRestore();
  });

  it("classifies UUID-shaped codes without exposing their values", () => {
    expect(referralCodeShape("550e8400-e29b-41d4-a716-446655440000")).toBe("uuid");
    expect(referralCodeShape("portfolio-cuid-123")).toBe("slug-like");
  });

  it("limits exception output to safe categories", () => {
    expect(referralErrorCategory({ code: "P2002", message: "sensitive database detail" })).toBe("P2002");
    expect(referralErrorCategory(new Error("sensitive value"))).toBe("Error");
    expect(referralErrorCategory(new Error("cookies() request store unavailable"))).toBe("NextRequestContextUnavailable");
  });
});
