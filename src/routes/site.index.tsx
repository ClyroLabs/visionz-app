import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AudioLines, Bot, Clapperboard, Coins, Eye, Gem, Megaphone, Music, Play, ShieldCheck, Sparkles, UserCheck, Users } from "lucide-react";
import {
  AIVerifiedBadge, Badge, Button, Card, CardDescription, CardTitle, ContentCard, KidsModeToggle, Logo, NetworkTag, PricingCard,
  SectionHeading, Stat, Timeline, WalletBalance, type Network,
} from "@/index";
import { Glow, LeadDialog, Section } from "@/experience/site-parts";
import { agents, catalog, roadmap } from "@/experience/data";
import { filterCatalog } from "@/experience/logic";
import heroCover from "@/assets/covers/jukebox-live.jpg";

export const Route = createFileRoute("/site/")({
  head: () => ({
    meta: [
      { title: "VisionZ — O entretenimento nunca mais será o mesmo" },
      { name: "description", content: "Streaming on-demand e à la carte com IA da Clyro Labs, conteúdo seguro para crianças e recompensas multichain para todo o ecossistema." },
      { property: "og:title", content: "VisionZ — O entretenimento nunca mais será o mesmo" },
      { property: "og:description", content: "Assista, crie e ganhe: o streaming ético, criativo e lucrativo da VisionZ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [lead, setLead] = useState<null | "espera" | "investidor">(null);
  const [kids, setKids] = useState(true);
  const [net, setNet] = useState<Network>("polygon");
  const preview = filterCatalog(catalog, kids).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={heroCover} alt="" width={1280} height={720} className="absolute inset-0 size-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/85 to-background" />
        <div className="absolute inset-0 bg-stage-glow" />
        <div className="absolute inset-0 bg-light-streaks" />
        <div className="absolute inset-x-0 bottom-0 h-64 floor-reflection" />
        <Section className="relative pb-24 pt-16 md:pt-20">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <p className="font-display text-lg italic tracking-[0.25em] md:text-2xl">MAIS QUE TECNOLOGIA,</p>
              <p className="underline-brand font-display text-lg font-bold italic tracking-[0.25em] md:text-2xl">É <span className="text-gradient-brand">VISÃO DE FUTURO.</span></p>
            </div>
            <div className="md:text-right">
              <Eyebrow tone="foreground" items={["Inovação", "Streaming", "Recompensas"]} />
              <Eyebrow className="mt-2 text-[0.65rem]">Construindo um mundo mais conectado.</Eyebrow>
            </div>
          </div>

          <div className="relative mx-auto mt-20 max-w-5xl text-center">
            <OrbitRing size="xl" className="hidden md:block" />
            <div className="relative mb-6 flex flex-wrap justify-center gap-2">
              <Badge variant="cyan"><Bot />IA Clyro nativa</Badge><Badge variant="neutral">4K / 8K sem lag</Badge>
              <Badge variant="neutral">Multichain</Badge><AIVerifiedBadge>Seguro para crianças</AIVerifiedBadge>
            </div>
            <h1 className="relative font-display text-5xl font-extrabold leading-[1.05] tracking-wide md:text-7xl">
              <span className="text-metallic">O entretenimento</span> <span className="text-gradient-brand">nunca mais</span> <span className="text-metallic">será o mesmo.</span>
            </h1>
            <Eyebrow tone="foreground" className="relative mt-8" items={["Assista", "Crie", "Ganhe"]} />
            <p className="relative mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A VisionZ vai revolucionar o streaming no Brasil e no mundo. Assista sob demanda ou à la carte, crie com IA e participe de um ecossistema de recompensas que cresce com você.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => setLead("espera")}>Entrar na lista de espera</Button>
              <Button size="lg" variant="neon" onClick={() => setLead("investidor")}>Sou investidor</Button>
              <Link to="/app"><Button size="lg" variant="ghost"><Play />Ver o protótipo</Button></Link>
            </div>
          </div>

          <div className="relative mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-5 md:divide-x md:divide-border">
            {[
              { icon: Clapperboard, t: "Criação audiovisual", c: "text-primary" },
              { icon: Play, t: "Streaming 4K/8K", c: "text-indigo" },
              { icon: Bot, t: "Inteligência artificial", c: "text-magenta" },
              { icon: ShieldCheck, t: "Seguro para crianças", c: "text-ember" },
              { icon: Coins, t: "Recompensas multichain", c: "text-gold" },
            ].map(({ icon: Icon, t, c }) => (
              <div key={t} className="flex flex-col items-center gap-3 px-4 text-center">
                <Icon className={`size-9 ${c}`} strokeWidth={1.5} />
                <span className="text-eyebrow text-[0.65rem] tracking-[0.2em] text-foreground">{t}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-16 flex justify-center"><TokenBadge size="lg" /></div>

          <div className="relative mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat value="0%" label="exposição infantil a conteúdo impróprio — nossa meta" />
            <Stat value="40%" tone="cyan" label="menos custo de banda com a tecnologia Clyro" />
            <Stat value="4K/8K" tone="default" label="streaming de alta performance" />
            <Stat value="5" tone="cyan" label="redes blockchain suportadas" />
          </div>
        </Section>
      </div>

      {/* Como funciona */}
      <Section>
        <SectionHeading align="center" eyebrow="Como funciona" title="Assista. Crie. Ganhe." description="Um único ecossistema em que todo mundo participa do valor gerado." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Eye, n: "01", t: "Assista", d: "Assine o catálogo ou compre só o título que quiser. Cada hora assistida gera recompensas." },
            { icon: Clapperboard, n: "02", t: "Crie", d: "Produza séries, filmes, curtas, documentários e músicas com o Clyro Synth e o Clyro Jukebox." },
            { icon: Coins, n: "03", t: "Ganhe", d: "Receba pela sua obra e por trazer pessoas ao ecossistema, direto na sua carteira interna." },
          ].map(({ icon: Icon, n, t, d }) => (
            <Card key={t} variant="glass" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground"><Icon className="size-6" /></span><span className="font-display text-3xl font-bold text-muted">{n}</span></div>
              <CardTitle className="text-xl">{t}</CardTitle><CardDescription className="text-base">{d}</CardDescription>
            </Card>
          ))}
        </div>
      </Section>

      {/* Segurança */}
      <div className="border-y bg-surface/40">
        <Section className="grid items-center gap-14 lg:grid-cols-2">
          <div className="space-y-8">
            <SectionHeading eyebrow="Segurança familiar" title={<>Segurança absoluta para a sua <span className="text-cyan">família</span>.</>} description="O Filtro Inteligente da Clyro Labs analisa imagem e áudio em milissegundos e bloqueia o que é proibido, principalmente para crianças." />
            <ol className="space-y-4">
              {[
                { icon: Eye, t: "Análise visual", d: "Padrões e gestos impróprios identificados quadro a quadro." },
                { icon: AudioLines, t: "Auditoria sonora", d: "Transcrição e detecção de tom agressivo em vários idiomas." },
                { icon: UserCheck, t: "Revisão humana", d: "Casos difíceis vão a especialistas, e cada decisão retreina a IA." },
              ].map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="flex gap-4">
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan"><Icon className="size-5" /><span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-cyan font-mono text-[10px] text-cyan-foreground">{i + 1}</span></span>
                  <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                </li>
              ))}
            </ol>
            <Link to="/site/seguranca"><Button variant="neon">Como protegemos as crianças</Button></Link>
          </div>
          <Card variant="glow" padding="lg" className="space-y-5">
            <KidsModeToggle enabled={kids} onEnabledChange={setKids} />
            <p className="text-sm text-muted-foreground">Experimente: com o modo infantil {kids ? "ligado" : "desligado"}, o catálogo mostra {kids ? "só títulos Livre e 10 anos" : "todas as classificações"}.</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {preview.map((t) => <ContentCard key={t.id} orientation="portrait" className="shrink-0" title={t.title} creator={t.creator} duration={t.duration} rating={t.rating} price={t.price} cover={<img src={t.cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />} />)}
            </div>
          </Card>
        </Section>
      </div>

      {/* Estúdio */}
      <Section>
        <SectionHeading eyebrow="Redemocratização audiovisual" title="Um estúdio inteiro dentro da plataforma" description="Quem deu vida à criação tem o direito de explorá-la e distribuí-la. A VisionZ valida a autoria de quem usa IA para materializar ideias." />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-lg bg-gradient-brand"><Sparkles className="size-5 text-primary-foreground" /></span><CardTitle className="text-xl">Clyro Synth</CardTitle></div>
            <CardDescription className="text-base">Estúdio de mídia sintética para séries animadas, filmes, curtas e longas, e documentários, com custo de produção muito menor.</CardDescription>
            <div className="flex flex-wrap gap-2"><Badge variant="cyan">Em produção: Aventuras do Trio Alegria</Badge><Badge variant="cyan">Rebeca e sua turma</Badge></div>
          </Card>
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-lg bg-gradient-tech"><Music className="size-5 text-cyan-foreground" /></span><CardTitle className="text-xl">Clyro Jukebox</CardTitle></div>
            <CardDescription className="text-base">Trilhas e canções originais geradas com IA, sem entraves de direitos autorais complexos. A obra é sua.</CardDescription>
            <div className="flex flex-wrap gap-2"><Badge>Trilhas originais</Badge><Badge>Distribuição direta</Badge><Badge>Autoria validada</Badge></div>
          </Card>
        </div>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {catalog.filter((c) => c.row === "synth").map((t) => <ContentCard key={t.id} className="shrink-0" title={t.title} creator={t.creator} duration={t.duration} rating={t.rating} price={t.price} cover={<img src={t.cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />} />)}
        </div>
      </Section>

      {/* Ecossistema */}
      <div className="relative overflow-hidden border-y bg-surface/40">
        <Glow className="right-0 top-0 size-96 bg-magenta/20" />
        <Section className="relative grid items-center gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-8">
            <SectionHeading eyebrow="Ecossistema de ganhos" title={<>Ganhos <span className="text-gradient-brand">ilimitados</span> para quem faz parte</>} description="Cada novo usuário, título e indicação gera valor que circula entre todos os participantes, em várias redes blockchain." />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Clapperboard, t: "Criadores", d: "Até 85% de cada venda avulsa e participação nas assinaturas." },
                { icon: Users, t: "Assinantes", d: "Recompensas por tempo assistido, avaliações e indicações." },
                { icon: Megaphone, t: "Embaixadores", d: "Participação direta no crescimento que trazem para a rede." },
                { icon: Gem, t: "Parceiros", d: "Valorização cruzada no ecossistema Clyro Labs." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-magenta" /><div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Recompensas dependem da atividade no ecossistema e não representam retorno garantido.</p>
          </div>
          <WalletBalance balance="1.284,50" token="VZN" fiat="R$ 642,25" network={net} onNetworkChange={setNet} />
        </Section>
      </div>

      {/* Planos */}
      <Section>
        <SectionHeading align="center" eyebrow="Planos" title="Assine, ou pague só pelo que assistir" />
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          <PricingCard name="À la carte" price="R$ 4,90+" period="por título" description="Sem mensalidade. Compre e assista para sempre." features={["Compra avulsa de títulos", "Pacotes on-demand", "Recompensa a cada compra", "Carteira interna inclusa"]} cta="Explorar catálogo" onSelect={() => setLead("espera")} />
          <PricingCard variant="featured" badge="Mais popular" name="Premium" price="R$ 29,90" description="O catálogo completo em 4K/8K." features={["Catálogo completo", "4K / 8K sem lag", "2 telas simultâneas", "Recompensas em dobro"]} cta="Entrar na lista" onSelect={() => setLead("espera")} />
          <PricingCard name="Family" price="R$ 44,90" description="Até 5 perfis, com Modo infantil." features={["5 perfis", "Modo infantil com IA", "Relatório para os pais", "4 telas simultâneas"]} cta="Entrar na lista" onSelect={() => setLead("espera")} />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">Criadores: ferramentas Pro do Synth e do Jukebox a partir de R$ 49,90/mês. Pagamentos por Pix, cartão e cripto.</p>
      </Section>

      {/* Tecnologia */}
      <div className="border-y bg-surface/40">
        <Section className="space-y-12">
          <SectionHeading eyebrow="Tecnologia Clyro" title="Um orquestrador de agentes de IA por trás de cada tela" description="O Clyro Agent Core coordena agentes especializados: moderação, marketing, Web3, desenvolvimento e pesquisa." />
          <div className="relative rounded-xl border border-cyan/20 bg-background/60 p-6 bg-circuit-grid">
            <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-xl border border-cyan/50 bg-surface px-5 py-3 shadow-glow-cyan"><Logo brand="clyro-icon" size="sm" alt="" /><span className="font-display font-semibold tracking-wide">Clyro Agent Core</span></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {agents.slice(1).map((a) => (
                <div key={a.name} className="rounded-lg border bg-surface p-3 text-center"><ShieldCheck className="mx-auto mb-2 size-5 text-cyan" /><p className="text-sm font-semibold">{a.name}</p><p className="text-xs text-muted-foreground">{a.role}</p></div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2"><NetworkTag network="polygon" /><NetworkTag network="ethereum" /><NetworkTag network="solana" /><NetworkTag network="bnb" /><NetworkTag network="base" /></div>
          </div>
          <Timeline items={roadmap} />
        </Section>
      </div>

      {/* Ambassadors */}
      <Section>
        <div className="relative overflow-hidden rounded-xl bg-gradient-brand p-10 md:p-16">
          <div className="absolute inset-0 bg-circuit-grid opacity-30" />
          <div className="relative max-w-2xl space-y-6 text-primary-foreground">
            <p className="font-mono text-xs uppercase tracking-[0.25em]">Programa VisionZ Ambassadors</p>
            <h2 className="font-display text-3xl font-bold tracking-wide md:text-5xl">Lance sua carreira com a gente.</h2>
            <p className="text-lg opacity-90">Crie com o Synth e o Jukebox, leve seu público para a VisionZ e participe diretamente do crescimento da plataforma.</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" onClick={() => setLead("espera")}>Quero ser embaixador</Button>
              <Link to="/site/criadores"><Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-background/20">Saiba mais</Button></Link>
            </div>
          </div>
        </div>
      </Section>

      <LeadDialog open={lead !== null} onOpenChange={(o) => !o && setLead(null)} kind={lead ?? "espera"} />
    </>
  );
}
