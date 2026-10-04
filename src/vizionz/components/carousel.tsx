import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useId, useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "../lib/utils";

export interface CarouselProps extends ComponentProps<"div"> {
  /** Accessible label for the carousel region. */
  label: string;
  /** Autoplay interval in ms; 0 disables. Pauses on hover/focus/touch and under reduced motion. */
  interval?: number;
}

/** Auto-advancing horizontal carousel with arrows and dots. Loops back to the start. */
export function Carousel({ label, interval = 3500, className, children, ...props }: CarouselProps) {
  const id = useId();
  const box = useRef<HTMLDivElement | null>(null);
  const ref = { get current() { return box.current ?? (typeof document !== "undefined" ? (document.getElementById(id) as HTMLDivElement | null) : null); } };
  const count = Children.count(children);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [overflow, setOverflow] = useState(true);

  const lock = useRef(0);
  const go = useCallback((i: number) => {
    const el = ref.current;
    if (!el || !count) return;
    const n = ((i % count) + count) % count;
    const child = el.children[n] as HTMLElement | undefined;
    const max = el.scrollWidth - el.clientWidth;
    const left = child ? Math.min(max, child.offsetLeft - (el.children[0] as HTMLElement).offsetLeft) : 0;
    setActive(n);
    lock.current = Date.now() + 900;
    el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [count]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setOverflow(el.scrollWidth > el.clientWidth + 4);
        if (Date.now() < lock.current) return;
        const max = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= max - 4) { setActive(count - 1); return; }
        const base = (el.children[0] as HTMLElement | undefined)?.offsetLeft ?? 0;
        let best = 0, dist = Infinity;
        Array.from(el.children).forEach((c, i) => {
          const d = Math.abs((c as HTMLElement).offsetLeft - base - el.scrollLeft);
          if (d < dist) { dist = d; best = i; }
        });
        setActive(best);
      });
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => { cancelAnimationFrame(raf); el.removeEventListener("scroll", sync); ro.disconnect(); };
  }, [count]);

  const live = useRef({ paused, active, go });
  live.current = { paused, active, go };
  const resume = useRef<number | undefined>(undefined);
  const pauseFor = (ms: number) => {
    setPaused(true);
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setPaused(false), ms);
  };
  useEffect(() => () => window.clearTimeout(resume.current), []);
  useEffect(() => {
    if (!interval || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      const el = ref.current;
      if (!el || document.hidden || live.current.paused || el.scrollWidth <= el.clientWidth + 4) return;
      live.current.go(live.current.active + 1);
    }, interval);
    return () => window.clearInterval(t);
  }, [interval]);

  const arrow = "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-magenta/40 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-magenta/15 hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={cn("relative", className)}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { window.clearTimeout(resume.current); setPaused(true); } }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setPaused(false); }}
      onPointerDown={(e) => { if (e.pointerType !== "mouse") pauseFor(5000); }}
      onClickCapture={() => pauseFor(5000)}>
      <div id={id} ref={box} role="region" aria-roledescription="carrossel" aria-label={label} tabIndex={0}
        className={cn("flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", !overflow && "justify-center")} {...props}>
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
