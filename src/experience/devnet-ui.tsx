import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ExternalLink, Link2, Loader2 } from "lucide-react";
import { getBase58Decoder } from "@solana/kit";
import { Badge, Button, Card, CardTitle, useToast } from "@/index";
import { useSession } from "@/lib/use-session";
import { claimDevnetReward, getDevnetStatus, linkWallet } from "@/lib/vzn-rewards.functions";
import { explorerTx, walletProofMessage, ONCHAIN_MISSIONS, isCompleted } from "@/lib/vzn-rules";
import { useExperience } from "./store";
import { hasPhantom, short } from "./web3";

type Sol = { connect: () => Promise<{ publicKey: { toString(): string } }>; signMessage: (m: Uint8Array, e: string) => Promise<{ signature: Uint8Array }> };
const phantom = () => { const w = window as unknown as { phantom?: { solana?: Sol }; solana?: Sol }; return w.phantom?.solana ?? w.solana; };

type ClaimData = { kind: "conclusao"; titleRef: string; kids: boolean } | { kind: "missao"; mission: "assistir30" | "concluir1"; kids: boolean };
export const DEVNET_KEY = ["vzn-devnet"] as const;

/** Real $VZN on Solana devnet: link Phantom, claim missions/completions, see on-chain history. */
export function DevnetRewardsCard() {
  const session = useSession();
  const { kids } = useExperience();
  const toast = useToast();
  const qc = useQueryClient();
  const status = useServerFn(getDevnetStatus);
  const link = useServerFn(linkWallet);
  const claim = useServerFn(claimDevnetReward);
  const q = useQuery({ queryKey: DEVNET_KEY, queryFn: () => status(), enabled: !!session });
  const [busy, setBusy] = useState<string | null>(null);

  if (!session) return null;
  const s = q.data;

  const connect = async () => {
    const p = phantom();
    if (!p || !hasPhantom()) { toast({ title: "Phantom não encontrada", description: "Instale a extensão Phantom e mude a rede para Devnet.", variant: "info" }); return; }
    setBusy("link");
    try {
      const addr = (await p.connect()).publicKey.toString();
      const { signature } = await p.signMessage(new TextEncoder().encode(walletProofMessage(addr, session.user.id)), "utf8");
      await link({ data: { address: addr, signature: getBase58Decoder().decode(signature) } });
      toast({ title: "Carteira vinculada", description: short(addr), variant: "success" });
      qc.invalidateQueries({ queryKey: DEVNET_KEY });
    } catch (e) { toast({ title: "Não foi possível vincular", description: (e as Error).message, variant: "error" }); }
    setBusy(null);
  };

  const run = async (id: string, input: ClaimData) => {
    setBusy(id);
    try {
      const r = await claim({ data: input });
      if (r.ok) toast({ title: `+${r.amount.toLocaleString("pt-BR")} $VZN na devnet`, description: "Enviado para sua Phantom.", variant: "reward" });
      else toast({ title: "Sem envio agora", description: r.reason, variant: "info" });
    } catch (e) { toast({ title: "Erro no envio", description: (e as Error).message, variant: "error" }); }
    qc.invalidateQueries({ queryKey: DEVNET_KEY });
    setBusy(null);
  };

  const sent = new Set((s?.rewards ?? []).filter((r) => r.status !== "failed").map((r) => r.claim_key));
  const today = new Date().toISOString().slice(0, 10);
  const missions = [
    { id: "assistir30" as const, label: "Assistir 30 minutos", done: (s?.secondsToday ?? 0) >= ONCHAIN_MISSIONS.assistir30, progress: `${Math.min(30, Math.floor((s?.secondsToday ?? 0) / 60))}/30 min` },
    { id: "concluir1" as const, label: "Concluir um título", done: (s?.completedToday ?? 0) >= 1, progress: `${Math.min(1, s?.completedToday ?? 0)}/1` },
  ];

  return (
    <Card variant="glow" padding="lg" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-lg">$VZN real na Solana devnet</CardTitle>
        <Badge variant="cyan" size="sm" data-no-translate>Solana devnet</Badge>
      </div>
      <p className="text-xs text-muted-foreground">Solana devnet · tokens de teste, sem valor real. Na Phantom, ative o modo de teste e escolha Devnet para ver seus $VZN.</p>
      {kids ? <p className="text-sm text-cyan">Perfil infantil: ganha só XP, nunca $VZN.</p>
        : q.isLoading ? <Loader2 className="size-5 animate-spin" />
        : !s?.configured ? <p className="text-sm text-muted-foreground">A carteira de recompensas da devnet ainda está sendo abastecida. Volte em breve.</p>
        : !s.wallet ? (
          <Button onClick={connect} disabled={busy === "link"}>{busy === "link" ? <Loader2 className="animate-spin" /> : <Link2 />}Conectar Phantom (devnet)</Button>
        ) : (
          <>
            <p className="text-sm"><span>Carteira vinculada:</span> <span className="font-mono" data-no-translate>{short(s.wallet)}</span></p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {missions.map((m) => {
                const got = sent.has(`missao:${m.id}:${today}`);
                return (
                  <li key={m.id} className="flex flex-col gap-2 rounded-xl border bg-background/60 p-3">
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">{m.progress} · 1 $VZN</p>
                    <Button size="sm" variant={m.done && !got ? "primary" : "secondary"} disabled={!m.done || got || !!busy} onClick={() => run(m.id, { kind: "missao", mission: m.id, kids })}>
                      {busy === m.id ? <Loader2 className="animate-spin" /> : got ? <><CheckCircle2 />Enviado</> : m.done ? "Receber na devnet" : "Em andamento"}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <CompletionClaims sent={sent} busy={busy} onClaim={(t) => run(`c:${t}`, { kind: "conclusao", titleRef: t, kids })} />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Histórico on-chain</p>
              {s.rewards.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum envio ainda.</p> : (
                <ul className="divide-y divide-border text-sm">
                  {s.rewards.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                      <span>{r.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-mono">{Number(r.amount).toLocaleString("pt-BR")} $VZN</span>
                        {r.signature ? <a href={explorerTx(r.signature)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:underline"><ExternalLink className="size-3" />Ver no Solana Explorer</a>
                          : <Badge size="sm" variant={r.status === "failed" ? "destructive" : "warning"}>{r.status === "failed" ? "Falhou" : "Enviando…"}</Badge>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
    </Card>
  );
}

function CompletionClaims({ sent, busy, onClaim }: { sent: Set<string>; busy: string | null; onClaim: (t: string) => void }) {
  const { completed } = useExperience();
  const pending = completed.filter((t) => !sent.has(`conclusao:${t}`));
  if (!pending.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {pending.map((t) => (
        <Button key={t} size="sm" variant="secondary" disabled={!!busy} onClick={() => onClaim(t)}>
          {busy === `c:${t}` ? <Loader2 className="animate-spin" /> : null}<span>Receber 0,5 $VZN por concluir</span> <span data-no-translate>{t}</span>
        </Button>
      ))}
    </div>
  );
}

export { isCompleted };
