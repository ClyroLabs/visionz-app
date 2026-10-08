import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ScanFace } from "lucide-react";
import { AgeRating, Avatar, Card, KidsModeToggle, cn } from "@/index";
import { catalog } from "@/experience/data";
import { allowedForKid } from "@/experience/logic";
import { useParental } from "@/experience/parental-ui";
import { useSession } from "@/lib/use-session";
import { useExperience, type ChildProfile } from "@/experience/store";

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
  const { kids, setKids, child, setChild, kidsMax } = useExperience();
  const session = useSession();
  const q = useParental(!!session);
  const children = (q.data?.children ?? []) as ChildProfile[];
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-wide">Quem está assistindo?</h1>
      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={() => kids && setKids(false)} className={cn("flex w-40 flex-col items-center gap-3 rounded-xl border bg-surface p-5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring", !kids && "border-cyan/60 shadow-glow-cyan")}>
          <Avatar name="Responsável" size="lg" ring="cyan" />
          <span className="font-semibold">Responsável</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">{kids && <ScanFace className="size-3" />}Adulto</span>
        </button>
        {children.map((c) => (
          <button key={c.id} type="button" onClick={() => setChild(c)} className={cn("flex w-40 flex-col items-center gap-3 rounded-xl border bg-surface p-5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring", child?.id === c.id && "border-magenta/60 shadow-glow-brand")}>
            <Avatar name={c.name} size="lg" ring="brand" />
            <span className="font-semibold">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.max_rating === "L" ? "Livre" : `Até ${c.max_rating} anos`} · {c.daily_minutes} min</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {session === null ? <><Link to="/auth" className="text-cyan underline">Entre na sua conta</Link> <span>para criar perfis infantis com regras próprias.</span></> : <><span>Crie perfis e defina as regras em</span> <Link to="/app/conta" className="text-cyan underline">Minha conta → Controle parental</Link>. <span>Sair do modo infantil pede o rosto do responsável.</span></>}
      </p>
      <div className="max-w-lg"><KidsModeToggle enabled={kids} onEnabledChange={setKids} /></div>
      <Card padding="lg" className="space-y-3">
        <p className="font-semibold">Catálogo neste perfil</p>
        <ul className="divide-y">
          {catalog.map((t) => {
            const blocked = kids && !allowedForKid(t.rating, kidsMax);
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
