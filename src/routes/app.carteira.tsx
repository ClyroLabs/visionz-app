import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, Coins, Wallet } from "lucide-react";
import { Button, Card, CardTitle, Input, Label, NetworkTag, Select, networks, useToast, type Network } from "@/index";
import { useExperience } from "@/experience/store";

export const Route = createFileRoute("/app/carteira")({
  head: () => ({
    meta: [
      { title: "Carteira — Protótipo VisionZ" },
      { name: "description", content: "Carteira interna VisionZ: saldo em reais, recompensas VZN multichain e histórico." },
      { property: "og:title", content: "Carteira — Protótipo VisionZ" },
      { property: "og:description", content: "Gerencie saldo e recompensas na VisionZ." },
    ],
  }),
  component: WalletPage,
});

const money = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function WalletPage() {
  const { vzn, brl, network, setNetwork, txs, redeem, deposit } = useExperience();
  const toast = useToast();
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-wide">Carteira</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" padding="lg" className="space-y-4">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Banknote className="size-4" />Saldo em reais</span>
          <p className="font-display text-4xl font-bold">R$ {money(brl)}</p>
          <p className="text-sm text-muted-foreground">Usado para compras avulsas e pacotes on-demand.</p>
          <div className="flex flex-wrap gap-2">
            {[20, 50, 100].map((v) => <Button key={v} size="sm" variant="secondary" onClick={() => { deposit(v); toast({ title: `R$ ${v},00 adicionados via Pix`, variant: "success" }); }}>+ R$ {v}</Button>)}
          </div>
        </Card>
        <Card variant="glow" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="size-4" />Recompensas</span><NetworkTag network={network} /></div>
          <p className="font-display text-4xl font-bold">{money(vzn)} <span className="text-lg text-cyan">VZN</span></p>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={(e) => {
            e.preventDefault();
            const v = Number(amount.replace(",", "."));
            const ok = redeem(v);
            toast(ok ? { title: `${money(v)} VZN resgatados`, description: `Enviados pela rede ${networks[network].label} (simulado).`, variant: "success" } : { title: "Valor inválido", description: "Informe um valor maior que zero e até o seu saldo.", variant: "error" });
            if (ok) setAmount("");
          }}>
            <div><Label htmlFor="wl-a" className="sr-only">Valor</Label><Input id="wl-a" inputMode="decimal" placeholder="Valor em VZN" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <Select aria-label="Rede" value={network} onChange={(e) => setNetwork(e.target.value as Network)}>{Object.entries(networks).map(([k, n]) => <option key={k} value={k}>{n.label}</option>)}</Select>
            <Button type="submit" variant="neon"><Coins />Resgatar</Button>
          </form>
        </Card>
      </div>
      <Card padding="lg">
        <CardTitle className="mb-4 text-lg">Histórico</CardTitle>
        <ul className="divide-y">
          {txs.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span className={t.kind === "in" ? "text-success" : "text-ember"}>{t.kind === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span>
              <span className="flex-1 text-sm">{t.label}</span>
              {t.amount > 0 && <span className="font-mono text-sm">{t.kind === "in" ? "+" : "−"}{money(t.amount)} VZN</span>}
              <span className="w-16 text-right text-xs text-muted-foreground">{t.when}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
