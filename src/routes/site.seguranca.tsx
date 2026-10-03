import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AudioLines, Eye, GraduationCap, RefreshCw, UserCheck } from "lucide-react";
import { AIVerifiedBadge, AgeRating, Card, CardDescription, CardTitle, KidsModeToggle, ScrollSnapRow, SectionHeading, Stat } from "@/index";
import { Section } from "@/experience/site-parts";

export const Route = createFileRoute("/site/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança infantil — VisionZ" },
      { name: "description", content: "Como o Filtro Inteligente da Clyro Labs protege crianças: análise visual, auditoria sonora e revisão humana." },
      { property: "og:title", content: "Segurança infantil — VisionZ" },
      { property: "og:description", content: "Tranquilidade para pais e educadores com moderação automática por IA." },
    ],
  }),
  component: Safety,
});

const steps = [
  { icon: Eye, t: "1. Análise visual", d: "Cada quadro do vídeo é analisado para identificar padrões e gestos impróprios." },
  { icon: AudioLines, t: "2. Auditoria sonora", d: "O áudio é transcrito e verificado para linguagem e tom agressivo em vários idiomas." },
  { icon: UserCheck, t: "3. Revisão humana", d: "Casos complexos vão para especialistas antes da publicação." },
  { icon: RefreshCw, t: "4. Aprendizado contínuo", d: "Cada decisão humana retreina a IA, que fica mais precisa a cada dia." },
];

function Safety() {
  const [kids, setKids] = useState(true);
  return (
    <>
      <Section>
        <SectionHeading eyebrow="Segurança" title={<>A tecnologia trabalha para proteger <span className="text-cyan">quem você ama</span>.</>} description="A VisionZ coloca a segurança infantil como pilar central da engenharia. Nenhum conteúdo chega ao catálogo sem passar pelo Filtro Inteligente." />
        <div className="mt-8 grid grid-cols-3 gap-3 text-center md:mt-12 md:gap-8 md:text-left">
          <Stat value="< 200ms" tone="cyan" label="por quadro analisado" />
          <Stat value="100%" label="do catálogo verificado antes de publicar" />
          <Stat value="6" tone="default" label="faixas de classificação indicativa" />
        </div>
      </Section>
      <Section className="py-6 md:py-10">
        <ScrollSnapRow label="Como funciona o filtro" className="md:grid-cols-4 md:gap-4">
          {steps.map(({ icon: Icon, t, d }) => <Card key={t} variant="glass" className="h-full space-y-3 flex flex-col items-center text-center md:items-start md:text-left"><Icon className="size-6 text-cyan" /><CardTitle className="text-sm">{t}</CardTitle><CardDescription>{d}</CardDescription></Card>)}
        </ScrollSnapRow>
      </Section>
      <Section className="grid gap-6 py-6 md:gap-10 md:py-10 lg:grid-cols-2">
        <Card padding="lg" className="space-y-5 flex flex-col items-center text-center md:items-start md:text-left">
          <CardTitle className="text-xl">Modo infantil</CardTitle>
          <KidsModeToggle enabled={kids} onEnabledChange={setKids} />
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            {(["L", "10", "12", "14", "16", "18"] as const).map((r) => <span key={r} className={kids && !["L", "10"].includes(r) ? "opacity-25" : ""}><AgeRating rating={r} /></span>)}
          </div>
          <p className="text-sm text-muted-foreground">{kids ? "Somente Livre e 10 anos ficam visíveis no perfil infantil." : "Perfil adulto: todas as classificações visíveis."}</p>
        </Card>
        <Card padding="lg" className="space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
          <GraduationCap className="size-8 text-magenta" />
          <CardTitle className="text-xl">Para pais e educadores</CardTitle>
          <CardDescription className="text-base">Relatórios semanais do que foi assistido, limites de tempo de tela e parcerias com instituições de proteção à infância para validar a tecnologia.</CardDescription>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start"><AIVerifiedBadge /><AIVerifiedBadge status="reviewing" /><AIVerifiedBadge status="blocked" /></div>
        </Card>
      </Section>
    </>
  );
}
