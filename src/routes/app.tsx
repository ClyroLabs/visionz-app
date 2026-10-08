import { useEffect, useState, type ComponentType } from "react";
import { LanguageSwitcher } from "@/experience/i18n";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Menu, X, Baby, Clapperboard, Home, Network, PlayCircle, ShieldCheck, UserRound, Wallet, Sparkles, Music2, LayoutGrid, ArrowLeft, PieChart as PieChartIcon, Landmark, Vault, Radar, Rocket, GraduationCap, ArrowLeftRight, PanelLeftClose, PanelLeftOpen, Upload } from "lucide-react";
import { Badge, Logo, Switch, ToastProvider, cn } from "@/index";
import { ExperienceProvider, useExperience } from "@/experience/store";
import { FaceGateHost } from "@/experience/parental-ui";
import { ClientOnly } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({ component: AppLayout });

const nav = [
  { to: "/app", label: "Início", icon: Home },
  { to: "/app/assistir", label: "Assistir", icon: PlayCircle },
  { to: "/app/perfis", label: "Perfis", icon: Baby },
  { to: "/app/estudio", label: "Estúdio", icon: Clapperboard },
  { to: "/app/publicar", label: "Publicar vídeo", icon: Upload },
  { to: "/app/synth", label: "Clyro Synth", icon: Sparkles },
  { to: "/app/jukebox", label: "Clyro Jukebox", icon: Music2 },
  { to: "/app/vitrine", label: "Vitrine", icon: LayoutGrid },
  { to: "/app/carteira", label: "Carteira", icon: Wallet },
  { to: "/app/financas", label: "Finanças", icon: PieChartIcon },
  { to: "/app/moderacao", label: "Moderação", icon: ShieldCheck },
  { to: "/app/ecossistema", label: "Ecossistema", icon: Network },
  { to: "/app/conta", label: "Minha conta", icon: UserRound },
] as const;

const defiNav = [
  { to: "/app/credito", label: "Crédito", icon: Landmark },
  { to: "/app/cofres", label: "Cofres", icon: Vault },
  { to: "/app/radar", label: "Radar IA", icon: Radar },
  { to: "/app/launchpad", label: "Launchpad", icon: Rocket },
  { to: "/app/koda", label: "Koda", icon: GraduationCap },
  { to: "/app/ponte", label: "Ponte", icon: ArrowLeftRight },
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
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { setCollapsed(localStorage.getItem("vz-sidebar") === "1"); }, []);
  const toggle = () => setCollapsed((c) => { localStorage.setItem("vz-sidebar", c ? "0" : "1"); return !c; });
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); toggle(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-surface/60 py-4 transition-[width] duration-300 md:flex", collapsed ? "w-16 px-2" : "w-60 px-4")}>
        <div className={cn("mb-6 flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
          <Link to="/site" aria-label="VisionZ — início" className="group flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logo brand="visionz-symbol" alt="" className="h-8 w-auto shrink-0 drop-shadow-[0_0_10px_var(--magenta)] transition-transform duration-300 group-hover:scale-105" />
            {!collapsed && <span className="flex flex-col leading-none"><span className="font-display text-lg font-bold tracking-[0.12em] text-foreground">VISIONZ</span><span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-muted-foreground">Entertainment</span></span>}
          </Link>
          <button type="button" onClick={toggle} aria-label={collapsed ? "Expandir menu" : "Recolher menu"} aria-expanded={!collapsed} title="Ctrl/⌘ + B"
            className="grid size-8 shrink-0 place-items-center rounded-md border text-muted-foreground transition-colors hover:border-cyan/60 hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden" aria-label="Plataforma">
          {nav.map((n) => <SideLink key={n.to} {...n} collapsed={collapsed} />)}
          {collapsed ? <div className="mx-auto my-3 h-px w-8 bg-border" /> : <p className="mt-4 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Ecossistema DeFi</p>}
          {defiNav.map((n) => <SideLink key={n.to} {...n} collapsed={collapsed} />)}
        </nav>
        {collapsed ? (
          <div className="mt-3 flex flex-col items-center gap-3 border-t pt-3">
            <button type="button" onClick={() => setKids(!kids)} aria-pressed={kids} aria-label="Modo infantil" title="Modo infantil" className={cn("grid size-9 place-items-center rounded-md border transition-colors", kids ? "border-success/60 bg-success/10 text-success" : "text-muted-foreground hover:text-foreground")}><Baby className="size-4" /></button>
            <span title={`${vzn.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} VZN`} className="font-mono text-[10px] text-muted-foreground">{Math.round(vzn)}</span>
            <Link to="/site" aria-label="Voltar ao site" title="Voltar ao site" className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-magenta/10 hover:text-magenta"><ArrowLeft className="size-4" /></Link>
          </div>
        ) : (
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between gap-2 rounded-md bg-background/60 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-medium">Modo infantil</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{vzn.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} VZN</p>
              </div>
              <Switch checked={kids} onCheckedChange={setKids} aria-label="Modo infantil" className="shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Link to="/site" className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta"><ArrowLeft className="size-3.5 shrink-0" /><span className="truncate">Voltar ao site</span></Link>
              <LanguageSwitcher className="shrink-0 scale-90 origin-right" />
            </div>
          </div>
        )}
      </aside>
      <div className="min-w-0 flex-1 overflow-x-clip">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur md:hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2">
            <Link to="/site" aria-label="VisionZ — início" className="min-w-0" onClick={() => setOpen(false)}><Logo brand="visionz-symbol" alt="" className="h-8 w-auto" /></Link>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="vz-app-menu" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-foreground transition-colors hover:border-magenta/60 hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
          {open && (
            <nav id="vz-app-menu" aria-label="Plataforma" className="absolute inset-x-3 top-full mt-2 grid max-h-[80dvh] overflow-y-auto gap-1 rounded-xl border border-border bg-surface/95 p-2 shadow-panel backdrop-blur animate-rise">
              <LanguageSwitcher className="mb-1 justify-self-center" />
              {nav.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} activeOptions={{ exact: true }} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta" activeProps={{ className: "!text-magenta bg-magenta/10" }}><Icon className="h-4 w-4 shrink-0" />{label}</Link>
              ))}
              <p className="mt-2 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Ecossistema DeFi</p>
              {defiNav.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} activeOptions={{ exact: true }} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta" activeProps={{ className: "!text-magenta bg-magenta/10" }}><Icon className="h-4 w-4 shrink-0" />{label}</Link>
              ))}
              <div className="mt-1 border-t border-border pt-1"><Link to="/site" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta"><ArrowLeft className="size-4 shrink-0" />Voltar ao site</Link></div>
            </nav>
          )}
        </header>
        {kids && <div className="border-b border-success/30 bg-success/10 px-6 py-2 text-sm text-success"><Badge variant="success" size="sm">Perfil infantil</Badge> Mostrando só conteúdos Livre e 10 anos.</div>}
        <main className="p-6 md:p-10"><Outlet /></main>
        <ClientOnly><FaceGateHost /></ClientOnly>
      </div>
    </div>
  );
}

function SideLink({ to, label, icon: Icon, collapsed }: { to: string; label: string; icon: ComponentType<{ className?: string }>; collapsed: boolean }) {
  return (
    <Link to={to} activeOptions={{ exact: true }} aria-label={collapsed ? label : undefined} title={collapsed ? label : undefined}
      className={cn("group relative flex items-center rounded-md py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground", collapsed ? "justify-center px-0" : "gap-3 px-3")}
      activeProps={{ className: "bg-surface-raised !text-cyan shadow-glow-cyan" }}>
      <Icon className="size-4 shrink-0" />{!collapsed && label}
    </Link>
  );
}
