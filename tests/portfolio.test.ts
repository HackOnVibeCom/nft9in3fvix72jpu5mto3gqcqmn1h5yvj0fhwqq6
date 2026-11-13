import { describe, expect, it, vi } from "vitest";
import { Prisma, type PrismaClient } from "@prisma/client";
import { ensurePortfolio } from "../src/lib/portfolio";
const collision = () => new Prisma.PrismaClientKnownRequestError("collision", { code: "P2002", clientVersion: "6.19.3" });
function store() {
  const findUnique = vi.fn(); const create = vi.fn();
  return { findUnique, create, db: { portfolio: { findUnique, create } } as unknown as Pick<PrismaClient, "portfolio"> };
}
describe("portfolio initialization", () => {
  it("returns existing portfolio without modifying it", async () => {
    const s = store(); const existing = { id: "p", published: false }; s.findUnique.mockResolvedValue(existing);
    expect(await ensurePortfolio(s.db, { id: "u" })).toBe(existing); expect(s.create).not.toHaveBeenCalled();
  });
  it("creates an unpublished default", async () => {
    const s = store(); s.findUnique.mockResolvedValue(null); s.create.mockImplementation(({ data }) => data);
    expect(await ensurePortfolio(s.db, { id: "u", name: "Jane", githubUsername: "jane-dev" })).toMatchObject({ userId: "u", slug: "jane-dev", displayName: "Jane", published: false, headline: "", biography: "" });
  });
  it("retries slug collisions with a safe suffix", async () => {
    const s = store(); s.findUnique.mockResolvedValue(null); s.create.mockRejectedValueOnce(collision()).mockImplementationOnce(({ data }) => data);
    expect((await ensurePortfolio(s.db, { id: "u", name: "Jane" })).slug).toMatch(/^jane-[a-f0-9]{8}$/);
  });
  it("handles concurrent creation for the same user", async () => {
    const s = store(); const winner = { id: "winner" }; s.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(winner); s.create.mockRejectedValueOnce(collision());
    expect(await ensurePortfolio(s.db, { id: "u" })).toBe(winner);
  });
  it("propagates database failures", async () => {
    const s = store(); s.findUnique.mockResolvedValue(null); s.create.mockRejectedValue(new Error("offline"));
    await expect(ensurePortfolio(s.db, { id: "u" })).rejects.toThrow("offline");
  });
  it("bounds collision retries", async () => {
    const s = store(); s.findUnique.mockResolvedValue(null); s.create.mockRejectedValue(collision());
    await expect(ensurePortfolio(s.db, { id: "u" })).rejects.toThrow("unique portfolio slug"); expect(s.create).toHaveBeenCalledTimes(5);
  });
});
