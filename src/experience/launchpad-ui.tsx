import { useMemo, useState } from "react";
import { CalendarDays, Copy, Search, ShieldCheck, Users } from "lucide-react";
import { Badge, Button, Card, Dialog, Input, NetworkTag, Progress, Select, cn, useToast } from "@/index";
import { MyAllocations, PresaleCheckout, useAllocations } from "./presale-ui";
import { raisedBy } from "./presale";
import { LP_CATEGORIES, LP_NETWORKS, LP_PROJECTS, LP_STATUSES, compact, fdv, filterProjects, marketCap, progressPct, type LaunchProject, type LpFilter, type LpSort } from "./launchpad-data";

const tone = { Ativo: "success", "Em análise": "warning", Captação: "cyan", Encerrado: "neutral" } as const;
const netLabel = { solana: "Solana", base: "Base", arbitrum: "Arbitrum", ethereum: "Ethereum" } as const;
const usd = (n: number) => n === 0 ? "US$ 0" : `US$ ${n < 1 ? n.toFixed(n < 0.01 ? 4 : 3) : compact(n)}`;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-magenta bg-magenta/15 text-foreground" : "text-muted-foreground hover:text-foreground")}>
      {children}
    </button>
  );
}

export function LaunchpadGallery() {
  const [f, setF] = useState<LpFilter>({ category: "Todas", network: "todas", status: "Todos", q: "", sort: "recentes" });
  const [open, setOpen] = useState<LaunchProject | null>(null);
  const all = useAllocations();
  const live = useMemo(() => LP_PROJECTS.map((p) => { const extra = raisedBy(all, p.id); const n = all.filter((a) => a.projectId === p.id).length; return extra ? { ...p, raised: p.raised + extra, backers: p.backers + n } : p; }), [all]);
  const list = useMemo(() => filterProjects(live, f), [f, live]);
  const up = (p: Partial<LpFilter>) => setF({ ...f, ...p });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:gap-3">
        <div className="relative col-span-3 min-w-0 sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Buscar projeto" placeholder="Buscar projeto ou símbolo" className="pl-9" value={f.q} onChange={(e) => up({ q: e.target.value })} />
        </div>
        <Select aria-label="Rede" value={f.network} onChange={(e) => up({ network: e.target.value as LpFilter["network"] })}>
          <option value="todas">Todas as redes</option>
          {LP_NETWORKS.map((n) => <option key={n} value={n}>{netLabel[n]}</option>)}
        </Select>
        <Select aria-label="Status" value={f.status} onChange={(e) => up({ status: e.target.value as LpFilter["status"] })}>
          <option value="Todos">Todos os status</option>
          {LP_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select aria-label="Ordenar" value={f.sort} onChange={(e) => up({ sort: e.target.value as LpSort })}>
          <option value="recentes">Mais recentes</option><option value="captado">Mais captado</option><option value="apoiadores">Mais apoiadores</option>
        </Select>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        <Chip active={f.category === "Todas"} onClick={() => up({ category: "Todas" })}>Todas</Chip>
        {LP_CATEGORIES.map((c) => <Chip key={c} active={f.category === c} onClick={() => up({ category: c })}>{c}</Chip>)}
      </div>
      <p className="text-xs text-muted-foreground">{list.length} projetos</p>

      {list.length === 0 ? (
        <Card padding="lg" className="text-center text-sm text-muted-foreground">Nenhum projeto com esses filtros.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((p) => <ProjectCard key={p.id} p={p} onOpen={() => setOpen(p)} />)}
        </div>
      )}
      <ProjectDialog p={open ? live.find((x) => x.id === open.id) ?? open : null} onClose={() => setOpen(null)} />
    </div>
  );
}

function ProjectCard({ p, onOpen }: { p: LaunchProject; onOpen: () => void }) {
  const pct = progressPct(p);
  return (
    <button type="button" onClick={onOpen} aria-label={`Ver detalhes de ${p.name}`}
      className="group min-w-0 overflow-hidden rounded-xl border bg-surface text-left transition hover:-translate-y-0.5 hover:border-magenta/60 hover:shadow-glow-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={p.image} alt="" loading="lazy" width={992} height={672} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute left-3 top-3"><NetworkTag network={p.network} className="bg-background/80 backdrop-blur" /></div>
        <div className="absolute right-3 top-3"><Badge variant={tone[p.status]} size="sm">{p.status}</Badge></div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex min-w-0 items-baseline justify-between gap-2">
          <h3 className="truncate font-display text-base tracking-wide">{p.name}</h3>
          <span data-no-translate className="shrink-0 font-mono text-xs text-muted-foreground">${p.symbol}</span>
        </div>
        <p className="text-xs text-cyan">{p.category}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{p.text}</p>
        <div className="space-y-1">
          <Progress value={pct} label={`Captação ${pct}%`} />
          <div className="flex justify-between font-mono text-xs text-muted-foreground"><span>{usd(p.raised)} / {usd(p.goal)}</span><span>{pct}%</span></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-mono">{usd(p.priceUsd)}</span>
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden />{compact(p.backers)}</span>
        </div>
      </div>
    </button>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return <div className="min-w-0 rounded-lg border bg-background/50 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="truncate font-mono text-sm">{v}</dd></div>;
}

function ProjectDialog({ p, onClose }: { p: LaunchProject | null; onClose: () => void }) {
  const toast = useToast();
  const [mode, setMode] = useState<"info" | "buy" | "mine">("info");
  const [lastId, setLastId] = useState<string | null>(null);
  if ((p?.id ?? null) !== lastId) { setLastId(p?.id ?? null); setMode("info"); }
  const alloc = p ? ([["Comunidade", p.allocation.community, "bg-magenta"], ["Equipe", p.allocation.team, "bg-primary"], ["Tesouraria", p.allocation.treasury, "bg-cyan"], ["Liquidez", p.allocation.liquidity, "bg-gold"]] as const) : [];
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()} title={p?.name ?? ""} description={p?.category ?? ""}
      className="max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:rounded-none sm:w-[min(92vw,44rem)] max-h-[90dvh] overflow-y-auto">
      {p && mode === "buy" && <PresaleCheckout p={p} onBack={() => setMode("info")} onSeeAllocations={() => setMode("mine")} />}
      {p && mode === "mine" && (
        <div className="space-y-3">
          <Button size="sm" variant="ghost" onClick={() => setMode("info")}>Voltar ao projeto</Button>
          <p className="label-eyebrow text-xs">Minhas cotas</p>
          <MyAllocations projectId={p.id} projects={LP_PROJECTS} />
        </div>
      )}
      {p && mode === "info" && (
        <div className="space-y-5">
          <div className="relative -mx-1 overflow-hidden rounded-lg">
            <img src={p.image} alt={p.name} width={992} height={672} className="aspect-[16/8] w-full object-cover" />
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2"><NetworkTag network={p.network} className="bg-background/80" /><Badge variant={tone[p.status]} size="sm">{p.status}</Badge>{p.audited && <Badge variant="success" size="sm"><ShieldCheck className="size-3" />Auditado</Badge>}</div>
          </div>
          <p className="text-sm text-muted-foreground">{p.text}</p>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat k="Supply total" v={compact(p.totalSupply)} />
            <Stat k="Circulante" v={compact(p.circulating)} />
            <Stat k="Preço" v={usd(p.priceUsd)} />
            <Stat k="Valor de mercado" v={usd(marketCap(p))} />
            <Stat k="Valor totalmente diluído" v={usd(fdv(p))} />
            <Stat k="Apoiadores" v={compact(p.backers)} />
          </dl>
          <div className="space-y-2">
            <p className="label-eyebrow text-xs">Distribuição</p>
            <div className="flex h-3 overflow-hidden rounded-full">{alloc.map(([n, v, c]) => <div key={n} className={c} style={{ width: `${v}%` }} />)}</div>
            <ul className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">{alloc.map(([n, v, c]) => <li key={n} className="flex items-center gap-1.5"><span className={cn("size-2 rounded-full", c)} aria-hidden />{n} <span className="font-mono">{v}%</span></li>)}</ul>
          </div>
          <div className="space-y-1">
            <p className="label-eyebrow text-xs">Captação</p>
            <Progress value={progressPct(p)} label="Captação" />
            <p className="font-mono text-xs text-muted-foreground">{usd(p.raised)} / {usd(p.goal)} · {progressPct(p)}%</p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-cyan" aria-hidden />Lançamento: <span className="font-mono">{p.launch}</span></p>
            <p>Liberação da equipe: <span className="font-mono">{p.vestingMonths}</span> meses</p>
          </div>
          <div className="space-y-1">
            <p className="label-eyebrow text-xs">Contrato (fictício)</p>
            <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background/50 p-2">
              <code data-no-translate className="min-w-0 flex-1 truncate font-mono text-xs">{p.contract}</code>
              <Button size="sm" variant="ghost" aria-label="Copiar endereço" onClick={() => { navigator.clipboard?.writeText(p.contract); toast({ title: "Endereço copiado" }); }}><Copy /></Button>
            </div>
            <p data-no-translate className="font-mono text-xs text-muted-foreground">{p.site}</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
            <Button variant="ghost" onClick={() => setMode("mine")}>Minhas cotas</Button>
            <Button disabled={p.status !== "Captação"} onClick={() => setMode("buy")}>Apoiar (demonstração)</Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Demonstração · exemplo, não é promessa. Dados simulados, sem dinheiro real.</p>
        </div>
      )}
    </Dialog>
  );
}

export function AllocationsTab() {
  return <MyAllocations projects={LP_PROJECTS} />;
}
