import { Link } from "@tanstack/react-router";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo, ToastProvider, Button, cn } from "@/index";

const nav = [
  { to: "/", label: "Visão geral" },
  { to: "/marca", label: "Marca" },
  { to: "/cores", label: "Cores" },
  { to: "/tipografia", label: "Tipografia" },
  { to: "/icones", label: "Ícones" },
  { to: "/componentes", label: "Componentes" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [light, setLight] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle("light", light); }, [light]);
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background bg-circuit-grid">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
            <Link to="/" className="flex items-center gap-3">
              <Logo brand="clyro-icon" size="sm" alt="" />
              <span className="font-display text-sm font-bold tracking-[0.2em]">VIZIONZ <span className="text-cyan">DS</span></span>
            </Link>
            <nav className="hidden flex-1 gap-1 md:flex" aria-label="Seções">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-surface-raised !text-cyan" }}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <Button size="icon" variant="ghost" className="ml-auto md:ml-0" aria-label={light ? "Tema escuro" : "Tema claro"} onClick={() => setLight((l) => !l)}>
              {light ? <Moon /> : <Sun />}
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Seções">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="shrink-0 rounded-md px-3 py-1 text-xs text-muted-foreground" activeProps={{ className: "bg-surface-raised !text-cyan" }}>{n.label}</Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
        <footer className="border-t py-8 text-center text-xs text-muted-foreground">VizionZ Entertainment · powered by Clyro Labs</footer>
      </div>
    </ToastProvider>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-12 max-w-3xl">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan">{eyebrow}</p>
      <h1 className="font-display text-4xl font-bold tracking-wide md:text-5xl">{title}</h1>
      {children && <p className="mt-4 text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}

export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-xs text-muted-foreground", className)}>{children}</p>;
}

export function Code({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-cyan">
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} /> código
      </button>
      {open && <pre className="mt-2 overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs text-foreground"><code>{code}</code></pre>}
    </div>
  );
}
