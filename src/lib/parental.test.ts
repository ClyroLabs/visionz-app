import { describe, expect, it } from "vitest";
import { attempt, averageDescriptors, isFaceMatch, LOCK_MS, purchaseNeedsApproval, ratingAllowed, screenTimeLeft } from "./parental";

const base = Array.from({ length: 128 }, (_, i) => (i % 7) / 10);

describe("parental control", () => {
  it("matches the same face below the 0.5 distance", () => {
    expect(isFaceMatch(base, base.map((v) => v + 0.02))).toBe(true);
  });
  it("rejects a different face", () => {
    expect(isFaceMatch(base, base.map((v) => v + 0.1))).toBe(false);
  });
  it("averages samples", () => {
    expect(averageDescriptors([[0, 2], [2, 4]])).toEqual([1, 3]);
  });
  it("locks for 5 minutes after 3 failed attempts", () => {
    let s = { failed: 0, lockedUntil: null as number | null };
    for (let i = 0; i < 3; i++) s = attempt(s, false, 1000);
    expect(s.lockedUntil).toBe(1000 + LOCK_MS);
    expect(attempt(s, true, 2000).allowed).toBe(false);
    expect(attempt(s, true, 1000 + LOCK_MS + 1).allowed).toBe(true);
  });
  it("filters ratings by each child's maximum", () => {
    expect(ratingAllowed("10", "10")).toBe(true);
    expect(ratingAllowed("12", "10")).toBe(false);
  });
  it("stops at the daily screen-time limit", () => {
    expect(screenTimeLeft(60, 60)).toBe(0);
    expect(screenTimeLeft(20, 60)).toBe(40);
  });
  it("kids-profile purchases need parent approval", () => {
    expect(purchaseNeedsApproval(true)).toBe(true);
  });
});
