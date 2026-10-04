import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "../lib/utils";

export interface CarouselProps extends ComponentProps<"div"> {
  /** Accessible label for the carousel region. */
  label: string;
  /** Autoplay interval in ms; 0 disables. Pauses on hover/focus/touch and under reduced motion. */
  interval?: number;
}

/** Auto-advancing horizontal carousel with arrows and dots. Loops back to the start. */
export function Carousel({ label, interval = 3500, className, children, ...props }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [overflow, setOverflow] = useState(true);

  const step = useCallback(() => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + parseFloat(getComputedStyle(el!).columnGap || "16") : 0;
  }, []);

  const go = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const target = i * step();
    el.scrollTo({ left: target > max + 4 ? 0 : Math.max(0, target), behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const s = step();
      setOverflow(el.scrollWidth > el.clientWidth + 4);
      if (s) setActive(Math.min(count - 1, Math.round(el.scrollLeft / s)));
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => { el.removeEventListener("scroll", sync); window.removeEventListener("resize", sync); };
  }, [count, step]);

  useEffect(() => {
    if (!interval || paused || !overflow || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else go(active + 1);
    }, interval);
    return () => clearInterval(t);
  }, [interval, paused, overflow, active, go]);

  const arrow = "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-magenta/40 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-magenta/15 hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)} onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}>
      <div ref={ref} role="region" aria-roledescription="carrossel" aria-label={label} tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...props}>
        {children}
      </div>
      {overflow && count > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={() => go(active - 1)} className={cn(arrow, "-left-2 hidden sm:grid")}><ChevronLeft className="size-5" /></button>
          <button type="button" aria-label="Próximo" onClick={() => go(active + 1)} className={cn(arrow, "-right-2 hidden sm:grid")}><ChevronRight className="size-5" /></button>
          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: count }, (_, i) => (
              <button key={i} type="button" aria-label={`Ir para o item ${i + 1}`} aria-current={i === active} onClick={() => go(i)}
                className={cn("h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", i === active ? "w-6 bg-gradient-brand" : "w-1.5 bg-muted hover:bg-magenta/60")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
