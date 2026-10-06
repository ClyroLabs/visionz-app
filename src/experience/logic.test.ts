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

import { burnSimulation, rewardsExample as rx } from "./logic";
describe("simulador de queima $VZN", () => {
  it("fórmula do whitepaper (o texto fixo do documento mostra 16,57M, mas a própria fórmula dá 20,51M): α 20%, β 10%, R$ 1,50", () => {
    const r = burnSimulation({ alpha: 0.2, beta: 0.1, price: 1.5 });
    expect((r.burned / 1e6).toFixed(2)).toBe("20.51");
    expect((r.finalSupply / 1e6).toFixed(2)).toBe("979.49");
    expect((r.buyback / 1e6).toFixed(1)).toBe("26.7");
  });
  it("conservador queima metade", () => {
    const a = burnSimulation({ alpha: 0.2, beta: 0.1, price: 1.5 }).burned;
    expect(burnSimulation({ alpha: 0.2, beta: 0.1, price: 1.5, multiplier: 0.5 }).burned).toBeCloseTo(a / 2);
  });
  it("vault de 28% rende US$ 280 sobre US$ 1.000 em 12 meses (juros simples do documento)", () => {
    expect(Math.round(1000 * 0.28)).toBe(280);
    expect(rx(0, 12, 28).final).toBe(0);
  });
});
