export type ConvertDir = "fiat-to-vzn" | "vzn-to-fiat";
export type VznChain = "solana" | "base" | "arbitrum" | "ethereum";
export type FiatCurrency = "BRL" | "USD" | "EUR" | "CNY";
export type FiatRail = "pix" | "ted";

/** Taxa de exemplo: 1 VZN = R$ 0,25. */
export const VZN_RATE_BRL = 0.25;
export const CONVERT_FEE = 0.01;
export const MIN_CONVERT_VZN = 1;
export const MIN_CONVERT_BRL = 5;
export const MIN_WITHDRAW_BRL = 50;
export const RAIL_FEE: Record<FiatRail, number> = { pix: 0, ted: 3.5 };
export const MIN_WITHDRAW_VZN = 10;
export const CHAIN_FEE: Record<VznChain, number> = { solana: 0.01, base: 0.05, arbitrum: 0.05, ethereum: 2 };
export const FX: Record<FiatCurrency, number> = { BRL: 1, USD: 0.18, EUR: 0.17, CNY: 1.3 };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function quote(dir: ConvertDir, amount: number, rate = VZN_RATE_BRL) {
  const fee = r2(amount * CONVERT_FEE);
  const net = amount - fee;
  const receive = dir === "fiat-to-vzn" ? r2(net / rate) : r2(net * rate);
  return { fee, receive };
}

export function validateConvert(dir: ConvertDir, amount: number, balance: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Informe um valor.";
  const min = dir === "fiat-to-vzn" ? MIN_CONVERT_BRL : MIN_CONVERT_VZN;
  if (amount < min) return dir === "fiat-to-vzn" ? "Mínimo de R$ 5,00." : "Mínimo de 1 VZN.";
  if (amount > balance) return "Saldo insuficiente.";
  return null;
}

export function withdrawFiat(amountBrl: number, rail: FiatRail, currency: FiatCurrency, balance: number) {
  const fee = RAIL_FEE[rail];
  let error: string | null = null;
  if (!Number.isFinite(amountBrl) || amountBrl < MIN_WITHDRAW_BRL) error = "Mínimo de R$ 50,00.";
  else if (amountBrl + fee > balance) error = "Saldo insuficiente.";
  return { fee, total: r2(amountBrl + fee), received: r2(amountBrl * FX[currency]), error };
}

export function validateWithdrawVzn(amount: number, chain: VznChain, balance: number) {
  const fee = CHAIN_FEE[chain];
  let error: string | null = null;
  if (!Number.isFinite(amount) || amount < MIN_WITHDRAW_VZN) error = "Mínimo de 10 VZN.";
  else if (amount + fee > balance) error = "Saldo insuficiente.";
  return { fee, total: r2(amount + fee), error };
}

export function fakeTxHash(chain: VznChain) {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const b58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  if (chain === "solana") return Array.from({ length: 64 }, () => b58[Math.floor(Math.random() * b58.length)]).join("");
  return "0x" + Array.from({ length: 64 }, hex).join("");
}

export const EXPLORER: Record<VznChain, string> = {
  solana: "https://solscan.io/tx/", base: "https://basescan.org/tx/", arbitrum: "https://arbiscan.io/tx/", ethereum: "https://etherscan.io/tx/",
};
