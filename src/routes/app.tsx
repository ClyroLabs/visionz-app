import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Baby, Clapperboard, Home, Network, PlayCircle, ShieldCheck, Wallet } from "lucide-react";
import { Badge, Logo, MobileNav, Switch, ToastProvider } from "@/index";
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
    <div className="flex min-h-screen overflow-x-clip bg-background responsive-center">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-surface/60 p-4 lg:flex">
        <Link to="/site" className="mb-8 rounded-md bg-white px-2 py-1"><Logo brand="vizionz" size="lg" className="mx-auto -my-4" /></Link>
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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/80 px-4 py-2.5 backdrop-blur lg:hidden">
          <Link to="/site" aria-label="VisionZ — site" className="flex items-center gap-2"><Logo brand="visionz-symbol" alt="" className="h-7 w-auto" /><span className="font-display text-sm font-bold tracking-[0.12em]">VISIONZ</span></Link>
          <span className="ml-auto font-mono text-[0.7rem] text-muted-foreground">{vzn.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} VZN</span>
          <MobileNav layout="grid" label="Abrir menu do protótipo" header={<Logo brand="visionz-symbol" alt="VisionZ" className="h-8 w-auto" />}>
            {nav.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} activeOptions={{ exact: true }} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 p-4 text-sm text-foreground transition-colors hover:border-neon-pink hover:text-neon-pink" activeProps={{ className: "!border-cyan !text-cyan" }}>
                <Icon className="size-6" />{label}
              </Link>
            ))}
            <div className="col-span-full mt-2 flex items-center justify-center gap-3 rounded-xl border border-border bg-surface/60 p-3 text-sm">
              <span>Modo infantil</span><Switch checked={kids} onCheckedChange={setKids} aria-label="Modo infantil" />
            </div>
          </MobileNav>
        </header>
        {kids && <div className="border-b border-success/30 bg-success/10 px-4 py-2 text-xs sm:px-6 sm:text-sm text-success"><Badge variant="success" size="sm">Perfil infantil</Badge> Mostrando só conteúdos Livre e 10 anos.</div>}
        <main className="p-4 sm:p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
