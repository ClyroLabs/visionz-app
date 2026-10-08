import { describe, expect, it } from "vitest";
import { LP_PROJECTS, filterProjects, marketCap, progressPct } from "./launchpad-data";

describe("launchpad demo data", () => {
  it("covers Solana, Base, Arbitrum and Ethereum", () => {
    expect(new Set(LP_PROJECTS.map((p) => p.network))).toEqual(new Set(["solana", "base", "arbitrum", "ethereum"]));
  });
  it("allocations always sum to 100%", () => {
    for (const p of LP_PROJECTS) { const a = p.allocation; expect(a.community + a.team + a.treasury + a.liquidity).toBe(100); }
  });
  it("progress caps at 100 and handles zero goal", () => {
    expect(progressPct({ raised: 150, goal: 100 })).toBe(100);
    expect(progressPct({ raised: 50, goal: 200 })).toBe(25);
    expect(progressPct({ raised: 5, goal: 0 })).toBe(0);
  });
  it("market cap = circulating × price", () => {
    expect(marketCap({ circulating: 1000, priceUsd: 0.5 })).toBe(500);
  });
  it("filters by network and sorts by raised", () => {
    const r = filterProjects(LP_PROJECTS, { network: "base", sort: "captado" });
    expect(r.every((p) => p.network === "base")).toBe(true);
    expect(r[0].raised).toBeGreaterThanOrEqual(r[r.length - 1].raised);
  });
});
