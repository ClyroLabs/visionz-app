import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, AudioLines, Boxes, Coins, Cpu, Eye, Flame, GraduationCap, Layers, Rocket, Server, ShieldCheck, Smartphone, UserCheck, Wand2 } from "lucide-react";
import { Badge, Card, CardDescription, CardTitle, NetworkTag, Reveal, SectionHeading, Stat } from "@/index";
import { Section } from "@/experience/site-parts";
import { BurnSimulator, RevenueChart, TokenomicsDonut, VaultSimulator } from "@/experience/finance-ui";
import { expansionPhases, risks } from "@/experience/data";

export const Route = createFileRoute("/site/whitepaper")({
  head: () => ({
    meta: [
      { title: "Whitepaper — VisionZ Entertainment" },
      { name: "description", content: "Arquitetura, motores de IA, token $VZN na Solana, simulador de queima, expansão DeFi e projeções da VisionZ." },
      { property: "og:title", content: "Whitepaper VisionZ — tecnologia, token e expansão" },
      { property: "og:description", content: "Entenda como a VisionZ une streaming, IA da Clyro Labs e o token $VZN na Solana." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Whitepaper,
});

const toc = [
  ["visao", "Visão geral"], ["arquitetura", "Arquitetura"], ["ia", "Motores de IA"], ["token", "Token $VZN"], ["distribuicao", "Distribuição"],
  ["queima", "Recompra e queima"], ["expansao", "Expansão"], ["receitas", "Receitas"], ["riscos", "Riscos e roadmap"],
] as const;

const layers = [
  { icon: Smartphone, t: "App", d: "Web, Smart TV e celular" },
  { icon: Server, t: "Gateway / CDN", d: "Entrega rápida de vídeo" },
  { icon: Cpu, t: "Clyro Engine", d: "Synth, Jukebox e Filtro" },
  { icon: Boxes, t: "Solana", d: "Contratos e token $VZN" },
];

function Block({ id, eyebrow, title, description, children }: { id: string; eyebrow: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6 border-b py-12 last:border-0 md:py-16">
      <Reveal><SectionHeading eyebrow={eyebrow} title={title} description={description} /></Reveal>
      {children}
    </section>
  );
}

function Whitepaper() {
  return (
    <>
      <Section className="pb-6 text-center md:pb-10">
        <Badge variant="cyan" className="mb-4">Especificação técnica v2.4</Badge>
        <h1 className="text-balance font-display text-3xl font-extrabold tracking-wide md:text-6xl"><span className="text-metallic">Whitepaper</span> <span className="text-gradient-brand">VisionZ</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-foreground/85 md:text-lg">Streaming, criação com IA da Clyro Labs e uma economia própria com o token $VZN na Solana, explicados de forma simples.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2"><NetworkTag network="solana" /><NetworkTag network="base" /><NetworkTag network="arbitrum" /></div>
      </Section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Índice" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1 border-l pl-4 text-sm">
            {toc.map(([id, t], i) => <li key={id}><a href={`#${id}`} className="block py-1 text-muted-foreground hover:text-magenta"><span className="mr-2 font-mono text-xs">{i + 1}.</span>{t}</a></li>)}
          </ol>
        </nav>
        <div className="min-w-0">
          <Block id="visao" eyebrow="1. Visão geral" title="Assistir, criar e ganhar no mesmo lugar">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-2"><CardTitle>O problema</CardTitle><CardDescription>Assistir, criar e ganhar dinheiro com conteúdo acontecem em lugares separados. Intermediários chegam a ficar com até 70% dos direitos e pagam em até 90 dias.</CardDescription></Card>
              <Card variant="featured" className="space-y-2"><CardTitle>A solução VisionZ</CardTitle><CardDescription>Uma só plataforma: recomendação inteligente, criação de filmes e músicas com IA e pagamento rápido ao criador pela Solana.</CardDescription></Card>
            </div>
          </Block>

          <Block id="arquitetura" eyebrow="2. Arquitetura" title="Como as peças se conectam" description="O caminho de cada vídeo, do seu aparelho até a blockchain.">
            <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
              {layers.map(({ icon: Icon, t, d }, i) => (
                <div key={t} className="contents">
                  <Reveal className="flex-1"><Card className="flex flex-col items-center gap-2 text-center"><span className="flex size-11 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground"><Icon className="size-5" /></span><p className="font-semibold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></Card></Reveal>
                  {i < layers.length - 1 && <ArrowDown aria-hidden className="mx-auto size-5 shrink-0 animate-breathe text-cyan md:-rotate-90" />}
                </div>
              ))}
            </div>
          </Block>

          <Block id="ia" eyebrow="3. Motores de IA" title="Três motores da Clyro Labs">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-2"><Wand2 className="size-6 text-cyan" /><CardTitle>Clyro Synth</CardTitle><CardDescription>Cria vídeos e séries a partir de um roteiro.</CardDescription><p className="font-mono text-xs text-muted-foreground">Roteiro → Storyboard → Personagens → Efeitos → Finalização</p></Card>
              <Card className="space-y-2"><AudioLines className="size-6 text-magenta" /><CardTitle>Clyro Jukebox</CardTitle><CardDescription>Cria músicas com ritmo, tom e clima escolhidos. Cada execução paga o artista na hora.</CardDescription></Card>
              <Card className="space-y-2"><ShieldCheck className="size-6 text-cyan" /><CardTitle>Filtro em 3 camadas</CardTitle>
                <ul className="space-y-1 text-sm text-muted-foreground"><li className="flex gap-2"><Eye className="size-4 shrink-0 text-cyan" />Imagem analisada quadro a quadro</li><li className="flex gap-2"><AudioLines className="size-4 shrink-0 text-cyan" />Áudio e falas verificados</li><li className="flex gap-2"><UserCheck className="size-4 shrink-0 text-cyan" />Pessoas revisam e ensinam a IA</li></ul></Card>
            </div>
          </Block>

          <Block id="token" eyebrow="4. Token $VZN" title="O $VZN na Solana" description="A Solana foi escolhida por ser rápida e barata, ideal para pequenos pagamentos durante o streaming.">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat value="1 bi" label="tokens no total" />
              <Stat value="SPL" tone="cyan" label="padrão Token-2022 da Solana" />
              <Stat value="20%" label="de desconto na assinatura paga em $VZN" />
              <Stat value="10%" tone="cyan" label="dos tokens usados em IA são queimados" />
            </div>
            <p className="text-xs text-muted-foreground">Token-2022 é um padrão oficial da Solana para tokens com regras automáticas. O $VZN ainda não foi lançado; os números são do planejamento.</p>
          </Block>

          <Block id="distribuicao" eyebrow="5. Distribuição" title="Para onde vão os tokens" description="Toque numa fatia para ver a quantidade e quando ela é liberada.">
            <Card padding="lg"><TokenomicsDonut /></Card>
          </Block>

          <Block id="queima" eyebrow="6. Recompra e queima" title="Menos tokens circulando com o tempo" description="Parte da receita recompra $VZN e parte dos tokens gastos em IA é destruída. Mexa nos controles e veja o efeito em 36 meses.">
            <BurnSimulator />
          </Block>

          <Block id="expansao" eyebrow="7. Expansão" title="Novos módulos do ecossistema">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-2"><Layers className="size-6 text-magenta" /><CardTitle>DeFi com mercados isolados</CardTitle><CardDescription>Cada cofre tem regras próprias de risco, para um problema não contaminar os outros. Pares parecidos podem usar até 90% de garantia.</CardDescription></Card>
              <Card className="space-y-2"><Rocket className="size-6 text-ember" /><CardTitle>Launchpad para parceiros</CardTitle><CardDescription>Estúdios e projetos usam as ferramentas da Clyro Labs, contratos auditados e a API do Filtro.</CardDescription></Card>
              <Card className="space-y-2"><GraduationCap className="size-6 text-gold" /><CardTitle>Koda: aprenda e ganhe</CardTitle><CardDescription>Quem conclui cursos na Koda recebe $VZN e um certificado digital com descontos no ecossistema.</CardDescription></Card>
              <Card className="space-y-2"><Coins className="size-6 text-cyan" /><CardTitle>Ponte entre redes (deBridge)</CardTitle>
                <div className="overflow-x-auto"><table className="w-full min-w-[300px] text-xs"><thead><tr className="text-left text-muted-foreground"><th className="py-1"></th><th>Pontes comuns</th><th className="text-cyan">deBridge</th></tr></thead><tbody>
                  <tr className="border-t"><td className="py-1">Fundos parados</td><td>Bilhões em custódia</td><td>Nenhum</td></tr>
                  <tr className="border-t"><td className="py-1">Ativo recebido</td><td>Cópia</td><td>Original</td></tr>
                  <tr className="border-t"><td className="py-1">Tempo</td><td>5–15 min</td><td>1–4 s</td></tr>
                </tbody></table></div></Card>
            </div>
            <VaultSimulator />
          </Block>

          <Block id="receitas" eyebrow="8. Receitas e projeções" title="Quatro fontes de receita">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {["Assinaturas", "Ferramentas para criadores", "Licenciamento da IA", "Marketplace"].map((t, i) => <Card key={t} className="text-center"><p className="font-mono text-xs text-muted-foreground">0{i + 1}</p><p className="font-semibold">{t}</p></Card>)}
            </div>
            <Card padding="lg" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Plano base × expandido (R$ milhões)</CardTitle><Badge variant="warning">Estimativa</Badge></div>
              <RevenueChart />
              <div className="grid grid-cols-3 gap-3 text-center"><Stat value="R$ 232 mi" label="receita no ano 3" /><Stat value="42%" tone="cyan" label="margem EBITDA no ano 3" /><Stat value="Mês 11" label="ponto de equilíbrio" /></div>
              <p className="text-xs text-muted-foreground">Projeções do Relatório de Expansão. São metas, não garantia de resultado.</p>
            </Card>
          </Block>

          <Block id="riscos" eyebrow="9. Riscos e roadmap" title="Riscos que levamos a sério">
            <div className="grid gap-3 md:grid-cols-2">
              {risks.map((r) => <Card key={r.t} className="space-y-2"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{r.t}</p><Badge variant={r.level === "Elevado" ? "destructive" : r.level === "Médio" ? "warning" : "success"}>{r.level}</Badge></div><p className="text-sm text-muted-foreground">{r.d}</p></Card>)}
            </div>
            <ol className="grid gap-3 md:grid-cols-4">
              {expansionPhases.map((p) => <li key={p.phase}><Card className="h-full text-center"><p className="font-mono text-xs text-cyan">{p.period}</p><p className="font-display font-semibold tracking-wide">{p.phase}</p><p className="text-sm text-muted-foreground">{p.title}</p></Card></li>)}
            </ol>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Flame className="size-4 text-ember" />Planejamento sujeito a mudanças.</p>
          </Block>
        </div>
      </div>
    </>
  );
}
