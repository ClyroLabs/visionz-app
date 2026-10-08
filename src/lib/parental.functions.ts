import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attempt, DESCRIPTOR_LEN, isFaceMatch, RATINGS } from "./parental";

const descriptor = z.array(z.number().finite()).length(DESCRIPTOR_LEN);
const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

async function log(userId: string, action: string, result: string, detail?: string) {
  await (await admin()).from("parental_events").insert({ user_id: userId, action, result, detail: detail ?? null });
}

export const getParental = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const { data: bio } = await db.from("parent_biometrics").select("consent_at, locked_until").eq("user_id", context.userId).maybeSingle();
    const [children, events, purchases] = await Promise.all([
      context.supabase.from("child_profiles").select("*").order("created_at"),
      context.supabase.from("parental_events").select("*").order("created_at", { ascending: false }).limit(20),
      context.supabase.from("purchase_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    return {
      enrolled: !!bio, consentAt: bio?.consent_at ?? null, lockedUntil: bio?.locked_until ?? null,
      children: children.data ?? [], events: events.data ?? [], purchases: purchases.data ?? [],
    };
  });

export const enrollFace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ descriptor, consent: z.literal(true) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { error } = await db.from("parent_biometrics").upsert({ user_id: context.userId, descriptor: data.descriptor, consent_at: new Date().toISOString(), failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() });
    if (error) throw new Error("Não foi possível salvar o cadastro facial.");
    await log(context.userId, "cadastro", "ok");
    return { ok: true };
  });

export const deleteFace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await (await admin()).from("parent_biometrics").delete().eq("user_id", context.userId);
    await log(context.userId, "exclusao", "ok");
    return { ok: true };
  });

const action = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rule"), childId: z.string().uuid(), maxRating: z.enum(RATINGS), dailyMinutes: z.number().int().min(0).max(600) }),
  z.object({ type: z.literal("kids_off") }),
  z.object({ type: z.literal("purchase"), requestId: z.string().uuid(), approve: z.boolean() }),
]);

const ACTION_LABEL = { rule: "regras", kids_off: "sair_modo_infantil", purchase: "compra" } as const;

/** Verifies the parent's face against the stored template, then performs the protected action. */
export const verifyAndApply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ descriptor, action }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean; reason?: "not_enrolled" | "locked" | "mismatch"; lockedUntil?: string | null }> => {
    const db = await admin();
    const { data: bio } = await db.from("parent_biometrics").select("*").eq("user_id", context.userId).maybeSingle();
    if (!bio) return { ok: false, reason: "not_enrolled" };
    const now = Date.now();
    const matched = isFaceMatch(bio.descriptor as number[], data.descriptor);
    const r = attempt({ failed: bio.failed_attempts, lockedUntil: bio.locked_until ? Date.parse(bio.locked_until) : null }, matched, now);
    const lockedUntil = r.lockedUntil ? new Date(r.lockedUntil).toISOString() : null;
    await db.from("parent_biometrics").update({ failed_attempts: r.failed, locked_until: lockedUntil }).eq("user_id", context.userId);
    const label = ACTION_LABEL[data.action.type];
    if (!r.allowed) {
      await log(context.userId, label, r.locked ? "bloqueado" : "negado");
      return { ok: false, reason: r.locked ? "locked" : "mismatch", lockedUntil };
    }
    const a = data.action;
    if (a.type === "rule") {
      const { error } = await db.from("child_profiles").update({ max_rating: a.maxRating, daily_minutes: a.dailyMinutes }).eq("id", a.childId).eq("user_id", context.userId);
      if (error) throw new Error("Não foi possível salvar as regras.");
      await log(context.userId, label, "aprovado", `${a.maxRating} · ${a.dailyMinutes} min`);
    } else if (a.type === "purchase") {
      const { error } = await db.from("purchase_requests").update({ status: a.approve ? "approved" : "denied" }).eq("id", a.requestId).eq("user_id", context.userId).eq("status", "pending");
      if (error) throw new Error("Não foi possível atualizar a compra.");
      await log(context.userId, label, a.approve ? "aprovado" : "recusado");
    } else {
      await log(context.userId, label, "aprovado");
    }
    return { ok: true };
  });

export const createChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ name: z.string().trim().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("child_profiles").insert({ user_id: context.userId, name: data.name, max_rating: "L", daily_minutes: 60 });
    if (error) throw new Error("Não foi possível criar o perfil.");
    return { ok: true };
  });

export const deleteChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("child_profiles").delete().eq("id", data.id);
    return { ok: true };
  });

export const requestPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ childId: z.string().uuid(), titleId: z.string().max(80), title: z.string().max(200), price: z.number().min(0).max(10000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("purchase_requests").insert({ user_id: context.userId, child_profile_id: data.childId, title_id: data.titleId, title: data.title, price: data.price });
    if (error) throw new Error("Não foi possível pedir a aprovação.");
    return { ok: true };
  });
