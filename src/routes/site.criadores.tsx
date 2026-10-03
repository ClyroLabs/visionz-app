import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Music, Sparkles, Wand2 } from "lucide-react";
import { Button, Card, CardDescription, CardTitle, EarningsCard, Progress, SectionHeading, Stat } from "@/index";
import { LeadDialog, Section } from "@/experience/site-parts";
import trio from "@/assets/covers/trio-alegria.jpg";

export const Route = createFileRoute("/site/criadores")({
  head: () => ({
    meta: [
      { title: "Criadores — VisionZ" },
      { name: "description", content: "Crie séries, filmes, documentários e música com Clyro Synth e Jukebox e receba pelo que criou." },
      { property: "og:title", content: "Criadores — VisionZ" },
      { property: "og:description", content: "Se você deu vida à criação, você tem o direito de explorá-la e distribuí-la." },
    ],
  }),
  component: Creators,
});

const split = [["Criador", 85, "brand"], ["Ecossistema e embaixadores", 10, "cyan"], ["Plataforma", 5, "success"]] as const;

function Creators() {
  const [lead, setLead] = useState(false);
  return (
    <>
      <Section className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading eyebrow="Para criadores" title={<>Se você deu vida à criação, <span className="text-gradient-brand">ela é sua</span>.</>} description="Produza com IA sem as barreiras de grandes estúdios e gravadoras. Publique, venda à la carte e receba direto na sua carteira." />
        <img src={trio} alt="Cena de Aventuras do Trio Alegria, série produzida com Clyro Synth" width={1280} height={720} className="rounded-xl border border-cyan/20 shadow-glow-brand" />
      </Section>
      <Section className="grid gap-6 py-10 md:grid-cols-3">
        {[
          { icon: Sparkles, t: "Clyro Synth", d: "Séries animadas, filmes, curtas e longas, documentários." },
          { icon: Music, t: "Clyro Jukebox", d: "Trilhas e músicas originais sem entraves de direitos." },
          { icon: Wand2, t: "Ferramentas Pro", d: "Render 8K, dublagem por IA e distribuição global." },
        ].map(({ icon: Icon, t, d }) => <Card key={t} variant="glass" padding="lg" className="space-y-3"><Icon className="size-7 text-magenta" /><CardTitle className="text-lg">{t}</CardTitle><CardDescription>{d}</CardDescription></Card>)}
      </Section>
      <Section className="grid gap-10 py-10 lg:grid-cols-2">
        <Card padding="lg" className="space-y-6">
          <CardTitle className="text-xl">Para onde vai cada venda avulsa</CardTitle>
          {split.map(([l, v, c]) => <div key={l} className="space-y-2"><div className="flex justify-between text-sm"><span>{l}</span><span className="font-mono">{v}%</span></div><Progress value={v} variant={c} label={l} /></div>)}
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <EarningsCard label="Exemplo: ganhos do mês" value="R$ 3.420" change="+18%" />
          <EarningsCard label="Exemplo: vendas avulsas" value="312" change="+9%" points={[2, 3, 5, 4, 6, 8, 9]} />
          <Stat value="R$ 0" label="para começar a publicar" className="rounded-xl border bg-surface p-5" />
          <Stat value="24h" tone="cyan" label="para análise e publicação pela IA" className="rounded-xl border bg-surface p-5" />
        </div>
      </Section>
      <Section className="pt-10">
        <Card variant="glow" padding="lg" className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex gap-4"><Award className="size-10 shrink-0 text-magenta" /><div><CardTitle className="text-2xl">VisionZ Ambassadors</CardTitle><CardDescription className="mt-2 max-w-xl text-base">Embaixadores recebem participação direta no crescimento que trazem para a plataforma.</CardDescription></div></div>
          <Button size="lg" onClick={() => setLead(true)}>Quero participar</Button>
        </Card>
      </Section>
      <LeadDialog open={lead} onOpenChange={setLead} kind="espera" />
    </>
  );
}
