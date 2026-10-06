import { useState } from "react";
import { LanguageSwitcher } from "@/experience/i18n";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Menu, X, Baby, Clapperboard, Home, Network, PlayCircle, ShieldCheck, UserRound, Wallet, Sparkles, Music2, LayoutGrid, ArrowLeft, PieChart as PieChartIcon } from "lucide-react";
import { Badge, Logo, Switch, ToastProvider } from "@/index";
import { ExperienceProvider, useExperience } from "@/experience/store";

export const Route = createFileRoute("/app")({ component: AppLayout });

const nav = [
  { to: "/app", label: "Início", icon: Home },
  { to: "/app/assistir", label: "Assistir", icon: PlayCircle },
  { to: "/app/perfis", label: "Perfis", icon: Baby },
  { to: "/app/estudio", label: "Estúdio", icon: Clapperboard },
  { to: "/app/synth", label: "Clyro Synth", icon: Sparkles },
  { to: "/app/jukebox", label: "Clyro Jukebox", icon: Music2 },
  { to: "/app/vitrine", label: "Vitrine", icon: LayoutGrid },
  { to: "/app/carteira", label: "Carteira", icon: Wallet },
  { to: "/app/financas", label: "Finanças", icon: PieChartIcon },
  { to: "/app/moderacao", label: "Moderação", icon: ShieldCheck },
  { to: "/app/ecossistema", label: "Ecossistema", icon: Network },
  { to: "/app/conta", label: "Minha conta", icon: UserRound },
] as const;

function AppLayout() {
  return (
    <ToastProvider>
      <ExperienceProvider>
        <Frame />
      </ExperienceProvider>
    </ToastProvider>
  );
}

function Frame() {
  const { kids, setKids, vzn } = useExperience();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-surface/60 p-4 md:flex">
        <Link to="/site" aria-label="VisionZ — início" className="group mb-8 flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo brand="visionz-symbol" alt="" className="h-8 w-auto shrink-0 drop-shadow-[0_0_10px_var(--magenta)] transition-transform duration-300 group-hover:scale-105" />
          <span className="flex flex-col leading-none"><span className="font-display text-lg font-bold tracking-[0.12em] text-foreground">VISIONZ</span><span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-muted-foreground">Entertainment</span></span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Plataforma">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-surface-raised !text-cyan shadow-glow-cyan" }}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 rounded-lg border bg-background/60 p-3">
          <div className="flex items-center justify-between text-sm"><span>Modo infantil</span><Switch checked={kids} onCheckedChange={setKids} aria-label="Modo infantil" /></div>
          <p className="font-mono text-xs text-muted-foreground">{vzn.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} VZN</p>
        </div>
        <div className="mt-3"><Link to="/site" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta"><ArrowLeft className="size-4 shrink-0" />Voltar ao site</Link></div>
        <LanguageSwitcher className="mx-auto mt-3" />
        <p className="mt-3 text-center text-[10px] text-muted-foreground">Protótipo · dados de exemplo</p>
      </aside>
      <div className="min-w-0 flex-1 overflow-x-clip">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur md:hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2">
            <Link to="/site" aria-label="VisionZ — início" className="min-w-0" onClick={() => setOpen(false)}><Logo brand="visionz-symbol" alt="" className="h-8 w-auto" /></Link>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="vz-app-menu" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-foreground transition-colors hover:border-magenta/60 hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
          {open && (
            <nav id="vz-app-menu" aria-label="Plataforma" className="absolute inset-x-3 top-full mt-2 grid gap-1 rounded-xl border border-border bg-surface/95 p-2 shadow-panel backdrop-blur animate-rise">
              <LanguageSwitcher className="mb-1 justify-self-center" />
              {nav.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} activeOptions={{ exact: true }} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta" activeProps={{ className: "!text-magenta bg-magenta/10" }}><Icon className="h-4 w-4 shrink-0" />{label}</Link>
              ))}
              <div className="mt-1 border-t border-border pt-1"><Link to="/site" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta"><ArrowLeft className="size-4 shrink-0" />Voltar ao site</Link></div>
            </nav>
          )}
        </header>
        {kids && <div className="border-b border-success/30 bg-success/10 px-6 py-2 text-sm text-success"><Badge variant="success" size="sm">Perfil infantil</Badge> Mostrando só conteúdos Livre e 10 anos.</div>}
        <main className="p-6 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
