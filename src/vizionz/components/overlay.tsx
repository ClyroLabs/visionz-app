import { X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/* ---------------- Tabs ---------------- */
interface TabsCtx { value: string; setValue: (v: string) => void; id: string }
const TabsContext = createContext<TabsCtx | null>(null);

export interface TabsProps extends Omit<ComponentProps<"div">, "onChange"> {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

/** Tabbed sections. Compose TabsList > TabsTrigger and TabsContent. */
export function Tabs({ defaultValue, value, onValueChange, className, ...props }: TabsProps) {
  const [inner, setInner] = useState(defaultValue);
  const id = useId();
  const current = value ?? inner;
  const setValue = (v: string) => { setInner(v); onValueChange?.(v); };
  return (
    <TabsContext.Provider value={{ value: current, setValue, id }}>
      <div className={cn("flex flex-col gap-4", className)} {...props} />
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends ComponentProps<"div"> {}
export function TabsList({ className, ...props }: TabsListProps) {
  return <div role="tablist" className={cn("inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border bg-surface/80 p-1 [scrollbar-width:none]", className)} {...props} />;
}

export interface TabsTriggerProps extends ComponentProps<"button"> { value: string }
export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.id}-t-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.id}-p-${value}`}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-magenta/15 text-magenta" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends ComponentProps<"div"> { value: string }
export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div role="tabpanel" id={`${ctx.id}-p-${value}`} aria-labelledby={`${ctx.id}-t-${value}`} className={className} {...props} />;
}

/* ---------------- Dialog ---------------- */
export interface DialogProps extends Omit<ComponentProps<"dialog">, "open" | "title"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
}

/** Modal dialog built on native <dialog> (focus trap + Esc). */
export function Dialog({ open, onOpenChange, title, description, className, children, ...props }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      onClose={() => onOpenChange(false)}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
      className={cn("m-auto w-[min(92vw,30rem)] rounded-xl border border-cyan/30 bg-surface p-0 text-foreground shadow-glow-cyan backdrop:bg-background/70 backdrop:backdrop-blur-sm", className)}
      {...props}
      ref={ref}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button type="button" aria-label="Fechar" onClick={() => onOpenChange(false)} className="rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

/* ---------------- Menu ---------------- */
export interface MenuItem { label: string; icon?: ReactNode; onSelect: () => void; destructive?: boolean }
export interface MenuProps extends Omit<ComponentProps<"div">, "children"> {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
}

/** Dropdown action menu. Arrow keys move, Esc closes. */
export function Menu({ trigger, items, align = "start", className, ...props }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    wrap.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const onKey = (e: React.KeyboardEvent) => {
    const els = Array.from(wrap.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? []);
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
  };
  return (
    <div ref={wrap} className={cn("relative inline-block", className)} onKeyDown={onKey} {...props}>
      {trigger({ onClick: () => setOpen((o) => !o), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open && (
        <div role="menu" className={cn("absolute z-50 mt-2 min-w-48 rounded-lg border bg-surface-raised p-1 shadow-panel", align === "end" ? "right-0" : "left-0")}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => { it.onSelect(); setOpen(false); }}
              className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted [&_svg]:size-4", it.destructive ? "text-destructive" : "text-foreground")}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Tooltip ---------------- */
export interface TooltipProps extends Omit<ComponentProps<"span">, "content"> {
  content: ReactNode;
  side?: "top" | "bottom";
}

/** Hover/focus hint around a focusable child. */
export function Tooltip({ content, side = "top", className, children, ...props }: TooltipProps) {
  const id = useId();
  return (
    <span className={cn("group relative inline-flex", className)} aria-describedby={id} {...props}>
      {children}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-cyan/30 bg-surface-raised px-2 py-1 text-xs text-foreground opacity-0 shadow-panel transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {content}
      </span>
    </span>
  );
}

/* ---------------- Toast ---------------- */
export const toastVariants = cva("pointer-events-auto flex w-80 items-start gap-3 rounded-lg border bg-surface-raised p-4 shadow-panel", {
  variants: { variant: { info: "border-cyan/40", success: "border-success/50", error: "border-destructive/50", reward: "border-magenta/50 shadow-glow-brand" } },
  defaultVariants: { variant: "info" },
});
export interface ToastOptions extends VariantProps<typeof toastVariants> { title: string; description?: string }
interface ToastItem extends ToastOptions { id: number }
const ToastContext = createContext<((t: ToastOptions) => void) | null>(null);

export interface ToastProviderProps { children: ReactNode }

/** Mount once near the app root; use useToast() to fire notifications. */
export function ToastProvider({ children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((t: ToastOptions) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} role="status" className={toastVariants({ variant: t.variant })}>
            <div className="flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
            </div>
            <button type="button" aria-label="Fechar aviso" onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
