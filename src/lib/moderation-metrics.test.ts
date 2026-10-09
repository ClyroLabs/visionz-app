import { describe, expect, it } from "vitest";
import { hiddenForKids, overturnRate } from "./moderation-metrics";

describe("moderation metrics", () => {
  it("reports insufficient data under 30 decisions", () => {
    expect(overturnRate(Array(29).fill({ aiAllowed: true, humanAllowed: true }))).toBeNull();
  });
  it("computes overturn share from 30 decisions", () => {
    const pairs = [...Array(27).fill({ aiAllowed: true, humanAllowed: true }), ...Array(3).fill({ aiAllowed: true, humanAllowed: false })];
    expect(overturnRate(pairs)).toBe(10);
  });
  it("hides a reported title only for kids profiles", () => {
    const r = new Set(["t1"]);
    expect(hiddenForKids("t1", true, r)).toBe(true);
    expect(hiddenForKids("t1", false, r)).toBe(false);
    expect(hiddenForKids("t2", true, r)).toBe(false);
  });
});
