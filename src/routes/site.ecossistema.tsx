import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Coins, Handshake, Lock, Network, Sparkles, TrendingUp, Users, AlertTriangle, Scale, Eye } from "lucide-react";
import { Badge, Button, Card, CardTitle, Eyebrow, Input, Label, Reveal, ScrollSnapRow, SectionHeading, Stat, Tabs, TabsContent, TabsList, TabsTrigger, TokenBadge, cn } from "@/index";
import { Glow, LeadDialog, Section } from "@/experience/site-parts";
import { ContactDialog } from "@/experience/contact-dialog";
import { projections } from "@/experience/data";
import { rewardsExample } from "@/experience/logic";
import synthLogo from "@/assets/logos/synth-logo.webp.asset.json";
import jukeboxLogo from "@/assets/logos/jukebox-logo.webp.asset.json";
import filterLogo from "@/assets/logos/filtro-inteligente-logo.png";

export const Route = createFileRoute("/site/ecossistema")({
  head: () => ({
    meta: [
      { title: "O que vem por aí — VisionZ" },
      { name: "description", content: "As próximas novidades do ecossistema VisionZ explicadas de um jeito simples." },
      { property: "og:title", content: "O que vem por aí — VisionZ" },
      { property: "og:description", content: "Recompensas, parceiros, conexão entre redes e IA: o futuro da VisionZ em palavras simples." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roadmap,
});

const pillars = [
  { key: "synth", logo: synthLogo.url, glow: "drop-shadow-[0_0_14px_var(--cyan)]", name: "Clyro Synth", short: "Criar vídeos com IA.", more: "Você escreve uma ideia e o Synth monta as cenas. Sua equipe revisa e aprova antes de publicar." },
  { key: "jukebox", logo: jukeboxLogo.url, glow: "drop-shadow-[0_0_14px_var(--magenta)]", name: "Clyro Jukebox", short: "Criar músicas e provar que são suas.", more: "Cada música guarda quem criou e quando. O crédito fica sempre visível e o pagamento vai direto para quem criou." },
  { key: "filter", logo: filterLogo, glow: "drop-shadow-[0_0_14px_var(--indigo)]", name: "Filtro Inteligente", short: "Protege as crianças e explica cada decisão.", more: "A IA olha imagem, som e contexto. Quando tem dúvida, uma pessoa decide — e a IA aprende com essa decisão." },
] as const;

const news = [
  { icon: TrendingUp, title: "Recompensas que crescem", text: "Suas recompensas $VZN podem ficar guardadas e render dentro do ecossistema.", example: "Exemplo: você guarda 1.000 $VZN e, com o tempo, recebe um pouco mais." },
  { icon: Handshake, title: "Ferramentas para parceiros", text: "Marcas e estúdios poderão usar a tecnologia VisionZ nos próprios produtos.", example: "Exemplo: um estúdio usa o Filtro Inteligente no seu próprio app infantil." },
  { icon: Network, title: "Conexão entre redes", text: "Leve seus $VZN de uma rede para outra de forma segura.", example: "Exemplo: passar seus $VZN da Solana para a Base sem esperar dias." },
  { icon: Bot, title: "IA que ajuda, pessoas que decidem", text: "A IA faz o trabalho repetitivo. A decisão final é sempre de uma pessoa.", example: "Exemplo: a IA faz o rascunho do vídeo; você escolhe o corte final." },
] as const;

const bridge = {
  comum: { label: "Jeito comum", tone: "warning", rows: [["Onde fica o dinheiro", "Parado num cofre de terceiros"], ["O que você recebe", "Uma “cópia” do seu token"], ["Principal risco", "Se o cofre for atacado, todos perdem"]] },
  visionz: { label: "Jeito VisionZ", tone: "success", rows: [["Onde fica o dinheiro", "Não fica parado em cofre nenhum"], ["O que você recebe", "O token original, na outra rede"], ["Principal risco", "Menor: só a mensagem viaja"]] },
} as const;

const lab = {
  criar: { label: "Criar", steps: ["Ideia", "Rascunho", "Ajustes", "Aprovação"], text: "Você conta a ideia, a IA faz um primeiro rascunho e você decide o que fica." },
  proteger: { label: "Proteger", steps: ["Alerta", "Contexto", "Revisão", "Aprendizado"], text: "A IA percebe algo estranho, olha o contexto e, na dúvida, chama uma pessoa." },
  prever: { label: "Prever", steps: ["Dados", "Sinais", "Faixa", "Decisão"], text: "A IA mostra tendências de uso para ajudar a decidir — nunca uma promessa de preço." },
} as const;

const cares = [
  { icon: Scale, title: "Direitos autorais", level: "Sob controle", tone: "success", text: "Cada obra registra quem criou e quando, com revisão jurídica." },
  { icon: Lock, title: "Segurança do sistema", level: "Atenção alta", tone: "danger", text: "Auditorias independentes e limites de valor antes de qualquer lançamento." },
  { icon: TrendingUp, title: "Sobe e desce do token", level: "Acompanhando", tone: "warning", text: "O valor do $VZN pode variar. Separamos sempre o uso do produto do preço." },
  { icon: Eye, title: "Privacidade dos dados", level: "Sob controle", tone: "success", text: "Seus dados só são usados com o seu consentimento, seguindo a LGPD." },
] as const;

const phases = [
  { n: "01", period: "Meses 1–4", title: "Base", items: ["Synth e Jukebox funcionando", "Regras do $VZN publicadas", "Medição de uso com consentimento"] },
  { n: "02", period: "Meses 5–8", title: "Recompensas", items: ["Guardar $VZN e receber recompensas", "Limites claros de valor", "Alertas de risco"] },
  { n: "03", period: "Meses 9–12", title: "Parceiros e redes", items: ["Ferramentas para parceiros", "Conexão com Solana, Base e Arbitrum", "Guia de integração"] },
  { n: "04", period: "Mês 13 em diante", title: "Crescimento", items: ["Conselho de criadores e parceiros", "Relatórios públicos", "Novos mercados"] },
] as const;

const badgeTone = { success: "success", warning: "warning", danger: "destructive" } as const;

function Roadmap() {
  const [pillar, setPillar] = useState<(typeof pillars)[number]["key"]>("synth");
  const [mode, setMode] = useState<keyof typeof bridge>("visionz");
  const [phase, setPhase] = useState(0);
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(12);
  const [lead, setLead] = useState<"espera" | "investidor" | null>(null);
  const [contact, setContact] = useState(false);
  const sim = rewardsExample(amount, months, 5);
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const active = pillars.find((p) => p.key === pillar)!;

  return (
    <main className="overflow-x-clip">
      {/* 1. Abertura */}
      <section className="relative isolate bg-stage-glow">
        <Glow className="left-1/2 top-10 h-64 w-64 -translate-x-1/2 bg-magenta/25" />
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
          <Reveal><Eyebrow underline="brand">O que vem por aí</Eyebrow></Reveal>
          <Reveal><h1 className="mt-5 text-balance font-display text-4xl font-bold tracking-wide sm:text-5xl md:text-6xl">A VisionZ está <span className="text-gradient-brand">crescendo</span>.</h1></Reveal>
          <Reveal><p className="mx-auto mt-5 max-w-xl text-base text-foreground/85 md:text-lg">Hoje você assiste, cria e ganha recompensas. Em breve, suas recompensas vão poder crescer, viajar entre redes e ajudar parceiros a criar coisas novas. Veja tudo em poucos minutos.</p></Reveal>
          <Reveal><Link to="/app"><Button size="lg" className="mt-8">Começar</Button></Link></Reveal>
        </div>
      </section>

      {/* 2. O que já existe */}
      <Section id="existe">
        <SectionHeading align="center" eyebrow="O que já existe" title="Três peças que já funcionam" description="Toque em cada uma para entender." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <button key={p.key} type="button" onClick={() => setPillar(p.key)} aria-pressed={pillar === p.key}
              className={cn("group flex flex-col items-center gap-3 rounded-2xl border bg-surface p-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", pillar === p.key ? "border-magenta/60 shadow-glow-brand" : "hover:border-magenta/40")}>
              <img src={p.logo} alt={`Logo ${p.name}`} loading="lazy" className={cn("h-20 w-auto max-w-[9rem] object-contain transition-transform duration-300 group-hover:scale-105", p.glow)} />
              <span className="font-display font-semibold tracking-wide">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.short}</span>
            </button>
          ))}
        </div>
        <Card variant="glass" padding="lg" className="mx-auto mt-6 max-w-3xl text-center animate-rise" key={pillar}>
          <p className="text-foreground/90">{active.more}</p>
        </Card>
      </Section>

      {/* 3. Novidades */}
      <Section className="pt-0 md:pt-0">
        <SectionHeading align="center" eyebrow="As novidades" title="Quatro coisas novas a caminho" />
        <ScrollSnapRow label="Novidades" className="mt-10 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {news.map((n) => (
            <Card key={n.title} padding="lg" className="flex h-full flex-col items-center gap-3 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-cyan/12 text-cyan"><n.icon className="size-5" /></span>
              <CardTitle>{n.title}</CardTitle>
              <p className="text-sm text-foreground/85">{n.text}</p>
              <p className="mt-auto text-xs text-muted-foreground">{n.example}</p>
            </Card>
          ))}
        </ScrollSnapRow>

        {/* Simulador */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card variant="featured" padding="lg" className="space-y-5">
            <div className="text-center lg:text-left">
              <Badge variant="warning" size="sm">Exemplo, não é promessa</Badge>
              <CardTitle className="mt-3 text-lg">Veja como as recompensas podem crescer</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Conta simples usando 5% ao ano só como exemplo. O valor real pode ser maior, menor ou zero.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="sim-a">Quantos $VZN guardar</Label><Input id="sim-a" type="number" min={0} max={1000000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label htmlFor="sim-m">Por quantos meses: {months}</Label><input id="sim-m" type="range" min={1} max={36} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="mt-3 w-full accent-[var(--magenta)]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Você teria</p><p className="font-mono text-xl text-gradient-brand">{fmt(sim.final)} $VZN</p></div>
              <div className="rounded-xl border bg-background/60 p-4"><p className="text-xs text-muted-foreground">Recompensa do exemplo</p><p className="font-mono text-xl text-cyan">+{fmt(sim.gain)}</p></div>
            </div>
          </Card>

          {/* Comparação de redes */}
          <Card padding="lg" className="space-y-5">
            <div className="text-center lg:text-left">
              <CardTitle className="text-lg">Como seus $VZN viajam entre redes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Compare os dois jeitos.</p>
            </div>
            <div className="flex justify-center gap-2 lg:justify-start">
              {(Object.keys(bridge) as (keyof typeof bridge)[]).map((k) => (
                <Button key={k} size="sm" variant={mode === k ? "primary" : "secondary"} onClick={() => setMode(k)} aria-pressed={mode === k}>{bridge[k].label}</Button>
              ))}
            </div>
            <ul className="space-y-2">
              {bridge[mode].rows.map(([k, v]) => (
                <li key={k} className="flex flex-col gap-1 rounded-xl border bg-background/60 p-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <Badge variant={badgeTone[bridge[mode].tone]} size="sm" className="self-center sm:self-auto">{v}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* IA */}
        <Card padding="lg" className="mt-6 space-y-5 text-center">
          <CardTitle className="text-lg">IA que ajuda, pessoas que decidem</CardTitle>
          <Tabs defaultValue="criar" className="flex flex-col items-center gap-5">
            <TabsList>{(Object.keys(lab) as (keyof typeof lab)[]).map((k) => <TabsTrigger key={k} value={k}>{lab[k].label}</TabsTrigger>)}</TabsList>
            {(Object.keys(lab) as (keyof typeof lab)[]).map((k) => (
              <TabsContent key={k} value={k} className="w-full space-y-4">
                <p className="mx-auto max-w-xl text-sm text-foreground/85">{lab[k].text}</p>
                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {lab[k].steps.map((s, i) => (
                    <li key={s} className="rounded-xl border bg-background/60 p-3"><span className="font-mono text-xs text-cyan">0{i + 1}</span><p className="text-sm font-semibold">{s}</p></li>
                  ))}
                </ol>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </Section>

      {/* 4. Token */}
      <Section className="pt-0 md:pt-0">
        <Card variant="glass" padding="lg" className="grid items-center gap-8 text-center md:grid-cols-[auto_1fr] md:text-left">
          <TokenBadge className="mx-auto" />
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-wide">O $VZN em palavras simples</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[[Coins, "Usar", "Pague títulos e ferramentas dentro da VisionZ."], [Sparkles, "Ganhar", "Receba por assistir, criar e convidar pessoas."], [Users, "Participar", "Ajude a decidir o futuro da plataforma."]].map(([I, t, d]) => {
                const Icon = I as typeof Coins;
                return <div key={t as string} className="flex flex-col items-center gap-2 rounded-xl border bg-background/60 p-4 sm:items-start"><Icon className="size-5 text-magenta" /><p className="font-semibold">{t as string}</p><p className="text-xs text-muted-foreground">{d as string}</p></div>;
              })}
            </div>
            <p className="flex items-start justify-center gap-2 text-sm text-warning md:justify-start"><AlertTriangle className="mt-0.5 size-4 shrink-0" />O valor do $VZN pode subir ou cair. Ele não é um investimento com retorno garantido.</p>
          </div>
        </Card>
      </Section>

      {/* 5. Números */}
      <Section className="pt-0 md:pt-0">
        <SectionHeading align="center" eyebrow="Estimativas" title="Para onde queremos chegar" description="Cenário de expansão. São metas, não garantias." />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {projections.map((p) => (
            <Card key={p.ano} padding="lg" className="flex flex-col items-center gap-2 text-center">
              <Badge variant="neutral" size="sm">{p.ano}</Badge>
              <Stat value={`${p.usuarios >= 1_000_000 ? `${(p.usuarios / 1_000_000).toLocaleString("pt-BR")}M` : `${p.usuarios / 1000}K`}`} label="pessoas usando" />
              <p className="font-mono text-sm text-muted-foreground">{`R$ ${p.receita.toLocaleString("pt-BR")}M`} · <span>receita</span></p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 6. Cuidados */}
      <Section className="pt-0 md:pt-0">
        <SectionHeading align="center" eyebrow="Cuidados" title="O que levamos a sério" />
        <ScrollSnapRow label="Cuidados" className="mt-10 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {cares.map((c) => (
            <Card key={c.title} padding="lg" className="flex h-full flex-col items-center gap-3 text-center">
              <c.icon className="size-6 text-cyan" />
              <CardTitle>{c.title}</CardTitle>
              <Badge variant={badgeTone[c.tone]} size="sm">{c.level}</Badge>
              <p className="text-sm text-muted-foreground">{c.text}</p>
            </Card>
          ))}
        </ScrollSnapRow>
      </Section>

      {/* 7. Linha do tempo */}
      <Section className="pt-0 md:pt-0">
        <SectionHeading align="center" eyebrow="Linha do tempo" title="Passo a passo" description="Toque numa fase para ver o que entra nela. É um plano e pode mudar." />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {phases.map((p, i) => (
            <button key={p.n} type="button" onClick={() => setPhase(i)} aria-pressed={phase === i}
              className={cn("rounded-2xl border bg-surface p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", phase === i ? "border-cyan/60 shadow-glow-cyan" : "hover:border-cyan/40")}>
              <span className="font-mono text-xs text-cyan">{p.n}</span>
              <p className="font-display font-semibold tracking-wide">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.period}</p>
            </button>
          ))}
        </div>
        <Card padding="lg" className="mx-auto mt-4 max-w-2xl animate-rise" key={phase}>
          <ul className="flex flex-col items-center gap-2 text-center md:flex-row md:flex-wrap md:justify-center md:gap-x-8">{phases[phase].items.map((it) => <li key={it} className="text-sm text-foreground/90"><span className="mr-2 text-magenta">•</span>{it}</li>)}</ul>
        </Card>
      </Section>

      {/* 8. Chamada final */}
      <Section className="pt-0 text-center md:pt-0">
        <Card variant="featured" padding="lg" className="space-y-5">
          <h2 className="text-balance font-display text-2xl font-bold tracking-wide md:text-3xl">Quer fazer parte desde o começo?</h2>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => setLead("espera")}>Entrar na lista de espera</Button>
            <Button size="lg" variant="secondary" onClick={() => setContact(true)}>Falar com a VisionZ</Button>
          </div>
        </Card>
      </Section>
      <LeadDialog open={lead !== null} onOpenChange={(v) => !v && setLead(null)} kind={lead ?? "espera"} />
      <ContactDialog open={contact} onOpenChange={setContact} />
    </main>
  );
}
