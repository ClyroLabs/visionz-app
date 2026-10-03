import { createFileRoute } from "@tanstack/react-router";
import { Film, LogOut, MoreHorizontal, Settings, Share2, Star, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Caption, Code, PageHeader, Shell } from "@/showcase/shell";
import {
  AIVerifiedBadge, AgeRating, Avatar, Badge, Button, Card, CardDescription, CardTitle, Checkbox, ContentCard, Dialog, EarningsCard,
  Input, KidsModeToggle, Label, Menu, NetworkTag, PlayerBar, Progress, Select, Skeleton, Switch, Tabs, TabsContent, TabsList,
  TabsTrigger, Tooltip, WalletBalance, useToast, type Network,
} from "@/index";

export const Route = createFileRoute("/componentes")({
  head: () => ({
    meta: [
      { title: "Componentes — VisionZ Design System" },
      { name: "description", content: "Galeria interativa de todos os componentes da VisionZ, com variantes, estados e código." },
      { property: "og:title", content: "Componentes — VisionZ Design System" },
      { property: "og:description", content: "Galeria interativa de todos os componentes da VisionZ, com variantes, estados e código." },
    ],
  }),
  component: Components,
});

function Section({ id, title, children, code }: { id: string; title: string; children: ReactNode; code: string }) {
  return (
    <section id={id} className="scroll-mt-24 border-b pb-12">
      <h2 className="mb-6 font-display text-xl font-semibold tracking-wide">{title}</h2>
      {children}
      <Code code={code} />
    </section>
  );
}
function Spec({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex flex-col items-start gap-2"><Caption>{label}</Caption>{children}</div>;
}

const sections = [
  "Button", "Input", "Select", "Switch", "Checkbox", "Badge", "Avatar", "Card", "Tabs", "Dialog", "Menu", "Tooltip", "Toast",
  "Progress", "Skeleton", "Logo", "ContentCard", "AgeRating", "AIVerifiedBadge", "KidsModeToggle", "WalletBalance", "EarningsCard",
  "NetworkTag", "PlayerBar", "Exemplo: Login",
];

function Components() {
  const [q, setQ] = useState("");
  return (
    <Shell>
      <PageHeader eyebrow="Biblioteca" title="Componentes">Tudo que a plataforma VisionZ precisa — do botão ao player e à carteira multichain.</PageHeader>
      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <Input size="sm" placeholder="Buscar componente…" aria-label="Buscar componente" value={q} onChange={(e) => setQ(e.target.value)} />
          <nav className="mt-3 flex flex-wrap gap-1 lg:flex-col" aria-label="Componentes">
            {sections.filter((s) => s.toLowerCase().includes(q.toLowerCase())).map((s) => (
              <a key={s} href={`#${slug(s)}`} className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-surface hover:text-cyan">{s}</a>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 space-y-12"><Gallery /></div>
      </div>
    </Shell>
  );
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

function Gallery() {
  const [sw, setSw] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [kids, setKids] = useState(true);
  const [net, setNet] = useState<Network>("polygon");
  const [playing, setPlaying] = useState(false);
  const toast = useToast();

  return (
    <>
      <Section id="button" title="Button" code={`<Button>Assistir agora</Button>\n<Button variant="neon">Conectar carteira</Button>\n<Button size="icon" variant="ghost" aria-label="Compartilhar"><Share2 /></Button>`}>
        <div className="flex flex-wrap gap-6">
          {(["primary", "neon", "secondary", "ghost", "destructive"] as const).map((v) => (
            <Spec key={v} label={v}><Button variant={v}>Assistir agora</Button></Spec>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <Spec label="sm / md / lg"><div className="flex items-center gap-2"><Button size="sm">Seguir</Button><Button>Seguir</Button><Button size="lg">Seguir</Button></div></Spec>
          <Spec label="icon"><Button size="icon" variant="ghost" aria-label="Compartilhar"><Share2 /></Button></Spec>
          <Spec label="loading"><Button loading>Processando</Button></Spec>
          <Spec label="disabled"><Button disabled>Indisponível</Button></Spec>
          <Spec label="focus-visible (Tab)"><Button variant="neon" className="ring-2 ring-ring ring-offset-2 ring-offset-background">Em foco</Button></Spec>
        </div>
      </Section>

      <Section id="input" title="Input" code={`<Label htmlFor="email">E-mail</Label>\n<Input id="email" placeholder="voce@exemplo.com" />`}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Spec label="default"><Input placeholder="Buscar filmes, séries, criadores" /></Spec>
          <Spec label="error"><Input aria-invalid="true" defaultValue="carteira-invalida" /></Spec>
          <Spec label="disabled"><Input disabled placeholder="Bloqueado" /></Spec>
          <Spec label="sm / lg"><div className="flex w-full flex-col gap-2"><Input size="sm" placeholder="Pequeno" /><Input size="lg" placeholder="Grande" /></div></Spec>
        </div>
      </Section>

      <Section id="select" title="Select" code={`<Select aria-label="Qualidade"><option>4K</option></Select>`}>
        <div className="grid max-w-md gap-4"><Select aria-label="Qualidade" defaultValue="4K"><option>4K</option><option>1080p</option><option>720p</option></Select><Select disabled aria-label="Idioma"><option>Português</option></Select></div>
      </Section>

      <Section id="switch" title="Switch" code={`<Switch checked={on} onCheckedChange={setOn} aria-label="Legendas" />`}>
        <div className="flex gap-8"><Spec label="on / off"><Switch checked={sw} onCheckedChange={setSw} aria-label="Legendas" /></Spec><Spec label="disabled"><Switch checked={false} onCheckedChange={() => {}} disabled aria-label="Indisponível" /></Spec></div>
      </Section>

      <Section id="checkbox" title="Checkbox" code={`<Checkbox id="t" /> <Label htmlFor="t">Aceito os termos</Label>`}>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Notificar lançamentos</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox /> Reprodução automática</label>
          <label className="flex items-center gap-2 text-sm opacity-70"><Checkbox disabled /> Desativado</label>
        </div>
      </Section>

      <Section id="badge" title="Badge" code={`<Badge variant="brand">Exclusivo</Badge>`}>
        <div className="flex flex-wrap gap-2">
          <Badge variant="brand">Exclusivo</Badge><Badge variant="cyan">Ao vivo</Badge><Badge>Documentário</Badge>
          <Badge variant="success">Pago</Badge><Badge variant="warning">Pendente</Badge><Badge variant="destructive">Expirado</Badge>
        </div>
      </Section>

      <Section id="avatar" title="Avatar" code={`<Avatar name="Luana Costa" ring="brand" />`}>
        <div className="flex items-center gap-4"><Avatar name="Luana Costa" size="sm" /><Avatar name="Rafael Mendes" ring="brand" /><Avatar name="Clyro Bot" size="lg" ring="cyan" /></div>
      </Section>

      <Section id="card" title="Card" code={`<Card variant="glass"><CardTitle>…</CardTitle></Card>`}>
        <div className="grid gap-4 md:grid-cols-3">
          {(["default", "glass", "glow"] as const).map((v) => (
            <Card key={v} variant={v}><CardTitle>Plano Criador</CardTitle><CardDescription className="mt-1">Publique sem limites e receba 85% de cada venda.</CardDescription><Caption className="mt-3">variant="{v}"</Caption></Card>
          ))}
        </div>
      </Section>

      <Section id="tabs" title="Tabs" code={`<Tabs defaultValue="filmes"><TabsList><TabsTrigger value="filmes">Filmes</TabsTrigger></TabsList><TabsContent value="filmes">…</TabsContent></Tabs>`}>
        <Tabs defaultValue="filmes">
          <TabsList><TabsTrigger value="filmes">Filmes</TabsTrigger><TabsTrigger value="series">Séries</TabsTrigger><TabsTrigger value="aovivo">Ao vivo</TabsTrigger></TabsList>
          <TabsContent value="filmes" className="text-sm text-muted-foreground">128 filmes disponíveis no seu plano.</TabsContent>
          <TabsContent value="series" className="text-sm text-muted-foreground">42 séries com novos episódios esta semana.</TabsContent>
          <TabsContent value="aovivo" className="text-sm text-muted-foreground">3 transmissões acontecendo agora.</TabsContent>
        </Tabs>
      </Section>

      <Section id="dialog" title="Dialog" code={`<Dialog open={open} onOpenChange={setOpen} title="Comprar título">…</Dialog>`}>
        <Button onClick={() => setDialog(true)}>Comprar "Rios de Neon"</Button>
        <Dialog open={dialog} onOpenChange={setDialog} title="Comprar título" description="Acesso vitalício a “Rios de Neon” por R$ 9,90.">
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setDialog(false)}>Cancelar</Button><Button onClick={() => { setDialog(false); toast({ title: "Compra confirmada", description: "Você ganhou 12 VZN de recompensa.", variant: "reward" }); }}>Confirmar</Button></div>
        </Dialog>
      </Section>

      <Section id="menu" title="Menu" code={`<Menu trigger={(p) => <Button {...p}>…</Button>} items={[...]} />`}>
        <Menu
          trigger={(p) => <Button variant="secondary" size="icon" aria-label="Mais opções" {...p}><MoreHorizontal /></Button>}
          items={[
            { label: "Adicionar à lista", icon: <Star />, onSelect: () => toast({ title: "Adicionado à sua lista" }) },
            { label: "Compartilhar", icon: <Share2 />, onSelect: () => {} },
            { label: "Configurações", icon: <Settings />, onSelect: () => {} },
            { label: "Sair", icon: <LogOut />, onSelect: () => {}, destructive: true },
          ]}
        />
      </Section>

      <Section id="tooltip" title="Tooltip" code={`<Tooltip content="Enviar vídeo"><Button size="icon" aria-label="Enviar vídeo"><Upload /></Button></Tooltip>`}>
        <Tooltip content="Enviar vídeo"><Button size="icon" variant="neon" aria-label="Enviar vídeo"><Upload /></Button></Tooltip>
      </Section>

      <Section id="toast" title="Toast" code={`const toast = useToast();\ntoast({ title: "Recompensa recebida", variant: "reward" });`}>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast({ title: "Download iniciado", description: "Episódio 4 · 1,2 GB" })}>Info</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Vídeo publicado", variant: "success" })}>Sucesso</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Falha na transação", description: "Saldo de gás insuficiente.", variant: "error" })}>Erro</Button>
          <Button onClick={() => toast({ title: "+25 VZN", description: "Recompensa por 10 horas assistidas.", variant: "reward" })}>Recompensa</Button>
        </div>
      </Section>

      <Section id="progress" title="Progress" code={`<Progress value={64} label="Envio" />`}>
        <div className="max-w-md space-y-4"><Progress value={64} label="Envio" /><Progress value={30} variant="cyan" label="Análise da IA" /><Progress value={100} variant="success" label="Concluído" /></div>
      </Section>

      <Section id="skeleton" title="Skeleton" code={`<Skeleton className="h-40 w-full" />`}>
        <div className="flex max-w-md gap-3"><Skeleton className="aspect-video w-40" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>
      </Section>

      <Section id="logo" title="Logo" code={`<Logo brand="vizionz" size="md" />`}>
        <p className="text-sm text-muted-foreground">Veja todas as variações na página Marca.</p>
      </Section>

      <Section id="contentcard" title="ContentCard" code={`<ContentCard title="Rios de Neon" creator="Luana Costa" duration="1h 42m" rating="12" price="R$ 9,90" />`}>
        <div className="flex flex-wrap gap-4">
          <ContentCard title="Rios de Neon" creator="Luana Costa" duration="1h 42m" rating="12" price="R$ 9,90" cover={<Cover />} />
          <ContentCard title="Pequenos Exploradores" creator="Estúdio Aurora" duration="24m" rating="L" cover={<Cover />} />
          <ContentCard orientation="portrait" title="Código Zero" creator="Rafael Mendes" duration="8 ep." rating="16" price="R$ 19,90" cover={<Cover />} />
        </div>
      </Section>

      <Section id="agerating" title="AgeRating" code={`<AgeRating rating="14" />`}>
        <div className="flex gap-2">{(["L", "10", "12", "14", "16", "18"] as const).map((r) => <AgeRating key={r} rating={r} />)}</div>
      </Section>

      <Section id="aiverifiedbadge" title="AIVerifiedBadge" code={`<AIVerifiedBadge status="reviewing" />`}>
        <div className="flex flex-wrap gap-2"><AIVerifiedBadge /><AIVerifiedBadge status="reviewing" /><AIVerifiedBadge status="blocked" /></div>
      </Section>

      <Section id="kidsmodetoggle" title="KidsModeToggle" code={`<KidsModeToggle enabled={on} onEnabledChange={setOn} />`}>
        <div className="max-w-md"><KidsModeToggle enabled={kids} onEnabledChange={setKids} /></div>
      </Section>

      <Section id="walletbalance" title="WalletBalance" code={`<WalletBalance balance="1.284,50" token="VZN" fiat="R$ 642,25" network={n} onNetworkChange={setN} />`}>
        <div className="max-w-sm"><WalletBalance balance="1.284,50" token="VZN" fiat="R$ 642,25" network={net} onNetworkChange={setNet} /></div>
      </Section>

      <Section id="earningscard" title="EarningsCard" code={`<EarningsCard label="Ganhos do mês" value="R$ 3.420" change="+18%" />`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <EarningsCard label="Ganhos do mês" value="R$ 3.420" change="+18%" />
          <EarningsCard label="Visualizações" value="84,2 mil" change="+9%" points={[3, 4, 6, 5, 7, 9, 8]} />
          <EarningsCard label="Vendas avulsas" value="312" change="-4%" trend="down" points={[9, 8, 8, 7, 6, 7, 6]} />
        </div>
      </Section>

      <Section id="networktag" title="NetworkTag" code={`<NetworkTag network="solana" />`}>
        <div className="flex flex-wrap gap-2">{(["polygon", "ethereum", "solana", "bnb", "base"] as const).map((n) => <NetworkTag key={n} network={n} />)}</div>
      </Section>

      <Section id="playerbar" title="PlayerBar" code={`<PlayerBar playing={p} onPlayingChange={setP} progress={38} current="38:12" total="1:42:00" />`}>
        <div className="relative max-w-2xl overflow-hidden rounded-xl bg-gradient-tech">
          <div className="flex aspect-video items-center justify-center"><Film className="size-12 text-cyan-foreground/60" /></div>
          <PlayerBar className="absolute inset-x-3 bottom-3" playing={playing} onPlayingChange={setPlaying} progress={38} current="38:12" total="1:42:00" />
        </div>
      </Section>

      <Section id="exemplo-login" title="Exemplo: Login" code={`<Card variant="glass">…<Input/><Button/>…</Card>`}>
        <Card variant="glass" padding="lg" className="max-w-sm space-y-4">
          <div><CardTitle className="text-xl">Entrar na VisionZ</CardTitle><CardDescription>Assista, crie e ganhe.</CardDescription></div>
          <div className="space-y-1.5"><Label htmlFor="em">E-mail</Label><Input id="em" type="email" placeholder="voce@exemplo.com" /></div>
          <div className="space-y-1.5"><Label htmlFor="pw">Senha</Label><Input id="pw" type="password" placeholder="••••••••" /></div>
          <Button className="w-full">Entrar</Button>
          <Button variant="neon" className="w-full">Conectar carteira</Button>
        </Card>
      </Section>
    </>
  );
}

function Cover() {
  return <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-transparent to-ember/40" />;
}
