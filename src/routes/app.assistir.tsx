import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Lock } from "lucide-react";
import { AIVerifiedBadge, AgeRating, Avatar, Badge, Button, Card, PlayerBar, useToast } from "@/index";
import { catalog } from "@/experience/data";
import { isAllowedForKids } from "@/experience/logic";
import { useExperience } from "@/experience/store";

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
  const { kids, earn, owned } = useExperience();
  const toast = useToast();
  const [playing, setPlaying] = useState(false);
  const [sec, setSec] = useState(0);
  const total = 600;
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setSec((s) => Math.min(total, s + 5)), 250);
    return () => clearInterval(i);
  }, [playing]);
  useEffect(() => {
    if (sec - last.current >= 120) {
      last.current = sec;
      earn(`Tempo assistido: ${t.title}`, 2);
      toast({ title: "+2 VZN", description: "Recompensa por tempo assistido.", variant: "reward" });
    }
  }, [sec]); // eslint-disable-line react-hooks/exhaustive-deps

  const blocked = kids && !isAllowedForKids(t.rating);
  const locked = !!t.priceValue && !owned.includes(t.id);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl border border-cyan/20">
          <img src={t.cover} alt="" width={1280} height={720} className={blocked || locked ? "aspect-video w-full object-cover blur-xl" : "aspect-video w-full object-cover"} />
          {blocked || locked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 p-6 text-center">
              <Lock className="size-10 text-destructive" />
              <p className="font-display text-xl font-semibold">{blocked ? "Bloqueado no perfil infantil" : "Título à la carte"}</p>
              <p className="text-sm text-muted-foreground">{blocked ? t.blockReason ?? `Classificação ${t.rating}` : `Compre por ${t.price} na tela inicial para assistir.`}</p>
              <Link to="/app"><Button variant="secondary">Voltar ao catálogo</Button></Link>
            </div>
          ) : (
            <PlayerBar className="absolute inset-x-3 bottom-3" playing={playing} onPlayingChange={setPlaying} progress={(sec / total) * 100} current={fmt(sec)} total={fmt(total)} />
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2"><AgeRating rating={t.rating} /><AIVerifiedBadge /><Badge variant="cyan">4K HDR</Badge></div>
          <h1 className="font-display text-[clamp(1.375rem,4.5vw,1.875rem)] font-bold tracking-wide">{t.title}</h1>
          <div className="flex items-center gap-3"><Avatar name={t.creator} size="sm" ring="brand" /><span className="text-sm text-muted-foreground">{t.creator} · {t.duration}</span></div>
        </div>
      </div>
      <Card variant="glass" className="h-fit space-y-3">
        <p className="font-semibold">Recompensas desta sessão</p>
        <p className="text-sm text-muted-foreground">A cada 2 minutos assistidos você ganha 2 VZN. Dê play e acompanhe os avisos.</p>
        <p className="font-display text-2xl font-bold text-gradient-brand">{Math.floor(sec / 120) * 2} VZN</p>
      </Card>
    </div>
  );
}
