/** Server-checked rules for real $VZN sends on Solana devnet. Pure, so they can be tested. */
import { COMPLETE_THRESHOLD, COMPLETE_VZN, DAILY_CAP, MISSION_VZN } from "@/experience/rewards";

export const DEVNET_TITLE_SECONDS = 600; // simulated title length used by the player
export const WATCH_STEP = 60; // seconds credited per report
export const MIN_REPORT_GAP_MS = 2500; // player runs at 20x, so 60 s of video ≈ 3 s real time
export const GLOBAL_DAILY_CEILING = 5000; // whole pool, per UTC day
export const ONCHAIN_MISSIONS = { assistir30: 1800, concluir1: 0 } as const;
export type OnchainMission = keyof typeof ONCHAIN_MISSIONS;

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
export const isCompleted = (seconds: number, total = DEVNET_TITLE_SECONDS) => seconds >= total * COMPLETE_THRESHOLD;

/** Credits one step only when enough real time passed since the last report. */
export function creditWatch(prev: number, lastReportMs: number | null, nowMs: number) {
  if (lastReportMs !== null && nowMs - lastReportMs < MIN_REPORT_GAP_MS) return prev;
  return Math.min(DEVNET_TITLE_SECONDS, prev + WATCH_STEP);
}

export type ClaimInput =
  | { kind: "conclusao"; titleRef: string }
  | { kind: "missao"; mission: OnchainMission };

export type ClaimState = { kids: boolean; wallet: string | null; claimedKeys: string[]; earnedToday: number; poolToday: number; titleSeconds: number; totalSecondsToday: number; completedToday: number; day: string };

/** Decide whether a claim can be paid, and how much. Never more than the daily cap. */
export function decideClaim(c: ClaimInput, s: ClaimState): { ok: true; key: string; amount: number; label: string } | { ok: false; reason: string } {
  if (s.kids) return { ok: false, reason: "Perfil infantil ganha só XP." };
  if (!s.wallet) return { ok: false, reason: "Conecte a Phantom primeiro." };
  const key = c.kind === "conclusao" ? `conclusao:${c.titleRef}` : `missao:${c.mission}:${s.day}`;
  if (s.claimedKeys.includes(key)) return { ok: false, reason: "Já resgatado." };
  let base: number;
  let label: string;
  if (c.kind === "conclusao") {
    if (!isCompleted(s.titleSeconds)) return { ok: false, reason: "Título ainda não concluído." };
    base = COMPLETE_VZN; label = "Título concluído";
  } else {
    const done = c.mission === "assistir30" ? s.totalSecondsToday >= ONCHAIN_MISSIONS.assistir30 : s.completedToday >= 1;
    if (!done) return { ok: false, reason: "Missão ainda não cumprida." };
    base = MISSION_VZN; label = c.mission === "assistir30" ? "Missão: Assistir 30 minutos" : "Missão: Concluir um título";
  }
  const amount = Math.round(Math.max(0, Math.min(base, DAILY_CAP - s.earnedToday)) * 100) / 100;
  if (amount <= 0) return { ok: false, reason: "Limite de hoje atingido." };
  if (s.poolToday + amount > GLOBAL_DAILY_CEILING) return { ok: false, reason: "Recompensas pausadas hoje. Tente amanhã." };
  return { ok: true, key, amount, label };
}

export const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
export const walletProofMessage = (address: string, userId: string) => `VisionZ devnet: vincular a carteira ${address} à conta ${userId}`;
