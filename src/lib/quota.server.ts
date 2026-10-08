import { LIMITS, PLAN_IDS, PLANS, periodFor, type Feature, type PlanId } from "./plans";

export async function planOf(userId: string): Promise<PlanId> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("subscriptions").select("plan").eq("user_id", userId).maybeSingle();
  return (data?.plan && PLAN_IDS.includes(data.plan as PlanId) ? data.plan : "free") as PlanId;
}

/** Checks and counts one use before any AI work runs. Throws a readable message when blocked. */
export async function requireQuota(userId: string, feature: Feature): Promise<number> {
  const plan = await planOf(userId);
  const limit = LIMITS[plan][feature];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_quota", { _uid: userId, _feature: feature, _period: periodFor(feature), _limit: limit });
  if (error) {
    if (error.message.includes("plan_locked")) throw new Error(`Recurso não incluído no plano ${PLANS[plan].name}. Faça upgrade em Minha conta → Plano e uso.`);
    if (error.message.includes("quota_exceeded")) throw new Error(`Limite do plano ${PLANS[plan].name} atingido. Faça upgrade ou aguarde a renovação.`);
    throw new Error("Não foi possível verificar seu plano.");
  }
  return data as number;
}
