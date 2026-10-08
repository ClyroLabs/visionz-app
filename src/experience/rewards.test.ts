import { describe, expect, it } from "vitest";
import { applyDailyCap, emissionFor, levelFor, missionReward, prorate, eligibleWatch, MONTHLY_BUDGET } from "./rewards";

describe("rewards economy", () => {
  it("caps $VZN at 5 per day", () => {
    expect(applyDailyCap(4, 2).granted).toBe(1);
    expect(applyDailyCap(5, 1).granted).toBe(0);
  });
  it("pays the 7-day streak bonus outside the cap", () => {
    expect(applyDailyCap(5, 5, { source: "sequencia" }).granted).toBe(5);
  });
  it("gives kids profiles no $VZN", () => {
    expect(applyDailyCap(0, 1, { kids: true }).granted).toBe(0);
  });
  it("applies level multipliers 1.0/1.1/1.2/1.3", () => {
    expect([0, 500, 2000, 6000].map(missionReward)).toEqual([1, 1.1, 1.2, 1.3]);
    expect(levelFor(1999).name).toBe("Prata");
  });
  it("reduces rewards 15% each semester", () => {
    expect(emissionFor(6)).toBe(1);
    expect(emissionFor(7)).toBeCloseTo(0.85);
    expect(emissionFor(13)).toBeCloseTo(0.7225);
  });
  it("prorates when requests exceed the monthly budget", () => {
    expect(prorate(MONTHLY_BUDGET * 2)).toBeCloseTo(0.5);
    expect(prorate(100)).toBe(1);
  });
  it("ignores muted, hidden or repeated watching", () => {
    expect(eligibleWatch({ muted: true, hidden: false, repeat: false })).toBe(false);
    expect(eligibleWatch({ muted: false, hidden: false, repeat: false })).toBe(true);
  });
});
