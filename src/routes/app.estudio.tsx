import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Logo, AIVerifiedBadge, Button, Card, CardDescription, CardTitle, EarningsCard, Input, Label, Progress, Select, useToast } from "@/index";

export const Route = createFileRoute("/app/estudio")({
  head: () => ({
    meta: [
      { title: "Estúdio do criador — Protótipo VisionZ" },
      { name: "description", content: "Envie vídeos, acompanhe a análise da IA e veja seus ganhos como criador." },
      { property: "og:title", content: "Estúdio do criador — Protótipo VisionZ" },
      { property: "og:description", content: "Painel do criador na VisionZ." },
    ],
  }),
  component: Studio,
});

function Studio() {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [step, setStep] = useState<"idle" | "upload" | "ai" | "done">("idle");
  const [p, setP] = useState(0);

  useEffect(() => {
    if (step === "idle" || step === "done") return;
    const i = setInterval(() => setP((v) => {
      if (v >= 100) {
        if (step === "upload") { setStep("ai"); return 0; }
        setStep("done"); toast({ title: "Publicado!", description: "Seu título foi verificado pela IA.", variant: "success" });
        return 100;
      }
      return v + 5;
    }), 120);
    return () => clearInterval(i);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-wide">Estúdio do criador</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <EarningsCard label="Ganhos do mês" value="R$ 3.420" change="+18%" />
        <EarningsCard label="Visualizações" value="84,2 mil" change="+9%" points={[3, 4, 6, 5, 7, 9, 8]} />
        <EarningsCard label="Vendas avulsas" value="312" change="+12%" points={[2, 3, 3, 5, 6, 6, 8]} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card padding="lg" className="space-y-4">
          <CardTitle className="text-lg">Novo envio</CardTitle>
          <div className="space-y-1.5"><Label htmlFor="st-t">Título</Label><Input id="st-t" placeholder="Ex.: Rebeca e sua turma — Ep. 3" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="st-c">Classificação</Label><Select id="st-c"><option>L</option><option>10</option><option>12</option><option>14</option><option>16</option><option>18</option></Select></div>
            <div className="space-y-1.5"><Label htmlFor="st-p">Preço avulso</Label><Select id="st-p"><option>Incluído no plano</option><option>R$ 4,90</option><option>R$ 9,90</option><option>R$ 19,90</option></Select></div>
          </div>
          {step !== "idle" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>{step === "upload" ? "Enviando arquivo…" : step === "ai" ? "Análise da IA: imagem e áudio…" : "Concluído"}</span><span className="font-mono">{p}%</span></div>
              <Progress value={p} variant={step === "ai" ? "cyan" : step === "done" ? "success" : "brand"} label="Progresso" />
              {step === "done" && <AIVerifiedBadge />}
            </div>
          )}
          <Button disabled={!title.trim() || step === "upload" || step === "ai"} onClick={() => { setP(0); setStep("upload"); }}><Upload />Enviar vídeo</Button>
        </Card>
        <div className="space-y-4">
          <Card variant="glass" className="flex flex-col items-center space-y-2 text-center md:items-start md:text-left border-cyan/30 bg-gradient-to-br from-cyan/10 to-magenta/10"><Logo brand="clyro-synth" alt="" className="h-20 w-auto md:h-16 drop-shadow-[0_0_12px_var(--cyan)]" /><CardTitle className="text-gradient-brand">Clyro Synth</CardTitle><CardDescription>Crie séries, filmes e documentários com IA.</CardDescription><Button size="sm" variant="secondary" className="w-full sm:w-auto" onClick={() => toast({ title: "Clyro Synth em breve no protótipo" })}>Abrir Synth</Button></Card>
          <Card variant="glass" className="flex flex-col items-center space-y-2 text-center md:items-start md:text-left border-magenta/30 bg-gradient-to-br from-magenta/10 to-ember/10"><Logo brand="clyro-jukebox" alt="" className="h-20 w-auto md:h-16 drop-shadow-[0_0_12px_var(--magenta)]" /><CardTitle className="text-gradient-brand">Clyro Jukebox</CardTitle><CardDescription>Componha trilhas originais para suas obras.</CardDescription><Button size="sm" variant="secondary" className="w-full sm:w-auto" onClick={() => toast({ title: "Clyro Jukebox em breve no protótipo" })}>Abrir Jukebox</Button></Card>
        </div>
      </div>
    </div>
  );
}
