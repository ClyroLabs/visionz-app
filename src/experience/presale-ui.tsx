import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, ExternalLink, Loader2, Lock, PenLine, Wallet } from "lucide-react";
import { Badge, Button, Card, Input, NetworkTag, cn } from "@/index";
import type { LaunchProject } from "./launchpad-data";
import { compact } from "./launchpad-data";
import { EXPLORER, fakeTxHash } from "./convert";
import { connectEvm, connectPhantom, hasEvm, hasPhantom, short, switchEvm } from "./web3";
import { useExperience } from "./store";
import {
  MIN_USD, demoBalance, loadAllocations, payTokens, quote, raisedBy, releaseSchedule, saveAllocation, validate,
  type Allocation, type PayToken, type PresaleError,
} from "./presale";

const fmt = (n: number, d = 2) => n.toLocaleString("pt-BR", { maximumFractionDigits: d });
const usd = (n: number) => `US$ ${fmt(n)}`;
const ERR: Record<Exclude<PresaleError, null>, string> = {
  closed: "Esta rodada não está aberta para apoio.",
  min: `Valor abaixo do mínimo de US$ ${MIN_USD}.`,
  max: "Valor acima do máximo por pessoa.",
  full: "A rodada atingiu o limite de captação.",
  balance: "Saldo insuficiente na moeda escolhida.",
};
const STEPS = ["Carteira", "Moeda", "Revisão", "Confirmação"];

/** Live list of the user's contributions (localStorage, demo). */
export function useAllocations() {
  const [all, setAll] = useState<Allocation[]>([]);
  useEffect(() => {
    const r = () => setAll(loadAllocations());
    r(); window.addEventListener("vz-presale", r);
    return () => window.removeEventListener("vz-presale", r);
  }, []);
  return all;
}

function Notice({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  return <div role="status" className={cn("rounded-lg border p-3 text-sm", tone === "error" ? "border-destructive/50 bg-destructive/10" : tone === "success" ? "border-success/50 bg-success/10" : "border-cyan/40 bg-cyan/10")}>{children}</div>;
}

type W = { address: string; kind: "phantom" | "evm" | "demo" };

export function PresaleCheckout({ p, onBack, onSeeAllocations }: { p: LaunchProject; onBack: () => void; onSeeAllocations: () => void }) {
  const { vzn, adjust, child } = useExperience();
  const all = useAllocations();
  const [step, setStep] = useState(0);
  const [wallet, setWallet] = useState<W | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const tokens = payTokens(p.network);
  const [tok, setTok] = useState<PayToken>(tokens[1]);
  const [amount, setAmount] = useState("");
  const [conf, setConf] = useState(0);
  const [done, setDone] = useState<Allocation | null>(null);

  const mineUsd = all.filter((a) => a.projectId === p.id).reduce((s, a) => s + a.usd, 0);
  const balance = (t: PayToken) => (t.kind === "internal" ? vzn : wallet ? demoBalance(wallet.address, t) : 0);
  const amt = Number(amount.replace(",", ".")) || 0;
  const q = useMemo(() => quote(p, tok, amt, mineUsd, raisedBy(all, p.id)), [p, tok, amt, mineUsd, all]);
  const v = validate(p, q, amt, balance(tok));
  const evm = p.network !== "solana";

  if (child) return <Notice tone="info"><Lock className="mr-2 inline size-4" />Perfis infantis não podem apoiar projetos.</Notice>;

  const connect = async (kind: "real" | "demo") => {
    setErr(null); setBusy("connect");
    try {
      if (kind === "demo") {
        await new Promise((r) => setTimeout(r, 900));
        const addr = evm ? "0x" + fakeTxHash("base").slice(2, 42) : fakeTxHash("solana").slice(0, 44);
        setWallet({ address: addr, kind: "demo" });
      } else {
        const c = evm ? await connectEvm() : await connectPhantom();
        if (evm && c.chain !== p.network) await switchEvm(p.network as "base" | "arbitrum" | "ethereum").catch(() => {});
        setWallet({ address: c.address, kind: c.kind });
      }
      setStep(1);
    } catch (e) { setErr(e instanceof Error ? e.message : "Conexão recusada"); } finally { setBusy(null); }
  };

  const sign = async () => {
    setErr(null); setBusy("sign");
    await new Promise((r) => setTimeout(r, 1600));
    setBusy(null); setStep(3); setConf(0);
    const tx = fakeTxHash(p.network);
    for (let i = 1; i <= 4; i++) { await new Promise((r) => setTimeout(r, 1100)); setConf(i); }
    const a: Allocation = { id: tx.slice(0, 12), projectId: p.id, projectName: p.name, symbol: p.symbol, network: p.network, pay: tok.symbol, amount: amt, usd: q.usd, fee: q.fee, tokens: q.tokens, tx, wallet: wallet!.address, at: new Date().toISOString() };
    saveAllocation(a);
    if (tok.kind === "internal") adjust(0, -amt, `Apoio presale · ${p.name}`);
    setDone(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="ghost" onClick={step > 0 && step < 3 ? () => setStep(step - 1) : onBack} disabled={step === 3 && !done}><ArrowLeft />Voltar</Button>
        <Badge variant="cyan" size="sm">Ambiente de testes · nenhum valor real é cobrado</Badge>
      </div>
      <ol className="grid grid-cols-4 gap-1" aria-label="Etapas">
        {STEPS.map((s, i) => (
          <li key={s} className="space-y-1">
            <div className={cn("h-1 rounded-full", i <= step ? "bg-gradient-brand" : "bg-border")} />
            <p className={cn("truncate text-[11px]", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</p>
          </li>
        ))}
      </ol>
      {err && <Notice tone="error">{err}</Notice>}

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Conecte uma carteira na rede do projeto para reservar sua cota.</p>
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Rede:</span><NetworkTag network={p.network} /></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => connect("real")} disabled={!!busy || !(evm ? hasEvm() : hasPhantom())}
              className="flex items-center gap-3 rounded-lg border bg-background/50 p-4 text-left transition hover:border-cyan disabled:opacity-50">
              <Wallet className="size-6 text-cyan" /><span><span className="block font-medium">{evm ? "MetaMask" : "Phantom"}</span><span className="text-xs text-muted-foreground">{(evm ? hasEvm() : hasPhantom()) ? "Extensão detectada" : "Extensão não instalada"}</span></span>
            </button>
            <button type="button" onClick={() => connect("demo")} disabled={!!busy}
              className="flex items-center gap-3 rounded-lg border border-magenta/40 bg-magenta/5 p-4 text-left transition hover:border-magenta">
              {busy === "connect" ? <Loader2 className="size-6 animate-spin text-magenta" /> : <Wallet className="size-6 text-magenta" />}
              <span><span className="block font-medium">Carteira de demonstração</span><span className="text-xs text-muted-foreground">Endereço e saldos fictícios</span></span>
            </button>
          </div>
        </div>
      )}

      {step >= 1 && wallet && (
        <div className="flex items-center justify-between rounded-lg border bg-background/50 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-success" aria-hidden />Conectada</span>
          <code data-no-translate className="font-mono">{short(wallet.address)}</code>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="label-eyebrow text-xs">Pagar com</p>
          <div className="grid grid-cols-3 gap-2">
            {tokens.map((t) => (
              <button key={t.symbol} type="button" aria-pressed={tok.symbol === t.symbol} onClick={() => { setTok(t); setAmount(""); }}
                className={cn("rounded-lg border p-3 text-left transition", tok.symbol === t.symbol ? "border-magenta bg-magenta/10" : "hover:border-cyan")}>
                <span data-no-translate className="block font-mono font-semibold">{t.symbol}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">{fmt(balance(t), 4)}</span>
                <span className="text-[10px] text-muted-foreground">{t.kind === "internal" ? "Saldo interno" : "Na carteira"}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input aria-label="Valor" inputMode="decimal" placeholder={`Valor em ${tok.symbol}`} value={amount} onChange={(e) => setAmount(e.target.value)} />
            {[0.25, 0.5, 1].map((f) => <Button key={f} size="sm" variant="ghost" onClick={() => setAmount(String(+(Math.min(balance(tok), q.maxUsd / tok.usd) * f).toFixed(4)))}>{f === 1 ? "Máx." : `${f * 100}%`}</Button>)}
          </div>
          <Card padding="md" className="space-y-1.5 text-sm">
            <Row k="Você recebe" v={<span className="text-gradient-brand font-semibold">{compact(q.tokens)} ${p.symbol}</span>} />
            <Row k="Equivale a" v={usd(q.usd)} />
            <Row k="Tarifa de rede" v={usd(q.fee)} />
            <Row k="Mínimo / máximo por pessoa" v={`${usd(MIN_USD)} / ${usd(Math.max(0, q.maxUsd))}`} />
            <Row k="Restante na rodada" v={usd(q.remaining)} />
          </Card>
          {amt > 0 && v && <Notice tone="error">{ERR[v]}</Notice>}
          <Button className="w-full" disabled={!amt || !!v} onClick={() => setStep(2)}>Revisar</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Card padding="md" className="space-y-1.5 text-sm">
            <Row k="Projeto" v={`${p.name} · $${p.symbol}`} />
            <Row k="Pagamento" v={`${fmt(amt, 4)} ${tok.symbol}`} />
            <Row k="Tarifa de rede" v={usd(q.fee)} />
            <Row k="Cota" v={<span className="font-semibold">{compact(q.tokens)} ${p.symbol}</span>} />
            <Row k="Liberação" v={`20% no lançamento + ${Math.min(12, p.vestingMonths)} meses`} />
          </Card>
          {busy === "sign" ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/5 p-6 text-center">
              <PenLine className="size-8 animate-pulse text-cyan" />
              <p className="font-medium">Aguardando assinatura…</p>
              <p className="text-xs text-muted-foreground">Confirme na sua carteira</p>
            </div>
          ) : <Button className="w-full" onClick={sign}><PenLine />Assinar e confirmar</Button>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {!done ? (
            <ol className="space-y-2">
              {["Transação enviada", "Confirmando 1/3", "Confirmando 2/3", "Confirmando 3/3", "Concluída"].map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  {i < conf ? <Check className="size-4 text-success" /> : i === conf ? <Loader2 className="size-4 animate-spin text-cyan" /> : <span className="size-4 rounded-full border" />}
                  <span className={i <= conf ? "" : "text-muted-foreground"}>{s}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="size-12 text-success" />
                <p className="font-display text-lg tracking-wide">Apoio confirmado</p>
                <p className="text-gradient-brand text-2xl font-semibold">{compact(done.tokens)} ${done.symbol}</p>
              </div>
              <Card padding="md" className="space-y-1.5 text-sm">
                <Row k="Pago" v={`${fmt(done.amount, 4)} ${done.pay} (${usd(done.usd)})`} />
                <Row k="Tarifa de rede" v={usd(done.fee)} />
                <Row k="Transação" v={<code data-no-translate className="font-mono text-xs">{short(done.tx)}</code>} />
              </Card>
              <Schedule p={p} tokens={done.tokens} />
              <a href={EXPLORER[p.network] + done.tx} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan hover:underline">Ver no explorador (exemplo)<ExternalLink className="size-3" /></a>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" onClick={onSeeAllocations}>Ver minhas cotas</Button>
                <Button className="flex-1" variant="ghost" onClick={onBack}>Voltar ao projeto</Button>
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">Demonstração · exemplo, não é promessa. Nada é enviado à rede.</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{k}</span><span className="min-w-0 truncate text-right font-mono">{v}</span></div>;
}

function Schedule({ p, tokens }: { p: LaunchProject; tokens: number }) {
  const r = releaseSchedule(p, tokens);
  return (
    <details className="rounded-lg border bg-background/50 p-3 text-xs">
      <summary className="cursor-pointer text-sm">Cronograma de liberação</summary>
      <ul className="mt-2 space-y-1">{r.map((x) => <li key={x.label} className="flex justify-between font-mono"><span>{x.label} · {x.date}</span><span>{compact(x.tokens)}</span></li>)}</ul>
    </details>
  );
}

/** Allocation list; filter by project when given. */
export function MyAllocations({ projectId, projects }: { projectId?: string; projects?: LaunchProject[] }) {
  const all = useAllocations().filter((a) => !projectId || a.projectId === projectId);
  if (all.length === 0) return <Card padding="lg" className="text-center text-sm text-muted-foreground">Você ainda não apoiou {projectId ? "este projeto" : "nenhum projeto"}.</Card>;
  return (
    <ul className="space-y-2">
      {all.map((a) => {
        const p = projects?.find((x) => x.id === a.projectId);
        return (
          <li key={a.id} className="rounded-lg border bg-surface p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{a.projectName} <span data-no-translate className="font-mono text-xs text-muted-foreground">${a.symbol}</span></span>
              <span className="flex items-center gap-2"><NetworkTag network={a.network} /><Badge variant="success" size="sm"><Check className="size-3" />Confirmada</Badge></span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs text-muted-foreground sm:grid-cols-4">
              <span>Cota: <span className="text-foreground">{compact(a.tokens)}</span></span>
              <span>Pago: {fmt(a.amount, 4)} {a.pay}</span>
              <span>{new Date(a.at).toLocaleString("pt-BR")}</span>
              <a href={EXPLORER[a.network] + a.tx} target="_blank" rel="noreferrer" className="truncate text-cyan hover:underline" data-no-translate>{short(a.tx)}</a>
            </div>
            {p && <div className="mt-2"><Schedule p={p} tokens={a.tokens} /></div>}
          </li>
        );
      })}
    </ul>
  );
}
