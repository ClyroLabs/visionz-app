export type Rating = "L" | "10" | "12" | "14" | "16" | "18";

export const KIDS_ALLOWED: Rating[] = ["L", "10"];

export function isAllowedForKids(rating: Rating) {
  return KIDS_ALLOWED.includes(rating);
}

export function filterCatalog<T extends { rating: Rating }>(items: T[], kidsMode: boolean) {
  return kidsMode ? items.filter((i) => isAllowedForKids(i.rating)) : items;
}

/** Withdraws from balance; refuses amounts that are non-positive or exceed the balance. */
export function redeem(balance: number, amount: number): { ok: boolean; balance: number } {
  if (!(amount > 0) || amount > balance) return { ok: false, balance };
  return { ok: true, balance: Math.round((balance - amount) * 100) / 100 };
}

/** Example-only compound growth of $VZN rewards (monthly compounding). Negative inputs count as zero. */
export function rewardsExample(amount: number, months: number, yearlyPct: number): { final: number; gain: number } {
  const a = Math.max(0, amount || 0), m = Math.max(0, Math.floor(months || 0)), r = Math.max(0, yearlyPct || 0) / 100 / 12;
  const final = Math.round(a * Math.pow(1 + r, m) * 100) / 100;
  return { final, gain: Math.round((final - a) * 100) / 100 };
}

/** Monthly revenue ramp (R$) from the Technical Specification v2.4: years 1–3. */
export const BASE_MONTHLY_REVENUE: number[] = [
  ...Array.from({ length: 12 }, (_, i) => 100_000 + i * 30_000),
  ...Array.from({ length: 12 }, (_, i) => 500_000 + i * 260_000),
  ...Array.from({ length: 12 }, (_, i) => 4_000_000 + i * 900_000),
];
export const SCENARIOS = { base: 1, conservador: 0.5, agressivo: 2 } as const;

/** Buyback & burn: S(t+1) = S(t) − (α·R/P + β·V_ai), with V_ai = 30% of revenue in $VZN. */
export function burnSimulation({ alpha, beta, price, multiplier = 1, supply = 1_000_000_000 }: { alpha: number; beta: number; price: number; multiplier?: number; supply?: number }) {
  let s = supply, burned = 0, buyback = 0;
  const series = [{ month: 0, supply: s / 1e6 }];
  if (!(price > 0)) return { series, burned: 0, buyback: 0, finalSupply: s, pct: 0 };
  BASE_MONTHLY_REVENUE.forEach((rev, m) => {
    const r = rev * multiplier, fiat = r * alpha;
    const b = fiat / price + ((r * 0.3) / price) * beta;
    buyback += fiat; burned += b; s -= b;
    series.push({ month: m + 1, supply: s / 1e6 });
  });
  return { series, burned, buyback, finalSupply: s, pct: (burned / supply) * 100 };
}
