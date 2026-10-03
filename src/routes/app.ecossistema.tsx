import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Badge, Card, CardTitle, Logo, NetworkTag, Progress } from "@/index";
import { agents } from "@/experience/data";

export const Route = createFileRoute("/app/ecossistema")({
  head: () => ({
    meta: [
      { title: "Ecossistema Clyro — Protótipo VisionZ" },
      { name: "description", content: "Mapa dos agentes Clyro com status e eventos em tempo real (simulados)." },
      { property: "og:title", content: "Ecossistema Clyro — Protótipo VisionZ" },
      { property: "og:description", content: "Painel do Clyro Agent Core na VisionZ." },
    ],
  }),
  component: Ecosystem,
});

const sample = [
  "ModerationAgent aprovou “Amazônia Viva” (L)",
  "Web3Agent registrou recompensa de 2 VZN na Polygon",
  "MarketingAgent criou campanha “Lançamento Trio Alegria”",
  "DevAgent publicou versão 0.4.2 do player",
  "R&D Agent renderizou episódio 3 de “Rebeca e sua turma”",
  "ModerationAgent bloqueou clipe com gesto impróprio",
];

function Ecosystem() {
  const [loads, setLoads] = useState(agents.map((a) => a.load));
  const [events, setEvents] = useState<string[]>(sample.slice(0, 3));
  useEffect(() => {
    const i = setInterval(() => {
      setLoads((l) => l.map((v) => Math.max(5, Math.min(95, v + Math.round(Math.random() * 16 - 8)))));
      setEvents((e) => [sample[Math.floor(Math.random() * sample.length)], ...e].slice(0, 8));
    }, 2000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-wide">Ecossistema Clyro</h1>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card padding="lg" className="bg-circuit-grid space-y-6">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-xl border border-cyan/50 bg-surface px-5 py-3 shadow-glow-cyan"><Logo brand="clyro-icon" size="sm" alt="" /><span className="font-display font-semibold">Clyro Agent Core</span><Badge variant="success" size="sm">online</Badge></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {agents.map((a, i) => (
              <div key={a.name} className="space-y-2 rounded-lg border bg-surface p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">{a.name}</span><span className="font-mono text-xs text-muted-foreground">{loads[i]}%</span></div>
                <p className="text-xs text-muted-foreground">{a.role}</p>
                <Progress value={loads[i]} variant={loads[i] > 80 ? "brand" : "cyan"} label={`Carga ${a.name}`} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2"><NetworkTag network="polygon" /><NetworkTag network="ethereum" /><NetworkTag network="solana" /><NetworkTag network="bnb" /><NetworkTag network="base" /></div>
        </Card>
        <Card padding="lg" className="space-y-3">
          <CardTitle className="flex items-center gap-2"><Activity className="size-4 text-cyan" />Eventos ao vivo</CardTitle>
          <ul aria-live="polite" className="space-y-2">{events.map((e, i) => <li key={i + e} className="rounded-md border bg-background/60 px-3 py-2 font-mono text-xs">{e}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
