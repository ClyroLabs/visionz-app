import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Card, CardTitle, Progress } from "@/index";
import { Donut, VaultSimulator } from "@/experience/finance-ui";

export const Route = createFileRoute("/app/financas")({
  head: () => ({
    meta: [
      { title: "Finanças — Protótipo VisionZ" },
      { name: "description", content: "Carteira por categorias, simulador de vaults e Safety Score de exemplo no protótipo VisionZ." },
      { property: "og:title", content: "Finanças — Protótipo VisionZ" },
      { property: "og:description", content: "Veja a carteira de demonstração por categorias e simule vaults." },
    ],
  }),
  component: Finance,
});

const holdings = [
  { name: "$VZN", value: 42000, sub: "US$ 42.000", detail: "Token da VisionZ na Solana." },
  { name: "SOL", value: 23000, sub: "US$ 23.000", detail: "Moeda da rede Solana, usada nas taxas." },
  { name: "USDC", value: 15000, sub: "US$ 15.000", detail: "Dólar digital para pagamentos estáveis." },
  { name: "Vaults", value: 12000, sub: "US$ 12.000", detail: "Valores em cofres de exemplo." },
  { name: "Recompensas", value: 8000, sub: "US$ 8.000", detail: "Ganhos por assistir, criar e indicar." },
];

const scores = { VZN: 94, SOL: 91, KODA: 82 } as const;

function Finance() {
  const [asset, setAsset] = useState<keyof typeof scores>("VZN");
  const s = scores[asset];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-3xl font-bold tracking-wide">Finanças</h1><Badge variant="neutral">Dados de demonstração</Badge></div>
      <div className="flex flex-wrap gap-2">{([["/app/credito", "Crédito"], ["/app/cofres", "Cofres"], ["/app/radar", "Radar IA"], ["/app/ponte", "Ponte"]] as const).map(([to, l]) => <Link key={to} to={to} className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-cyan/60 hover:text-cyan">{l} →</Link>)}</div>
      <Card padding="lg" className="space-y-4">
        <CardTitle>Carteira por categorias</CardTitle>
        <Donut total="US$ 100 mil" unit="5 categorias" items={holdings} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <VaultSimulator />
        <Card padding="lg" className="space-y-4">
          <CardTitle>Safety Score IA</CardTitle>
          <div className="flex flex-wrap gap-2">{(Object.keys(scores) as (keyof typeof scores)[]).map((k) => (
            <button key={k} type="button" onClick={() => setAsset(k)} className={`rounded-full border px-4 py-1.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${asset === k ? "border-cyan bg-cyan/10 text-cyan" : "text-muted-foreground"}`}>${k}</button>
          ))}</div>
          <p className="font-display text-4xl font-bold">{s}<span className="text-lg text-muted-foreground">/100</span></p>
          <Progress value={s} variant="cyan" label={`Safety Score ${asset}`} />
          <p className="text-sm text-muted-foreground">{s >= 90 ? "Baixo risco" : "Risco moderado"}: a IA olha liquidez, histórico de preço e sinais de golpe.</p>
          <p className="text-xs text-muted-foreground">Pontuações ilustrativas, sem conexão com dados reais de mercado ainda.</p>
        </Card>
      </div>
    </div>
  );
}
