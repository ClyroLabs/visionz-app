import { useEffect, useMemo, useState } from "react";
import { Banknote, CheckCircle2, Copy, CreditCard, Loader2, Lock, Plus, ShieldCheck, XCircle } from "lucide-react";
import { Badge, Button, Dialog, Input, Label, Select, cn, useToast } from "@/index";
import { CARD_FEE, DEPOSIT_MAX, DEPOSIT_MIN, PIX_TTL_SEC, cardApproved, depositFee, depositTotal, pixPayload, txId, validateAmount, type PayKind } from "./deposit";

export type PayMethod = { id: string; kind: PayKind; title: string; subtitle: string; isDefault?: boolean };
export type DepositResult = { ok: boolean; amount: number; fee: number; total: number; id: string; method: PayMethod; at: Date };

const money = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const methodText = (m: PayMethod) => (m.kind === "pix" ? "Pix" : m.subtitle);
export { methodText };

type Step = "amount" | "method" | "pay" | "done";
const STEPS: [Step, string][] = [["amount", "Valor"], ["method", "Pagamento"], ["pay", "Confirmação"], ["done", "Comprovante"]];

/** Pseudo QR code drawn from the payload hash (visual only). */
function FakeQr({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    const out: boolean[] = [];
    for (let i = 0; i < 25 * 25; i++) { h ^= seed.charCodeAt(i % seed.length) + i; h = Math.imul(h, 16777619) >>> 0; out.push((h & 7) < 3); }
    return out;
  }, [seed]);
  const finder = (x: number, y: number) => [[0, 0], [18, 0], [0, 18]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const finderOn = (x: number, y: number) => { const fx = x < 7 ? 0 : 18, fy = y < 7 ? 0 : 18; const dx = x - fx, dy = y - fy; return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4); };
  return (
    <svg viewBox="-2 -2 29 29" className="size-44 rounded-lg bg-[white] p-1" role="img" aria-label="QR code Pix (exemplo)">
      {cells.map((on, i) => { const x = i % 25, y = Math.floor(i / 25); const v = finder(x, y) ? finderOn(x, y) : on; return v ? <rect key={i} x={x} y={y} width={1} height={1} fill="black" /> : null; })}
    </svg>
  );
}

export function DepositCheckout({ open, onOpenChange, methods, onComplete, onAddMethod }: {
  open: boolean; onOpenChange: (o: boolean) => void; methods: PayMethod[];
  onComplete: (r: DepositResult) => void | Promise<void>;
  onAddMethod?: (m: { kind: PayKind; value: string }) => Promise<PayMethod | null>;
}) {
  const toast = useToast();
  const [step, setStep] = useState<Step>("amount");
  const [raw, setRaw] = useState("50");
  const [methodId, setMethodId] = useState<string>("");
  const [id, setId] = useState("");
  const [secs, setSecs] = useState(PIX_TTL_SEC);
  const [phase, setPhase] = useState<"idle" | "waiting" | "processing" | "otp">("idle");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<DepositResult | null>(null);
  const [adding, setAdding] = useState<{ kind: PayKind; value: string } | null>(null);

  const amount = Number(raw.replace(/\./g, "").replace(",", "."));
  const err = validateAmount(amount);
  const method = methods.find((m) => m.id === methodId) ?? methods.find((m) => m.isDefault) ?? methods[0];
  const kind: PayKind = method?.kind ?? "pix";
  const fee = depositFee(amount || 0, kind), total = depositTotal(amount || 0, kind);

  useEffect(() => { if (open) { setStep("amount"); setPhase("idle"); setResult(null); setOtp(""); setAdding(null); } }, [open]);

  const finish = async (ok: boolean) => {
    if (!method) return;
    const r: DepositResult = { ok, amount, fee, total, id, method, at: new Date() };
    await onComplete(r);
    setResult(r); setStep("done"); setPhase("idle");
  };

  // Pix: countdown + auto-confirmation after a few seconds (simulated webhook).
  useEffect(() => {
    if (step !== "pay" || kind !== "pix") return;
    setSecs(PIX_TTL_SEC); setPhase("waiting");
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    const c = setTimeout(() => { setPhase("processing"); setTimeout(() => finish(true), 1200); }, 6000);
    return () => { clearInterval(t); clearTimeout(c); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, kind]);

  const startPay = () => {
    setId(txId(Date.now() + Math.random() * 1e6));
    setStep("pay");
    if (kind === "card") { setPhase("processing"); setTimeout(() => setPhase("otp"), 1800); }
  };
  const confirmOtp = () => {
    if (!/^\d{6}$/.test(otp)) return toast({ title: "Digite o código de 6 dígitos", variant: "error" });
    setPhase("processing");
    setTimeout(() => finish(cardApproved(amount)), 1500);
  };

  const idx = STEPS.findIndex(([s]) => s === step);
  const payload = id ? pixPayload(amount, id) : "";
  const copy = (v: string, title: string) => { navigator.clipboard?.writeText(v); toast({ title, variant: "success" }); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Adicionar saldo" description="Checkout seguro VisionZ Pay"
      className="max-h-[92dvh] overflow-y-auto max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:rounded-none sm:w-[min(92vw,32rem)]">
      <ol className="mb-5 grid grid-cols-4 gap-1" aria-label="Etapas">
        {STEPS.map(([s, l], i) => (
          <li key={s} className="space-y-1">
            <div className={cn("h-1 rounded-full", i <= idx ? "bg-gradient-brand" : "bg-muted")} />
            <span className={cn("block truncate text-[11px]", i === idx ? "text-foreground" : "text-muted-foreground")}>{l}</span>
          </li>
        ))}
      </ol>

      {step === "amount" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dp-v">Quanto você quer adicionar?</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
              <span className="font-mono text-muted-foreground">R$</span>
              <input id="dp-v" inputMode="decimal" value={raw} onChange={(e) => setRaw(e.target.value.replace(/[^\d.,]/g, ""))} className="h-14 w-full bg-transparent font-display text-3xl font-bold outline-none" />
            </div>
            <p className={cn("text-xs", err && raw ? "text-destructive" : "text-muted-foreground")}>{err && raw ? err : <>Mínimo R$ {DEPOSIT_MIN},00 · máximo R$ {DEPOSIT_MAX.toLocaleString("pt-BR")},00</>}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">{[20, 50, 100, 200].map((v) => <Button key={v} size="sm" variant={amount === v ? "primary" : "secondary"} onClick={() => setRaw(String(v))}>{`R$ ${v}`}</Button>)}</div>
          <Button className="w-full" disabled={!!err} onClick={() => setStep("method")}>Continuar</Button>
        </div>
      )}

      {step === "method" && (
        <div className="space-y-4">
          {methods.length === 0 && !adding && <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Você ainda não tem uma forma de pagamento. Cadastre uma para continuar.</p>}
          <div role="radiogroup" aria-label="Forma de pagamento" className="space-y-2">
            {methods.map((m) => {
              const sel = method?.id === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={sel} onClick={() => setMethodId(m.id)}
                  className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", sel ? "border-cyan bg-cyan/10" : "hover:border-cyan/40")}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-raised">{m.kind === "pix" ? <Banknote className="size-5 text-cyan" /> : <CreditCard className="size-5 text-magenta" />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{m.title}{m.isDefault && <Badge variant="brand" size="sm" className="ml-2 align-middle">Principal</Badge>}</span><span className="block truncate font-mono text-xs text-muted-foreground">{m.subtitle}</span></span>
                  <span className="shrink-0 text-xs text-muted-foreground">{m.kind === "pix" ? "Sem taxa" : `Taxa ${(CARD_FEE * 100).toFixed(2).replace(".", ",")}%`}</span>
                </button>
              );
            })}
          </div>
          {onAddMethod && (adding ? (
            <form className="space-y-2 rounded-lg border p-3" onSubmit={async (e) => { e.preventDefault(); const m = await onAddMethod(adding); if (m) { setMethodId(m.id); setAdding(null); } }}>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <Select aria-label="Tipo" value={adding.kind} onChange={(e) => setAdding({ kind: e.target.value as PayKind, value: "" })}><option value="card">Cartão</option><option value="pix">Pix</option></Select>
                <Input aria-label={adding.kind === "card" ? "Número do cartão" : "Chave Pix"} placeholder={adding.kind === "card" ? "4242 4242 4242 4242" : "E-mail, CPF ou telefone"} value={adding.value} onChange={(e) => setAdding({ ...adding, value: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2"><Button size="sm" variant="ghost" type="button" onClick={() => setAdding(null)}>Cancelar</Button><Button size="sm" type="submit">Salvar</Button></div>
            </form>
          ) : <Button variant="ghost" size="sm" onClick={() => setAdding({ kind: "card", value: "" })}><Plus />Adicionar forma de pagamento</Button>)}
          <dl className="space-y-1 rounded-lg bg-background/60 p-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Valor</dt><dd className="font-mono">{`R$ ${money(amount)}`}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Taxa</dt><dd className="font-mono">{`R$ ${money(fee)}`}</dd></div>
            <div className="flex justify-between border-t pt-1 font-semibold"><dt>Total</dt><dd className="font-mono">{`R$ ${money(total)}`}</dd></div>
          </dl>
          <div className="flex gap-2"><Button variant="ghost" onClick={() => setStep("amount")}>Voltar</Button><Button className="flex-1" disabled={!method} onClick={startPay}><Lock />{`Pagar R$ ${money(total)}`}</Button></div>
        </div>
      )}

      {step === "pay" && kind === "pix" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-fit"><FakeQr seed={payload} /></div>
          <p className="text-sm text-muted-foreground">Abra o app do seu banco e escaneie o QR code ou use o Pix copia e cola.</p>
          <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background/60 p-2">
            <code data-no-translate className="min-w-0 flex-1 truncate font-mono text-xs">{payload}</code>
            <Button size="sm" variant="secondary" onClick={() => copy(payload, "Código Pix copiado")}><Copy />Copiar</Button>
          </div>
          <p className="font-mono text-sm">{`R$ ${money(total)}`} · <span className="text-muted-foreground">expira em {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</span></p>
          <p className="inline-flex items-center gap-2 text-sm text-cyan" aria-live="polite"><Loader2 className="size-4 animate-spin" />{phase === "processing" ? "Pagamento recebido, confirmando..." : "Aguardando pagamento..."}</p>
        </div>
      )}

      {step === "pay" && kind === "card" && (
        <div className="space-y-4 text-center" aria-live="polite">
          {phase === "otp" ? (
            <>
              <ShieldCheck className="mx-auto size-10 text-cyan" />
              <p className="font-semibold">Verificação do banco emissor</p>
              <p className="text-sm text-muted-foreground">Enviamos um código para o celular cadastrado no cartão {method?.subtitle}. Em testes, use qualquer código de 6 dígitos.</p>
              <Input aria-label="Código de verificação" inputMode="numeric" maxLength={6} className="mx-auto max-w-40 text-center font-mono text-lg tracking-[0.4em]" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
              <Button className="w-full" onClick={confirmOtp}>Confirmar</Button>
            </>
          ) : (
            <><Loader2 className="mx-auto size-10 animate-spin text-magenta" /><p className="text-sm text-muted-foreground">Processando com o banco emissor...</p></>
          )}
        </div>
      )}

      {step === "done" && result && (
        <div className="space-y-4">
          <div className="text-center">
            {result.ok ? <CheckCircle2 className="mx-auto size-12 text-success" /> : <XCircle className="mx-auto size-12 text-destructive" />}
            <p className="mt-2 font-display text-lg tracking-wide">{result.ok ? "Depósito aprovado" : "Pagamento recusado"}</p>
            {!result.ok && <p className="text-sm text-muted-foreground">O banco emissor recusou a transação (limite do cartão). Tente um valor menor ou use Pix.</p>}
          </div>
          <dl className="space-y-1.5 rounded-lg border bg-background/60 p-3 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Transação</dt><dd className="flex items-center gap-1 font-mono"><span data-no-translate>{result.id}</span><button type="button" aria-label="Copiar ID" onClick={() => copy(result.id, "ID copiado")} className="text-muted-foreground hover:text-foreground"><Copy className="size-3.5" /></button></dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Data</dt><dd className="font-mono">{result.at.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Meio</dt><dd className="truncate">{methodText(result.method)}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Valor</dt><dd className="font-mono">{`R$ ${money(result.amount)}`}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Taxa</dt><dd className="font-mono">{`R$ ${money(result.fee)}`}</dd></div>
            <div className="flex justify-between gap-2 border-t pt-1.5 font-semibold"><dt>Total</dt><dd className="font-mono">{`R$ ${money(result.total)}`}</dd></div>
          </dl>
          <div className="flex gap-2">{!result.ok && <Button variant="secondary" onClick={() => setStep("method")}>Tentar de novo</Button>}<Button className="flex-1" onClick={() => onOpenChange(false)}>Concluir</Button></div>
        </div>
      )}

      <p className="mt-5 flex items-center justify-center gap-1.5 border-t pt-3 text-[11px] text-muted-foreground"><Lock className="size-3" />Ambiente de testes · nenhum valor real é cobrado</p>
    </Dialog>
  );
}
