import { useMemo, useState } from "react";
import { Clock, Coins, Copy, Gavel, Layers, Lock, PieChart, Rocket, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { Badge, Button, Card, Dialog, Input, Label, NetworkTag, cn, useToast } from "@/index";
import { TEMPLATES, defaults, splitTotal, splitValid, stakingProjection, templateSnippet, vestingSchedule, type Template, type TplId, type TplNetwork } from "./templates";

const ICON: Record<TplId, LucideIcon> = { token: Coins, staking: TrendingUp, vesting: Lock, royalties: PieChart, auction: Gavel };
const NETS: TplNetwork[] = ["solana", "base", "arbitrum", "ethereum"];
const NET_LABEL: Record<TplNetwork, string> = { solana: "Solana", base: "Base", arbitrum: "Arbitrum", ethereum: "Ethereum" };

export function TemplateGallery({ onUse }: { onUse: (t: Template, v: Record<string, number>) => void }) {
  const [net, setNet] = useState<TplNetwork | "all">("all");
  const [open, setOpen] = useState<Template | null>(null);
  const list = TEMPLATES.filter((t) => net === "all" || t.networks.includes(net));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...NETS] as const).map((n) => (
          <button key={n} type="button" onClick={() => setNet(n)} aria-pressed={net === n}
            className={cn("rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", net === n ? "border-cyan bg-cyan/10 text-cyan" : "text-muted-foreground hover:text-foreground")}>
            {n === "all" ? "Todas as redes" : NET_LABEL[n]}
          </button>
        ))}
        <Badge variant="neutral" size="sm" className="ml-auto">Demonstração · exemplo, não é promessa</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => { const I = ICON[t.id]; return (
          <button key={t.id} type="button" onClick={() => setOpen(t)} className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
            <Card padding="lg" className="h-full space-y-4 transition-all group-hover:-translate-y-0.5 group-hover:border-magenta/60 group-hover:shadow-glow-magenta">
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-brand text-white"><I className="size-5" /></span>
                <Badge variant="success" size="sm"><ShieldCheck className="size-3" />Pré-auditado</Badge>
              </div>
              <div><h3 className="font-display text-lg tracking-wide">{t.name}</h3><p className="mt-1 text-sm text-muted-foreground">{t.text}</p></div>
              <ul className="space-y-1 text-xs text-muted-foreground">{t.features.map((f) => <li key={f} className="flex items-center gap-1.5"><Layers className="size-3 text-cyan" />{f}</li>)}</ul>
              <div className="flex flex-wrap gap-1.5">{t.networks.map((n) => <NetworkTag key={n} network={n} />)}</div>
              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">{t.level}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="size-3" />{`~${t.minutes} min`}</span>
                <span className="font-mono text-gradient-brand">{`${t.costVzn} VZN`}</span>
              </div>
            </Card>
          </button>); })}
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum modelo para esta rede.</p>}
      <TemplateDialog t={open} onClose={() => setOpen(null)} onUse={(t, v) => { setOpen(null); onUse(t, v); }} />
    </div>
  );
}

function TemplateDialog({ t, onClose, onUse }: { t: Template | null; onClose: () => void; onUse: (t: Template, v: Record<string, number>) => void }) {
  return (
    <Dialog open={!!t} onOpenChange={(o) => !o && onClose()} title={t?.name ?? ""} description={t?.text ?? ""}
      className="max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:rounded-none sm:w-[min(92vw,44rem)] max-h-[90dvh] overflow-y-auto">
      {t && <Body key={t.id} t={t} onUse={onUse} />}
    </Dialog>
  );
}

function Body({ t, onUse }: { t: Template; onUse: (t: Template, v: Record<string, number>) => void }) {
  const toast = useToast();
  const [v, setV] = useState(() => defaults(t));
  const code = useMemo(() => templateSnippet(t, v), [t, v]);
  const split = [v.a, v.b, v.c];
  const invalid = t.id === "royalties" && !splitValid(split);
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t.about}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {t.params.map((p) => (
          <div key={p.key} className="space-y-1.5">
            <Label htmlFor={`tp-${p.key}`}>{p.label}</Label>
            <Input id={`tp-${p.key}`} type="number" min={p.min} max={p.max} step={p.step} value={v[p.key]}
              onChange={(e) => { const n = Math.min(p.max, Math.max(p.min, Number(e.target.value) || 0)); setV({ ...v, [p.key]: n }); }} />
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-surface p-4">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Prévia</p>
        {t.id === "vesting" && <Bars values={vestingSchedule(v.cliff, v.duration)} max={100} unit="%" />}
        {t.id === "staking" && <Bars values={stakingProjection(v.apy, v.months)} unit="" />}
        {t.id === "royalties" && (
          <div className="space-y-2">
            <div className="flex h-4 overflow-hidden rounded-full bg-background">{split.map((n, i) => <span key={i} className={["bg-magenta", "bg-primary", "bg-cyan"][i]} style={{ width: `${Math.min(100, n)}%` }} />)}</div>
            <p className={cn("text-xs", invalid ? "text-destructive" : "text-success")}>{invalid ? `A soma está em ${splitTotal(split)}%. Ajuste para 100%.` : "Divisão válida: 100%."}</p>
          </div>
        )}
        {t.id === "auction" && (
          <ol className="grid grid-cols-3 gap-2 text-center text-xs">
            <li className="rounded border p-2"><p className="text-muted-foreground">Abertura</p><p className="font-mono">{`${v.start} VZN`}</p></li>
            <li className="rounded border p-2"><p className="text-muted-foreground">Lances</p><p className="font-mono">{`${v.hours} h`}</p></li>
            <li className="rounded border p-2"><p className="text-muted-foreground">Prorrogação</p><p className="font-mono">+5 min</p></li>
          </ol>
        )}
        {t.id === "token" && <p className="font-mono text-sm">{`${v.supply.toLocaleString("pt-BR")} mi tokens · ${v.decimals} casas decimais`}</p>}
      </div>
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border bg-background p-4 font-mono text-xs"><code>{code}</code></pre>
        <Button size="sm" variant="ghost" className="absolute right-2 top-2" aria-label="Copiar código" onClick={() => { void navigator.clipboard?.writeText(code); toast({ title: "Código copiado", variant: "success" }); }}><Copy /></Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Nada é publicado na rede · exemplo, não é promessa</span>
        <Button disabled={invalid} onClick={() => onUse(t, v)}><Rocket />Usar este modelo</Button>
      </div>
    </div>
  );
}

function Bars({ values, max, unit }: { values: number[]; max?: number; unit: string }) {
  const top = max ?? Math.max(...values);
  const lo = max ? 0 : Math.min(...values) * 0.98;
  return (
    <div>
      <div className="flex h-24 items-end gap-0.5">{values.map((n, i) => <span key={i} title={`${n}${unit}`} className="flex-1 rounded-t bg-gradient-brand" style={{ height: `${Math.max(2, ((n - lo) / (top - lo || 1)) * 100)}%` }} />)}</div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground"><span>{`${values[0]}${unit}`}</span><span>{`${values.at(-1)}${unit}`}</span></div>
    </div>
  );
}
