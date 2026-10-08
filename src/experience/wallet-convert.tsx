import { useEffect, useState } from "react";
import { ArrowDownUp, Banknote, CheckCircle2, ExternalLink, Loader2, Lock, Repeat, Send, Wallet } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Select, Tabs, TabsContent, TabsList, TabsTrigger, cn, useToast } from "@/index";
import { useExperience } from "@/experience/store";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import {
  CHAIN_FEE, EXPLORER, VZN_RATE_BRL, fakeTxHash, quote, validateConvert, validateWithdrawVzn, withdrawFiat,
  type ConvertDir, type FiatCurrency, type FiatRail, type VznChain,
} from "./convert";
import { connectEvm, connectPhantom, hasEvm, hasPhantom, short, switchEvm, type Connected } from "./web3";

const money = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (s: string) => Number(s.replace(",", "."));
const ref = () => "VZW-" + Math.random().toString(36).slice(2, 8).toUpperCase();
const CUR_SYM: Record<FiatCurrency, string> = { BRL: "R$", USD: "US$", EUR: "€", CNY: "¥" };
const CHAINS: { id: VznChain; label: string }[] = [{ id: "solana", label: "Solana" }, { id: "base", label: "Base" }, { id: "arbitrum", label: "Arbitrum" }, { id: "ethereum", label: "Ethereum" }];

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className={cn("flex justify-between gap-3 text-sm", strong && "border-t border-border pt-2 font-semibold")}><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}

function useRecord() {
  const session = useSession();
  return async (label: string, amount: number, currency: string, direction: "in" | "out") => {
    if (!session) return;
    await supabase.from("wallet_transactions").insert({ user_id: session.user.id, label, amount, currency, direction });
  };
}

export function WalletConvert() {
  const { kids } = useExperience();
  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Repeat className="size-5 text-cyan" /><CardTitle className="text-lg">Converter e sacar</CardTitle></div>
        <Badge variant="neutral" size="sm">Demonstração · exemplo, não é promessa</Badge>
      </div>
      {kids ? (
        <p className="rounded-lg border bg-background/60 p-4 text-sm text-muted-foreground">Conversões e saques ficam bloqueados no perfil infantil. Troque para o perfil do responsável.</p>
      ) : (
        <Tabs defaultValue="conv" className="space-y-5">
          <TabsList className="max-w-full overflow-x-auto"><TabsTrigger value="conv">Converter</TabsTrigger><TabsTrigger value="fiat">Sacar em dinheiro</TabsTrigger><TabsTrigger value="web3">Sacar VZN (web3)</TabsTrigger></TabsList>
          <TabsContent value="conv"><ConvertTab /></TabsContent>
          <TabsContent value="fiat"><FiatTab /></TabsContent>
          <TabsContent value="web3"><Web3Tab /></TabsContent>
        </Tabs>
      )}
    </Card>
  );
}

function ConvertTab() {
  const { brl, vzn, adjust } = useExperience();
  const toast = useToast(); const record = useRecord();
  const [dir, setDir] = useState<ConvertDir>("fiat-to-vzn");
  const [v, setV] = useState("");
  const [left, setLeft] = useState(30);
  const [rate, setRate] = useState(VZN_RATE_BRL);
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1) { setRate(Math.round(VZN_RATE_BRL * (1 + (Math.random() - 0.5) * 0.02) * 10000) / 10000); return 30; }
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);
  const fiat = dir === "fiat-to-vzn";
  const bal = fiat ? brl : vzn;
  const a = num(v); const q = quote(dir, a || 0, rate);
  const err = v ? validateConvert(dir, a, bal) : null;
  const go = async () => {
    if (validateConvert(dir, a, bal)) return;
    const label = fiat ? `Conversão: R$ ${money(a)} → ${money(q.receive)} VZN` : `Conversão: ${money(a)} VZN → R$ ${money(q.receive)}`;
    adjust(fiat ? -a : q.receive, fiat ? q.receive : -a, label);
    await record(label, fiat ? q.receive : a, "VZN", fiat ? "in" : "out");
    toast({ title: "Conversão concluída", variant: "success" }); setV("");
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="rounded-xl border bg-background/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Você envia</span><span>{fiat ? `Saldo: R$ ${money(brl)}` : `Saldo: ${money(vzn)} VZN`}</span></div>
          <div className="mt-2 flex items-center gap-2">
            <Input inputMode="decimal" placeholder="0,00" value={v} onChange={(e) => setV(e.target.value)} aria-label="Valor" className="font-mono text-lg" />
            <Button size="sm" variant="ghost" onClick={() => setV(String(bal))}>Máx.</Button>
            <span className="w-12 shrink-0 text-right font-mono text-sm">{fiat ? "R$" : "VZN"}</span>
          </div>
        </div>
        <div className="flex justify-center"><Button size="sm" variant="secondary" aria-label="Inverter direção" onClick={() => { setDir(fiat ? "vzn-to-fiat" : "fiat-to-vzn"); setV(""); }}><ArrowDownUp className="size-4" /></Button></div>
        <div className="rounded-xl border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">Você recebe</p>
          <p className="mt-2 font-mono text-2xl">{fiat ? `${money(q.receive)} VZN` : `R$ ${money(q.receive)}`}</p>
        </div>
      </div>
      <div className="space-y-3 rounded-xl border p-4">
        <Row k="Cotação" v={`1 VZN = R$ ${rate.toFixed(4).replace(".", ",")}`} />
        <Row k="Tarifa (1%)" v={fiat ? `R$ ${money(q.fee)}` : `${money(q.fee)} VZN`} />
        <Row k="Atualiza em" v={`${left}s`} />
        <Row strong k="Total" v={fiat ? `${money(q.receive)} VZN` : `R$ ${money(q.receive)}`} />
        {err && <p className="text-sm text-danger">{err}</p>}
        <Button className="w-full" disabled={!v || !!err} onClick={go}><Repeat className="size-4" />Converter</Button>
        <p className="text-xs text-muted-foreground">Cotação de exemplo, não é promessa de valor.</p>
      </div>
    </div>
  );
}

function FiatTab() {
  const { brl, adjust } = useExperience();
  const toast = useToast(); const record = useRecord();
  const [v, setV] = useState("");
  const [cur, setCur] = useState<FiatCurrency>("BRL");
  const [rail, setRail] = useState<FiatRail>("pix");
  const [dest, setDest] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; got: string } | null>(null);
  const a = num(v); const w = withdrawFiat(a || 0, rail, cur, brl);
  const go = async () => {
    if (w.error || !dest.trim()) return;
    setBusy(true); await new Promise((r) => setTimeout(r, 1400));
    const id = ref(); const label = `Saque ${rail === "pix" ? "Pix" : "TED"} · ${cur} · ${id}`;
    adjust(-w.total, 0, label); await record(label, w.total, "BRL", "out");
    setDone({ id, got: `${CUR_SYM[cur]} ${money(w.received)}` }); setBusy(false); setV("");
    toast({ title: "Saque solicitado", variant: "success" });
  };
  if (done) return (
    <div className="mx-auto max-w-md space-y-3 text-center">
      <CheckCircle2 className="mx-auto size-10 text-success" />
      <p className="font-display text-lg tracking-wide">Saque solicitado</p>
      <div className="space-y-2 rounded-xl border p-4 text-left">
        <Row k="Referência" v={done.id} /><Row k="Você recebe" v={done.got} /><Row k="Prazo" v={rail === "pix" ? "Instantâneo" : "1 dia útil"} />
      </div>
      <Button variant="secondary" onClick={() => setDone(null)}>Novo saque</Button>
    </div>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select aria-label="Moeda" value={cur} onChange={(e) => setCur(e.target.value as FiatCurrency)}>{(["BRL", "USD", "EUR", "CNY"] as const).map((c) => <option key={c} value={c}>{c}</option>)}</Select>
          <Select aria-label="Destino" value={rail} onChange={(e) => setRail(e.target.value as FiatRail)}><option value="pix">Pix</option><option value="ted">Transferência bancária</option></Select>
        </div>
        <Input placeholder={rail === "pix" ? "Chave Pix" : "Banco · agência · conta"} value={dest} onChange={(e) => setDest(e.target.value)} aria-label="Conta de destino" />
        <div className="flex items-center gap-2">
          <Input inputMode="decimal" placeholder="Valor em R$" value={v} onChange={(e) => setV(e.target.value)} aria-label="Valor" className="font-mono" />
          <Button size="sm" variant="ghost" onClick={() => setV(String(Math.max(0, brl - w.fee)))}>Máx.</Button>
        </div>
        <p className="text-xs text-muted-foreground">{`Saldo: R$ ${money(brl)} · mínimo R$ 50,00`}</p>
      </div>
      <div className="space-y-3 rounded-xl border p-4">
        <Row k="Tarifa" v={`R$ ${money(w.fee)}`} />
        <Row k="Prazo" v={rail === "pix" ? "Instantâneo" : "1 dia útil"} />
        <Row k="Débito do saldo" v={`R$ ${money(w.total)}`} />
        <div data-no-translate><Row strong k={cur === "BRL" ? "Você recebe" : `Você recebe (${cur})`} v={`${CUR_SYM[cur]} ${money(w.received)}`} /></div>
        {v && w.error && <p className="text-sm text-danger">{w.error}</p>}
        <Button className="w-full" disabled={busy || !v || !!w.error || !dest.trim()} onClick={go}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />}Sacar</Button>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3" />Ambiente de testes · nenhum valor real é transferido</p>
      </div>
    </div>
  );
}

function Web3Tab() {
  const { vzn, adjust } = useExperience();
  const toast = useToast(); const record = useRecord();
  const [wallet, setWallet] = useState<Connected | null>(null);
  const [chain, setChain] = useState<VznChain>("solana");
  const [v, setV] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [tx, setTx] = useState<{ hash: string; chain: VznChain; confirmed: boolean } | null>(null);
  const [avail, setAvail] = useState({ phantom: false, evm: false });
  useEffect(() => setAvail({ phantom: hasPhantom(), evm: hasEvm() }), []);
  const a = num(v); const w = validateWithdrawVzn(a || 0, chain, vzn);

  const connect = async (kind: "phantom" | "evm") => {
    setBusy(kind);
    try {
      const c = kind === "phantom" ? await connectPhantom() : await connectEvm();
      setWallet(c); setChain(kind === "phantom" ? "solana" : (["base", "arbitrum", "ethereum"].includes(c.chain) ? c.chain as VznChain : "base"));
      toast({ title: "Carteira conectada", variant: "success" });
    } catch { toast({ title: "Conexão cancelada", variant: "error" }); }
    setBusy(null);
  };
  const pickChain = async (c: VznChain) => {
    setChain(c);
    if (wallet?.kind === "evm" && c !== "solana") { try { await switchEvm(c); } catch { /* usuário recusou */ } }
  };
  const send = async () => {
    if (!wallet || w.error) return;
    setBusy("send");
    const hash = fakeTxHash(chain);
    const label = `Saque ${money(a)} VZN · ${CHAINS.find((x) => x.id === chain)!.label} · ${short(wallet.address)}`;
    adjust(0, -w.total, label); await record(label, w.total, "VZN", "out");
    setTx({ hash, chain, confirmed: false }); setV(""); setBusy(null);
    setTimeout(() => setTx((t) => (t && t.hash === hash ? { ...t, confirmed: true } : t)), 4000);
  };
  const chainOk = wallet && (wallet.kind === "phantom" ? chain === "solana" : chain !== "solana");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        {wallet ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan/50 bg-cyan/5 p-4">
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{wallet.kind === "phantom" ? "Phantom conectada" : "MetaMask conectada"}</p><p data-no-translate className="truncate font-mono text-sm">{short(wallet.address)}</p><p className="text-xs text-success">Assinatura verificada</p></div>
            <Button size="sm" variant="ghost" onClick={() => setWallet(null)}>Desconectar</Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(["phantom", "evm"] as const).map((k) => {
              const ok = k === "phantom" ? avail.phantom : avail.evm;
              const name = k === "phantom" ? "Phantom" : "MetaMask";
              return ok ? (
                <Button key={k} variant="secondary" disabled={!!busy} onClick={() => connect(k)}>{busy === k ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}{`Conectar ${name}`}</Button>
              ) : (
                <a key={k} href={k === "phantom" ? "https://phantom.app/download" : "https://metamask.io/download/"} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"><ExternalLink className="size-4" />{`Instalar ${name}`}</a>
              );
            })}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHAINS.map((c) => <button key={c.id} type="button" onClick={() => pickChain(c.id)} aria-pressed={chain === c.id} className={cn("rounded-lg border px-3 py-2 text-xs", chain === c.id ? "border-cyan bg-cyan/10 text-cyan" : "text-muted-foreground hover:border-cyan/50")}>{c.label}</button>)}
        </div>
        <div className="flex items-center gap-2">
          <Input inputMode="decimal" placeholder="Valor em VZN" value={v} onChange={(e) => setV(e.target.value)} aria-label="Valor" className="font-mono" />
          <Button size="sm" variant="ghost" onClick={() => setV(String(Math.max(0, vzn - CHAIN_FEE[chain])))}>Máx.</Button>
        </div>
        <p className="text-xs text-muted-foreground">{`Saldo: ${money(vzn)} VZN · mínimo 10 VZN`}</p>
      </div>
      <div className="space-y-3 rounded-xl border p-4">
        <Row k="Taxa de rede (exemplo)" v={`${money(CHAIN_FEE[chain])} VZN`} />
        <Row strong k="Total debitado" v={`${money(w.total)} VZN`} />
        {v && w.error && <p className="text-sm text-danger">{w.error}</p>}
        {wallet && !chainOk && <p className="text-sm text-ember">Esta carteira não suporta a rede escolhida.</p>}
        <Button className="w-full" disabled={!wallet || !chainOk || !v || !!w.error || busy === "send"} onClick={send}><Send className="size-4" />Enviar para minha carteira</Button>
        {!wallet && <p className="text-xs text-muted-foreground">Conecte uma carteira para continuar.</p>}
        {tx && (
          <div className="space-y-2 rounded-lg border bg-background/60 p-3 text-xs">
            <div className="flex items-center justify-between">{tx.confirmed ? <span className="text-success">Confirmada</span> : <span className="inline-flex items-center gap-1 text-cyan"><Loader2 className="size-3 animate-spin" />Em andamento</span>}<Badge variant="neutral" size="sm">exemplo</Badge></div>
            <p data-no-translate className="truncate font-mono">{tx.hash}</p>
            <a href={EXPLORER[tx.chain] + tx.hash} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:underline"><ExternalLink className="size-3" />Ver no explorador (exemplo)</a>
          </div>
        )}
        <p className="text-xs text-muted-foreground">O contrato $VZN ainda não foi lançado: o envio é simulado.</p>
      </div>
    </div>
  );
}
