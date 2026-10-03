import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AudioLines, Bot, Clapperboard, Coins, Eye, Gem, Megaphone, Music, Play, ShieldCheck, Sparkles, UserCheck, Users } from "lucide-react";
import {
  AIVerifiedBadge, Badge, Button, Card, CardDescription, CardTitle, ContentCard, KidsModeToggle, Logo, NetworkTag, PricingCard,
  SectionHeading, ScrollSnapRow, Stat, Timeline, WalletBalance, Reveal, Eyebrow, OrbitRing, TokenBadge, type Network,
} from "@/index";
import { Glow, LeadDialog, Section } from "@/experience/site-parts";
import { agents, catalog, roadmap } from "@/experience/data";
import { filterCatalog } from "@/experience/logic";
import heroCover from "@/assets/covers/jukebox-live.jpg";
import heroVideo from "@/assets/videos/visionz-hero-bg-720.mp4.asset.json";

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
        <HeroVideo src={heroVideo.url} poster={heroCover} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_0%,transparent_70%)] opacity-60" />
        <div className="absolute inset-0 bg-stage-glow" />
        <div className="absolute inset-0 bg-light-streaks" />
        <div className="absolute inset-x-0 bottom-0 h-64 floor-reflection" />
        <Section className="relative pb-16 pt-10 md:pb-24 md:pt-20">
          <div className="animate-rise flex flex-col items-center justify-between gap-5 text-center md:flex-row md:items-start md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <p className="font-display text-sm italic tracking-[0.2em] sm:text-lg md:text-2xl md:tracking-[0.25em]">MAIS QUE TECNOLOGIA,</p>
              <p className="underline-brand font-display text-sm font-bold italic tracking-[0.2em] after:left-1/2 after:-translate-x-1/2 sm:text-lg md:text-2xl md:tracking-[0.25em] md:after:left-0 md:after:translate-x-0">É <span className="text-gradient-brand">VISÃO DE FUTURO.</span></p>
            </div>
            <div className="hidden sm:block md:text-right">
              <Eyebrow tone="foreground" items={["Inovação", "Streaming", "Recompensas"]} />
              <Eyebrow className="mt-2 text-[0.65rem]">Construindo um mundo mais conectado.</Eyebrow>
            </div>
          </div>

          <div className="relative mx-auto mt-12 max-w-5xl text-center md:mt-20">
            <OrbitRing size="xl" className="hidden md:block" />
            <div className="animate-rise relative mb-6 flex flex-wrap justify-center gap-2 [animation-delay:150ms]">
              <Badge variant="cyan"><Bot />IA Clyro nativa</Badge><Badge variant="neutral" className="hidden sm:inline-flex">4K / 8K sem lag</Badge>
              <Badge variant="neutral" className="hidden sm:inline-flex">Multichain</Badge><AIVerifiedBadge>Seguro para crianças</AIVerifiedBadge>
            </div>
            <h1 className="animate-rise relative [animation-delay:300ms] text-balance font-display text-[1.8rem] font-extrabold leading-[1.08] tracking-wide sm:text-5xl md:text-7xl">
              <span className="text-metallic">O entretenimento</span> <span className="text-gradient-brand">nunca mais</span> <span className="text-metallic">será o mesmo.</span>
            </h1>
            <Eyebrow tone="foreground" className="animate-rise relative mt-8 [animation-delay:450ms]" items={["Assista", "Crie", "Ganhe"]} />
            <p className="animate-rise relative mx-auto mt-5 max-w-2xl [animation-delay:550ms] text-base md:mt-6 md:text-lg font-medium leading-relaxed text-foreground/90 [text-shadow:0_2px_12px_var(--background)]">
              A VisionZ vai revolucionar o streaming no Brasil e no mundo. Assista sob demanda ou à la carte, crie com IA e participe de um ecossistema de recompensas que cresce com você.
            </p>
            <div className="animate-rise relative mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:mt-10 [animation-delay:700ms]">
              <Button size="lg" onClick={() => setLead("espera")}>Entrar na lista de espera</Button>
              <Button size="lg" variant="neon" onClick={() => setLead("investidor")}>Sou investidor</Button>
              <Link to="/app" className="self-center"><Button size="lg" variant="ghost"><Play />Ver o protótipo</Button></Link>
            </div>
          </div>

          <div className="relative -mx-5 mt-12 flex snap-x gap-6 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-auto sm:grid sm:max-w-5xl sm:grid-cols-5 sm:gap-y-8 sm:overflow-visible sm:px-0 md:mt-20 md:divide-x md:divide-border">
            {[
              { icon: Clapperboard, t: "Criação audiovisual", c: "text-primary" },
              { icon: Play, t: "Streaming 4K/8K", c: "text-indigo" },
              { icon: Bot, t: "Inteligência artificial", c: "text-magenta" },
              { icon: ShieldCheck, t: "Seguro para crianças", c: "text-ember" },
              { icon: Coins, t: "Recompensas multichain", c: "text-gold" },
            ].map(({ icon: Icon, t, c }) => (
              <Reveal key={t} className="flex w-24 shrink-0 snap-center flex-col items-center gap-3 text-center sm:w-auto sm:px-4">
                <Icon className={`size-8 md:size-9 ${c}`} strokeWidth={1.5} />
                <span className="label-eyebrow text-[0.65rem] tracking-[0.2em] text-foreground">{t}</span>
              </Reveal>
            ))}
          </div>

          <Reveal effect="zoom" className="relative mt-10 flex justify-center md:mt-16"><TokenBadge size="lg" /></Reveal>

          <div className="relative mt-10 grid grid-cols-2 gap-x-4 gap-y-6 text-center md:mt-20 md:grid-cols-4 md:gap-8 md:text-left">
            <Stat value="0%" label="exposição infantil a conteúdo impróprio — nossa meta" />
            <Stat value="40%" tone="cyan" label="menos custo de banda com a tecnologia Clyro" />
            <Stat value="4K/8K" tone="default" label="streaming de alta performance" />
            <Stat value="5" tone="cyan" label="redes blockchain suportadas" />
          </div>
        </Section>
      </div>

      {/* Como funciona */}
      <Section>
        <Reveal><SectionHeading align="center" eyebrow="Como funciona" title="Assista. Crie. Ganhe." description="Um único ecossistema em que todo mundo participa do valor gerado." /></Reveal>
        <ScrollSnapRow label="Como funciona" className="mt-10 md:mt-14 md:grid-cols-3 md:gap-6">
          {[
            { icon: Eye, n: "01", t: "Assista", d: "Assine o catálogo ou compre só o título que quiser. Cada hora assistida gera recompensas." },
            { icon: Clapperboard, n: "02", t: "Crie", d: "Produza séries, filmes, curtas, documentários e músicas com o Clyro Synth e o Clyro Jukebox." },
            { icon: Coins, n: "03", t: "Ganhe", d: "Receba pela sua obra e por trazer pessoas ao ecossistema, direto na sua carteira interna." },
          ].map(({ icon: Icon, n, t, d }) => (
            <Reveal key={t}><Card variant="glass" padding="lg" className="flex h-full flex-col items-center space-y-4 text-center md:items-start md:text-left">
              <div className="flex w-full items-center justify-center gap-4 md:justify-between"><span className="flex size-12 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground"><Icon className="size-6" /></span><span className="font-display text-3xl font-bold text-muted">{n}</span></div>
              <CardTitle className="text-xl">{t}</CardTitle><CardDescription className="text-base">{d}</CardDescription>
            </Card></Reveal>
          ))}
        </ScrollSnapRow>
      </Section>

      {/* Segurança */}
      <div className="border-y bg-surface/40">
        <Section className="grid items-center gap-10 [&>*]:min-w-0 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col items-center space-y-6 text-center md:items-start md:space-y-8 md:text-left">
            <Reveal><SectionHeading eyebrow="Segurança familiar" title={<>Segurança absoluta para a sua <span className="text-cyan">família</span>.</>} description="O Filtro Inteligente da Clyro Labs analisa imagem e áudio em milissegundos e bloqueia o que é proibido, principalmente para crianças." /></Reveal>
            <ol className="w-full space-y-3 md:space-y-4">
              {[
                { icon: Eye, t: "Análise visual", d: "Padrões e gestos impróprios identificados quadro a quadro." },
                { icon: AudioLines, t: "Auditoria sonora", d: "Transcrição e detecção de tom agressivo em vários idiomas." },
                { icon: UserCheck, t: "Revisão humana", d: "Casos difíceis vão a especialistas, e cada decisão retreina a IA." },
              ].map(({ icon: Icon, t, d }, i) => (
                <li key={t}><details className="group rounded-lg border bg-background/40 p-3 text-left md:border-0 md:bg-transparent md:p-0">
                  <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan"><Icon className="size-5" /><span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-cyan font-mono text-[10px] text-cyan-foreground">{i + 1}</span></span>
                  <div className="flex-1"><p className="font-semibold">{t}</p><p className="hidden text-sm text-muted-foreground md:block">{d}</p></div><span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45 md:hidden">+</span>
                  </summary>
                  <p className="mt-2 pl-15 text-sm text-muted-foreground md:hidden">{d}</p>
                </details></li>
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
        <Reveal><SectionHeading eyebrow="Redemocratização audiovisual" title="Um estúdio inteiro dentro da plataforma" description="Quem deu vida à criação tem o direito de explorá-la e distribuí-la. A VisionZ valida a autoria de quem usa IA para materializar ideias." /></Reveal>
        <ScrollSnapRow label="Estúdio Clyro" className="mt-10 md:mt-12 md:grid-cols-2 md:gap-6">
          <Card padding="lg" className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
            <div className="flex flex-col items-center gap-3 md:flex-row"><span className="flex size-11 items-center justify-center rounded-lg bg-gradient-brand"><Sparkles className="size-5 text-primary-foreground" /></span><CardTitle className="text-xl">Clyro Synth</CardTitle></div>
            <CardDescription className="text-base">Estúdio de mídia sintética para séries animadas, filmes, curtas e longas, e documentários, com custo de produção muito menor.</CardDescription>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start"><Badge variant="cyan">Em produção: Aventuras do Trio Alegria</Badge><Badge variant="cyan">Rebeca e sua turma</Badge></div>
          </Card>
          <Card padding="lg" className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
            <div className="flex flex-col items-center gap-3 md:flex-row"><span className="flex size-11 items-center justify-center rounded-lg bg-gradient-tech"><Music className="size-5 text-cyan-foreground" /></span><CardTitle className="text-xl">Clyro Jukebox</CardTitle></div>
            <CardDescription className="text-base">Trilhas e canções originais geradas com IA, sem entraves de direitos autorais complexos. A obra é sua.</CardDescription>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start"><Badge>Trilhas originais</Badge><Badge>Distribuição direta</Badge><Badge>Autoria validada</Badge></div>
          </Card>
        </ScrollSnapRow>
        <div className="-mx-5 mt-8 flex snap-x gap-4 px-5 [&>*]:snap-start sm:mx-0 sm:px-0 overflow-x-auto pb-2">
          {catalog.filter((c) => c.row === "synth").map((t) => <ContentCard key={t.id} className="shrink-0" title={t.title} creator={t.creator} duration={t.duration} rating={t.rating} price={t.price} cover={<img src={t.cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />} />)}
        </div>
      </Section>

      {/* Ecossistema */}
      <div className="relative overflow-hidden border-y bg-surface/40">
        <Glow className="right-0 top-0 size-96 bg-magenta/20" />
        <Section className="relative grid items-center gap-10 [&>*]:min-w-0 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div className="space-y-6 md:space-y-8">
            <Reveal><SectionHeading eyebrow="Ecossistema de ganhos" title={<>Ganhos <span className="text-gradient-brand">ilimitados</span> para quem faz parte</>} description="Cada novo usuário, título e indicação gera valor que circula entre todos os participantes, em várias redes blockchain." /></Reveal>
            <ScrollSnapRow label="Quem ganha" item="narrow" className="md:grid-cols-2 md:gap-4">
              {[
                { icon: Clapperboard, t: "Criadores", d: "Até 85% de cada venda avulsa e participação nas assinaturas." },
                { icon: Users, t: "Assinantes", d: "Recompensas por tempo assistido, avaliações e indicações." },
                { icon: Megaphone, t: "Embaixadores", d: "Participação direta no crescimento que trazem para a rede." },
                { icon: Gem, t: "Parceiros", d: "Valorização cruzada no ecossistema Clyro Labs." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex flex-col items-center gap-2 rounded-lg border bg-background/40 p-4 text-center md:flex-row md:items-start md:gap-3 md:border-0 md:bg-transparent md:p-0 md:text-left"><Icon className="size-6 shrink-0 text-magenta md:mt-0.5 md:size-5" /><div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></div>
              ))}
            </ScrollSnapRow>
            <p className="text-center text-xs md:text-left text-muted-foreground">Recompensas dependem da atividade no ecossistema e não representam retorno garantido.</p>
          </div>
          <WalletBalance balance="1.284,50" token="VZN" fiat="R$ 642,25" network={net} onNetworkChange={setNet} />
        </Section>
      </div>

      {/* Planos */}
      <Section>
        <Reveal><SectionHeading align="center" eyebrow="Planos" title="Assine, ou pague só pelo que assistir" /></Reveal>
        <ScrollSnapRow label="Planos" className="mx-auto mt-10 max-w-5xl md:mt-14 md:grid-cols-3 md:gap-6">
          <PricingCard className="order-2 md:order-none" name="À la carte" price="R$ 4,90+" period="por título" description="Sem mensalidade. Compre e assista para sempre." features={["Compra avulsa de títulos", "Pacotes on-demand", "Recompensa a cada compra", "Carteira interna inclusa"]} cta="Explorar catálogo" onSelect={() => setLead("espera")} />
          <PricingCard className="order-1 md:order-none" variant="featured" badge="Mais popular" name="Premium" price="R$ 29,90" description="O catálogo completo em 4K/8K." features={["Catálogo completo", "4K / 8K sem lag", "2 telas simultâneas", "Recompensas em dobro"]} cta="Entrar na lista" onSelect={() => setLead("espera")} />
          <PricingCard className="order-3 md:order-none" name="Family" price="R$ 44,90" description="Até 5 perfis, com Modo infantil." features={["5 perfis", "Modo infantil com IA", "Relatório para os pais", "4 telas simultâneas"]} cta="Entrar na lista" onSelect={() => setLead("espera")} />
        </ScrollSnapRow>
        <p className="mt-6 text-center text-sm text-muted-foreground">Criadores: ferramentas Pro do Synth e do Jukebox a partir de R$ 49,90/mês. Pagamentos por Pix, cartão e cripto.</p>
      </Section>

      {/* Tecnologia */}
      <div className="border-y bg-surface/40">
        <Section className="space-y-8 md:space-y-12">
          <Reveal><SectionHeading eyebrow="Tecnologia Clyro" title="Um orquestrador de agentes de IA por trás de cada tela" description="O Clyro Agent Core coordena agentes especializados: moderação, marketing, Web3, desenvolvimento e pesquisa." /></Reveal>
          <div className="relative rounded-xl border border-cyan/20 bg-background/60 p-4 bg-circuit-grid md:p-6">
            <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-xl border border-cyan/50 bg-surface px-5 py-3 shadow-glow-cyan"><Logo brand="clyro-icon" size="sm" alt="" /><span className="font-display font-semibold tracking-wide">Clyro Agent Core</span></div>
            <ScrollSnapRow label="Agentes Clyro" item="narrow" className="gap-3 md:grid-cols-5">
              {agents.slice(1).map((a) => (
                <div key={a.name} className="rounded-lg border bg-surface flex flex-col items-center p-3 text-center"><ShieldCheck className="mx-auto mb-2 size-5 text-cyan" /><p className="text-sm font-semibold">{a.name}</p><p className="text-xs text-muted-foreground">{a.role}</p></div>
              ))}
            </ScrollSnapRow>
            <div className="mt-6 flex flex-wrap justify-center gap-2"><NetworkTag network="polygon" /><NetworkTag network="ethereum" /><NetworkTag network="solana" /><NetworkTag network="bnb" /><NetworkTag network="base" /></div>
          </div>
          <details className="group md:hidden"><summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg border p-3 font-display text-sm tracking-wide [&::-webkit-details-marker]:hidden">Roadmap <span aria-hidden className="transition-transform group-open:rotate-45">+</span></summary><div className="mt-4"><Timeline items={roadmap} /></div></details>
          <div className="hidden md:block"><Timeline items={roadmap} /></div>
        </Section>
      </div>

      {/* Ambassadors */}
      <Section>
        <div className="relative overflow-hidden rounded-xl bg-gradient-brand p-7 text-center sm:p-10 md:p-16 md:text-left">
          <div className="absolute inset-0 bg-circuit-grid opacity-30" />
          <div className="relative mx-auto max-w-2xl space-y-5 text-primary-foreground md:mx-0 md:space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em]">Programa VisionZ Ambassadors</p>
            <h2 className="text-balance font-display text-2xl font-bold tracking-wide sm:text-3xl md:text-5xl">Lance sua carreira com a gente.</h2>
            <p className="text-base opacity-90 md:text-lg">Crie com o Synth e o Jukebox, leve seu público para a VisionZ e participe diretamente do crescimento da plataforma.</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap md:justify-start">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => setLead("espera")}>Quero ser embaixador</Button>
              <Link to="/site/criadores" className="hidden sm:block"><Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-background/20">Saiba mais</Button></Link>
            </div>
          </div>
        </div>
      </Section>

      <LeadDialog open={lead !== null} onOpenChange={(o) => !o && setLead(null)} kind={lead ?? "espera"} />
    </>
  );
}

/** Background video: lightweight, paused when off-screen or tab hidden. */
function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let visible = true;
    const sync = () => (visible && !document.hidden ? v.play().catch(() => {}) : v.pause());
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return (
    <video ref={ref} src={src} poster={poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full transform-gpu object-cover opacity-0 animate-[vz-fade_1.6s_ease-out_0.2s_forwards] [--tw-final:0.35] motion-reduce:hidden" />
  );
}
