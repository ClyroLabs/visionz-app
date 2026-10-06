import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  topic: z.enum(["Parceria", "Investimento", "Criadores", "Imprensa", "Outro"]),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot
});

export const sendContact = createServerFn({ method: "POST" })
  .inputValidator((d) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await supabaseAdmin.from("contact_submissions").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since);
    if ((count ?? 0) >= 3) return { ok: false as const, error: "Muitas mensagens em pouco tempo. Tente de novo em alguns minutos." };
    const { error } = await supabaseAdmin.from("contact_submissions").insert({ name: data.name, email, topic: data.topic, message: data.message, source: "ecossistema" });
    if (error) { console.error("contact insert", error); return { ok: false as const, error: "Não foi possível enviar agora. Tente de novo." }; }
    return { ok: true as const };
  });
