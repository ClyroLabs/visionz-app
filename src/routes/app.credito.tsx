import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldAlert, TrendingDown, Lock } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, Progress, Switch, cn } from "@/index";
import { DemoHeader, pct, usd } from "@/experience/defi-ui";
import { markets, prices } from "@/experience/defi-data";
import { MAX_LOSS_CAP, borrowRate, healthFactor, liquidationPrice, lockPrice, maxBorrow, shock, supplyRate, utilization } from "@/experience/defi";

export const Route = createFileRoute("/app/credito")({
  head: () => ({
    meta: [
      { title: "Crédito — Protótipo VisionZ" },
      { name: "description", content: "Simule empréstimos com garantia em mercados isolados, eMode e trava anti-perdas." },
      { property: "og:title", content: "Crédito — Protótipo VisionZ" },
      { property: "og:description", content: "Mercados isolados de crédito em Solana, em demonstração." },
    ],
  }),
  component: Credit,
});

function Credit() {
  const [mid, setMid] = useState("sol");
  const m = markets.find((x) => x.id === mid)!;
  const price = prices[mid];
  const [amount, setAmount] = useState(10);
  const [eMode, setEMode] = useState(false);
  const [borrowPct, setBorrowPct] = useState(50);
  const [maxLoss, setMaxLoss] = useState(25);
  const [drop, setDrop] = useState<number | null>(null);

  const colValue = amount * price;
  const limit = maxBorrow(colValue, m, eMode && !!m.eModeLtv);
  const debt = (limit * borrowPct) / 100;
  const h = healthFactor(amount, price, eMode && m.eModeLtv ? Math.min(0.95, m.eModeLtv + 0.03) : m.liq, debt);
  const liqT = eMode && m.eModeLtv ? Math.min(0.95, m.eModeLtv + 0.03) : m.liq;
  const pos = { collateral: amount, price, debt, liq: liqT, maxLoss: maxLoss / 100 };
  const lp = liquidationPrice(amount, liqT, debt);
  const lock = lockPrice(pos);
  const sh = useMemo(() => (drop == null ? null : shock(pos, -drop)), [drop, amount, price, debt, liqT, maxLoss]); // eslint-disable-line react-hooks/exhaustive-deps
  const hPct = Number.isFinite(h) ? Math.min(100, Math.max(0, ((h - 1) / 1) * 100)) : 100;

  return (
    <div className="space-y-8">
      <DemoHeader title="Crédito" text="Cada ativo tem seu próprio mercado com regras de risco separadas. Você deposita uma garantia e pega emprestado sem vender o que tem." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {markets.map((x) => {
          const u = utilization(x);
          return (
            <button key={x.id} type="button" onClick={() => { setMid(x.id); setDrop(null); if (!x.eModeLtv) setEMode(false); }} aria-pressed={mid === x.id}
              className={cn("rounded-2xl border bg-surface p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", mid === x.id ? "border-cyan/60 shadow-glow-cyan" : "hover:border-cyan/40")}>
              <div className="flex items-center justify-between"><span className="font-display font-semibold tracking-wide">{x.asset}</span>{x.eModeLtv && <Badge variant="cyan" size="sm">eMode</Badge>}</div>
              <p className="mt-1 text-xs text-muted-foreground">{x.note}</p>
              <dl className="mt-3 grid grid-cols-2 gap-1 font-mono text-xs">
                <dt className="text-muted-foreground">LTV</dt><dd className="text-right">{pct(x.ltv, 0)}</dd>
                <dt className="text-muted-foreground">Liquidação</dt><dd className="text-right">{pct(x.liq, 0)}</dd>
                <dt className="text-muted-foreground">Depósito</dt><dd className="text-right text-success">{supplyRate(u).toFixed(1)}%</dd>
                <dt className="text-muted-foreground">Empréstimo</dt><dd className="text-right text-warning">{borrowRate(u).toFixed(1)}%</dd>
              </dl>
              <Progress value={u * 100} variant="cyan" className="mt-3" label={`Uso do mercado ${x.asset}`} />
              <p className="mt-1 text-[11px] text-muted-foreground">Uso: {pct(u, 0)}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg" className="space-y-5">
          <CardTitle>Simulador de posição · {m.asset}</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="cr-a">Garantia ({m.asset})</Label><Input id="cr-a" type="number" min={0} value={amount} onChange={(e) => { setAmount(Math.max(0, Number(e.target.value))); setDrop(null); }} /></div>
            <div className="space-y-1.5"><Label htmlFor="cr-b">Usar {borrowPct}% do limite</Label><input id="cr-b" type="range" min={0} max={100} value={borrowPct} onChange={(e) => { setBorrowPct(Number(e.target.value)); setDrop(null); }} className="mt-3 w-full accent-[var(--cyan)]" /></div>
          </div>
          {m.eModeLtv && (
            <label className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-3 text-sm">
              <span>Modo eMode (pares parecidos, limite até 90%)</span>
              <Switch checked={eMode} onCheckedChange={(v) => { setEMode(v); setDrop(null); }} aria-label="Modo eMode" />
            </label>
          )}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border bg-background/60 p-3"><p className="text-xs text-muted-foreground">Garantia</p><p className="font-mono text-gradient-brand">{usd(colValue)}</p></div>
            <div className="rounded-xl border bg-background/60 p-3"><p className="text-xs text-muted-foreground">Empréstimo</p><p className="font-mono">{usd(debt)}</p></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span>Saúde da posição</span><span className={cn("font-mono", h < 1.1 ? "text-destructive" : h < 1.5 ? "text-warning" : "text-success")}>{Number.isFinite(h) ? h.toFixed(2) : "∞"}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="meter" aria-label="Saúde da posição" aria-valuenow={Number.isFinite(h) ? h : 99}>
              <div className={cn("h-full rounded-full transition-all", hPct < 10 ? "bg-destructive" : hPct < 50 ? "bg-warning" : "bg-success")} style={{ width: `${hPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">Liquidação se {m.asset} cair para <span className="font-mono text-foreground">{usd(lp)}</span> <span>· preço atual</span> {usd(price)}</p>
          </div>
        </Card>

        <Card variant="featured" padding="lg" className="space-y-5">
          <div className="flex items-center gap-2"><Lock className="size-5 text-cyan" /><CardTitle>Trava anti-perdas</CardTitle></div>
          <p className="text-sm text-muted-foreground">Escolha a perda máxima que você aceita. Se a posição perder isso, ela é encerrada automaticamente antes de chegar à liquidação. O limite máximo é {MAX_LOSS_CAP * 100}%.</p>
          <div className="space-y-1.5"><Label htmlFor="cr-l">Perda máxima aceitável: {maxLoss}%</Label><input id="cr-l" type="range" min={5} max={MAX_LOSS_CAP * 100} step={1} value={maxLoss} onChange={(e) => { setMaxLoss(Number(e.target.value)); setDrop(null); }} className="w-full accent-[var(--cyan)]" /></div>
          <p className="text-sm">Encerramento automático se {m.asset} cair para <span className="font-mono text-cyan">{usd(lock)}</span>.</p>
          {lock > 0 && lock <= lp && <p className="flex items-start gap-2 text-xs text-warning"><ShieldAlert className="mt-0.5 size-4 shrink-0" />Com esse empréstimo, a liquidação viria antes da trava. Use menos do limite ou uma perda máxima menor.</p>}
          <div className="flex flex-wrap gap-2">
            {[0.1, 0.3, 0.5].map((d) => <Button key={d} size="sm" variant={drop === d ? "primary" : "secondary"} onClick={() => setDrop(d)}><TrendingDown />E se o preço cair {d * 100}%?</Button>)}
          </div>
          {sh && (
            <div className={cn("rounded-xl border p-4 text-sm animate-rise", sh.autoClosed ? "border-cyan/50 bg-cyan/10" : sh.liquidated ? "border-destructive/50 bg-destructive/10" : "border-success/40 bg-success/10")}>
              <p className="font-semibold">{sh.autoClosed ? "Trava acionada: posição encerrada automaticamente." : sh.liquidated ? "A posição seria liquidada." : "A posição continua aberta."}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground"><span><span>Preço</span> {usd(sh.price)}</span><span><span>Saúde</span> {Number.isFinite(sh.health) ? sh.health.toFixed(2) : "∞"}</span><span><span>Perda</span> {pct(Math.min(1, sh.loss))}</span></p>
            </div>
          )}
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Preços acompanhados por oráculos redundantes (Pyth e Switchboard) na versão final. Aqui os preços são fixos de exemplo.</p>
    </div>
  );
}
