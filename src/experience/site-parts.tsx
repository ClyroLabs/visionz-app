import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Dialog, Input, Label, Select, cn, useToast } from "@/index";

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cn("mx-auto max-w-7xl px-5 py-14 sm:px-6 md:py-24", className)}>{children}</section>;
}

export function Glow({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute rounded-full blur-3xl", className)} />;
}

/** Lead form (demo only — no persistence yet). */
export function LeadDialog({ open, onOpenChange, kind }: { open: boolean; onOpenChange: (v: boolean) => void; kind: "espera" | "investidor" }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) { toast({ title: "Preencha nome e e-mail válidos", variant: "error" }); return; }
    onOpenChange(false); setName(""); setEmail("");
    toast({ title: "Recebido!", description: kind === "espera" ? "Você está na lista de espera da VisionZ." : "Nosso time de relações com investidores vai entrar em contato.", variant: "success" });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={kind === "espera" ? "Entrar na lista de espera" : "Falar com a VisionZ"} description={kind === "espera" ? "Seja dos primeiros a assistir, criar e ganhar." : "Receba o deck completo e agende uma conversa."}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="ld-n">Nome</Label><Input id="ld-n" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
        <div className="space-y-1.5"><Label htmlFor="ld-e">E-mail</Label><Input id="ld-e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></div>
        {kind === "espera" ? (
          <div className="space-y-1.5"><Label htmlFor="ld-p">Eu quero</Label><Select id="ld-p"><option>Assistir</option><option>Criar conteúdo</option><option>Ser embaixador</option></Select></div>
        ) : (
          <div className="space-y-1.5"><Label htmlFor="ld-p">Perfil</Label><Select id="ld-p"><option>Investidor anjo</option><option>Fundo</option><option>Parceiro estratégico</option></Select></div>
        )}
        <Button type="submit" className="w-full">Enviar</Button>
      </form>
    </Dialog>
  );
}
