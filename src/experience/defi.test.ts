import { describe, expect, it } from "vitest";
import { aiBurn, bridgeQuote, clampMaxLoss, healthFactor, isLiquidatable, kodaReward, lockPrice, maxBorrow, safetyScore, shock, splitCreditFees } from "./defi";

describe("defi demo rules", () => {
  it("eMode caps LTV at 90%", () => {
    expect(maxBorrow(1000, { ltv: 0.6, eModeLtv: 0.95 }, true)).toBeCloseTo(900);
    expect(maxBorrow(1000, { ltv: 0.6, eModeLtv: 0.95 }, false)).toBeCloseTo(600);
  });
  it("health below 1 is liquidatable", () => {
    expect(isLiquidatable(healthFactor(10, 100, 0.8, 900))).toBe(true);
    expect(isLiquidatable(healthFactor(10, 100, 0.8, 700))).toBe(false);
  });
  it("credit fees split 50% burn / 50% stakers", () => {
    expect(splitCreditFees(1000)).toEqual({ burn: 500, stakers: 500 });
  });
  it("AI tool usage burns 10%", () => {
    expect(aiBurn(250)).toBe(25);
  });
  it("mint authority lowers the safety score", () => {
    const base = { top10: 0.2, lockedLiquidity: 0.9, mintAuth: false, freezeAuth: false };
    expect(safetyScore(base).score).toBe(100);
    expect(safetyScore({ ...base, mintAuth: true }).score).toBe(80);
  });
  it("anti-loss limit never exceeds 50%", () => {
    expect(clampMaxLoss(0.8)).toBe(0.5);
    expect(clampMaxLoss(0.2)).toBe(0.2);
  });
  it("anti-loss lock closes the position when loss reaches the limit", () => {
    const p = { collateral: 10, price: 100, debt: 300, liq: 0.85, maxLoss: 0.2 };
    expect(shock(p, -0.1).autoClosed).toBe(false); // equity 700→600 = 14% loss
    expect(shock(p, -0.3).autoClosed).toBe(true); // 700→400 = 43% loss
    expect(lockPrice(p)).toBeCloseTo(86);
  });
  it("bridge quote: 0.1% fee and no same-chain transfers", () => {
    expect(bridgeQuote(1000, "solana", "base")).toMatchObject({ ok: true, receive: 999, fee: 1 });
    expect(bridgeQuote(1000, "base", "base").ok).toBe(false);
  });
  it("koda pays per lesson plus completion bonus", () => {
    const t = { lessons: 4, perLesson: 10, bonus: 50 };
    expect(kodaReward(t, 2)).toBe(20);
    expect(kodaReward(t, 4)).toBe(90);
  });
});
