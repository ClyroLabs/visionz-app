import { cva, type VariantProps } from "class-variance-authority";
import { Children, useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "../lib/utils";

export const scrollSnapRowVariants = cva(
  "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:overflow-visible md:pb-0",
  {
    variants: { item: { wide: "[&>*]:w-[85%] sm:[&>*]:w-[60%]", narrow: "[&>*]:w-[46%] sm:[&>*]:w-[32%]" } },
    defaultVariants: { item: "wide" },
  },
);

export interface ScrollSnapRowProps extends ComponentProps<"div">, VariantProps<typeof scrollSnapRowVariants> {
  /** Accessible label for the carousel region on small screens. */
  label: string;
}

/**
 * Swipeable carousel with dot indicators on small screens; a regular grid from `md` up
 * (pass the desktop columns via `className`, e.g. `md:grid-cols-3`).
 */
export function ScrollSnapRow({ className, item, label, children, ...props }: ScrollSnapRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      setActive(Math.min(count - 1, Math.round(el.scrollLeft / (first.offsetWidth + 16))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);
  const go = (i: number) => {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (el && child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft });
  };
  return (
    <div>
      <div ref={ref} role="region" aria-label={label} tabIndex={0}
        className={cn(scrollSnapRowVariants({ item }), "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>*]:shrink-0 [&>*]:snap-center md:[&>*]:w-auto", className)} {...props}>
        {children}
      </div>
      {count > 1 && (
        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" aria-label={`Ir para o item ${i + 1}`} aria-current={i === active}
              onClick={() => go(i)}
              className={cn("h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", i === active ? "w-6 bg-gradient-brand" : "w-1.5 bg-muted")} />
          ))}
        </div>
      )}
    </div>
  );
}
