import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, Megaphone, ShieldAlert, Store, Ticket, TvMinimalPlay } from "lucide-react";
import { Button, Card, CardDescription, CardTitle, SectionHeading, Stat, Timeline } from "@/index";
import { LeadDialog, Section } from "@/experience/site-parts";
import { projections, roadmap } from "@/experience/data";

export const Route = createFileRoute("/site/investidores")({
  head: () => ({
    meta: [
      { title: "Investidores — VisionZ Entertainment" },
      { name: "description", content: "Modelo de negócio, fontes de receita, projeções de 3 anos e gestão de risco da VisionZ." },
      { property: "og:title", content: "Investidores — VisionZ Entertainment" },
      { property: "og:description", content: "Por que investir agora na VisionZ: inovação brasileira com alcance global." },
    ],
  }),
  component: Investors,
});

const revenue = [
  { icon: TvMinimalPlay, t: "Assinaturas", d: "Planos Premium e Family, mensais e anuais." },
  { icon: Ticket, t: "À la carte e pacotes on-demand", d: "Compra avulsa de títulos com taxa do ecossistema." },
  { icon: Store, t: "Marketplace e ferramentas Pro", d: "Ganho sobre a distribuição independente e assinaturas Synth/Jukebox." },
  { icon: BrainCircuit, t: "Licenciamento da IA", d: "Tecnologia de moderação para redes, escolas e plataformas." },
  { icon: Megaphone, t: "Publicidade inteligente", d: "Anúncios contextuais que não interrompem a experiência." },
];

const risks = [
  ["Conteúdo", "IA de monitoramento em tempo real + revisão humana."],
  ["Regulatório", "Conformidade LGPD, termos claros e recompensas sem promessa de retorno."],
  ["Execução", "Roadmap curto em fases e infraestrutura Clyro já existente."],
  ["Mercado cripto", "Carteira interna em reais com ponte multichain opcional."],
];

const fmt = (n: number) => n.toLocaleString("pt-BR");

function Investors() {
  const [lead, setLead] = useState(false);
  return (
    <>
      <Section className="pb-10">
        <SectionHeading eyebrow="Investidores" title={<>Inovação brasileira com <span className="text-gradient-brand">alcance global</span></>} description="A VisionZ é o motor de criação que alimenta o ecossistema Clyro Labs. Ao reduzir custos de produção e eliminar intermediários, a margem por conteúdo é muito maior que no streaming tradicional." />
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          <Stat value="1,2 mi" label="usuários ativos no ano 3" />
          <Stat value="R$ 58 mi" label="receita bruta no ano 3" tone="cyan" />
          <Stat value="21%" label="margem EBITDA no ano 3" tone="default" />
          <Stat value="Mês 20" label="ponto de equilíbrio estimado" tone="cyan" />
        </div>
      </Section>

      <Section className="py-10">
        <Card padding="lg" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><CardTitle className="text-xl">Projeção de 3 anos — cenário inicial conservador</CardTitle><CardDescription>Receita em R$ milhões (barras) e margem EBITDA em % (linha).</CardDescription></div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projections}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="ano" stroke="var(--muted-foreground)" />
                <YAxis yAxisId="r" stroke="var(--muted-foreground)" />
                <YAxis yAxisId="e" orientation="right" stroke="var(--muted-foreground)" unit="%" />
                <RTooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                <Bar yAxisId="r" dataKey="receita" name="Receita (R$ mi)" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Line yAxisId="e" dataKey="ebitda" name="EBITDA %" stroke="var(--cyan)" strokeWidth={3} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Indicador</th>{projections.map((p) => <th key={p.ano} className="py-2">{p.ano}</th>)}</tr></thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Usuários ativos</td>{projections.map((p) => <td key={p.ano} className="font-mono">{fmt(p.usuarios)}</td>)}</tr>
                <tr className="border-b"><td className="py-2">Receita bruta</td>{projections.map((p) => <td key={p.ano} className="font-mono">R$ {fmt(p.receita)} mi</td>)}</tr>
                <tr><td className="py-2">Margem EBITDA</td>{projections.map((p) => <td key={p.ano} className="font-mono">{p.ebitda}%</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Recalculado a partir do Master Plan (R$ 15 / 90 / 350 mi) para um início mais realista: adoção gradual, ticket médio de cerca de R$ 40/mês por usuário pagante e conversão menor no primeiro ano. Estimativas, não garantia de resultado.</p>
        </Card>
      </Section>

      <Section className="py-10">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-wide">Fontes de receita</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {revenue.map(({ icon: Icon, t, d }) => (
            <Card key={t} variant="glass" className="space-y-3"><Icon className="size-6 text-magenta" /><CardTitle className="text-sm">{t}</CardTitle><CardDescription>{d}</CardDescription></Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Toda a movimentação é registrada em blockchain e processada por gateway de pagamentos (Pix, cartão e cripto), com carteira interna para cada usuário.</p>
      </Section>

      <Section className="py-10">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-wide">Roadmap</h2>
        <Timeline items={roadmap} />
      </Section>

      <Section className="py-10">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-wide">Gestão de risco</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {risks.map(([t, d]) => <Card key={t} className="flex gap-3"><ShieldAlert className="size-5 shrink-0 text-warning" /><div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></Card>)}
        </div>
      </Section>

      <Section className="pt-10">
        <Card variant="glow" padding="lg" className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div><CardTitle className="text-2xl">O convite</CardTitle><CardDescription className="mt-2 max-w-xl text-base">A VisionZ não está mudando só o que você assiste, mas como o mundo se diverte e lucra. Junte-se a nós.</CardDescription></div>
          <Button size="lg" onClick={() => setLead(true)}>Falar com a VisionZ</Button>
        </Card>
      </Section>
      <LeadDialog open={lead} onOpenChange={setLead} kind="investidor" />
    </>
  );
}

