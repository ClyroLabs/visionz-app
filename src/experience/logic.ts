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
