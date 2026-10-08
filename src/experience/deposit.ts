/** Simulated payment-gateway rules for wallet deposits (sandbox — no real charge). */
export type PayKind = "pix" | "card";
export const DEPOSIT_MIN = 10;
export const DEPOSIT_MAX = 5000;
export const CARD_FEE = 0.0299;
/** Card deposits above this are declined by the simulated issuer. */
export const CARD_ISSUER_LIMIT = 2000;
export const PIX_TTL_SEC = 600;

const r2 = (n: number) => Math.round(n * 100) / 100;
export const depositFee = (amount: number, kind: PayKind) => (kind === "card" ? r2(amount * CARD_FEE) : 0);
export const depositTotal = (amount: number, kind: PayKind) => r2(amount + depositFee(amount, kind));
export function validateAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount < DEPOSIT_MIN) return `Valor mínimo: R$ ${DEPOSIT_MIN},00`;
  if (amount > DEPOSIT_MAX) return `Valor máximo: R$ ${DEPOSIT_MAX.toLocaleString("pt-BR")},00`;
  return null;
}
export const cardApproved = (amount: number) => amount <= CARD_ISSUER_LIMIT;

export function txId(seed = Date.now()): string {
  const s = Math.abs(Math.floor(seed * 9301 + 49297) % 2176782336).toString(36).toUpperCase().padStart(6, "0");
  return `VZP-${s}`;
}
/** Fake "copia e cola" EMV-like payload (not a real Pix code). */
export function pixPayload(amount: number, id: string) {
  const v = amount.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136visionz-sandbox-${id.toLowerCase()}520400005303986540${v.length}${v}5802BR5907VISIONZ6009SAO PAULO62${String(id.length + 4).padStart(2, "0")}05${id}6304DEMO`;
}

export const depositLabel = (ok: boolean, method: string, id: string) => `${ok ? "Depósito" : "Depósito recusado"} · ${method} · ${id}`;
export function parseDepositLabel(label: string): { ok: boolean; method: string; id: string } | null {
  const m = label.match(/^(Depósito|Depósito recusado) · (.+) · (VZP-[A-Z0-9]+)$/);
  return m ? { ok: m[1] === "Depósito", method: m[2], id: m[3] } : null;
}
