import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AudioLines, Eye, GraduationCap, RefreshCw, UserCheck } from "lucide-react";
import { AIVerifiedBadge, AgeRating, Card, CardDescription, CardTitle, KidsModeToggle, ScrollSnapRow, SectionHeading, Stat } from "@/index";
import { Section } from "@/experience/site-parts";
import { Lock, ScanFace, ShieldCheck } from "lucide-react";
import biometria from "@/assets/biometria-facial.jpg";

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
  { icon: Eye, t: "1. Análise da IA", d: "Antes de publicar, a IA avalia imagem, texto e áudio e sugere a classificação indicativa." },
  { icon: AudioLines, t: "2. Dúvida vai para pessoas", d: "Se a IA tem menos de 75% de certeza, um moderador humano revisa antes de publicar." },
  { icon: UserCheck, t: "3. Denúncia dos pais", d: "Qualquer responsável pode denunciar um título; ele sai na hora dos perfis infantis." },
  { icon: RefreshCw, t: "4. Correção e aprendizado", d: "O moderador decide, a decisão fica registrada e serve para melhorar o filtro." },
];

function Safety() {
  const [kids, setKids] = useState(true);
  return (
    <>
      <Section>
        <SectionHeading eyebrow="Segurança" title={<>A tecnologia trabalha para proteger <span className="text-cyan">quem você ama</span>.</>} description="A VisionZ coloca a segurança infantil como pilar central da engenharia. Toda publicação passa pelo Filtro Inteligente antes de chegar ao catálogo." />
        <div className="mt-8 grid grid-cols-3 gap-3 text-center md:mt-12 md:gap-8 md:text-left">
          <Stat value="75%" tone="cyan" label="de certeza mínima para a IA publicar sozinha" />
          <Stat value="Toda" label="publicação passa pelo filtro" />
          <Stat value="6" tone="default" label="faixas de classificação indicativa" />
        </div>
      </Section>
      <Section className="py-6 md:py-10">
        <Card padding="lg" className="space-y-3 border-warning/40">
          <CardTitle className="text-xl">Quando a IA erra</CardTitle>
          <p className="text-foreground/85">Se a IA tem menos de 75% de certeza, um moderador humano revisa antes de publicar. Se algo impróprio passar, qualquer responsável pode denunciar: o título sai na hora dos perfis infantis, um moderador decide e essa decisão melhora o filtro.</p>
          <p className="text-sm text-muted-foreground">A VisionZ responde pelo que é publicado; a equipe de moderação revisa toda denúncia.</p>
          <p className="text-sm text-muted-foreground">Métrica de acerto: ainda não medida. Vamos publicar o número real depois da beta fechada.</p>
        </Card>
      </Section>
      <Section className="py-6 md:py-10">
        <ScrollSnapRow label="Como funciona o filtro" className="md:grid-cols-4 md:gap-4">
          {steps.map(({ icon: Icon, t, d }) => <Card key={t} variant="glass" className="h-full space-y-3 flex flex-col items-center text-center md:items-start md:text-left"><Icon className="size-6 text-cyan" /><CardTitle className="text-sm">{t}</CardTitle><CardDescription>{d}</CardDescription></Card>)}
        </ScrollSnapRow>
      </Section>
      <Section className="py-6 md:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div className="relative overflow-hidden rounded-3xl border border-cyan/30 shadow-glow-cyan">
            <img src={biometria} alt="Adulto liberando o modo infantil com biometria facial enquanto a criança assiste TV" width={1536} height={1024} loading="lazy" className="aspect-[3/2] w-full object-cover" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan/0 via-cyan/15 to-cyan/0 animate-drift" />
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-cyan/40 bg-background/75 px-3 py-1.5 text-xs text-cyan backdrop-blur sm:left-4 sm:top-4"><ScanFace className="size-4" />Verificando rosto…</div>
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 rounded-2xl border border-success/40 bg-background/80 p-3 backdrop-blur sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-xs">
              <ShieldCheck className="size-5 shrink-0 text-success" />
              <div className="min-w-0 text-left"><p className="text-sm font-semibold text-success">Adulto autorizado</p><p className="text-xs text-muted-foreground">Controle parental liberado</p></div>
            </div>
          </div>
          <div className="space-y-5 text-center lg:text-left">
            <SectionHeading eyebrow="Biometria facial" title={<>Só um <span className="text-cyan">adulto autorizado</span> muda as regras.</>} description="Sair do modo infantil, mudar a classificação ou liberar um título exige o rosto do responsável cadastrado. A criança não consegue burlar." className="lg:items-start lg:text-left" />
            <ul className="space-y-3 text-sm">
              {[[ScanFace, "Reconhecimento facial com prova de vida simples (piscar). Primeira versão, ainda não é nível bancário."], [Lock, "Os dados do rosto ficam protegidos no aparelho e nunca são vendidos."], [ShieldCheck, "Toda liberação fica registrada para o responsável conferir."]].map(([I, t]) => { const Icon = I as typeof Lock; return <li key={t as string} className="flex items-start justify-center gap-3 lg:justify-start"><Icon className="mt-0.5 size-4 shrink-0 text-cyan" /><span className="text-foreground/85">{t as string}</span></li>; })}
            </ul>
            <p className="text-xs text-muted-foreground">Demonstração ilustrativa do recurso em desenvolvimento.</p>
          </div>
        </div>
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
