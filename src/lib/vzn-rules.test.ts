import { describe, expect, it } from "vitest";
import { creditWatch, decideClaim, isCompleted, type ClaimState } from "./vzn-rules";

const base: ClaimState = { kids: false, wallet: "W", claimedKeys: [], earnedToday: 0, poolToday: 0, titleSeconds: 600, totalSecondsToday: 1800, completedToday: 1, day: "2026-10-09" };

describe("devnet $VZN claims", () => {
  it("kids profiles never receive $VZN", () => {
    expect(decideClaim({ kind: "missao", mission: "assistir30" }, { ...base, kids: true }).ok).toBe(false);
  });
  it("requires a linked wallet", () => {
    expect(decideClaim({ kind: "missao", mission: "assistir30" }, { ...base, wallet: null }).ok).toBe(false);
  });
  it("caps at 5 $VZN per day", () => {
    const r = decideClaim({ kind: "missao", mission: "assistir30" }, { ...base, earnedToday: 4.8 });
    expect(r.ok && r.amount).toBe(0.2);
    expect(decideClaim({ kind: "missao", mission: "assistir30" }, { ...base, earnedToday: 5 }).ok).toBe(false);
  });
  it("rejects duplicate claims", () => {
    expect(decideClaim({ kind: "conclusao", titleRef: "t1" }, { ...base, claimedKeys: ["conclusao:t1"] }).ok).toBe(false);
  });
  it("completion pays 0.5 only at 80% watched", () => {
    expect(isCompleted(479)).toBe(false);
    expect(isCompleted(480)).toBe(true);
    const r = decideClaim({ kind: "conclusao", titleRef: "t1" }, base);
    expect(r.ok && r.amount).toBe(0.5);
    expect(decideClaim({ kind: "conclusao", titleRef: "t1" }, { ...base, titleSeconds: 300 }).ok).toBe(false);
  });
  it("watch mission needs 30 minutes", () => {
    expect(decideClaim({ kind: "missao", mission: "assistir30" }, { ...base, totalSecondsToday: 1740 }).ok).toBe(false);
  });
  it("ignores watch reports sent too fast", () => {
    expect(creditWatch(60, 1000, 2000)).toBe(60);
    expect(creditWatch(60, 1000, 4000)).toBe(120);
  });
});
