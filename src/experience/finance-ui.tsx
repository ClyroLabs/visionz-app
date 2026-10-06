import { useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Badge, Button, Card, CardDescription, CardTitle, Input, Label, Select } from "@/index";
import { tokenomics, vaults, projections } from "./data";
import { burnSimulation, SCENARIOS } from "./logic";

export const CHART_COLORS = ["var(--indigo)", "var(--primary)", "var(--magenta)", "var(--ember)", "var(--gold)", "var(--cyan)"];
const tip = { background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" };
const fmtM = (n: number, d = 2) => (n / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Generic interactive donut: click a slice to see its detail, then go back. */
export function Donut({ items, total, unit, onBackLabel = "Voltar à visão geral" }: { items: { name: string; value: number; detail?: string; sub?: string }[]; total: string; unit?: string; onBackLabel?: string }) {
  const [sel, setSel] = useState<number | null>(null);
  const sum = items.reduce((a, b) => a + b.value, 0);
  const cur = sel === null ? null : items[sel];
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={items} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" onClick={(_, i) => setSel(i)} className="cursor-pointer" isAnimationActive={false}>
              {items.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={sel === null || sel === i ? 1 : 0.3} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl font-bold">{cur ? `${Math.round((cur.value / sum) * 100)}%` : total}</span>
          <span className="text-xs text-muted-foreground">{cur ? cur.name : unit}</span>
        </div>
      </div>
      {cur ? (
        <Card variant="glass" className="space-y-3 text-center md:text-left">
          <CardTitle>{cur.name}</CardTitle>
          {cur.sub && <p className="font-mono text-lg text-gradient-brand">{cur.sub}</p>}
          {cur.detail && <CardDescription>{cur.detail}</CardDescription>}
          <Button size="sm" variant="soft" onClick={() => setSel(null)}>{onBackLabel}</Button>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={it.name}><button type="button" onClick={() => setSel(i)} className="flex w-full items-center gap-3 rounded-xl border bg-surface/60 px-3 py-2 text-left text-sm transition-colors hover:border-magenta/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="size-3 shrink-0 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="flex-1">{it.name}</span><span className="font-mono text-muted-foreground">{Math.round((it.value / sum) * 100)}%</span>
            </button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TokenomicsDonut() {
  return <Donut total="1 bi" unit="$VZN" items={tokenomics.map((t) => ({ name: t.name, value: t.pct, sub: `${t.amount} $VZN`, detail: t.vesting }))} />;
}

export function BurnSimulator() {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("base");
  const [alpha, setAlpha] = useState(20), [beta, setBeta] = useState(10), [price, setPrice] = useState(1.5);
  const r = burnSimulation({ alpha: alpha / 100, beta: beta / 100, price, multiplier: SCENARIOS[scenario] });
  const slider = (id: string, label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, show: string) => (
    <div className="space-y-1.5"><div className="flex justify-between text-sm"><Label htmlFor={id}>{label}</Label><span className="font-mono text-cyan">{show}</span></div>
      <input id={id} type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} className="w-full accent-[var(--magenta)]" /></div>
  );
  return (
    <Card padding="lg" className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        <div className="space-y-1.5"><Label htmlFor="bs-s">Cenário</Label>
          <Select id="bs-s" value={scenario} onChange={(e) => setScenario(e.target.value as keyof typeof SCENARIOS)}><option value="base">Roadmap oficial (base)</option><option value="conservador">Conservador (-50%)</option><option value="agressivo">Agressivo (+100%)</option></Select></div>
        {slider("bs-a", "Recompra (α)", alpha, setAlpha, 0, 40, 1, `${alpha}%`)}
        {slider("bs-b", "Queima de IA (β)", beta, setBeta, 0, 30, 1, `${beta}%`)}
        {slider("bs-p", "Preço médio $VZN", price, setPrice, 0.1, 10, 0.1, `R$ ${price.toFixed(2).replace(".", ",")}`)}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={r.series}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" tickFormatter={(m) => `M${m}`} />
            <YAxis stroke="var(--muted-foreground)" domain={["auto", 1000]} unit="M" width={60} />
            <RTooltip contentStyle={tip} formatter={(v: number) => [`${v.toFixed(2)}M $VZN`, "Suprimento"]} labelFormatter={(m) => `Mês ${m}`} />
            <Line dataKey="supply" stroke="var(--magenta)" strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-4">
        {[["Queima em 36 meses", `${fmtM(r.burned)}M`], ["% do suprimento", `${r.pct.toFixed(2).replace(".", ",")}%`], ["Total em recompras", `R$ ${fmtM(r.buyback, 1)}M`], ["Suprimento final", `${fmtM(r.finalSupply)}M`]].map(([l, v]) => (
          <div key={l} className="rounded-xl border bg-surface/60 p-3"><p className="font-mono text-lg font-semibold">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Simulação com a fórmula do whitepaper: S(t+1) = S(t) − (α·Receita/Preço + β·Volume de IA). Exemplo para entender o modelo, não é promessa de valorização.</p>
    </Card>
  );
}

export function VaultSimulator() {
  const [amount, setAmount] = useState(1000), [vault, setVault] = useState(vaults[0].id);
  const v = vaults.find((x) => x.id === vault)!;
  const gain = Math.round(Math.max(0, amount || 0) * v.apy) / 100;
  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Simulador de vaults</CardTitle><Badge variant="warning">Exemplo, não é promessa</Badge></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="vs-a">Valor (US$)</Label><Input id="vs-a" type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
        <div className="space-y-1.5"><Label htmlFor="vs-v">Vault</Label><Select id="vs-v" value={vault} onChange={(e) => setVault(e.target.value)}>{vaults.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.apy}% ao ano, estimado)</option>)}</Select></div>
      </div>
      <div className="rounded-xl border bg-surface/60 p-4 text-center"><p className="text-xs text-muted-foreground">Rendimento ilustrativo em 12 meses</p><p className="font-display text-3xl font-bold text-gradient-brand">US$ {gain.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p><p className="font-mono text-sm text-muted-foreground">+{v.apy}% ao ano (estimativa)</p></div>
      <p className="text-xs text-muted-foreground">Taxas variam com o mercado e podem ser negativas. Recurso em desenvolvimento; nenhum valor é aplicado de verdade.</p>
    </Card>
  );
}

export function RevenueChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={projections}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="ano" stroke="var(--muted-foreground)" />
          <YAxis yAxisId="r" stroke="var(--muted-foreground)" />
          <YAxis yAxisId="e" orientation="right" stroke="var(--muted-foreground)" unit="%" />
          <RTooltip contentStyle={tip} />
          <Bar yAxisId="r" dataKey="base" name="Plano base (R$ mi)" fill="var(--indigo)" radius={[6, 6, 0, 0]} />
          <Bar yAxisId="r" dataKey="receita" name="Plano expandido (R$ mi)" fill="var(--magenta)" radius={[6, 6, 0, 0]} />
          <Line yAxisId="e" dataKey="ebitda" name="EBITDA %" stroke="var(--cyan)" strokeWidth={3} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
