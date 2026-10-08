import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Fish, Gauge } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, Progress, cn, useToast } from "@/index";
import { DemoHeader, Sparkline, useLocal, usd } from "@/experience/defi-ui";
import { radarTokens } from "@/experience/defi-data";
import { safetyScore } from "@/experience/defi";

export const Route = createFileRoute("/app/radar")({
  head: () => ({
    meta: [
      { title: "Radar IA — Protótipo VisionZ" },
      { name: "description", content: "Nota de segurança, sinais de baleias, sentimento e tendência de tokens da Solana em demonstração." },
      { property: "og:title", content: "Radar IA — Protótipo VisionZ" },
      { property: "og:description", content: "Análise de tokens com IA no ecossistema VisionZ." },
    ],
  }),
  component: Radar,
});

type Alert = { symbol: string; below: number };

function Radar() {
  const toast = useToast();
  const [sel, setSel] = useState("VZN");
  const [alerts, setAlerts] = useLocal<Alert[]>("vz-radar-alerts", []);
  const [below, setBelow] = useState("");
  const t = radarTokens.find((x) => x.symbol === sel)!;
  const s = safetyScore(t.risk);
  const add = () => {
    const v = Number(below);
    if (!(v > 0)) { toast({ title: "Informe um preço válido", variant: "error" }); return; }
    setAlerts([...alerts.filter((a) => a.symbol !== sel), { symbol: sel, below: v }]); setBelow("");
    toast({ title: "Alerta salvo", description: "Guardado só neste navegador.", variant: "success" });
  };
  return (
    <div className="space-y-8">
      <DemoHeader title="Radar IA" text="A IA observa os tokens da Solana e explica os riscos em palavras simples. Não é recomendação de investimento." />
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised text-left text-muted-foreground"><tr><th className="p-3">Token</th><th className="p-3">Preço</th><th className="hidden p-3 sm:table-cell">24h</th><th className="p-3">Nota</th></tr></thead>
          <tbody>
            {radarTokens.map((x) => {
              const sc = safetyScore(x.risk).score;
              return (
                <tr key={x.symbol} onClick={() => setSel(x.symbol)} className={cn("cursor-pointer border-t transition-colors hover:bg-muted/40", sel === x.symbol && "bg-cyan/10")}>
                  <td className="p-3"><button type="button" className="font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setSel(x.symbol)}>${x.symbol}</button><span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{x.name}</span></td>
                  <td className="p-3 font-mono">{usd(x.price)}</td>
                  <td className={cn("hidden p-3 font-mono sm:table-cell", x.change >= 0 ? "text-success" : "text-destructive")}>{x.change > 0 ? "+" : ""}{x.change}%</td>
                  <td className="p-3"><Badge variant={sc >= 80 ? "success" : sc >= 50 ? "warning" : "destructive"} size="sm">{sc}/100</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="lg" className="space-y-3">
          <CardTitle>Nota de segurança · ${t.symbol}</CardTitle>
          <p className="font-display text-4xl font-bold">{s.score}<span className="text-lg text-muted-foreground">/100</span></p>
          <Progress value={s.score} variant="cyan" label={`Nota de segurança ${t.symbol}`} />
          <ul className="space-y-1 text-sm">{s.reasons.map((r) => <li key={r} className="text-muted-foreground"><span className="mr-2 text-cyan">•</span>{r}</li>)}</ul>
        </Card>
        <Card padding="lg" className="space-y-4">
          <CardTitle>Sinais</CardTitle>
          <div className="flex items-center gap-3"><Fish className="size-5 text-cyan" /><p className="text-sm">{t.whales} movimentos de baleias nas últimas 24h</p></div>
          <div className="space-y-1"><div className="flex items-center gap-3"><Gauge className="size-5 text-magenta" /><p className="text-sm">Sentimento nas redes: {t.sentiment}/100</p></div><Progress value={t.sentiment} label="Sentimento" /></div>
          <div><p className="text-xs text-muted-foreground">Tendência (faixa de incerteza)</p><Sparkline data={t.trend} band={0.08} className="mt-1 h-20 w-full" /></div>
        </Card>
        <Card padding="lg" className="space-y-3">
          <div className="flex items-center gap-2"><Bell className="size-5 text-cyan" /><CardTitle>Alertas</CardTitle></div>
          <div className="space-y-1.5"><Label htmlFor="rd-b">Avisar se ${t.symbol} ficar abaixo de (US$)</Label><Input id="rd-b" type="number" min={0} step="any" value={below} onChange={(e) => setBelow(e.target.value)} /></div>
          <Button size="sm" onClick={add}>Salvar alerta</Button>
          <ul className="space-y-1 text-sm">{alerts.map((a) => <li key={a.symbol} className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-1.5"><span>${a.symbol} &lt; {usd(a.below)}</span><button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => setAlerts(alerts.filter((x) => x.symbol !== a.symbol))}>Remover</button></li>)}</ul>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Dados ilustrativos. Na versão final, os dados virão da Birdeye e da DexScreener.</p>
    </div>
  );
}
