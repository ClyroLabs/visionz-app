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
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-6 sm:px-6 sm:py-3">
            <Link to="/site" aria-label="VisionZ — início" className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Logo brand="visionz-symbol" alt="" className="h-7 w-auto shrink-0 sm:h-8 transition-transform duration-300 drop-shadow-[0_0_10px_var(--magenta)] group-hover:scale-105" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base font-bold sm:text-lg tracking-[0.12em] text-foreground">VISIONZ</span>
                <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-muted-foreground">Entertainment</span>
              </span>
            </Link>
            <nav className="hidden flex-1 gap-1 md:flex" aria-label="Site">
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>
              ))}
            </nav>
            <Link to="/app" className="ml-auto shrink-0"><Button size="sm"><span className="sm:hidden">Protótipo</span><span className="hidden sm:inline">Abrir protótipo</span></Button></Link>
          </div>
          <nav className="flex justify-center gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:hidden" aria-label="Site">
            {links.map((l) => <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="shrink-0 rounded-md px-3 py-1 text-xs text-muted-foreground" activeProps={{ className: "!text-cyan bg-cyan/10" }}>{l.label}</Link>)}
          </nav>
        </header>
        <Outlet />
        <footer className="border-t bg-surface/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-center md:flex-row md:py-10 md:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3"><Logo brand="clyro-icon" size="sm" alt="" /><p className="text-sm text-muted-foreground">VisionZ Entertainment &amp; Clyro Labs</p></div>
            <p className="text-xs text-muted-foreground">Streaming Ético, Criativo e Lucrativo · Brasil para o mundo</p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
