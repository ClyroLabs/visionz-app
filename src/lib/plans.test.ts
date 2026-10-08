import { describe, expect, it } from "vitest";
import { FEATURES, LIMITS, PLANS, PLAN_IDS, canUse, cheapestPlanFor, resolutionAllowed } from "./plans";

describe("plans", () => {
  it("no plan is unlimited", () => { for (const p of PLAN_IDS) for (const f of FEATURES) expect(Number.isFinite(LIMITS[p][f])).toBe(true); });
  it("no plan unlocks everything except within caps, and free has no clips or APIs", () => {
    expect(LIMITS.free.synth_clip).toBe(0);
    expect(LIMITS.free.api_call).toBe(0);
  });
  it("only Criador Pro has APIs and 8K", () => {
    expect(PLAN_IDS.filter((p) => LIMITS[p].api_call > 0)).toEqual(["creator_pro"]);
    expect(PLAN_IDS.filter((p) => resolutionAllowed(p, "8K"))).toEqual(["creator_pro"]);
  });
  it("clips start at Family", () => expect(cheapestPlanFor("synth_clip")).toBe("family"));
  it("refuses once the count reaches the limit", () => {
    expect(canUse("premium", "synth_image", 39)).toBe(true);
    expect(canUse("premium", "synth_image", 40)).toBe(false);
  });
  it("screens per plan", () => expect([PLANS.free.screens, PLANS.premium.screens, PLANS.family.screens, PLANS.creator_pro.screens]).toEqual([1, 2, 4, 2]));
});
