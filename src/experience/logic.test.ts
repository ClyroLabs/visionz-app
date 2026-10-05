import { describe, expect, it } from "vitest";
import { filterCatalog, isAllowedForKids, redeem } from "./logic";

describe("modo infantil", () => {
  it("libera só L e 10", () => {
    expect(isAllowedForKids("L")).toBe(true);
    expect(isAllowedForKids("10")).toBe(true);
    expect(isAllowedForKids("12")).toBe(false);
    expect(isAllowedForKids("18")).toBe(false);
  });
  it("filtra o catálogo", () => {
    const items = [{ rating: "L" as const }, { rating: "14" as const }, { rating: "10" as const }];
    expect(filterCatalog(items, true)).toHaveLength(2);
    expect(filterCatalog(items, false)).toHaveLength(3);
  });
});

describe("resgate", () => {
  it("não deixa o saldo negativo", () => {
    expect(redeem(100, 150)).toEqual({ ok: false, balance: 100 });
  });
  it("desconta valor válido", () => {
    expect(redeem(100, 40)).toEqual({ ok: true, balance: 60 });
  });
  it("recusa valor zero ou negativo", () => {
    expect(redeem(100, 0).ok).toBe(false);
    expect(redeem(100, -5).ok).toBe(false);
  });
});

import { rewardsExample } from "./logic";
describe("rewardsExample", () => {
  it("compounds monthly: 1000 at 12%/yr for 12 months", () => {
    expect(rewardsExample(1000, 12, 12).final).toBe(1126.83);
  });
  it("never goes negative", () => {
    expect(rewardsExample(-50, 6, 5)).toEqual({ final: 0, gain: 0 });
  });
});
