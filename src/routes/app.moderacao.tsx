import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BrainCircuit, Check, Flag, Gavel, History, Inbox, ShieldAlert, Sparkles, X } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Select, Stat, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from "@/index";
import { analyzeCreation, decide, getModeration, isModerator } from "@/lib/moderation.functions";
import { RATINGS } from "@/lib/parental";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/app/moderacao")({
  head: () => ({
    meta: [
      { title: "Central de moderação — Protótipo VisionZ" },
      { name: "description", content: "Fila real de criações e denúncias, com explicação da IA e decisão humana." },
      { property: "og:title", content: "Central de moderação — Protótipo VisionZ" },
      { property: "og:description", content: "Revisão humana do Filtro Inteligente VisionZ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Moderation,
});

type Analysis = { allowed: boolean; confidence: number; rating: string; severity: "low" | "medium" | "high"; categories: string[]; reasons: string[] };
const SEV = { high: ["Alta", "destructive"], medium: ["Média", "warning"], low: ["Baixa", "neutral"] } as const;
const CAT: Record<string, string> = { violencia: "Violência", linguagem: "Linguagem", medo: "Medo", sexual: "Sexual", drogas: "Drogas", odio: "Ódio", direitos_autorais: "Direitos autorais", perigo_real: "Perigo real" };
const DEC: Record<string, string> = { approve: "Aprovado", block: "Bloqueado", rating: "Classificação alterada", dismiss: "Descartado" };
const ratingLabel = (r: string) => (r === "L" ? "Livre" : `${r} anos`);

function Moderation() {
  const session = useSession();
  const check = useServerFn(isModerator);
  const mod = useQuery({ queryKey: ["is-mod"], queryFn: () => check(), enabled: !!session });
  if (session === undefined || (session && mod.isLoading)) return <Card className="text-center text-muted-foreground">Carregando…</Card>;
  if (session === null) return <Card className="space-y-3 text-center"><p>Entre com uma conta de moderador.</p><Link to="/auth"><Button>Entrar</Button></Link></Card>;
  if (!mod.data) return <Card className="text-center text-muted-foreground">Esta área é só para a equipe de moderação.</Card>;
  return <Center />;
}

function Center() {
  const get = useServerFn(getModeration);
  const q = useQuery({ queryKey: ["moderation"], queryFn: () => get() });
  const [type, setType] = useState<"all" | "creation" | "report">("all");
  const [sev, setSev] = useState<"all" | "low" | "medium" | "high">("all");
  if (q.isLoading) return <Card className="text-center text-muted-foreground">Carregando fila…</Card>;
  if (q.error) return <Card className="text-center text-destructive">{(q.error as Error).message}</Card>;
  const { creations, reports, history } = q.data!;
  const sevOf = (c: { ai_analysis: unknown }) => ((c.ai_analysis as Analysis | null)?.severity ?? "medium");
  const shownC = type === "report" ? [] : creations.filter((c) => sev === "all" || sevOf(c) === sev);
  const shownR = type === "creation" || sev !== "all" ? [] : reports;

  return (
    <div className="space-y-8">
      <h1 className="text-center font-display text-2xl font-bold tracking-wide sm:text-left sm:text-3xl">Central de moderação</h1>
      <div className="grid gap-4 text-center sm:grid-cols-3 sm:text-left">
        <Card variant="glass"><Stat icon={<Inbox />} value={String(creations.filter((c) => c.status === "review").length)} label="criações em revisão" size="md" /></Card>
        <Card variant="glass"><Stat icon={<Flag />} value={String(reports.length)} label="denúncias de pais abertas" tone="cyan" size="md" /></Card>
        <Card variant="featured"><Stat icon={<Gavel />} value={String(history.length)} label="decisões recentes" size="md" /></Card>
      </div>
      <Tabs defaultValue="fila" className="space-y-6">
        <TabsList><TabsTrigger value="fila">Fila</TabsTrigger><TabsTrigger value="historico">Histórico</TabsTrigger></TabsList>
        <TabsContent value="fila" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-auto"><option value="all">Tudo</option><option value="creation">Criações</option><option value="report">Denúncias</option></Select>
            <Select aria-label="Gravidade" value={sev} onChange={(e) => setSev(e.target.value as typeof sev)} className="w-auto"><option value="all">Toda gravidade</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></Select>
          </div>
          {shownC.map((c) => <CreationItem key={c.id} c={c} />)}
          {shownR.map((r) => <ReportItem key={r.id} r={r} />)}
          {shownC.length + shownR.length === 0 && <Card className="text-center text-muted-foreground">Fila vazia. Tudo revisado!</Card>}
        </TabsContent>
        <TabsContent value="historico">
          <Card padding="lg"><CardTitle className="mb-3 inline-flex items-center gap-2 text-lg"><History className="size-5 text-cyan" />Decisões</CardTitle>
            <ul className="divide-y">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                  <span className="flex-1">{h.target_title}{h.note ? ` · ${h.note}` : ""}</span>
                  <Badge size="sm" variant={h.decision === "approve" ? "success" : h.decision === "block" ? "destructive" : "neutral"}>{DEC[h.decision]}</Badge>
                  {h.rating && <Badge size="sm" variant="cyan">{ratingLabel(h.rating)}</Badge>}
                  <span className="text-xs text-muted-foreground">{h.moderator_id === undefined ? "" : "Moderador"} · {new Date(h.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
              {history.length === 0 && <li className="py-2 text-sm text-muted-foreground">Nenhuma decisão ainda.</li>}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useDecide() {
  const fn = useServerFn(decide);
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (d: Parameters<typeof fn>[0]["data"]) => fn({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["moderation"] }); toast({ title: "Decisão salva", description: "A IA aprende com sua escolha.", variant: "success" }); },
    onError: (e) => toast({ title: "Não foi possível salvar", description: (e as Error).message, variant: "error" }),
  });
}

function CreationItem({ c }: { c: { id: string; tool: string; title: string; description: string | null; age_rating: string; status: string; moderation_note: string | null; ai_analysis: unknown } }) {
  const a = c.ai_analysis as Analysis | null;
  const [rating, setRating] = useState(a?.rating ?? c.age_rating);
  const [note, setNote] = useState("");
  const d = useDecide();
  const run = useServerFn(analyzeCreation);
  const qc = useQueryClient();
  const toast = useToast();
  const analyze = useMutation({
    mutationFn: () => run({ data: { id: c.id } }),
    onSuccess: (r) => { if (!r.ok) toast({ title: "IA indisponível", description: r.error, variant: "error" }); qc.invalidateQueries({ queryKey: ["moderation"] }); },
  });
  const base = { targetType: "creation" as const, targetId: c.id, title: c.title };
  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm" variant="neutral">{c.tool === "synth" ? "Synth" : "Jukebox"}</Badge>
        <Badge size="sm" variant={c.status === "review" ? "warning" : "destructive"}>{c.status === "review" ? "Em revisão" : "Bloqueado pela IA"}</Badge>
        {a && <Badge size="sm" variant={SEV[a.severity][1]}><ShieldAlert className="size-3" />{SEV[a.severity][0]}</Badge>}
      </div>
      <div><CardTitle>{c.title}</CardTitle>{c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}</div>
      {a ? (
        <div className="space-y-2 rounded-xl border border-cyan/30 bg-cyan/5 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold"><BrainCircuit className="size-4 text-cyan" />Explicação da IA · <span className="font-mono">{Math.round(a.confidence * 100)}%</span> <span>de confiança</span></p>
          <ul className="space-y-1 text-sm text-foreground/85">{a.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
          <div className="flex flex-wrap gap-2">{a.categories.map((k) => <Badge key={k} size="sm" variant="neutral">{CAT[k] ?? k}</Badge>)}<Badge size="sm" variant="cyan"><span>Sugestão:</span> {ratingLabel(a.rating)}</Badge></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">{c.moderation_note ?? "Sem análise detalhada."}</p>}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Select aria-label="Classificação" value={rating} onChange={(e) => setRating(e.target.value)} className="lg:w-36">{RATINGS.map((r) => <option key={r} value={r}>{ratingLabel(r)}</option>)}</Select>
        <Input aria-label="Nota para o criador" placeholder="Nota para o criador (opcional)" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" loading={analyze.isPending} onClick={() => analyze.mutate()}><Sparkles />{a ? "Reanalisar" : "Analisar com IA"}</Button>
          <Button size="sm" loading={d.isPending} onClick={() => d.mutate({ ...base, decision: "approve", rating: rating as never, note: note || undefined })}><Check />Aprovar</Button>
          <Button size="sm" variant="secondary" onClick={() => d.mutate({ ...base, decision: "rating", rating: rating as never })}>Só mudar classificação</Button>
          <Button size="sm" variant="destructive" onClick={() => d.mutate({ ...base, decision: "block", note: note || undefined })}><X />Bloquear</Button>
        </div>
      </div>
    </Card>
  );
}

function ReportItem({ r }: { r: { id: string; title: string; reason: string; details: string | null; created_at: string } }) {
  const d = useDecide();
  const base = { targetType: "report" as const, targetId: r.id, title: r.title };
  return (
    <Card padding="lg" className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap gap-2"><Badge size="sm" variant="cyan"><Flag className="size-3" />Denúncia de responsável</Badge><Badge size="sm" variant="warning">{r.reason}</Badge></div>
        <CardTitle>{r.title}</CardTitle>
        {r.details && <p className="text-sm text-muted-foreground">{r.details}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" loading={d.isPending} onClick={() => d.mutate({ ...base, decision: "approve", note: "Denúncia procedente" })}><Check />Procedente</Button>
        <Button size="sm" variant="secondary" onClick={() => d.mutate({ ...base, decision: "dismiss" })}>Descartar</Button>
      </div>
    </Card>
  );
}
