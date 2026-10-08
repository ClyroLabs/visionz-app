import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, History, Lock, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { Badge, Button, Card, CardTitle, Checkbox, Dialog, Input, Label, Select, useToast } from "@/index";
import { ClientOnly } from "@tanstack/react-router";
import { FaceCapture } from "./face-capture";
import { useExperience, type ChildProfile } from "./store";
import { useSession } from "@/lib/use-session";
import { averageDescriptors, RATINGS } from "@/lib/parental";
import { createChild, deleteChild, deleteFace, enrollFace, getParental, verifyAndApply } from "@/lib/parental.functions";

export const PARENTAL_KEY = ["parental"] as const;

export function useParental(enabled = true) {
  const get = useServerFn(getParental);
  return useQuery({ queryKey: PARENTAL_KEY, queryFn: () => get(), enabled });
}

const EVENT_LABEL: Record<string, string> = { cadastro: "Cadastro facial", exclusao: "Dados faciais apagados", regras: "Regras do perfil", sair_modo_infantil: "Sair do modo infantil", compra: "Compra do perfil infantil" };
const RESULT_TONE: Record<string, "success" | "destructive" | "warning" | "neutral"> = { ok: "success", aprovado: "success", negado: "destructive", bloqueado: "warning", recusado: "neutral" };

/** Global face check window, opened by requestFace() from anywhere in the prototype. */
export function FaceGateHost() {
  const { faceRequest, closeFace } = useExperience();
  const session = useSession();
  const verify = useServerFn(verifyAndApply);
  const qc = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const open = !!faceRequest;
  const close = (ok: boolean) => { setMsg(null); closeFace(ok); };

  const onDone = async (list: number[][]) => {
    if (!faceRequest) return;
    try {
      const r = await verify({ data: { descriptor: list[0], action: faceRequest.action as never } });
      qc.invalidateQueries({ queryKey: PARENTAL_KEY });
      if (r.ok) return close(true);
      setMsg(r.reason === "not_enrolled" ? "not_enrolled" : r.reason === "locked" ? "Muitas tentativas. Tente de novo em 5 minutos." : "Rosto não reconhecido. Tente de novo.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Algo deu errado.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close(false)} title="Confirme que é você" description={faceRequest?.title}>
      {session === null ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Entre com a conta do responsável para usar a verificação facial.</p>
          <Link to="/auth" onClick={() => close(false)}><Button>Entrar</Button></Link>
        </div>
      ) : msg === "not_enrolled" ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Ainda não há rosto cadastrado nesta conta.</p>
          <Link to="/app/conta" onClick={() => close(false)}><Button>Cadastrar meu rosto</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {open && !msg && <ClientOnly><FaceCapture key={round} samples={1} onDone={onDone} /></ClientOnly>}
          {msg && <div className="space-y-3 text-center"><p className="text-sm text-destructive">{msg}</p><Button size="sm" variant="secondary" onClick={() => { setMsg(null); setRound((r) => r + 1); }}>Tentar de novo</Button></div>}
          <p className="text-center text-xs text-muted-foreground">Só o responsável cadastrado pode confirmar. Nenhuma foto é enviada.</p>
        </div>
      )}
    </Dialog>
  );
}

/** "Controle parental" tab: consent + enrollment, child rules, purchase approvals and activity log. */
export function ParentalPanel() {
  const q = useParental();
  const toast = useToast();
  const qc = useQueryClient();
  const { requestFace } = useExperience();
  const enroll = useServerFn(enrollFace);
  const remove = useServerFn(deleteFace);
  const addChild = useServerFn(createChild);
  const delChild = useServerFn(deleteChild);
  const [consent, setConsent] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [newName, setNewName] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: PARENTAL_KEY });

  const save = useMutation({
    mutationFn: (list: number[][]) => enroll({ data: { descriptor: averageDescriptors(list), consent: true } }),
    onSuccess: () => { setCapturing(false); refresh(); toast({ title: "Rosto cadastrado", description: "Agora só você muda as regras.", variant: "success" }); },
    onError: (e) => toast({ title: "Não foi possível cadastrar", description: (e as Error).message, variant: "error" }),
  });
  const erase = useMutation({ mutationFn: () => remove(), onSuccess: () => { refresh(); toast({ title: "Dados faciais apagados", variant: "success" }); } });
  const create = useMutation({ mutationFn: () => addChild({ data: { name: newName } }), onSuccess: () => { setNewName(""); refresh(); } });

  if (q.isLoading) return <Card className="text-center text-muted-foreground">Carregando…</Card>;
  if (q.error) return <Card className="text-center text-destructive">{(q.error as Error).message}</Card>;
  const p = q.data!;

  return (
    <div className="space-y-6">
      <Card variant="featured" padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="inline-flex items-center gap-2 text-lg"><ShieldCheck className="size-5 text-cyan" />Verificação facial do responsável</CardTitle>
          {p.enrolled ? <Badge variant="success" size="sm">Cadastrado</Badge> : <Badge variant="warning" size="sm">Não cadastrado</Badge>}
        </div>
        {p.enrolled ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground"><span>Consentimento dado em</span> {new Date(p.consentAt!).toLocaleDateString("pt-BR")}.</p>
            <Button size="sm" variant="secondary" loading={erase.isPending} onClick={() => erase.mutate()}><Trash2 />Apagar meus dados faciais</Button>
          </div>
        ) : capturing ? (
          <div className="space-y-3">
            <FaceCapture samples={3} onDone={(l) => save.mutate(l)} />
            <div className="text-center"><Button size="sm" variant="ghost" onClick={() => setCapturing(false)}>Cancelar</Button></div>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-1.5 text-sm text-foreground/85">
              <li>• Guardamos só uma "impressão numérica" do rosto (128 números). <strong>Nenhuma foto é salva ou enviada.</strong></li>
              <li>• Ela serve apenas para confirmar que é você antes de mudar regras dos perfis infantis, sair do modo infantil ou aprovar compras.</li>
              <li>• Você pode apagar esses dados a qualquer momento, aqui mesmo.</li>
              <li>• Tratamento de dado biométrico com base no seu consentimento, conforme a LGPD.</li>
            </ul>
            <label className="flex items-start gap-3 text-sm"><Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />Sou o responsável e autorizo o uso do meu rosto para o controle parental.</label>
            <Button disabled={!consent} onClick={() => setCapturing(true)}>Cadastrar meu rosto</Button>
          </div>
        )}
        {p.lockedUntil && Date.parse(p.lockedUntil) > Date.now() && <p className="inline-flex items-center gap-2 text-xs text-warning"><Lock className="size-3" />Bloqueado após 3 tentativas. Libera às {new Date(p.lockedUntil).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.</p>}
      </Card>

      <Card padding="lg" className="space-y-4">
        <CardTitle className="text-lg">Perfis infantis</CardTitle>
        <ul className="space-y-3">
          {(p.children as ChildProfile[]).map((c) => <ChildRules key={c.id} child={c} onDelete={() => delChild({ data: { id: c.id } }).then(refresh)} />)}
          {p.children.length === 0 && <li className="text-sm text-muted-foreground">Nenhum perfil infantil ainda.</li>}
        </ul>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) create.mutate(); }}>
          <Label htmlFor="kid-name" className="sr-only">Nome da criança</Label>
          <Input id="kid-name" placeholder="Nome da criança" value={newName} maxLength={40} onChange={(e) => setNewName(e.target.value)} />
          <Button type="submit" variant="secondary" loading={create.isPending}><UserPlus />Adicionar</Button>
        </form>
        <p className="text-xs text-muted-foreground">Perfis novos começam em Livre e 60 minutos por dia.</p>
      </Card>

      {p.purchases.length > 0 && (
        <Card padding="lg" className="space-y-3">
          <CardTitle className="text-lg">Compras aguardando aprovação</CardTitle>
          {p.purchases.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-xl border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm">{r.title} · <span className="font-mono">{`R$ ${Number(r.price).toFixed(2).replace(".", ",")}`}</span></span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => requestFace({ type: "purchase", requestId: r.id, approve: true }, `Aprovar compra: ${r.title}`).then((ok) => ok && toast({ title: "Compra aprovada", variant: "success" }))}><Check />Aprovar</Button>
                <Button size="sm" variant="secondary" onClick={() => requestFace({ type: "purchase", requestId: r.id, approve: false }, `Recusar compra: ${r.title}`)}><X />Recusar</Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card padding="lg" className="space-y-3">
        <CardTitle className="inline-flex items-center gap-2 text-lg"><History className="size-5 text-cyan" />Atividade</CardTitle>
        <ul className="divide-y">
          {p.events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
              <span className="flex-1">{EVENT_LABEL[e.action] ?? e.action}{e.detail ? ` · ${e.detail}` : ""}</span>
              <Badge size="sm" variant={RESULT_TONE[e.result] ?? "neutral"}>{e.result}</Badge>
              <span className="w-28 text-right text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
            </li>
          ))}
          {p.events.length === 0 && <li className="py-2 text-sm text-muted-foreground">Nenhuma atividade ainda.</li>}
        </ul>
      </Card>
    </div>
  );
}

function ChildRules({ child, onDelete }: { child: ChildProfile; onDelete: () => void }) {
  const { requestFace } = useExperience();
  const toast = useToast();
  const qc = useQueryClient();
  const [rating, setRating] = useState(child.max_rating);
  const [minutes, setMinutes] = useState(child.daily_minutes);
  const dirty = rating !== child.max_rating || minutes !== child.daily_minutes;
  return (
    <li className="space-y-3 rounded-xl border bg-background/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{child.name}</span>
        <Button size="sm" variant="ghost" aria-label={`Remover ${child.name}`} onClick={onDelete}><Trash2 /></Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor={`r-${child.id}`}>Classificação máxima</Label>
          <Select id={`r-${child.id}`} value={rating} onChange={(e) => setRating(e.target.value)}>{RATINGS.map((r) => <option key={r} value={r}>{r === "L" ? "Livre" : `${r} anos`}</option>)}</Select></div>
        <div className="space-y-1.5"><Label htmlFor={`m-${child.id}`}>Tempo de tela por dia: {minutes} min</Label>
          <input id={`m-${child.id}`} type="range" min={0} max={240} step={15} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-3 w-full accent-[var(--cyan)]" /></div>
      </div>
      <Button size="sm" disabled={!dirty} onClick={() => requestFace({ type: "rule", childId: child.id, maxRating: rating, dailyMinutes: minutes }, `Mudar regras de ${child.name}`).then((ok) => {
        if (ok) { qc.invalidateQueries({ queryKey: PARENTAL_KEY }); toast({ title: "Regras salvas", variant: "success" }); }
      })}><ShieldCheck />Salvar com verificação facial</Button>
    </li>
  );
}
