import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button, Logo, ToastProvider } from "@/index";

export const Route = createFileRoute("/site")({ component: SiteLayout });

const links = [
  { to: "/site", label: "Início" },
  { to: "/site/criadores", label: "Criadores" },
  { to: "/site/seguranca", label: "Segurança" },
  { to: "/site/investidores", label: "Investidores" },
] as const;

function SiteLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!sessionStorage.getItem("vz-intro-seen")) navigate({ to: "/abertura", replace: true });
  }, [navigate]);
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
            <Link to="/site" aria-label="VisionZ — início" className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Logo brand="visionz-symbol" alt="" className="h-8 w-auto transition-transform duration-300 drop-shadow-[0_0_10px_var(--magenta)] group-hover:scale-105" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold tracking-[0.12em] text-foreground">VISIONZ</span>
                <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-muted-foreground">Entertainment</span>
              </span>
            </Link>
            <nav className="hidden flex-1 gap-1 md:flex" aria-label="Site">
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-neon-pink hover:[text-shadow:0_0_12px_var(--neon-pink)]" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>
              ))}
            </nav>
            <Link to="/app" className="ml-auto"><Button size="sm">Abrir protótipo</Button></Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Site">
            {links.map((l) => <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="shrink-0 rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-neon-pink" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>)}
          </nav>
        </header>
        <Outlet />
        <footer className="border-t bg-surface/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
            <div className="flex items-center gap-3"><Logo brand="clyro-icon" size="sm" alt="" /><p className="text-sm text-muted-foreground">VisionZ Entertainment &amp; Clyro Labs</p></div>
            <p className="text-xs text-muted-foreground">Streaming Ético, Criativo e Lucrativo · Brasil para o mundo</p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
