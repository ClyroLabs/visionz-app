import { createFileRoute } from "@tanstack/react-router";
import { Caption, PageHeader, Shell } from "@/showcase/shell";
import { Card } from "@/index";

export const Route = createFileRoute("/tipografia")({
  head: () => ({
    meta: [
      { title: "Tipografia — VisionZ Design System" },
      { name: "description", content: "Orbitron para títulos, Inter para leitura e JetBrains Mono para dados on-chain." },
      { property: "og:title", content: "Tipografia — VisionZ Design System" },
      { property: "og:description", content: "Orbitron para títulos, Inter para leitura e JetBrains Mono para dados on-chain." },
    ],
  }),
  component: Typography,
});

const fonts = [
  ["Orbitron", "font-display", "500 · 600 · 700 · 800", "títulos, números de destaque", "font-display"],
  ["Inter", "font-sans", "400 · 500 · 600 · 700", "texto corrido e interface", "font-sans"],
  ["JetBrains Mono", "font-mono", "400 · 500", "endereços, hashes, durações", "font-mono"],
];

const scale = [
  ["font-display text-6xl font-extrabold tracking-wide", "Display", "O streaming reinventado"],
  ["font-display text-4xl font-bold tracking-wide", "H1", "Lançamentos da semana"],
  ["font-display text-3xl font-bold tracking-wide", "H2", "Criadores em alta"],
  ["font-display text-2xl font-semibold tracking-wide", "H3", "Sua carteira"],
  ["font-display text-xl font-semibold tracking-wide", "H4", "Recompensas multichain"],
  ["font-display text-base font-semibold tracking-wide", "H5", "Modo infantil ativo"],
  ["text-sm font-semibold uppercase tracking-[0.2em]", "H6 / Eyebrow", "Ao vivo agora"],
  ["text-lg text-foreground", "Body large", "Assista, crie e ganhe em um único ecossistema."],
  ["text-base text-foreground", "Body", "Cada visualização gera recompensas para quem criou e para quem compartilhou."],
  ["text-sm text-muted-foreground", "Small / muted", "Conteúdo verificado automaticamente pela IA da Clyro Labs."],
  ["text-xs text-muted-foreground", "Caption", "Atualizado há 2 minutos"],
  ["text-cyan underline underline-offset-4", "Link", "Ver termos do programa de recompensas"],
  ["font-mono text-sm text-cyan", "Code", "0x7a3F…c91E"],
];

function Typography() {
  return (
    <Shell>
      <PageHeader eyebrow="Fundamentos" title="Tipografia">A Orbitron ecoa o letreiro da Clyro e dá o tom futurista; a Inter mantém tudo legível.</PageHeader>
      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {fonts.map(([name, token, weights, use, cls]) => (
          <Card key={name} className="space-y-2">
            <p className={`${cls} text-4xl font-bold`}>Aa</p>
            <p className="font-semibold">{name}</p>
            <Caption>{token} · {weights}</Caption>
            <p className="text-sm text-muted-foreground">{use}</p>
          </Card>
        ))}
      </div>
      <Card padding="lg" className="divide-y">
        {scale.map(([cls, name, sample]) => (
          <div key={name} className="grid gap-2 py-5 md:grid-cols-[12rem_1fr] md:items-baseline">
            <div><p className="text-sm font-medium">{name}</p><Caption className="break-all">{cls}</Caption></div>
            <p className={cls}>{sample}</p>
          </div>
        ))}
        <div className="grid gap-2 py-5 md:grid-cols-[12rem_1fr]">
          <p className="text-sm font-medium">Blockquote / Lista</p>
          <div className="space-y-4">
            <blockquote className="border-l-2 border-magenta pl-4 text-lg italic">"Pela primeira vez, meu público me paga direto e ainda ganha junto."</blockquote>
            <ul className="list-disc space-y-1 pl-5 text-sm marker:text-cyan"><li>Streaming sob demanda</li><li>Compra avulsa de títulos</li><li>Recompensas em várias redes</li></ul>
          </div>
        </div>
      </Card>
    </Shell>
  );
}
