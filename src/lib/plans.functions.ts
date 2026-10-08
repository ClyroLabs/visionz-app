import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FEATURES, PLAN_IDS, periodFor, type Feature, type PlanId } from "./plans";

export const getPlanUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: sub } = await context.supabase.from("subscriptions").select("plan").eq("user_id", context.userId).maybeSingle();
    const { data: rows } = await context.supabase.from("ai_usage").select("feature, period, count").eq("user_id", context.userId);
    const used = Object.fromEntries(FEATURES.map((f) => [f, rows?.find((r) => r.feature === f && r.period === periodFor(f))?.count ?? 0])) as Record<Feature, number>;
    return { plan: ((sub?.plan as PlanId) ?? "free") as PlanId, used };
  });

/** Demonstration plan switcher — no real charge. */
export const setPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ plan: z.enum(PLAN_IDS) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("subscriptions").upsert({ user_id: context.userId, plan: data.plan, updated_at: new Date().toISOString() });
    return { ok: true };
  });

/** One simulated developer API call, counted against the daily plan cap. */
export const apiCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireQuota } = await import("./quota.server");
    try { return { ok: true as const, left: await requireQuota(context.userId, "api_call") }; }
    catch (e) { return { ok: false as const, error: e instanceof Error ? e.message : "Bloqueado." }; }
  });
