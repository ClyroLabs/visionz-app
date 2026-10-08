import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cardBrand, cardLast4, pixKeySchema } from "@/lib/account";
import { useToast } from "@/index";
import { depositLabel, type PayKind } from "./deposit";
import { methodText, type DepositResult, type PayMethod } from "./deposit-checkout";

const DEMO: PayMethod[] = [
  { id: "demo-pix", kind: "pix", title: "Pix", subtitle: "Pix · pagamento instantâneo", isDefault: true },
  { id: "demo-card", kind: "card", title: "Cartão de teste", subtitle: "Visa •••• 4242" },
];

/** Payment methods + recording for the sandbox deposit checkout. Guests get demo methods. */
export function useDeposit(uid?: string) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data = [] } = useQuery({
    queryKey: ["pm", uid], enabled: !!uid,
    queryFn: async () => (await supabase.from("payment_methods").select("*").eq("user_id", uid!).order("created_at")).data ?? [],
  });
  const methods: PayMethod[] = uid
    ? data.map((m) => ({ id: m.id, kind: m.kind as PayKind, title: m.label, subtitle: m.kind === "card" ? `${m.brand} •••• ${m.last4}` : `Pix · ${m.pix_key}`, isDefault: m.is_default }))
    : DEMO;

  const addMethod = async ({ kind, value }: { kind: PayKind; value: string }): Promise<PayMethod | null> => {
    if (!uid) return null;
    let row;
    if (kind === "card") {
      const last4 = cardLast4(value);
      if (!last4) { toast({ title: "Número de cartão inválido", variant: "error" }); return null; }
      row = { kind, label: `Cartão ${cardBrand(value)}`, brand: cardBrand(value), last4 };
    } else {
      const p = pixKeySchema.safeParse(value);
      if (!p.success) { toast({ title: p.error.issues[0].message, variant: "error" }); return null; }
      row = { kind, label: "Pix", pix_key: p.data };
    }
    const { data: ins, error } = await supabase.from("payment_methods").insert({ user_id: uid, ...row, is_default: data.length === 0 }).select().single();
    if (error || !ins) { toast({ title: "Não foi possível salvar", variant: "error" }); return null; }
    await qc.invalidateQueries({ queryKey: ["pm", uid] });
    toast({ title: "Forma de pagamento adicionada", variant: "success" });
    return { id: ins.id, kind, title: ins.label, subtitle: kind === "card" ? `${ins.brand} •••• ${ins.last4}` : `Pix · ${ins.pix_key}`, isDefault: ins.is_default };
  };

  const record = async (r: DepositResult) => {
    if (!uid) return;
    await supabase.from("wallet_transactions").insert({ user_id: uid, label: depositLabel(r.ok, methodText(r.method), r.id), amount: r.ok ? r.amount : 0, currency: "BRL", direction: "in" });
    await qc.invalidateQueries({ queryKey: ["txs", uid] });
  };

  return { methods, addMethod: uid ? addMethod : undefined, record };
}
