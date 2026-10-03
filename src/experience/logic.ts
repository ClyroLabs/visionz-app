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
