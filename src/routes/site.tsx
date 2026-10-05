import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/experience/i18n";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem("vz-intro-seen")) navigate({ to: "/abertura", replace: true });
  }, [navigate]);
  return (
    <ToastProvider>
      <div className="min-h-screen overflow-x-clip bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 px-4 py-2.5 sm:gap-6 sm:px-6 sm:py-3">
            <Link to="/site" aria-label="VisionZ — início" className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Logo brand="visionz-symbol" alt="" className="h-7 w-auto shrink-0 sm:h-8 transition-transform duration-300 drop-shadow-[0_0_10px_var(--magenta)] group-hover:scale-105" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base font-bold sm:text-lg tracking-[0.12em] text-foreground">VISIONZ</span>
                <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] text-muted-foreground">Entertainment</span>
              </span>
            </Link>
            <nav className="hidden min-w-0 flex-1 gap-0.5 md:flex lg:gap-1" aria-label="Site">
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-300 lg:px-3 hover:bg-magenta/10 hover:text-magenta" activeProps={{ className: "!text-magenta" }}>{l.label}</Link>
              ))}
            </nav>
            <LanguageSwitcher className="ml-auto hidden md:inline-flex" />
            <Link to="/app" className="ml-auto shrink-0 md:ml-0"><Button size="sm"><span className="lg:hidden">Protótipo</span><span className="hidden lg:inline">Abrir protótipo</span></Button></Link>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="vz-mobile-menu" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-foreground transition-colors hover:border-magenta/60 hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
          {open && (
            <nav id="vz-mobile-menu" className="absolute right-4 top-full mt-2 flex w-48 flex-col gap-1 rounded-lg border border-magenta/30 bg-surface/95 p-2 shadow-glow-brand backdrop-blur-md animate-rise md:hidden" aria-label="Site">
              <LanguageSwitcher className="mb-1 self-center" />
              {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-magenta/10 hover:text-magenta" activeProps={{ className: "!text-magenta bg-magenta/10" }}>{l.label}</Link>)}
            </nav>
          )}
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
