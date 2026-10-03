import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button, Logo, ToastProvider , MobileNav } from "@/index";

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
      <div className="min-h-screen overflow-x-clip bg-background responsive-center">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6">
            <BrandLink />
            <nav className="hidden flex-1 gap-1 lg:flex" aria-label="Site">
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-neon-pink hover:[text-shadow:0_0_12px_var(--neon-pink)]" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>
              ))}
            </nav>
            <Link to="/app" className="ml-auto hidden sm:block"><Button size="sm">Abrir protótipo</Button></Link>
            <MobileNav className="ml-auto sm:ml-0" header={<BrandLink />}>
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-lg px-4 py-3 text-center font-display text-lg tracking-wide text-foreground transition-colors hover:text-neon-pink" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>
              ))}
              <div className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-3">
                <Link to="/app"><Button className="w-full">Abrir protótipo</Button></Link>
                <Link to="/site/investidores"><Button variant="neon" className="w-full">Sou investidor</Button></Link>
              </div>
            </MobileNav>
          </div>
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

function BrandLink() {
  return (
    <Link to="/site" aria-label="VisionZ — início" className="group flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-2.5">
      <Logo brand="visionz-symbol" alt="" className="h-7 w-auto transition-transform duration-300 drop-shadow-[0_0_10px_var(--magenta)] group-hover:scale-105 sm:h-8" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-[0.12em] text-foreground sm:text-lg">VISIONZ</span>
        <span className="mt-1 text-[0.5rem] font-medium uppercase tracking-[0.36em] text-muted-foreground sm:text-[0.55rem] sm:tracking-[0.42em]">Entertainment</span>
      </span>
    </Link>
  );
}
