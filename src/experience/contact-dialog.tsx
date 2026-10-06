import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button, Dialog, Input, Label, Select, useToast } from "@/index";
import { sendContact } from "@/lib/contact.functions";

const TOPICS = ["Parceria", "Investimento", "Criadores", "Imprensa", "Outro"] as const;

export function ContactDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const toast = useToast();
  const send = useServerFn(sendContact);
  const [f, setF] = useState({ name: "", email: "", topic: "Parceria" as (typeof TOPICS)[number], message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(f.email) || f.message.trim().length < 10) {
      toast({ title: "Preencha nome, e-mail válido e uma mensagem com pelo menos 10 letras", variant: "error" }); return;
    }
    setBusy(true);
    try {
      const r = await send({ data: f });
      if (!r.ok) { toast({ title: r.error, variant: "error" }); return; }
      toast({ title: "Mensagem enviada!", description: "Recebemos seu contato e vamos responder no seu e-mail.", variant: "success" });
      setF({ name: "", email: "", topic: "Parceria", message: "", website: "" }); onOpenChange(false);
    } catch { toast({ title: "Não foi possível enviar agora. Tente de novo.", variant: "error" }); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Falar com a VisionZ" description="Conte o que você precisa. Respondemos no seu e-mail.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="ct-n">Nome</Label><Input id="ct-n" value={f.name} onChange={set("name")} maxLength={100} required /></div>
        <div className="space-y-1.5"><Label htmlFor="ct-e">E-mail</Label><Input id="ct-e" type="email" value={f.email} onChange={set("email")} maxLength={255} required /></div>
        <div className="space-y-1.5"><Label htmlFor="ct-t">Assunto</Label><Select id="ct-t" value={f.topic} onChange={set("topic")}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</Select></div>
        <div className="space-y-1.5"><Label htmlFor="ct-m">Mensagem</Label>
          <textarea id="ct-m" value={f.message} onChange={set("message")} maxLength={2000} rows={5} required
            className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={set("website")} />
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Enviando…" : "Enviar mensagem"}</Button>
      </form>
    </Dialog>
  );
}
