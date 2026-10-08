import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { RATINGS } from "./parental";

type Ctx = { supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "moderator" }) => PromiseLike<{ data: boolean | null }> }; userId: string };

async function requireModerator(context: Ctx) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
  if (!data) throw new Error("Apenas moderadores podem acessar.");
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

export const isModerator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    return !!data;
  });

export const getModeration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await requireModerator(context as unknown as Ctx);
    const [creations, reports, history] = await Promise.all([
      db.from("creations").select("id, tool, title, description, age_rating, status, moderation_note, ai_analysis, created_at").in("status", ["review", "blocked"]).order("created_at", { ascending: false }).limit(100),
      db.from("content_reports").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(100),
      db.from("moderation_decisions").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    return { creations: creations.data ?? [], reports: reports.data ?? [], history: history.data ?? [] };
  });

export const decide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    targetType: z.enum(["creation", "report"]), targetId: z.string().uuid(), title: z.string().max(200),
    decision: z.enum(["approve", "block", "rating", "dismiss"]), rating: z.enum(RATINGS).optional(), note: z.string().max(300).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await requireModerator(context as unknown as Ctx);
    if (data.targetType === "creation") {
      const patch: { status?: string; age_rating?: string; moderation_note?: string } = {};
      if (data.decision === "approve") patch.status = "published";
      if (data.decision === "block") patch.status = "blocked";
      if (data.rating) patch.age_rating = data.rating;
      if (data.note) patch.moderation_note = data.note;
      const { error } = await db.from("creations").update(patch).eq("id", data.targetId);
      if (error) throw new Error("Não foi possível salvar a decisão.");
    } else {
      await db.from("content_reports").update({ status: data.decision === "dismiss" ? "dismissed" : "resolved" }).eq("id", data.targetId);
    }
    await db.from("moderation_decisions").insert({ target_type: data.targetType, target_id: data.targetId, target_title: data.title, decision: data.decision, rating: data.rating ?? null, note: data.note ?? null, moderator_id: context.userId });
    return { ok: true };
  });

export const analyzeCreation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await requireModerator(context as unknown as Ctx);
    const { data: c } = await db.from("creations").select("*").eq("id", data.id).maybeSingle();
    if (!c) throw new Error("Criação não encontrada.");
    const { analyzeContent, creationText } = await import("./moderation.server");
    try {
      const a = await analyzeContent(creationText(c));
      await db.from("creations").update({ ai_analysis: a as never }).eq("id", c.id);
      return { ok: true as const, analysis: a };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "A IA não respondeu." };
    }
  });

export const reportContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ titleRef: z.string().max(80), title: z.string().max(200), reason: z.string().max(60), details: z.string().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("content_reports").insert({ reporter_id: context.userId, title_ref: data.titleRef, title: data.title, reason: data.reason, details: data.details ?? null });
    if (error) throw new Error("Não foi possível enviar a denúncia.");
    return { ok: true };
  });
