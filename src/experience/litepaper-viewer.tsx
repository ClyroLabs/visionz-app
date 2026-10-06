import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BadgePercent, Brain, ChevronLeft, ChevronRight, Clapperboard, Cloud, Download, Ear, Eye, Flame, Globe, Lightbulb, Music, Rocket, ShieldCheck, ShoppingCart, FileBadge, Tv, Users, Wallet, X, Zap } from "lucide-react";
import { Button, Logo, cn } from "@/index";
import paper from "@/assets/visionz-litepaper.pdf.asset.json";

/** Native, translatable Litepaper reader (10 slides) over the current page. Esc / ✕ closes, ←/→ navigate. */

function Tag({ children }: { children: ReactNode }) {
  return <p className="label-eyebrow text-cyan">{children}</p>;
}
function Title({ a, b }: { a: string; b: string }) {
  return (
    <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-wide sm:text-4xl">
      <span className="text-metallic">{a}</span><br /><span className="text-gradient-brand">{b}</span>
    </h2>
  );
}
function Item({ icon, title, text, tone = "cyan" }: { icon: ReactNode; title: string; text: string; tone?: "cyan" | "brand" }) {
  return (
    <div className="flex gap-3 rounded-xl border bg-surface-raised/60 p-3 sm:p-4">
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5", tone === "cyan" ? "bg-cyan/10 text-cyan" : "bg-magenta/10 text-magenta")}>{icon}</div>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold tracking-wide">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

const SLIDES: ReactNode[] = [
  <div key="1" className="flex h-full flex-col items-center justify-center gap-6 text-center">
    <Logo brand="vizionz-transparent" className="h-auto w-64 max-w-full sm:w-96" />
    <p className="label-eyebrow text-foreground">O entretenimento nunca mais será o mesmo</p>
    <div className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-muted-foreground"><Logo brand="clyro-icon" size="sm" alt="" /><span>Uma divisão Clyro Labs</span></div>
  </div>,
  <div key="2" className="grid gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <Tag>Foco: o problema e a solução</Tag>
      <Title a="A próxima geração" b="do streaming" />
      <p className="text-lg">O streaming atual separa consumo, criação e monetização.</p>
      <p className="text-lg text-muted-foreground">A VisionZ integra essas camadas em uma experiência única, segura e escalável.</p>
    </div>
    <div className="grid gap-3">
      <Item icon={<Tv />} title="Consumo" text="Experiências imersivas e personalizadas para cada usuário." tone="brand" />
      <Item icon={<Clapperboard />} title="Criação" text="Ferramentas e IA para criadores produzirem e distribuírem sem barreiras." />
      <Item icon={<Wallet />} title="Monetização" text="Modelos justos, transparentes e escaláveis com tecnologia blockchain." tone="brand" />
    </div>
  </div>,
  <div key="3" className="grid gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <Tag>Foco: diferencial tecnológico</Tag>
      <Title a="Um ecossistema," b="não apenas um app." />
      <div className="flex items-center gap-3 pt-2"><Logo brand="clyro-icon" size="md" alt="" /><div><p className="label-eyebrow text-muted-foreground">Tecnologia proprietária provida por</p><p className="font-display font-semibold tracking-wide">Clyro Labs · <span className="text-cyan">Tecnologia que conecta.</span></p></div></div>
    </div>
    <div className="grid gap-3">
      <Item icon={<Zap />} title="Baixa latência extrema" text="Experiências em tempo real, sem espera. Conexões instantâneas que engajam." tone="brand" />
      <Item icon={<Brain />} title="IA nativa: recomendação & moderação" text="Inteligência Artificial proprietária para personalizar experiências e manter ambientes seguros." />
      <Item icon={<Globe />} title="Escalabilidade global" text="Infraestrutura distribuída e elástica para crescer sem limites, em qualquer lugar do mundo." tone="brand" />
    </div>
  </div>,
  <div key="4" className="space-y-6">
    <div className="space-y-3 text-center"><Tag>Foco: produção de mídia sintética</Tag><Title a="Redemocratização" b="audiovisual" /></div>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border bg-surface-raised/60 p-4"><Logo brand="clyro-synth" className="h-10 w-auto" /><p className="mt-3 font-display text-sm font-semibold tracking-wide">IA para geração de vídeo e séries</p><p className="mt-1 text-sm text-muted-foreground">Produção completa com IA: roteiro, cena, personagens, efeitos e finalização.</p></div>
      <div className="rounded-xl border bg-surface-raised/60 p-4"><Logo brand="clyro-jukebox" className="h-10 w-auto" /><p className="mt-3 font-display text-sm font-semibold tracking-wide">Streaming e geração de música autoral</p><p className="mt-1 text-sm text-muted-foreground">Criação, distribuição e streaming de músicas originais com IA, royalties inteligentes e imediatos.</p></div>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      <Item icon={<Users />} title="Tecnologia que empodera" text="Criadores, artistas e estúdios independentes em escala global." tone="brand" />
      <Item icon={<Globe />} title="Acesso, criação e distribuição" text="Tudo em uma plataforma integrada, justa e descentralizada." />
      <Item icon={<Rocket />} title="Inovação que transforma" text="IA generativa + blockchain + streaming em um só ecossistema." tone="brand" />
    </div>
  </div>,
  <div key="5" className="grid gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <Tag>Segurança inteligente por design</Tag>
      <Title a="Filtro" b="híbrido" />
      <p className="text-muted-foreground">Três camadas de inteligência trabalhando em sinergia para garantir um ambiente seguro, ético e adequado para toda a família.</p>
      <p className="font-display text-lg tracking-wide">Segurança não é um recurso. <span className="text-cyan">É o nosso compromisso.</span></p>
    </div>
    <div className="grid gap-3">
      <Item icon={<Eye />} title="1 · Análise visual (CNNs)" text="Redes neurais convolucionais identificam cenas, objetos e contextos inapropriados em tempo real." />
      <Item icon={<Ear />} title="2 · Auditagem sonora (NLP)" text="Processamento de linguagem natural analisa diálogos, áudio e tonalidade para detectar riscos e conteúdos sensíveis." />
      <Item icon={<Users />} title="3 · Sinergia humana (Active Learning)" text="Curadoria humana com aprendizado contínuo: o sistema evolui com feedbacks e novas revisões da comunidade." tone="brand" />
    </div>
  </div>,
  <div key="6" className="space-y-6">
    <div className="space-y-3"><Tag>Foco: estratégia go-to-market</Tag><Title a="Tração em" b="três fases" /></div>
    <div className="grid gap-3 md:grid-cols-3">
      <Item icon={<span className="font-display font-bold">1</span>} title="Fase 1 · Regional (Sudeste BR)" text="Consolidação e liderança no Sudeste, construindo comunidade e tração local." tone="brand" />
      <Item icon={<span className="font-display font-bold">2</span>} title="Fase 2 · Nacional & piloto LATAM" text="Expansão para todo o Brasil e projetos piloto na América Latina." tone="brand" />
      <Item icon={<span className="font-display font-bold">3</span>} title="Fase 3 · Escala global" text="Crescimento internacional e posicionamento como referência global." />
    </div>
    <div className="rounded-xl border-gradient-brand p-4 text-center"><p className="font-display font-semibold tracking-wide text-gradient-brand">Crescimento orgânico. Impacto global.</p><p className="label-eyebrow mt-2 text-muted-foreground">Construímos onde somos fortes para escalar sem limites.</p></div>
  </div>,
  <div key="7" className="space-y-6">
    <div className="space-y-3 text-center"><Title a="Quatro motores" b="de receita" /><p className="label-eyebrow text-muted-foreground">Diversificamos fontes. Escalamos valor. Construímos o futuro.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Item icon={<Users />} title="Assinaturas B2C" text="Planos mensais e anuais que dão acesso ilimitado a conteúdos exclusivos, eventos ao vivo e experiências premium." tone="brand" />
      <Item icon={<Cloud />} title="SaaS para criadores" text="Plataforma completa com IA para criação, gestão, distribuição e monetização de conteúdo por assinatura." tone="brand" />
      <Item icon={<FileBadge />} title="Licenciamento B2B" text="Soluções de conteúdo, tecnologia e IA licenciadas para empresas, marcas e plataformas em escala global." />
      <Item icon={<ShoppingCart />} title="Marketplace / revenue share" text="Marketplace de ativos digitais e experiências com modelo de comissão e participação em receita." />
    </div>
    <p className="label-eyebrow text-center text-cyan">Quatro fontes. Um ecossistema. Crescimento sustentável.</p>
  </div>,
  <div key="8" className="grid gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <Tag>Uma rampa regional → global</Tag>
      <Title a="Crescimento exponencial." b="Valor real." />
      <p className="label-eyebrow text-muted-foreground">Projeção financeira (estimativa)</p>
      <div className="rounded-xl border-gradient-brand p-4"><p className="font-display text-sm tracking-wide text-muted-foreground">Breakeven no mês</p><p className="font-display text-5xl font-bold text-gradient-brand">16</p></div>
    </div>
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-surface-raised text-left text-muted-foreground"><tr><th className="p-3">Período</th><th className="p-3">Usuários</th><th className="p-3">Receita projetada</th></tr></thead>
        <tbody className="font-mono">
          {[["Ano 1", "80K", "R$ 3,2M"], ["Ano 2", "500K", "R$ 24,5M"], ["Ano 3", "2.5M+", "R$ 110M"]].map(([p, u, r]) => (
            <tr key={p} className="border-t"><td className="p-3 font-sans text-magenta">{p}</td><td className="p-3">{u}</td><td className="p-3 text-gradient-brand font-semibold">{r}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>,
  <div key="9" className="grid gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <Tag>$VZN: valor que circula</Tag>
      <h2 className="font-display text-4xl font-bold tracking-wide sm:text-5xl"><span className="text-gradient-brand">$VZN</span><br /><span className="text-metallic text-2xl sm:text-3xl">UTILITY TOKEN</span></h2>
      <p className="label-eyebrow text-cyan">Foco: tokenomics na Solana</p>
      <p className="text-sm text-muted-foreground">Utilidade real. Valor real. Futuro descentralizado.</p>
    </div>
    <div className="grid gap-3">
      <Item icon={<BadgePercent />} title="20% de desconto em assinaturas" text="Pague planos com $VZN e economize." tone="brand" />
      <Item icon={<Flame />} title="Economia deflacionária" text="Buyback & burn: parte da receita recompra e queima tokens." tone="brand" />
      <Item icon={<Brain />} title="Queima automática no uso de IA" text="Cada uso das ferramentas de IA queima $VZN." />
    </div>
  </div>,
  <div key="10" className="grid gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <Title a="Construir o futuro" b="do entretenimento." />
      <p className="text-lg text-muted-foreground">O entretenimento nunca mais será o mesmo.</p>
      <Logo brand="vizionz-transparent" className="h-auto w-56" />
      <p className="label-eyebrow text-muted-foreground">Tecnologia. Conteúdo. Comunidade. O futuro é agora.</p>
    </div>
    <div className="grid gap-3">
      <Item icon={<ShieldCheck />} title="Segurança absoluta" text="Infraestrutura blindada com tecnologia blockchain e IA." />
      <Item icon={<Lightbulb />} title="Liberdade criativa" text="Ferramentas inteligentes para criadores irem além." tone="brand" />
      <Item icon={<Music />} title="Ganhos no ecossistema" text="Modelos inovadores que geram valor real e escalável." tone="brand" />
    </div>
  </div>,
];

export function LitepaperViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((n) => Math.min(SLIDES.length - 1, Math.max(0, n + d))), []);
  useEffect(() => {
    if (!open) return;
    setI(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose, go]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Litepaper VisionZ" className="fixed inset-0 z-[100] flex flex-col bg-background/80 p-2 animate-rise sm:p-6 [backdrop-filter:blur(6px)]" onClick={onClose}>
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border-gradient-brand shadow-glow-brand" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="font-display text-sm font-semibold tracking-wide md:text-base">Litepaper <span className="text-gradient-brand">VisionZ</span></p>
          <div className="flex items-center gap-2">
            <a href={paper.url} download="VisionZ-Litepaper-PT.pdf"><Button size="sm" variant="soft"><Download />PDF (PT)</Button></a>
            <Button size="sm" variant="ghost" aria-label="Fechar" onClick={onClose}><X /></Button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto bg-stage-glow">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-light-streaks opacity-40" />
          <div key={i} className="relative mx-auto flex min-h-full max-w-5xl flex-col justify-center p-5 animate-rise sm:p-10">{SLIDES[i]}</div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <Button size="sm" variant="ghost" aria-label="Anterior" disabled={i === 0} onClick={() => go(-1)}><ChevronLeft /></Button>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, n) => (
              <button key={n} type="button" aria-label={`Ir para o item ${n + 1}`} aria-current={n === i} onClick={() => setI(n)}
                className={cn("h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", n === i ? "w-6 bg-gradient-brand" : "w-2 bg-muted hover:bg-magenta/60")} />
            ))}
            <span className="ml-2 font-mono text-xs text-muted-foreground">{i + 1}/{SLIDES.length}</span>
          </div>
          <Button size="sm" variant="ghost" aria-label="Próximo" disabled={i === SLIDES.length - 1} onClick={() => go(1)}><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}
