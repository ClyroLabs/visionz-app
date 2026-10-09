import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { creditWatch, dayKey, decideClaim, isCompleted, walletProofMessage } from "./vzn-rules";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

export const getDevnetStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: link } = await context.supabase.from("wallet_links").select("address").eq("user_id", context.userId).maybeSingle();
    const { data: rows } = await context.supabase.from("vzn_rewards").select("id, label, amount, status, signature, created_at, claim_key").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(30);
    const { data: watch } = await context.supabase.from("watch_sessions").select("title_ref, seconds").eq("user_id", context.userId).eq("day", dayKey());
    return {
      configured: !!process.env["VZN_DEVNET_MINT"] && !!process.env["VZN_DEVNET_TREASURY_KEY"],
      mint: process.env["VZN_DEVNET_MINT"] ?? null,
      wallet: link?.address ?? null,
      rewards: rows ?? [],
      secondsToday: (watch ?? []).reduce((s, w) => s + w.seconds, 0),
      completedToday: (watch ?? []).filter((w) => isCompleted(w.seconds)).length,
    };
  });

export const linkWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ address: z.string().min(32).max(44), signature: z.string().min(40).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const { verifyWalletSignature, isValidAddress } = await import("./vzn-devnet.server");
    if (!isValidAddress(data.address)) throw new Error("Endereço Solana inválido.");
    const ok = await verifyWalletSignature(data.address, walletProofMessage(data.address, context.userId), data.signature);
    if (!ok) throw new Error("Assinatura da carteira inválida.");
    const db = await admin();
    const { data: taken } = await db.from("wallet_links").select("user_id").eq("address", data.address).maybeSingle();
    if (taken && taken.user_id !== context.userId) throw new Error("Esta carteira já está vinculada a outra conta.");
    const { error } = await db.from("wallet_links").upsert({ user_id: context.userId, address: data.address, verified_at: new Date().toISOString() });
    if (error) throw new Error("Não foi possível vincular a carteira.");
    return { address: data.address };
  });

export const reportWatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ titleRef: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const day = dayKey();
    const { data: row } = await db.from("watch_sessions").select("seconds, last_report").eq("user_id", context.userId).eq("title_ref", data.titleRef).eq("day", day).maybeSingle();
    const now = Date.now();
    const seconds = creditWatch(row?.seconds ?? 0, row ? new Date(row.last_report).getTime() : null, now);
    if (!row || seconds !== row.seconds) {
      await db.from("watch_sessions").upsert({ user_id: context.userId, title_ref: data.titleRef, day, seconds, last_report: new Date(now).toISOString() });
    }
    return { seconds, completed: isCompleted(seconds) };
  });

export const claimDevnetReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.union([
    z.object({ kind: z.literal("conclusao"), titleRef: z.string().min(1).max(80), kids: z.boolean() }),
    z.object({ kind: z.literal("missao"), mission: z.enum(["assistir30", "concluir1"]), kids: z.boolean() }),
  ]).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const day = dayKey();
    const start = `${day}T00:00:00Z`;
    const [{ data: link }, { data: mine }, { data: pool }, { data: watch }] = await Promise.all([
      db.from("wallet_links").select("address").eq("user_id", context.userId).maybeSingle(),
      db.from("vzn_rewards").select("claim_key, amount, status, created_at").eq("user_id", context.userId),
      db.from("vzn_rewards").select("amount").gte("created_at", start).neq("status", "failed"),
      db.from("watch_sessions").select("title_ref, seconds").eq("user_id", context.userId).eq("day", day),
    ]);
    const rows = mine ?? [];
    const w = watch ?? [];
    const failedRetry = rows.find((r) => r.status === "failed" && r.claim_key === (data.kind === "conclusao" ? `conclusao:${data.titleRef}` : `missao:${data.mission}:${day}`));
    const d = decideClaim(data.kind === "conclusao" ? { kind: "conclusao", titleRef: data.titleRef } : { kind: "missao", mission: data.mission }, {
      kids: data.kids, wallet: link?.address ?? null, day,
      claimedKeys: rows.filter((r) => r.status !== "failed").map((r) => r.claim_key),
      earnedToday: rows.filter((r) => r.status !== "failed" && r.created_at >= start).reduce((s, r) => s + Number(r.amount), 0),
      poolToday: (pool ?? []).reduce((s, r) => s + Number(r.amount), 0),
      titleSeconds: data.kind === "conclusao" ? w.find((x) => x.title_ref === data.titleRef)?.seconds ?? 0 : 0,
      totalSecondsToday: w.reduce((s, x) => s + x.seconds, 0),
      completedToday: w.filter((x) => isCompleted(x.seconds)).length,
    });
    if (!d.ok) return { ok: false as const, reason: d.reason };
    if (failedRetry) await db.from("vzn_rewards").delete().eq("claim_key", d.key);
    const { data: ins, error } = await db.from("vzn_rewards").insert({ user_id: context.userId, claim_key: d.key, source: data.kind, label: d.label, amount: d.amount, address: link!.address }).select("id").single();
    if (error || !ins) return { ok: false as const, reason: "Já resgatado." };
    try {
      const { sendVzn } = await import("./vzn-devnet.server");
      const sig = await sendVzn(link!.address, d.amount);
      await db.from("vzn_rewards").update({ status: "sent", signature: sig }).eq("id", ins.id);
      return { ok: true as const, amount: d.amount, signature: sig };
    } catch (e) {
      console.error("vzn send failed", e);
      await db.from("vzn_rewards").update({ status: "failed", error: String((e as Error).message).slice(0, 200) }).eq("id", ins.id);
      return { ok: false as const, reason: "O envio na devnet falhou. Tente de novo em instantes." };
    }
  });
