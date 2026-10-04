import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Baby, Clapperboard, Home, Network, PlayCircle, ShieldCheck, Wallet } from "lucide-react";
import { Badge, Logo, Switch, ToastProvider } from "@/index";
import { ExperienceProvider, useExperience } from "@/experience/store";

export const Route = createFileRoute("/app")({ component: AppLayout });

const nav = [
  { to: "/app", label: "Início", icon: Home },
  { to: "/app/assistir", label: "Assistir", icon: PlayCircle },
  { to: "/app/perfis", label: "Perfis", icon: Baby },
  { to: "/app/estudio", label: "Estúdio", icon: Clapperboard },
  { to: "/app/carteira", label: "Carteira", icon: Wallet },
  { to: "/app/moderacao", label: "Moderação", icon: ShieldCheck },
  { to: "/app/ecossistema", label: "Ecossistema", icon: Network },
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
        <p className="mt-4 text-center text-[10px] text-muted-foreground">Protótipo · dados de exemplo</p>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b bg-background/80 px-4 py-2 backdrop-blur md:hidden">
          {nav.map(({ to, label }) => <Link key={to} to={to} activeOptions={{ exact: true }} className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground" activeProps={{ className: "!text-cyan" }}>{label}</Link>)}
        </header>
        {kids && <div className="border-b border-success/30 bg-success/10 px-6 py-2 text-sm text-success"><Badge variant="success" size="sm">Perfil infantil</Badge> Mostrando só conteúdos Livre e 10 anos.</div>}
        <main className="p-6 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
