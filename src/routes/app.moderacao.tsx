import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { Card, ModerationItem, Stat, useToast } from "@/index";
import { useExperience } from "@/experience/store";

export const Route = createFileRoute("/app/moderacao")({
  head: () => ({
    meta: [
      { title: "Central de moderação — Protótipo VisionZ" },
      { name: "description", content: "Fila de conteúdos marcados pela IA com decisão humana que retreina o modelo." },
      { property: "og:title", content: "Central de moderação — Protótipo VisionZ" },
      { property: "og:description", content: "Revisão humana do Filtro Inteligente VisionZ." },
    ],
  }),
  component: Moderation,
});

function Moderation() {
  const { flags, retrained, decide } = useExperience();
  const toast = useToast();
  return (
    <div className="space-y-8">
      <h1 className="text-center font-display text-2xl sm:text-left sm:text-3xl font-bold tracking-wide">Central de moderação</h1>
      <div className="grid gap-4 text-center sm:grid-cols-3 sm:text-left">
        <Card><Stat value={String(flags.length)} label="itens aguardando revisão" tone="default" size="md" /></Card>
        <Card><Stat value="98,7%" label="decididos sozinhos pela IA" tone="cyan" size="md" /></Card>
        <Card variant="glow"><div className="flex flex-col items-center gap-3 sm:flex-row"><BrainCircuit className="size-8 text-cyan" /><Stat value={retrained.toLocaleString("pt-BR")} label="vezes que a IA foi retreinada" size="md" /></div></Card>
      </div>
      <div className="space-y-3">
        {flags.map((f) => (
          <ModerationItem key={f.id} title={f.title} reason={f.reason} confidence={f.confidence} timestamp={f.timestamp} severity={f.severity}
            onApprove={() => { decide(f.id); toast({ title: "Aprovado", description: "A IA aprendeu com sua decisão." }); }}
            onBlock={() => { decide(f.id); toast({ title: "Bloqueado", description: "Conteúdo removido e IA retreinada.", variant: "error" }); }} />
        ))}
        {flags.length === 0 && <Card className="text-center text-muted-foreground">Fila vazia. Tudo revisado!</Card>}
      </div>
    </div>
  );
}
