import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, GraduationCap } from "lucide-react";
import { Badge, Button, Card, CardTitle, Progress, cn, useToast } from "@/index";
import { DemoHeader, useLocal } from "@/experience/defi-ui";
import { kodaTracks } from "@/experience/defi-data";
import { kodaReward } from "@/experience/defi";

export const Route = createFileRoute("/app/koda")({
  head: () => ({
    meta: [
      { title: "Koda · Aprenda e ganhe — Protótipo VisionZ" },
      { name: "description", content: "Trilhas da Koda com aulas curtas, quiz, $VZN de demonstração e certificados intransferíveis." },
      { property: "og:title", content: "Koda · Aprenda e ganhe — Protótipo VisionZ" },
      { property: "og:description", content: "Aprenda Web3, DeFi e criação com IA e ganhe recompensas de demonstração." },
    ],
  }),
  component: KodaSoon,
});

function KodaSoon() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card padding="lg" className="relative max-w-lg space-y-4 overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 bg-stage-glow opacity-60" aria-hidden />
        <div className="relative space-y-4">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-gold/50 bg-gold/10 shadow-glow-brand"><GraduationCap className="size-8 text-gold" /></span>
          <Badge variant="brand" size="sm">Em breve</Badge>
          <h1 className="font-display text-3xl font-bold tracking-wide text-metallic">Koda</h1>
          <p className="text-muted-foreground">A escola da Clyro Labs está sendo preparada: trilhas curtas sobre Web3, DeFi e criação com IA, com recompensas e certificados. Avisaremos quando abrir.</p>
          <p className="text-xs text-muted-foreground">Demonstração · exemplo, não é promessa</p>
        </div>
      </Card>
    </div>
  );
}

// Full Koda experience kept for when it launches.
export function Koda() {
  const toast = useToast();
  const [done, setDone] = useLocal<Record<string, number>>("vz-koda", {});
  const [quiz, setQuiz] = useState<string | null>(null);
  const total = kodaTracks.reduce((s, t) => s + kodaReward(t, done[t.id] ?? 0), 0);
  const certs = kodaTracks.filter((t) => (done[t.id] ?? 0) >= t.lessons);
  const lesson = (id: string, lessons: number) => {
    const n = done[id] ?? 0;
    if (n >= lessons - 1) { setQuiz(id); return; }
    setDone({ ...done, [id]: n + 1 });
  };
  const answer = (id: string, ok: boolean, lessons: number) => {
    if (!ok) { toast({ title: "Quase!", description: "Tente de novo.", variant: "error" }); return; }
    setDone({ ...done, [id]: lessons }); setQuiz(null);
    toast({ title: "Trilha concluída!", description: "Você ganhou um certificado e $VZN de demonstração.", variant: "success" });
  };
  return (
    <div className="space-y-8">
      <DemoHeader title="Koda · Aprenda e ganhe" text="A Koda é a escola da Clyro Labs. Cada aula concluída rende $VZN de demonstração; cada trilha completa vira um certificado que não pode ser vendido nem transferido." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card variant="featured" className="flex items-center gap-4"><GraduationCap className="size-8 text-magenta" /><div><p className="text-xs text-muted-foreground">Ganhos em demonstração</p><p className="font-mono text-2xl text-gradient-brand">{total} $VZN</p></div></Card>
        <Card className="flex items-center gap-4"><Award className="size-8 text-cyan" /><div><p className="text-xs text-muted-foreground">Certificados</p><p className="text-sm">{certs.length ? certs.map((c) => c.title).join(" · ") : "Nenhum ainda"}</p></div></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {kodaTracks.map((t) => {
          const n = done[t.id] ?? 0, complete = n >= t.lessons;
          return (
            <Card key={t.id} padding="lg" className={cn("space-y-3", complete && "border-success/50")}>
              <div className="flex items-center justify-between gap-2"><CardTitle>{t.title}</CardTitle>{complete && <Badge variant="success" size="sm">Concluída</Badge>}</div>
              <Progress value={(n / t.lessons) * 100} label={`Progresso ${t.title}`} />
              <p className="text-xs text-muted-foreground">{n}/{t.lessons} aulas · {t.perLesson} $VZN por aula + {t.bonus} de bônus</p>
              <p className="text-xs text-cyan">Benefício: {t.perk}</p>
              {quiz === t.id ? (
                <div className="space-y-2 rounded-xl border bg-background/60 p-3 animate-rise">
                  <p className="text-sm font-semibold">{t.quiz.q}</p>
                  {t.quiz.options.map((o, i) => <Button key={o} size="sm" variant="secondary" className="w-full justify-start" onClick={() => answer(t.id, i === t.quiz.answer, t.lessons)}>{o}</Button>)}
                </div>
              ) : !complete && <Button size="sm" onClick={() => lesson(t.id, t.lessons)}>{n >= t.lessons - 1 ? "Fazer o quiz final" : "Concluir próxima aula"}</Button>}
            </Card>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" onClick={() => setDone({})}>Reiniciar demonstração</Button>
    </div>
  );
}
