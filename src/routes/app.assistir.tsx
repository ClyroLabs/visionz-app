import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Lock, Volume2, VolumeX } from "lucide-react";
import { AIVerifiedBadge, AgeRating, Avatar, Badge, Button, Card, PlayerBar, useToast } from "@/index";
import { catalog } from "@/experience/data";
import { allowedForKid } from "@/experience/logic";
import { ReportButton } from "@/experience/report-dialog";
import { useExperience } from "@/experience/store";
import { COMPLETE_THRESHOLD, COMPLETE_VZN, eligibleWatch } from "@/experience/rewards";

export const Route = createFileRoute("/app/assistir")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Assistir — Protótipo VisionZ" },
      { name: "description", content: "Player VisionZ com classificação indicativa, verificação por IA e recompensas por tempo assistido." },
      { property: "og:title", content: "Assistir — Protótipo VisionZ" },
      { property: "og:description", content: "Assista e ganhe recompensas na VisionZ." },
    ],
  }),
  component: Watch,
});

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Watch() {
  const { id } = Route.useSearch();
  const t = catalog.find((c) => c.id === id) ?? catalog[0];
  const { kids, kidsMax, child, childMinutes, addChildMinute, earn, owned, addXp, addWatchMin, completed, complete } = useExperience();
  const timeUp = !!child && childMinutes >= child.daily_minutes;
  const [muted, setMuted] = useState(false);
  const [xpSession, setXpSession] = useState(0);
  const repeat = completed.includes(t.id);
  const toast = useToast();
  const [playing, setPlaying] = useState(false);
  const [sec, setSec] = useState(0);
  const total = 600;
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return;
    if (timeUp) { setPlaying(false); return; }
    const i = setInterval(() => setSec((s) => Math.min(total, s + 5)), 250);
    return () => clearInterval(i);
  }, [playing, timeUp]);
  useEffect(() => {
    if (sec - last.current >= 60) {
      last.current = sec;
      const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
      if (child) addChildMinute();
      if (eligibleWatch({ muted, hidden, repeat })) { addXp(1); addWatchMin(1); setXpSession((x) => x + 1); }
    }
    if (sec >= total * COMPLETE_THRESHOLD && !muted && complete(t.id)) {
      const g = earn(`Título concluído: ${t.title}`, COMPLETE_VZN, "conclusao");
      toast(g > 0 ? { title: `+${g.toLocaleString("pt-BR")} VZN`, description: "Título concluído.", variant: "reward" } : { title: "Título concluído", description: kids ? "Perfil infantil ganha só XP." : "Limite de hoje atingido.", variant: "info" });
    }
  }, [sec]); // eslint-disable-line react-hooks/exhaustive-deps

  const blocked = kids && !allowedForKid(t.rating, kidsMax);
  const locked = !!t.priceValue && !owned.includes(t.id);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl border border-cyan/20">
          <img src={t.cover} alt="" width={1280} height={720} className={blocked || locked ? "aspect-video w-full object-cover blur-xl" : "aspect-video w-full object-cover"} />
          {timeUp && !blocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center">
              <p className="font-display text-xl font-semibold">O tempo de tela de hoje acabou</p>
              <p className="text-sm text-muted-foreground">Até amanhã, {child?.name}! Um responsável pode mudar o limite em Minha conta.</p>
            </div>
          ) : blocked || locked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 p-6 text-center">
              <Lock className="size-10 text-destructive" />
              <p className="font-display text-xl font-semibold">{blocked ? "Bloqueado no perfil infantil" : "Título à la carte"}</p>
              <p className="text-sm text-muted-foreground">{blocked ? t.blockReason ?? `Classificação ${t.rating}` : `Compre por ${t.price} na tela inicial para assistir.`}</p>
              <Link to="/app"><Button variant="secondary">Voltar ao catálogo</Button></Link>
            </div>
          ) : (<>
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ativar som" : "Silenciar"} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button>
            <PlayerBar className="absolute inset-x-3 bottom-3" playing={playing} onPlayingChange={setPlaying} progress={(sec / total) * 100} current={fmt(sec)} total={fmt(total)} /></>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2"><AgeRating rating={t.rating} /><AIVerifiedBadge /><Badge variant="cyan">4K HDR</Badge><ReportButton titleRef={t.id} title={t.title} /></div>
          <h1 className="font-display text-3xl font-bold tracking-wide">{t.title}</h1>
          <div className="flex items-center gap-3"><Avatar name={t.creator} size="sm" ring="brand" /><span className="text-sm text-muted-foreground">{t.creator} · {t.duration}</span></div>
        </div>
      </div>
      <Card variant="glass" className="h-fit space-y-3">
        <p className="font-semibold">Recompensas desta sessão</p>
        <p className="text-sm text-muted-foreground">Assistir rende XP (10 XP a cada 10 min). Concluir o título rende {COMPLETE_VZN.toLocaleString("pt-BR")} $VZN.</p>
        <p className="font-display text-2xl font-bold text-cyan">+{xpSession} XP</p>
        <div className="space-y-1"><div className="flex justify-between text-xs text-muted-foreground"><span>Progresso para concluir</span><span>{Math.min(100, Math.round((sec / (total * COMPLETE_THRESHOLD)) * 100))}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-brand transition-all" style={{ width: `${Math.min(100, (sec / (total * COMPLETE_THRESHOLD)) * 100)}%` }} /></div></div>
        {child && <p className="text-xs text-muted-foreground"><span>Tempo de tela hoje:</span> {childMinutes}/{child.daily_minutes} min</p>}
        {(muted || repeat) && <p className="text-xs text-warning">{muted ? "Com o som desligado, o tempo não conta." : "Você já concluiu este título hoje: repetir não rende XP."}</p>}
      </Card>
    </div>
  );
}
