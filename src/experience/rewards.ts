/** $VZN rewards economy: watching earns XP; $VZN comes from gamification, capped daily and budgeted monthly. */
export const DAILY_CAP = 5;
export const WATCH_XP_PER_10MIN = 10;
export const COMPLETE_VZN = 0.5;
export const COMPLETE_THRESHOLD = 0.8;
export const MISSION_VZN = 1;
export const STREAK7_BONUS = 5;
export const PURCHASE_VZN = 1;
export const CREATION_VZN = 10;
export const SEMESTER_DECAY = 0.15;
/** Ecosystem & Community reserve (400M) released over 48 months. */
export const MONTHLY_BUDGET = 400_000_000 / 48;

export const LEVELS = [
  { name: "Bronze", minXp: 0, mult: 1 },
  { name: "Prata", minXp: 500, mult: 1.1 },
  { name: "Ouro", minXp: 2000, mult: 1.2 },
  { name: "Diamante", minXp: 6000, mult: 1.3 },
] as const;

export type RewardSource = "missao" | "conclusao" | "sequencia" | "criacao" | "compra";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function levelFor(xp: number) {
  let l: (typeof LEVELS)[number] = LEVELS[0];
  for (const lv of LEVELS) if (xp >= lv.minXp) l = lv;
  return l;
}

/** Grants up to the remaining daily cap. The 7-day streak bonus is outside the cap. Kids profiles never receive $VZN. */
export function applyDailyCap(earnedToday: number, amount: number, opts: { source?: RewardSource; kids?: boolean } = {}) {
  if (opts.kids || !(amount > 0)) return { granted: 0, earnedToday };
  if (opts.source === "sequencia") return { granted: r2(amount), earnedToday };
  const granted = r2(Math.max(0, Math.min(amount, DAILY_CAP - earnedToday)));
  return { granted, earnedToday: r2(earnedToday + granted) };
}

/** Mission reward with level multiplier (cap still applies afterwards). */
export const missionReward = (xp: number) => r2(MISSION_VZN * levelFor(xp).mult);

/** Reward multiplier for a given month since launch (1-based): drops 15% every 6 months. */
export const emissionFor = (month: number) => Math.pow(1 - SEMESTER_DECAY, Math.floor(Math.max(0, month - 1) / 6));

/** When monthly requests exceed the budget, every reward is scaled by the same factor. */
export const prorate = (requested: number, budget = MONTHLY_BUDGET) => (requested <= budget || requested <= 0 ? 1 : budget / requested);

/** Watch time counts only when audible, visible and not a repeat. */
export const eligibleWatch = (s: { muted: boolean; hidden: boolean; repeat: boolean }) => !s.muted && !s.hidden && !s.repeat;

/** Things XP can be spent on — XP is never convertible to $VZN or money. */
export const XP_SHOP = [
  { id: "moldura", name: "Moldura neon para o avatar", cost: 100, kids: true },
  { id: "adesivos", name: "Pacote de adesivos animados", cost: 150, kids: true },
  { id: "tema", name: "Tema de perfil Aurora", cost: 300, kids: true },
  { id: "estreia", name: "Acesso antecipado a uma estreia", cost: 800, kids: false },
] as const;
