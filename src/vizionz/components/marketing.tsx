import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, Check, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Badge } from "./display";

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
}

/** Highlighted metric: big number + caption. */
export function Stat({ value, label, tone, size, className, ...props }: StatProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <p className={statVariants({ tone, size })}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------------- SectionHeading ---------------- */
export const sectionHeadingVariants = cva("max-w-3xl space-y-4", {
  variants: { align: { start: "", center: "mx-auto text-center" } },
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
      <h2 className="font-display text-3xl font-bold tracking-wide md:text-4xl">{title}</h2>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
    </div>
  );
}

/* ---------------- PricingCard ---------------- */
export const pricingCardVariants = cva("flex flex-col gap-6 rounded-xl border p-7", {
  variants: {
    variant: { default: "bg-surface shadow-panel", featured: "border-magenta/50 bg-surface-raised shadow-glow-brand" },
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
export const moderationItemVariants = cva("flex flex-col gap-3 rounded-lg border bg-surface p-4 sm:flex-row sm:items-center", {
  variants: { severity: { low: "border-l-4 border-l-cyan", medium: "border-l-4 border-l-warning", high: "border-l-4 border-l-destructive" } },
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

/** Item flagged by AI moderation awaiting a human decision. */
export function ModerationItem({ title, reason, confidence, timestamp, onApprove, onBlock, severity, className, ...props }: ModerationItemProps) {
  return (
    <div className={cn(moderationItemVariants({ severity }), className)} {...props}>
      <AlertTriangle className={cn("size-5 shrink-0", severity === "high" ? "text-destructive" : severity === "low" ? "text-cyan" : "text-warning")} aria-hidden />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{reason} · <span className="font-mono">{timestamp}</span> · confiança {confidence}%</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="neon" onClick={onApprove}><Check />Aprovar</Button>
        <Button size="sm" variant="destructive" onClick={onBlock}><X />Bloquear</Button>
      </div>
    </div>
  );
}
