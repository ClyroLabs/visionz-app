import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export const badgeVariants = cva("inline-flex items-center gap-1 rounded-full font-medium [&_svg]:size-3.5", {
  variants: {
    variant: {
      brand: "bg-gradient-brand text-primary-foreground",
      cyan: "border border-cyan/40 bg-cyan/10 text-cyan",
      neutral: "border border-border bg-muted text-muted-foreground",
      success: "border border-success/40 bg-success/10 text-success",
      warning: "border border-warning/40 bg-warning/10 text-warning",
      destructive: "border border-destructive/40 bg-destructive/10 text-destructive",
    },
    size: { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-xs" },
  },
  defaultVariants: { variant: "neutral", size: "md" },
});

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

/** Small status or category label. */
export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export const cardVariants = cva("vz-card min-w-0 rounded-xl border text-foreground", {
  variants: {
    variant: {
      default: "bg-surface shadow-panel",
      glass: "border-cyan/20 bg-surface/60 backdrop-blur-md shadow-panel",
      glow: "border-cyan/40 bg-surface shadow-glow-cyan",
      featured: "border-gradient-brand shadow-glow-brand",
    },
    padding: { none: "", md: "p-4 sm:p-5", lg: "p-5 sm:p-6 lg:p-7" },
  },
  defaultVariants: { variant: "default", padding: "md" },
});

export interface CardProps extends ComponentProps<"div">, VariantProps<typeof cardVariants> {}

/** Surface container for grouped content. */
export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}

export interface CardTitleProps extends ComponentProps<"h3"> {}
export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("font-display text-base font-semibold tracking-wide", className)} {...props} />;
}

export interface CardDescriptionProps extends ComponentProps<"p"> {}
export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export const avatarVariants = cva("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-foreground", {
  variants: {
    size: { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-base" },
    ring: { none: "", brand: "ring-2 ring-magenta ring-offset-2 ring-offset-background", cyan: "ring-2 ring-cyan ring-offset-2 ring-offset-background" },
  },
  defaultVariants: { size: "md", ring: "none" },
});

export interface AvatarProps extends ComponentProps<"span">, VariantProps<typeof avatarVariants> {
  src?: string;
  /** Full name — used for alt text and initials fallback. */
  name: string;
}

/** User or creator picture with initials fallback. */
export function Avatar({ src, name, size, ring, className, ...props }: AvatarProps) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className={cn(avatarVariants({ size, ring }), className)} {...props}>
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : <span aria-label={name}>{initials}</span>}
    </span>
  );
}

export const progressVariants = cva("h-full rounded-full transition-[width]", {
  variants: { variant: { brand: "bg-gradient-brand", cyan: "bg-cyan", success: "bg-success" } },
  defaultVariants: { variant: "brand" },
});

export interface ProgressProps extends ComponentProps<"div">, VariantProps<typeof progressVariants> {
  /** 0–100 */
  value: number;
  label?: string;
}

/** Determinate progress bar. */
export function Progress({ value, variant, label, className, ...props }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label} className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
      <div className={progressVariants({ variant })} style={{ width: `${v}%` }} />
    </div>
  );
}

export interface SkeletonProps extends ComponentProps<"div"> {}

/** Loading placeholder block. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
