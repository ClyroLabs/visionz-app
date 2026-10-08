// Presale contribution simulator — pure logic. Example values only, no real funds.
import type { LaunchProject, LpNetwork } from "./launchpad-data";

export type PayToken = { symbol: string; usd: number; kind: "internal" | "stable" | "native" };
export const VZN_USD = 0.045; // 1 VZN = R$ 0,25 ≈ US$ 0,045 (exemplo)
export const NATIVE: Record<LpNetwork, PayToken> = {
  solana: { symbol: "SOL", usd: 150, kind: "native" },
  base: { symbol: "ETH", usd: 3000, kind: "native" },
  arbitrum: { symbol: "ETH", usd: 3000, kind: "native" },
  ethereum: { symbol: "ETH", usd: 3000, kind: "native" },
};
export const NET_FEE_USD: Record<LpNetwork, number> = { solana: 0.01, base: 0.05, arbitrum: 0.05, ethereum: 2 };
export const MIN_USD = 10;
export const MAX_USD = 5000;
export const VESTING_TGE = 0.2; // 20% liberado no lançamento

export function payTokens(n: LpNetwork): PayToken[] {
  return [{ symbol: "VZN", usd: VZN_USD, kind: "internal" }, { symbol: "USDC", usd: 1, kind: "stable" }, NATIVE[n]];
}

/** Simulated wallet balance (in token units), stable per address. */
export function demoBalance(address: string, t: PayToken): number {
  const seed = Array.from(address + t.symbol).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const usd = 300 + (seed % 2700); // US$ 300–3000
  return +(usd / t.usd).toFixed(t.usd > 100 ? 4 : 2);
}

export type Quote = { usd: number; fee: number; tokens: number; remaining: number; maxUsd: number };
export function quote(p: LaunchProject, t: PayToken, amount: number, alreadyUsd = 0, raisedExtra = 0): Quote {
  const usd = Math.max(0, amount) * t.usd;
  const remaining = Math.max(0, p.goal - p.raised - raisedExtra);
  return { usd, fee: NET_FEE_USD[p.network], tokens: Math.floor(usd / p.priceUsd), remaining, maxUsd: Math.min(MAX_USD - alreadyUsd, remaining) };
}

export type PresaleError = "closed" | "min" | "max" | "full" | "balance" | null;
export function validate(p: LaunchProject, q: Quote, amount: number, balance: number): PresaleError {
  if (p.status !== "Captação") return "closed";
  if (q.remaining <= 0) return "full";
  if (q.usd < MIN_USD) return "min";
  if (q.usd > q.maxUsd) return q.maxUsd < MAX_USD && q.maxUsd === q.remaining ? "full" : "max";
  if (amount > balance) return "balance";
  return null;
}

export type Release = { label: string; date: string; tokens: number };
export function releaseSchedule(p: LaunchProject, tokens: number): Release[] {
  const months = Math.max(1, Math.min(12, p.vestingMonths));
  const tge = Math.floor(tokens * VESTING_TGE);
  const rest = tokens - tge;
  const each = Math.floor(rest / months);
  const out: Release[] = [{ label: "Lançamento (TGE)", date: p.launch, tokens: tge }];
  const d0 = new Date(p.launch + "T00:00:00Z");
  for (let i = 1; i <= months; i++) {
    const d = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + i, d0.getUTCDate()));
    out.push({ label: `Mês ${i}`, date: d.toISOString().slice(0, 10), tokens: i === months ? rest - each * (months - 1) : each });
  }
  return out;
}

export type Allocation = {
  id: string; projectId: string; projectName: string; symbol: string; network: LpNetwork;
  pay: string; amount: number; usd: number; fee: number; tokens: number; tx: string; wallet: string; at: string;
};
const KEY = "vz-presale";
export function loadAllocations(): Allocation[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function saveAllocation(a: Allocation) {
  const all = [a, ...loadAllocations()];
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("vz-presale"));
}
export const raisedBy = (all: Allocation[], id: string) => all.filter((a) => a.projectId === id).reduce((s, a) => s + a.usd, 0);
