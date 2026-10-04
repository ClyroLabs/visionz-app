import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "shine bg-gradient-brand text-primary-foreground shadow-glow-brand hover:shadow-glow-hot hover:brightness-110 active:brightness-95",
        soft: "border border-transparent bg-foreground/5 text-foreground hover:bg-magenta/12 hover:text-magenta hover:border-magenta/30",
        success: "border border-success/30 bg-success/10 text-success hover:bg-success/20 hover:shadow-[0_0_20px_-4px_var(--success)]",
        danger: "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-[0_0_20px_-4px_var(--destructive)]",
        neon: "border border-cyan/60 bg-cyan/10 text-cyan hover:bg-cyan/20 hover:shadow-glow-cyan active:bg-cyan/25",
        secondary: "border border-border bg-surface-raised text-foreground hover:bg-magenta/10 hover:text-magenta",
        ghost: "text-foreground hover:bg-magenta/10 hover:text-magenta",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-sm",
        md: "h-11 rounded-full px-5 text-sm",
        lg: "h-12 rounded-full px-7 text-base",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

/** Primary action control. Icon-only buttons (size="icon") need an aria-label. */
export function Button({ className, variant, size, loading, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
