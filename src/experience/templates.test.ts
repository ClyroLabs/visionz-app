import { describe, expect, it } from "vitest";
import { splitValid, stakingProjection, vestingSchedule } from "./templates";

describe("contract templates", () => {
  it("vesting releases nothing before the cliff and 100% at the end", () => {
    const s = vestingSchedule(6, 24);
    expect(s[5]).toBe(0);
    expect(s[6]).toBe(25);
    expect(s[24]).toBe(100);
  });
  it("staking compounds monthly", () => {
    expect(stakingProjection(12, 12).at(-1)).toBe(1126.83);
  });
  it("royalty splits must add up to 100%", () => {
    expect(splitValid([60, 30, 10])).toBe(true);
    expect(splitValid([60, 30, 20])).toBe(false);
  });
});
