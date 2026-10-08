import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownUp, Wallet } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, NetworkTag, Select, useToast } from "@/index";
import { DemoHeader } from "@/experience/defi-ui";
import { bridgeQuote, type Chain } from "@/experience/defi";

export const Route = createFileRoute("/app/ponte")({
  head: () => ({
    meta: [
      { title: "Ponte entre redes — Protótipo VisionZ" },
      { name: "description", content: "Transfira $VZN ou USDC entre Solana, Base e Arbitrum com cotação fixa, em demonstração." },
      { property: "og:title", content: "Ponte entre redes — Protótipo VisionZ" },
      { property: "og:description", content: "Transferências entre redes no modelo deBridge, sem cofre de terceiros." },
    ],
  }),
  component: Bridge,
});

const CHAINS: { id: Chain; label: string }[] = [{ id: "solana", label: "Solana" }, { id: "base", label: "Base" }, { id: "arbitrum", label: "Arbitrum" }];
const compare = [
  ["Onde fica o dinheiro", "Parado num cofre de terceiros", "Não fica parado em cofre nenhum"],
  ["O que você recebe", "Uma “cópia” do seu token", "O token original, na outra rede"],
  ["Tempo", "De 5 a 15 minutos", "De 1 a 4 segundos"],
  ["Variação no valor", "Pode mudar no caminho", "Valor fixo na cotação"],
];

function Bridge() {
  const toast = useToast();
  const [from, setFrom] = useState<Chain>("solana");
  const [to, setTo] = useState<Chain>("base");
  const [asset, setAsset] = useState("$VZN");
  const [amount, setAmount] = useState(1000);
  const [wallets, setWallets] = useState({ phantom: false, metamask: false });
  const q = bridgeQuote(amount, from, to);
  const send = () => {
    if (!q.ok) return;
    toast({ title: "Transferência concluída (demonstração)", description: `${q.receive.toLocaleString("pt-BR")} ${asset} chegaram na ${CHAINS.find((c) => c.id === to)!.label}.`, variant: "success" });
  };
  return (
    <div className="space-y-8">
      <DemoHeader title="Ponte entre redes" text="Leve seus tokens entre Solana, Base e Arbitrum em segundos. Você recebe o token original na outra rede, sem cópias." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="featured" padding="lg" className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={wallets.phantom ? "primary" : "secondary"} onClick={() => setWallets({ ...wallets, phantom: !wallets.phantom })}><Wallet />{wallets.phantom ? "Phantom conectada" : "Conectar Phantom"}</Button>
            <Button size="sm" variant={wallets.metamask ? "primary" : "secondary"} onClick={() => setWallets({ ...wallets, metamask: !wallets.metamask })}><Wallet />{wallets.metamask ? "MetaMask conectada" : "Conectar MetaMask"}</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="br-f">De</Label><Select id="br-f" value={from} onChange={(e) => setFrom(e.target.value as Chain)}>{CHAINS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="br-t">Para</Label><Select id="br-t" value={to} onChange={(e) => setTo(e.target.value as Chain)}>{CHAINS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></div>
          </div>
          <Button size="sm" variant="ghost" aria-label="Inverter redes" onClick={() => { setFrom(to); setTo(from); }}><ArrowDownUp />Inverter</Button>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="br-a">Token</Label><Select id="br-a" value={asset} onChange={(e) => setAsset(e.target.value)}><option>$VZN</option><option>USDC</option></Select></div>
            <div className="space-y-1.5"><Label htmlFor="br-v">Quantidade</Label><Input id="br-v" type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
          </div>
          <div className="rounded-xl border bg-background/60 p-4 text-sm">
            {q.ok ? (
              <>
                <div className="flex items-center gap-2"><NetworkTag network={from} /><span className="text-muted-foreground">→</span><NetworkTag network={to} /></div>
                <p className="mt-2">Você recebe <span className="font-mono text-gradient-brand">{q.receive.toLocaleString("pt-BR")} {asset}</span></p>
                <p className="font-mono text-xs text-muted-foreground">Taxa {q.fee.toLocaleString("pt-BR")} {asset} · cerca de {q.seconds}s · valor fixo</p>
              </>
            ) : <p className="text-muted-foreground">Escolha redes diferentes e uma quantidade maior que zero.</p>}
          </div>
          <Button className="w-full" disabled={!q.ok || !(wallets.phantom || wallets.metamask)} onClick={send}>Transferir</Button>
          {!(wallets.phantom || wallets.metamask) && <p className="text-center text-xs text-muted-foreground">Conecte uma carteira de demonstração para continuar.</p>}
        </Card>
        <Card padding="lg" className="space-y-4">
          <CardTitle>Ponte comum × modelo deBridge</CardTitle>
          <ul className="space-y-2">
            {compare.map(([k, a, b]) => (
              <li key={k} className="rounded-xl border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{k}</p>
                <div className="mt-1 flex flex-wrap gap-2"><Badge variant="warning" size="sm">{a}</Badge><Badge variant="success" size="sm">{b}</Badge></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
