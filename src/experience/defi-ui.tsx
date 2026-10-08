import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/index";

/** Page header shared by the DeFi demo screens. */
export function DemoHeader({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">{title}</h1>
        <Badge variant="warning">Demonstração · exemplo, não é promessa</Badge>
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}

/** Small persisted state for demo data (read after hydration). */
export function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* ignore */ }
  }, [key]);
  const set = (next: T) => { setV(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ } };
  return [v, set] as const;
}

/** Tiny sparkline with an uncertainty band. */
export function Sparkline({ data, band = 0, className }: { data: number[]; band?: number; className?: string }) {
  const w = 240, h = 70, min = Math.min(...data) * (1 - band), max = Math.max(...data) * (1 + band);
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * h;
  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const up = data.map((v, i) => `${x(i)},${y(v * (1 + band * (i / data.length)))}`);
  const dn = data.map((v, i) => `${x(i)},${y(v * (1 - band * (i / data.length)))}`).reverse();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="Gráfico de tendência">
      {band > 0 && <polygon points={[...up, ...dn].join(" ")} className="fill-cyan/15" />}
      <polyline points={line} fill="none" className="stroke-cyan" strokeWidth="2" />
    </svg>
  );
}

export const usd = (n: number) => `US$ ${n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 4 : 2 })}`;
export const pct = (n: number, d = 1) => `${(n * 100).toFixed(d).replace(".", ",")}%`;
