import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { Badge, Button, Card, CardTitle, Progress, cn, useToast } from "@/index";
import { FEATURES, FEATURE_LABEL, LIMITS, PLANS, PLAN_IDS, cheapestPlanFor, remaining, type Feature, type PlanId } from "@/lib/plans";
import { getPlanUsage, setPlan } from "@/lib/plans.functions";

const EMPTY = { plan: "free" as PlanId, used: Object.fromEntries(FEATURES.map((f) => [f, 0])) as Record<Feature, number> };

export function usePlan() {
  const fn = useServerFn(getPlanUsage);
  const q = useQuery({ queryKey: ["plan-usage"], queryFn: () => fn().catch(() => EMPTY), staleTime: 15_000 });
  const d = q.data ?? EMPTY;
  return { ...d, left: (f: Feature) => remaining(d.plan, f, d.used[f]), limit: (f: Feature) => LIMITS[d.plan][f], loaded: !!q.data };
}

export const useRefreshPlan = () => { const qc = useQueryClient(); return () => qc.invalidateQueries({ queryKey: ["plan-usage"] }); };

/** Small "N left" note under an AI button; turns into an upgrade link when blocked. */
export function QuotaHint({ feature, className }: { feature: Feature; className?: string }) {
  const p = usePlan();
  const lim = p.limit(feature), left = p.left(feature);
  if (lim === 0 || left === 0) {
    const up = PLAN_IDS.find((x) => LIMITS[x][feature] > (lim || 0) && PLAN_IDS.indexOf(x) > PLAN_IDS.indexOf(p.plan)) ?? cheapestPlanFor(feature);
    return <Link to="/app/conta" search={{ tab: "plano" }} className={cn("inline-flex items-center gap-1 text-xs text-ember hover:underline", className)}><Lock className="size-3" /><span>{lim === 0 ? "Não incluído no seu plano" : "Limite do mês atingido"}</span>{up && <span>{` · upgrade para ${PLANS[up].name}`}</span>}</Link>;
  }
  return <span className={cn("text-xs text-muted-foreground", className)}><span className="font-mono">{`${left}/${lim}`}</span> <span>{feature === "api_call" ? "restantes hoje" : "restantes este mês"}</span></span>;
}

export const blocked = (p: ReturnType<typeof usePlan>, f: Feature) => p.left(f) === 0;

/** Lock card shown instead of a feature the plan doesn't include. */
export function PlanGate({ feature, children }: { feature: Feature; children: React.ReactNode }) {
  const p = usePlan();
  if (p.limit(feature) > 0) return <>{children}</>;
  const up = cheapestPlanFor(feature);
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-ember/40 bg-ember/5 p-4 sm:flex-row sm:items-center">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ember/15 text-ember"><Lock className="size-4" /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{FEATURE_LABEL[feature]}</p><p className="text-xs text-muted-foreground">{up ? `Disponível a partir do plano ${PLANS[up].name}.` : "Indisponível."}</p></div>
      <Link to="/app/conta" search={{ tab: "plano" }} className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-brand px-4 text-sm text-white"><Sparkles className="size-4" />Ver planos</Link>
    </div>
  );
}

/** My account → Plano e uso. */
export function PlanUsageTab() {
  const p = usePlan();
  const set = useServerFn(setPlan);
  const refresh = useRefreshPlan();
  const toast = useToast();
  const m = useMutation({ mutationFn: (plan: PlanId) => set({ data: { plan } }), onSuccess: () => { refresh(); toast({ title: "Plano alterado", variant: "success" }); } });
  const next = new Date(); next.setUTCMonth(next.getUTCMonth() + 1, 1);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_IDS.map((id) => { const x = PLANS[id]; const on = id === p.plan; return (
          <Card key={id} variant={on ? "featured" : undefined} padding="lg" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2"><CardTitle className="text-base">{x.name}</CardTitle>{on && <Badge size="sm" variant="cyan">Atual</Badge>}</div>
            <p className="font-display text-2xl text-gradient-brand">{x.price}<span className="text-xs text-muted-foreground">/mês</span></p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><span>Telas simultâneas</span>: <span className="font-mono text-foreground">{x.screens}</span></li>
              <li><span>Exportação máxima</span>: <span className="font-mono text-foreground">{x.maxResolution}</span></li>
              {FEATURES.map((f) => <li key={f}><span>{FEATURE_LABEL[f]}</span>: <span className="font-mono text-foreground">{LIMITS[id][f] || "—"}</span></li>)}
              <li><span>Chaves de API</span>: <span className="font-mono text-foreground">{x.apiKeys || "—"}</span></li>
            </ul>
            <Button size="sm" variant={on ? "ghost" : "secondary"} disabled={on} loading={m.isPending && m.variables === id} onClick={() => m.mutate(id)} className="mt-auto">{on ? "Seu plano" : "Escolher"}</Button>
          </Card>); })}
      </div>
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Uso deste mês</CardTitle><span className="text-xs text-muted-foreground"><span>Renova em</span> <span className="font-mono">{next.toLocaleDateString()}</span></span></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => { const lim = p.limit(f); const u = p.used[f]; return (
            <div key={f} className="space-y-1">
              <div className="flex justify-between text-sm"><span>{FEATURE_LABEL[f]}</span><span className="font-mono">{lim ? `${u}/${lim}` : "—"}</span></div>
              {lim ? <Progress value={(u / lim) * 100} variant={u >= lim ? "default" : "cyan"} label={FEATURE_LABEL[f]} /> : <p className="text-xs text-muted-foreground"><Lock className="mr-1 inline size-3" />Não incluído no seu plano</p>}
            </div>); })}
        </div>
      </Card>
      <p className="text-xs text-muted-foreground">Demonstração · exemplo, não é promessa — nenhuma cobrança real ao trocar de plano.</p>
    </div>
  );
}
