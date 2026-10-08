/** Plan tiers and what each one unlocks. Every number is a finite cap — no plan is unlimited. */
export const PLAN_IDS = ["free", "premium", "family", "creator_pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const FEATURES = ["synth_board", "synth_image", "synth_clip", "jukebox_compose", "jukebox_describe", "moderation_analyze", "api_call"] as const;
export type Feature = (typeof FEATURES)[number];

/** api_call is per day; everything else per month. */
export const DAILY: Feature[] = ["api_call"];

export const PLANS: Record<PlanId, { name: string; price: string; screens: number; maxResolution: "2K" | "4K" | "8K"; apiKeys: number }> = {
  free: { name: "Grátis / À la carte", price: "R$ 0", screens: 1, maxResolution: "2K", apiKeys: 0 },
  premium: { name: "Premium", price: "R$ 29,90", screens: 2, maxResolution: "4K", apiKeys: 0 },
  family: { name: "Family", price: "R$ 44,90", screens: 4, maxResolution: "4K", apiKeys: 0 },
  creator_pro: { name: "Criador Pro", price: "R$ 49,90", screens: 2, maxResolution: "8K", apiKeys: 2 },
};

export const LIMITS: Record<PlanId, Record<Feature, number>> = {
  free: { synth_board: 2, synth_image: 6, synth_clip: 0, jukebox_compose: 2, jukebox_describe: 2, moderation_analyze: 0, api_call: 0 },
  premium: { synth_board: 10, synth_image: 40, synth_clip: 0, jukebox_compose: 10, jukebox_describe: 10, moderation_analyze: 0, api_call: 0 },
  family: { synth_board: 15, synth_image: 60, synth_clip: 2, jukebox_compose: 15, jukebox_describe: 15, moderation_analyze: 0, api_call: 0 },
  creator_pro: { synth_board: 60, synth_image: 300, synth_clip: 20, jukebox_compose: 60, jukebox_describe: 60, moderation_analyze: 30, api_call: 500 },
};

export const FEATURE_LABEL: Record<Feature, string> = {
  synth_board: "Roteiros do Synth", synth_image: "Imagens de cena", synth_clip: "Clipes com IA", jukebox_compose: "Músicas do Jukebox",
  jukebox_describe: "Descrições com IA", moderation_analyze: "Análises de moderação", api_call: "Chamadas de API por dia",
};

export const limitOf = (plan: PlanId, f: Feature) => LIMITS[plan][f];
export const canUse = (plan: PlanId, f: Feature, used: number) => used < LIMITS[plan][f];
export const remaining = (plan: PlanId, f: Feature, used: number) => Math.max(0, LIMITS[plan][f] - used);
export const cheapestPlanFor = (f: Feature): PlanId | null => PLAN_IDS.find((p) => LIMITS[p][f] > 0) ?? null;
const RES = ["2K", "4K", "8K"] as const;
export const resolutionAllowed = (plan: PlanId, r: string) => RES.indexOf(r as never) <= RES.indexOf(PLANS[plan].maxResolution);

export function periodFor(f: Feature, d = new Date()) {
  const m = d.toISOString().slice(0, 7);
  return DAILY.includes(f) ? d.toISOString().slice(0, 10) : m;
}
