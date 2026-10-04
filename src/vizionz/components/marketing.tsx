import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, Check, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Badge } from "./display";
import { CountUp } from "./motion";

/* ---------------- Stat ---------------- */
export const statVariants = cva("font-display font-bold tracking-wide", {
  variants: {
    tone: { brand: "text-gradient-brand", cyan: "text-cyan", default: "text-foreground" },
    size: { md: "text-2xl", lg: "text-4xl", xl: "text-5xl md:text-6xl" },
  },
  defaultVariants: { tone: "brand", size: "lg" },
});
export interface StatProps extends ComponentProps<"div">, VariantProps<typeof statVariants> {
  value: string;
  label: string;
  /** Optional icon shown in a tinted circle. */
  icon?: ReactNode;
}

/** Highlighted metric: big number + caption. */
export function Stat({ value, label, tone, size, icon, className, ...props }: StatProps) {
  return (
    <div className={cn(icon ? "flex flex-col items-center gap-3 sm:flex-row sm:items-center" : "space-y-1", className)} {...props}>
      {icon && <span className={cn("grid size-12 shrink-0 place-items-center rounded-full [&_svg]:size-5", tone === "cyan" ? "bg-cyan/12 text-cyan" : tone === "default" ? "bg-foreground/8 text-foreground" : "bg-magenta/12 text-magenta")} aria-hidden>{icon}</span>}
      <div className="space-y-1">
        <p className={statVariants({ tone, size })}><CountUp value={value} /></p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ---------------- SectionHeading ---------------- */
export const sectionHeadingVariants = cva("max-w-3xl space-y-4", {
  variants: { align: { start: "mx-auto text-center md:mx-0 md:text-left", center: "mx-auto text-center" } },
  defaultVariants: { align: "start" },
});
export interface SectionHeadingProps extends Omit<ComponentProps<"div">, "title">, VariantProps<typeof sectionHeadingVariants> {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
}

/** Eyebrow + display title + lead paragraph for page sections. */
export function SectionHeading({ eyebrow, title, description, align, className, ...props }: SectionHeadingProps) {
  return (
    <div className={cn(sectionHeadingVariants({ align }), className)} {...props}>
      {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">{eyebrow}</p>}
      <h2 className="text-balance font-display text-2xl font-bold tracking-wide sm:text-3xl md:text-4xl">{title}</h2>
      {description && <p className="text-base text-muted-foreground md:text-lg">{description}</p>}
    </div>
  );
}

/* ---------------- PricingCard ---------------- */
export const pricingCardVariants = cva("flex flex-col gap-6 rounded-xl border p-7", {
  variants: {
    variant: { default: "bg-surface shadow-panel", featured: "border-gradient-brand shadow-glow-brand" },
  },
  defaultVariants: { variant: "default" },
});
export interface PricingCardProps extends ComponentProps<"div">, VariantProps<typeof pricingCardVariants> {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  onSelect?: () => void;
}

/** Subscription plan card. */
export function PricingCard({ name, price, period = "/mês", description, features, cta, badge, onSelect, variant, className, ...props }: PricingCardProps) {
  return (
    <div className={cn(pricingCardVariants({ variant }), className)} {...props}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold tracking-wide">{name}</h3>
          {badge && <Badge variant="brand">{badge}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <p><span className="font-display text-4xl font-bold">{price}</span> <span className="text-sm text-muted-foreground">{period}</span></p>
      <ul className="flex-1 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />{f}</li>
        ))}
      </ul>
      <Button variant={variant === "featured" ? "primary" : "secondary"} onClick={onSelect} className="w-full">{cta}</Button>
    </div>
  );
}

/* ---------------- Timeline ---------------- */
export interface TimelineItem { phase: string; period: string; title: string; items: string[]; status?: "done" | "current" | "next" }
export interface TimelineProps extends ComponentProps<"ol"> { items: TimelineItem[] }

/** Roadmap phases laid out horizontally on wide screens. */
export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <ol className={cn("grid gap-4 md:grid-cols-3", className)} {...props}>
      {items.map((it) => (
        <li key={it.phase} className={cn("relative rounded-xl border bg-surface p-6", it.status === "current" && "border-cyan/50 shadow-glow-cyan")}>
          <div className="mb-3 flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", it.status === "current" ? "bg-cyan" : it.status === "done" ? "bg-success" : "bg-steel")} aria-hidden />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{it.phase} · {it.period}</span>
          </div>
          <h3 className="mb-3 font-display font-semibold tracking-wide">{it.title}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">{it.items.map((x) => <li key={x}>— {x}</li>)}</ul>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- ModerationItem ---------------- */
export const moderationItemVariants = cva("group flex flex-col items-center gap-4 rounded-2xl border bg-surface/80 p-5 text-center backdrop-blur transition-all hover:-translate-y-0.5 sm:flex-row sm:text-left", {
  variants: { severity: {
    low: "border-cyan/20 shadow-[0_0_30px_-18px_var(--cyan)]",
    medium: "border-warning/25 shadow-[0_0_30px_-18px_var(--warning)]",
    high: "border-destructive/30 shadow-[0_0_30px_-16px_var(--destructive)]",
  } },
  defaultVariants: { severity: "medium" },
});
export interface ModerationItemProps extends ComponentProps<"div">, VariantProps<typeof moderationItemVariants> {
  title: string;
  reason: string;
  confidence: number;
  timestamp: string;
  onApprove: () => void;
  onBlock: () => void;
}
const sev = {
  high: { label: "Alta", ring: "bg-destructive/12 text-destructive", bar: "bg-destructive" },
  medium: { label: "Média", ring: "bg-warning/12 text-warning", bar: "bg-warning" },
  low: { label: "Baixa", ring: "bg-cyan/12 text-cyan", bar: "bg-cyan" },
} as const;

/** Item flagged by AI moderation awaiting a human decision. */
export function ModerationItem({ title, reason, confidence, timestamp, onApprove, onBlock, severity, className, ...props }: ModerationItemProps) {
  const s = sev[severity ?? "medium"];
  return (
    <div className={cn(moderationItemVariants({ severity }), className)} {...props}>
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", s.ring)}><AlertTriangle className="size-5" aria-hidden /></span>
      <div className="w-full min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <p className="font-semibold">{title}</p>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider", s.ring)}>Gravidade {s.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{reason} · <span className="font-mono">{timestamp}</span></p>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="meter" aria-label="Confiança da IA" aria-valuenow={confidence} aria-valuemin={0} aria-valuemax={100}>
            <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${confidence}%` }} />
          </div>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">IA {confidence}%</span>
        </div>
      </div>
      <div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
        <Button size="sm" variant="success" onClick={onApprove}><Check />Aprovar</Button>
        <Button size="sm" variant="danger" onClick={onBlock}><X />Bloquear</Button>
      </div>
    </div>
  );
}

/* ---------------- Eyebrow ---------------- */
export const eyebrowVariants = cva("label-eyebrow", {
  variants: {
    tone: { muted: "text-muted-foreground", foreground: "text-foreground", brand: "text-gradient-brand" },
    underline: { none: "", brand: "underline-brand mb-3 inline-block" },
  },
  defaultVariants: { tone: "muted", underline: "none" },
});
export interface EyebrowProps extends ComponentProps<"p">, VariantProps<typeof eyebrowVariants> {
  /** Optional list rendered with "•" separators (e.g. pillars). */
  items?: string[];
}
/** Wide-tracked uppercase label, e.g. "INOVAÇÃO • MOBILIDADE • LIBERDADE". */
export function Eyebrow({ className, tone, underline, items, children, ...props }: EyebrowProps) {
  return (
    <p className={cn(eyebrowVariants({ tone, underline }), className)} {...props}>
      {items ? items.map((it, i) => (
        <span key={it}>{i > 0 && <span aria-hidden className="mx-3 opacity-60">•</span>}{it}</span>
      )) : children}
    </p>
  );
}

/* ---------------- OrbitRing ---------------- */
export const orbitRingVariants = cva("pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] p-[2px] bg-gradient-brand", {
  variants: {
    size: { md: "h-40 w-[28rem]", lg: "h-56 w-[40rem]", xl: "h-72 w-[52rem]" },
  },
  defaultVariants: { size: "lg" },
});
export interface OrbitRingProps extends ComponentProps<"div">, VariantProps<typeof orbitRingVariants> {}
/** Decorative tilted gradient orbit. Place inside a `relative` container. */
export function OrbitRing({ className, size, ...props }: OrbitRingProps) {
  return (
    <div
      aria-hidden
      className={cn(orbitRingVariants({ size }), "animate-orbit opacity-80 [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)] drop-shadow-[0_0_12px_var(--magenta)]", className)}
      {...props}
    />
  );
}

/* ---------------- TokenBadge ---------------- */
export const tokenBadgeVariants = cva("inline-flex items-center gap-3 font-display font-bold tracking-wide", {
  variants: { size: { sm: "text-lg", md: "text-2xl", lg: "text-4xl" } },
  defaultVariants: { size: "md" },
});
const medal = { sm: "size-9 text-xs", md: "size-12 text-sm", lg: "size-20 text-xl" } as const;
export interface TokenBadgeProps extends ComponentProps<"div">, VariantProps<typeof tokenBadgeVariants> {
  /** Ticker without the "$". Defaults to VZN. */
  symbol?: string;
}
/** Rewards-token medallion: gradient ring + ticker, e.g. "$VZN". */
export function TokenBadge({ className, size, symbol = "VZN", ...props }: TokenBadgeProps) {
  const s = size ?? "md";
  return (
    <div className={cn(tokenBadgeVariants({ size }), className)} {...props}>
      <span aria-hidden className={cn("flex items-center justify-center rounded-full border-gradient-brand shadow-glow-hot", medal[s])}>
        <span className="text-gradient-brand">VZ</span>
      </span>
      <span className="underline-brand text-foreground">${symbol}</span>
    </div>
  );
}
