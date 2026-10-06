import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, Megaphone, ShieldAlert, Store, Ticket, TvMinimalPlay } from "lucide-react";
import { Button, Card, CardDescription, CardTitle, ScrollSnapRow, SectionHeading, Stat, Timeline } from "@/index";
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
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 text-center md:mt-12 md:grid-cols-4 md:gap-8 md:text-left">
          <Stat value="2,5 mi" label="usuários ativos no ano 3" />
          <Stat value="R$ 232 mi" label="receita bruta no ano 3" tone="cyan" />
          <Stat value="42%" label="margem EBITDA no ano 3" tone="default" />
          <Stat value="Mês 11" label="ponto de equilíbrio estimado" tone="cyan" />
        </div>
      </Section>

      <Section className="py-6 md:py-10">
        <Card padding="lg" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="w-full text-center md:text-left"><CardTitle className="text-lg md:text-xl">Projeção de 3 anos — cenário de expansão</CardTitle><CardDescription>Receita em R$ milhões (barras) e margem EBITDA em % (linha).</CardDescription></div>
          </div>
          <div className="-mx-2 h-60 sm:h-80">
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
            <table className="w-full min-w-[480px] text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Indicador</th>{projections.map((p) => <th key={p.ano} className="py-2">{p.ano}</th>)}</tr></thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Usuários ativos</td>{projections.map((p) => <td key={p.ano} className="font-mono">{fmt(p.usuarios)}</td>)}</tr>
                <tr className="border-b"><td className="py-2">Receita bruta</td>{projections.map((p) => <td key={p.ano} className="font-mono">{`R$ ${fmt(p.receita)} mi`}</td>)}</tr>
                <tr><td className="py-2">Margem EBITDA</td>{projections.map((p) => <td key={p.ano} className="font-mono">{p.ebitda}%</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Cenário do Relatório de Expansão: assinaturas, DeFi, Launchpad e ponte entre redes. Estimativas, não garantia de resultado.</p>
        </Card>
      </Section>

      <Section className="py-6 md:py-10">
        <h2 className="mb-5 text-center font-display text-xl font-bold tracking-wide sm:text-2xl md:mb-6 md:text-left">Fontes de receita</h2>
        <ScrollSnapRow label="Fontes de receita" item="narrow" className="sm:grid-cols-2 md:gap-4 lg:grid-cols-5">
          {revenue.map(({ icon: Icon, t, d }) => (
            <Card key={t} variant="glass" className="h-full space-y-3 flex flex-col items-center text-center md:items-start md:text-left"><Icon className="size-6 text-magenta" /><CardTitle className="text-sm">{t}</CardTitle><CardDescription>{d}</CardDescription></Card>
          ))}
        </ScrollSnapRow>
        <p className="mt-4 text-center text-sm text-muted-foreground md:text-left">Toda a movimentação é registrada em blockchain e processada por gateway de pagamentos (Pix, cartão e cripto), com carteira interna para cada usuário.</p>
      </Section>

      <Section className="py-6 md:py-10">
        <h2 className="mb-5 text-center font-display text-xl font-bold tracking-wide sm:text-2xl md:mb-6 md:text-left">Roadmap</h2>
        <details className="group md:hidden"><summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg border p-3 text-sm [&::-webkit-details-marker]:hidden">Ver fases <span aria-hidden className="transition-transform group-open:rotate-45">+</span></summary><div className="mt-4"><Timeline items={roadmap} /></div></details>
        <div className="hidden md:block"><Timeline items={roadmap} /></div>
      </Section>

      <Section className="py-6 md:py-10">
        <h2 className="mb-5 text-center font-display text-xl font-bold tracking-wide sm:text-2xl md:mb-6 md:text-left">Gestão de risco</h2>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {risks.map(([t, d]) => <Card key={t} className="flex flex-col items-center gap-2 text-center md:flex-row md:items-start md:gap-3 md:text-left"><ShieldAlert className="size-5 shrink-0 text-warning" /><div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></Card>)}
        </div>
      </Section>

      <Section className="pt-6 md:pt-10">
        <Card variant="glow" padding="lg" className="flex flex-col items-center text-center md:text-left justify-between gap-6 md:flex-row md:items-center">
          <div><CardTitle className="text-2xl">O convite</CardTitle><CardDescription className="mt-2 max-w-xl text-base">A VisionZ não está mudando só o que você assiste, mas como o mundo se diverte e lucra. Junte-se a nós.</CardDescription></div>
          <Button size="lg" className="w-full md:w-auto" onClick={() => setLead(true)}>Falar com a VisionZ</Button>
        </Card>
      </Section>
      <LeadDialog open={lead} onOpenChange={setLead} kind="investidor" />
    </>
  );
}

