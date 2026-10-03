import { cva, type VariantProps } from "class-variance-authority";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { cn } from "../lib/utils";

export const mobileNavPanelVariants = cva(
  "m-0 h-dvh max-h-none w-full max-w-none border-0 bg-background/95 p-0 text-foreground backdrop:bg-background/80",
  {
    variants: { layout: { list: "", grid: "" } },
    defaultVariants: { layout: "list" },
  },
);

export interface MobileNavProps extends Omit<ComponentProps<"div">, "title">, VariantProps<typeof mobileNavPanelVariants> {
  /** Content shown at the top of the open panel (usually the logo). */
  header?: ReactNode;
  /** Accessible label for the trigger button. */
  label?: string;
  /** Panel content: links, actions. Any link click closes the panel. */
  children: ReactNode;
}

/**
 * Hamburger trigger + full-screen panel for phones and tablets.
 * Built on the native <dialog> (focus trap, Esc to close). Closes when any link or button inside is activated.
 */
export function MobileNav({ header, label = "Abrir menu", layout, className, children, ...props }: MobileNavProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const onPanelClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,[data-close]")) setOpen(false);
  };

  return (
    <div className={cn("lg:hidden", className)} {...props}>
      <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-neon-pink hover:text-neon-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Menu className="size-5" />
      </button>
      <dialog ref={ref} onClose={() => setOpen(false)} onClick={onPanelClick} className={mobileNavPanelVariants({ layout })}>
        <div className="flex h-full flex-col gap-6 overflow-hidden bg-stage-glow px-5 py-4">
          <div className="flex items-center justify-between">
            {header}
            <button type="button" data-close aria-label="Fechar menu"
              className="ml-auto flex size-10 items-center justify-center rounded-md border border-border transition-colors hover:border-neon-pink hover:text-neon-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Menu" className={cn("flex flex-1 flex-col justify-center gap-2", layout === "grid" && "grid grid-cols-2 content-center sm:grid-cols-3")}>
            {children}
          </nav>
        </div>
      </dialog>
    </div>
  );
}
