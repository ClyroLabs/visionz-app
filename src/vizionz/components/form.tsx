import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const fieldBase =
  "w-full rounded-md border bg-surface text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-cyan focus-visible:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

export const inputVariants = cva(fieldBase, {
  variants: { size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-4 text-base" } },
  defaultVariants: { size: "md" },
});

export interface InputProps extends Omit<ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

/** Text input. Pair with Label; set aria-invalid for error state. */
export function Input({ className, size, ...props }: InputProps) {
  return <input className={cn(inputVariants({ size }), className)} {...props} />;
}

export interface LabelProps extends ComponentProps<"label"> {}

/** Form label wired to its control via htmlFor. */
export function Label({ className, ...props }: LabelProps) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

export interface SelectProps extends Omit<ComponentProps<"select">, "size">, VariantProps<typeof inputVariants> {}

/** Native select styled to the system. */
export function Select({ className, size, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select className={cn(inputVariants({ size }), "appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

export interface SwitchProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** On/off toggle. Needs an aria-label or associated label. */
export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
        checked ? "border-cyan bg-cyan/80" : "border-border bg-muted",
        className,
      )}
      {...props}
    >
      <span className={cn("block size-4 rounded-full bg-foreground transition-transform", checked ? "translate-x-6 bg-cyan-foreground" : "translate-x-1")} />
    </button>
  );
}

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {}

/** Checkbox built on the native input. */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span className="relative inline-flex size-5 shrink-0">
      <input
        type="checkbox"
        className={cn(
          "peer size-5 appearance-none rounded-sm border bg-surface outline-none transition-colors checked:border-cyan checked:bg-cyan focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <Check className="pointer-events-none absolute inset-0.5 size-4 text-cyan-foreground opacity-0 peer-checked:opacity-100" aria-hidden />
    </span>
  );
}
