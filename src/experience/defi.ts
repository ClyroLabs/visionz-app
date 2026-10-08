/** Pure demo math for the DeFi ecosystem screens (no real money, no chain calls). */

export const EMODE_MAX_LTV = 0.9;
/** Anti-loss lock: users pick a max acceptable loss up to this cap (50%). */
export const MAX_LOSS_CAP = 0.5;
/** Fee split of the credit market: half burned, half to $VZN stakers. */
export const CREDIT_FEE_SPLIT = { burn: 0.5, stakers: 0.5 } as const;
/** Share of $VZN spent on AI tools (Synth/Jukebox) that is burned. */
export const AI_BURN_RATE = 0.1;

export type Market = { id: string; asset: string; ltv: number; liq: number; supplied: number; borrowed: number; eModeLtv?: number };

export const utilization = (m: Pick<Market, "supplied" | "borrowed">) => (m.supplied > 0 ? Math.min(1, m.borrowed / m.supplied) : 0);

/** Kinked rate curve: 2% base, +8% up to 80% use, then +100% steep slope. Returns yearly %. */
export function borrowRate(u: number): number {
  const x = Math.max(0, Math.min(1, u)), k = 0.8;
  const r = x <= k ? 2 + (x / k) * 8 : 10 + ((x - k) / (1 - k)) * 100;
  return Math.round(r * 100) / 100;
}
export const supplyRate = (u: number) => Math.round(borrowRate(u) * Math.max(0, Math.min(1, u)) * 0.9 * 100) / 100;

/** Max borrowable value; eMode lifts the limit to the market eMode LTV, never above 90%. */
export function maxBorrow(collateralValue: number, m: Pick<Market, "ltv" | "eModeLtv">, eMode = false): number {
  const ltv = eMode && m.eModeLtv ? Math.min(m.eModeLtv, EMODE_MAX_LTV) : m.ltv;
  return Math.max(0, collateralValue) * ltv;
}

/** Health > 1 is safe; below 1 the position can be liquidated. */
export function healthFactor(collateral: number, price: number, liqThreshold: number, debt: number): number {
  if (!(debt > 0)) return Infinity;
  return (collateral * price * liqThreshold) / debt;
}
export const isLiquidatable = (h: number) => h < 1;

/** Collateral price at which health hits exactly 1. */
export function liquidationPrice(collateral: number, liqThreshold: number, debt: number): number {
  if (!(collateral > 0) || !(liqThreshold > 0)) return 0;
  return debt / (collateral * liqThreshold);
}

export type Position = { collateral: number; price: number; debt: number; liq: number; maxLoss: number };

/** Clamps the user's anti-loss limit to (0, 50%]. */
export const clampMaxLoss = (v: number) => Math.min(MAX_LOSS_CAP, Math.max(0.01, v || 0));

/** Applies a price move (e.g. -0.3) and reports health, equity loss and whether the anti-loss lock closes the position. */
export function shock(p: Position, pct: number) {
  const price = Math.max(0, p.price * (1 + pct));
  const equity0 = p.collateral * p.price - p.debt;
  const equity = p.collateral * price - p.debt;
  const loss = equity0 > 0 ? Math.max(0, (equity0 - equity) / equity0) : 0;
  const health = healthFactor(p.collateral, price, p.liq, p.debt);
  const autoClosed = loss >= clampMaxLoss(p.maxLoss) && !isLiquidatable(health);
  return { price, equity, loss, health, liquidated: isLiquidatable(health), autoClosed };
}

/** Lock price: below this collateral price the anti-loss lock closes the position. */
export function lockPrice(p: Position): number {
  const equity0 = p.collateral * p.price - p.debt;
  if (!(p.collateral > 0) || equity0 <= 0) return 0;
  return (equity0 * (1 - clampMaxLoss(p.maxLoss)) + p.debt) / p.collateral;
}

export function splitCreditFees(fees: number) {
  return { burn: fees * CREDIT_FEE_SPLIT.burn, stakers: fees * CREDIT_FEE_SPLIT.stakers };
}
export const aiBurn = (spent: number) => Math.max(0, spent) * AI_BURN_RATE;

export type TokenRisk = { top10: number; lockedLiquidity: number; mintAuth: boolean; freezeAuth: boolean };

/** 0–100 safety score with plain-language reasons. */
export function safetyScore(t: TokenRisk): { score: number; reasons: string[] } {
  let s = 100; const reasons: string[] = [];
  if (t.top10 > 0.5) { s -= 30; reasons.push("Poucas carteiras concentram a maior parte"); }
  else if (t.top10 > 0.3) { s -= 15; reasons.push("Concentração moderada nos maiores donos"); }
  if (t.lockedLiquidity < 0.5) { s -= 25; reasons.push("Pouca liquidez travada"); }
  if (t.mintAuth) { s -= 20; reasons.push("Contrato ainda pode emitir novos tokens"); }
  if (t.freezeAuth) { s -= 15; reasons.push("Contrato pode congelar carteiras"); }
  if (!reasons.length) reasons.push("Nenhum sinal de risco encontrado");
  return { score: Math.max(0, s), reasons };
}

export type Chain = "solana" | "base" | "arbitrum";
export const BRIDGE_FEE = 0.001;
/** Fixed quote (0.1% fee, zero slippage), native asset on arrival, 1–4 s. */
export function bridgeQuote(amount: number, from: Chain, to: Chain) {
  if (from === to || !(amount > 0)) return { ok: false as const, receive: 0, fee: 0, seconds: 0 };
  const fee = Math.round(amount * BRIDGE_FEE * 1e6) / 1e6;
  return { ok: true as const, receive: Math.round((amount - fee) * 1e6) / 1e6, fee, seconds: from === "solana" || to === "solana" ? 2 : 4 };
}

/** Koda learn-to-earn reward: per-lesson reward plus a completion bonus. */
export function kodaReward(track: { lessons: number; perLesson: number; bonus: number }, done: number) {
  const d = Math.max(0, Math.min(track.lessons, Math.floor(done)));
  return d * track.perLesson + (d === track.lessons ? track.bonus : 0);
}
