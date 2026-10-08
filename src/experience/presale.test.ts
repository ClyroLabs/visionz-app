import { describe, expect, it } from "vitest";
import { LP_PROJECTS } from "./launchpad-data";
import { MAX_USD, payTokens, quote, releaseSchedule, validate } from "./presale";

const p = { ...LP_PROJECTS.find((x) => x.status === "Captação")!, priceUsd: 0.05, raised: 0, goal: 100_000 };
const usdc = payTokens(p.network)[1];

describe("presale", () => {
  it("quotes tokens from USD / price", () => expect(quote(p, usdc, 100).tokens).toBe(2000));
  it("rejects below US$ 10", () => expect(validate(p, quote(p, usdc, 5), 5, 1000)).toBe("min"));
  it("rejects above per-person max", () => expect(validate(p, quote(p, usdc, MAX_USD + 1), MAX_USD + 1, 1e9)).toBe("max"));
  it("rejects insufficient balance", () => expect(validate(p, quote(p, usdc, 100), 100, 50)).toBe("balance"));
  it("rejects when round is full", () => {
    const full = { ...p, raised: 100_000 };
    expect(validate(full, quote(full, usdc, 100), 100, 1000)).toBe("full");
  });
  it("rejects closed rounds", () => expect(validate({ ...p, status: "Ativo" }, quote(p, usdc, 100), 100, 1000)).toBe("closed"));
  it("release schedule sums to all tokens, 20% at TGE", () => {
    const r = releaseSchedule({ ...p, vestingMonths: 6 }, 10_001);
    expect(r.reduce((s, x) => s + x.tokens, 0)).toBe(10_001);
    expect(r[0].tokens).toBe(2000);
    expect(r).toHaveLength(7);
  });
});
