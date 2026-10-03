import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, Coins, Network, ShieldCheck, Sparkles, Tv } from "lucide-react";
import { Shell } from "@/showcase/shell";
import { AIVerifiedBadge, Badge, Button, Card, CardDescription, CardTitle, Logo, NetworkTag } from "@/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisionZ Design System — Visão geral" },
      { name: "description", content: "A VisionZ vai revolucionar o streaming no Brasil e no mundo: criação, streaming sob demanda e recompensas multichain." },
      { property: "og:title", content: "VisionZ Design System — Visão geral" },
      { property: "og:description", content: "Streaming on-demand e à la carte em blockchain, com recompensas gamificadas e conteúdo seguro para crianças." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const pillars = [
  { icon: Clapperboard, title: "Criação audiovisual", text: "Ferramentas para criadores produzirem, publicarem e serem donos do que criam." },
  { icon: Tv, title: "On-demand e à la carte", text: "Assine o catálogo ou pague só pelo título que quiser assistir." },
  { icon: Coins, title: "Recompensas gamificadas", text: "Quem cria, assiste e indica acumula ganhos ilimitados no ecossistema." },
  { icon: Network, title: "Multichain", text: "Recompensas em várias redes blockchain, sem amarrar ninguém a uma só." },
  { icon: ShieldCheck, title: "Conteúdo monitorado", text: "IA da Clyro Labs analisa tudo automaticamente e bloqueia o proibido, principalmente para crianças." },
  { icon: Sparkles, title: "Brasil para o mundo", text: "Nascida no Brasil, pensada para revolucionar o streaming em qualquer lugar." },
];

function Overview() {
  return (
    <Shell>
      <section className="relative overflow-hidden rounded-xl border border-cyan/20 bg-surface/60 px-8 py-16 shadow-panel md:px-14">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-96 rounded-full bg-cyan/15 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge variant="cyan">Multiplataforma em blockchain</Badge>
              <AIVerifiedBadge />
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-wide md:text-6xl">
              O streaming <span className="text-gradient-brand">reinventado</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              A VisionZ vai revolucionar a maneira como se lida com streaming no Brasil e fora dele: tecnologia de ponta e ganhos ilimitados para todos que fazem parte do ecossistema.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/componentes"><Button size="lg">Ver componentes</Button></Link>
              <Link to="/marca"><Button size="lg" variant="neon">Conhecer a marca</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <NetworkTag network="polygon" /><NetworkTag network="solana" /><NetworkTag network="ethereum" /><NetworkTag network="base" />
            </div>
          </div>
          <div className="flex justify-center rounded-xl bg-white p-6"><Logo brand="vizionz" size="xl" /></div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-wide">Pilares da plataforma</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <Card key={title} variant="glass" className="space-y-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan"><Icon className="size-5" /></span>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}
