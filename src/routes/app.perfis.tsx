import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { AgeRating, Avatar, Card, KidsModeToggle, cn } from "@/index";
import { catalog } from "@/experience/data";
import { isAllowedForKids } from "@/experience/logic";
import { useExperience } from "@/experience/store";

export const Route = createFileRoute("/app/perfis")({
  head: () => ({
    meta: [
      { title: "Perfis e Modo infantil — Protótipo VisionZ" },
      { name: "description", content: "Troque de perfil e veja o catálogo ser filtrado pela IA na hora." },
      { property: "og:title", content: "Perfis e Modo infantil — Protótipo VisionZ" },
      { property: "og:description", content: "Controle parental com IA na VisionZ." },
    ],
  }),
  component: Profiles,
});

function Profiles() {
  const { kids, setKids } = useExperience();
  const profiles = [
    { name: "Bruno", kids: false, ring: "cyan" as const },
    { name: "Ana Clara", kids: true, ring: "brand" as const },
  ];
  return (
    <div className="space-y-8">
      <h1 className="font-display text-[clamp(1.375rem,4.5vw,1.875rem)] font-bold tracking-wide">Quem está assistindo?</h1>
      <div className="flex flex-wrap gap-4">
        {profiles.map((p) => (
          <button key={p.name} type="button" onClick={() => setKids(p.kids)} className={cn("flex w-40 flex-col items-center gap-3 rounded-xl border bg-surface p-5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring", kids === p.kids && "border-cyan shadow-glow-cyan")}>
            <Avatar name={p.name} size="lg" ring={p.ring} />
            <span className="font-semibold">{p.name}</span>
            <span className="text-xs text-muted-foreground">{p.kids ? "Perfil infantil" : "Adulto"}</span>
          </button>
        ))}
      </div>
      <div className="max-w-lg"><KidsModeToggle enabled={kids} onEnabledChange={setKids} /></div>
      <Card padding="lg" className="space-y-3">
        <p className="font-semibold">Catálogo neste perfil</p>
        <ul className="divide-y">
          {catalog.map((t) => {
            const blocked = kids && !isAllowedForKids(t.rating);
            return (
              <li key={t.id} className={cn("flex items-center gap-3 py-3", blocked && "opacity-60")}>
                <AgeRating rating={t.rating} size="sm" />
                <span className="flex-1">{t.title}</span>
                {blocked ? <span className="inline-flex items-center gap-1 text-xs text-destructive"><Lock className="size-3" />{t.blockReason ?? `Classificação ${t.rating}`}</span> : <span className="text-xs text-success">Liberado</span>}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
