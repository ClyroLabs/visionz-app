import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Card, CardTitle, Input, Label, cn } from "@/index";
import { DemoHeader } from "@/experience/defi-ui";
import { vaults } from "@/experience/defi-data";
import { rewardsExample } from "@/experience/logic";

export const Route = createFileRoute("/app/cofres")({
  head: () => ({
    meta: [
      { title: "Cofres de rendimento — Protótipo VisionZ" },
      { name: "description", content: "Multiply, Creator Yield e Real Yield explicados passo a passo, com simulação de exemplo." },
      { property: "og:title", content: "Cofres de rendimento — Protótipo VisionZ" },
      { property: "og:description", content: "Simule cofres automáticos do ecossistema VisionZ." },
    ],
  }),
  component: Vaults,
});

function Vaults() {
  const [id, setId] = useState<(typeof vaults)[number]["id"]>("real");
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(12);
  const v = vaults.find((x) => x.id === id)!;
  const sim = rewardsExample(amount, months, v.apy);
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return (
    <div className="space-y-8">
      <DemoHeader title="Cofres de rendimento" text="Os cofres fazem o trabalho repetitivo sozinhos: reinvestem e rebalanceiam. Os percentuais são exemplos e podem ser maiores, menores ou zero." />
      <div className="grid gap-4 md:grid-cols-3">
        {vaults.map((x) => (
          <button key={x.id} type="button" onClick={() => setId(x.id)} aria-pressed={id === x.id}
            className={cn("rounded-2xl border bg-surface p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", id === x.id ? "border-magenta/60 shadow-glow-brand" : "hover:border-magenta/40")}>
            <div className="flex items-center justify-between gap-2"><span className="font-display font-semibold tracking-wide">{x.name}</span><Badge variant={x.tone} size="sm">Risco {x.risk}</Badge></div>
            <p className="mt-2 font-display text-3xl font-bold text-gradient-brand">{x.apy}%<span className="ml-1 text-xs font-normal text-muted-foreground">ao ano (exemplo)</span></p>
            <p className="mt-2 text-sm text-muted-foreground">{x.text}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg" className="space-y-4">
          <CardTitle>Como o {v.name} funciona</CardTitle>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {v.steps.map((s, i) => <li key={s} className="rounded-xl border bg-background/60 p-3"><span className="font-mono text-xs text-cyan">0{i + 1}</span><p className="text-sm font-semibold">{s}</p></li>)}
          </ol>
        </Card>
        <Card variant="featured" padding="lg" className="space-y-4">
          <CardTitle>Simulação</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="vt-a">Quantos $VZN</Label><Input id="vt-a" type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label htmlFor="vt-m">Por quantos meses: {months}</Label><input id="vt-m" type="range" min={1} max={36} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="mt-3 w-full accent-[var(--magenta)]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Você teria</p><p className="font-mono text-xl text-gradient-brand">{fmt(sim.final)} $VZN</p></div>
            <div className="rounded-xl border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Recompensa do exemplo</p><p className="font-mono text-xl text-cyan">+{fmt(sim.gain)}</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
