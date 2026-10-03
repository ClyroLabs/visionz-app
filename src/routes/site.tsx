import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button, Logo, ToastProvider } from "@/index";

export const Route = createFileRoute("/site")({ component: SiteLayout });

const links = [
  { to: "/site", label: "Início" },
  { to: "/site/criadores", label: "Criadores" },
  { to: "/site/seguranca", label: "Segurança" },
  { to: "/site/investidores", label: "Investidores" },
] as const;

function SiteLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
            <Link to="/site" className="flex items-center gap-2 rounded-md bg-white px-2 py-1"><Logo brand="vizionz" size="md" className="-my-2" /></Link>
            <nav className="hidden flex-1 gap-1 md:flex" aria-label="Site">
              {links.map((l) => (
                <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>
              ))}
            </nav>
            <Link to="/app" className="ml-auto"><Button size="sm">Abrir protótipo</Button></Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Site">
            {links.map((l) => <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="shrink-0 rounded-md px-3 py-1 text-xs text-muted-foreground" activeProps={{ className: "!text-cyan" }}>{l.label}</Link>)}
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
