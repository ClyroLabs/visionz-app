import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "../lib/utils";

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) { setSeen(true); return true; }
      return false;
    };
    if (check()) return;
    const onScroll = () => { if (check()) cleanup(); };
    const cleanup = () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return cleanup;
  }, []);
  return { ref, seen };
}

export const revealVariants = cva("transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none", {
  variants: {
    effect: { rise: "", fade: "", zoom: "" },
    state: { hidden: "opacity-0 motion-reduce:opacity-100", shown: "opacity-100 translate-y-0 scale-100 blur-0" },
  },
  compoundVariants: [
    { effect: "rise", state: "hidden", className: "translate-y-8 blur-sm motion-reduce:translate-y-0 motion-reduce:blur-0" },
    { effect: "zoom", state: "hidden", className: "scale-95 motion-reduce:scale-100" },
  ],
  defaultVariants: { effect: "rise", state: "hidden" },
});
export interface RevealProps extends ComponentProps<"div">, Omit<VariantProps<typeof revealVariants>, "state"> {
  /** Delay in ms before the reveal starts. */
  delay?: number;
}
/** Reveals its children when scrolled into view. Respects reduced motion. */
export function Reveal({ className, effect, delay = 0, style, ...props }: RevealProps) {
  const { ref, seen } = useInView<HTMLDivElement>();
  return <div ref={ref} className={cn(revealVariants({ effect, state: seen ? "shown" : "hidden" }), className)} style={{ transitionDelay: `${delay}ms`, ...style }} {...props} />;
}

export interface CountUpProps extends ComponentProps<"span"> {
  /** Final text, e.g. "40%", "4K/8K", "R$ 2,4 mi". The first number in it is animated. */
  value: string;
  duration?: number;
}
/** Counts the first number in `value` up from zero when visible. */
export function CountUp({ value, duration = 1400, ...props }: CountUpProps) {
  const { ref, seen } = useInView<HTMLSpanElement>();
  const m = value.match(/\d+(?:[.,]\d+)?/);
  const [text, setText] = useState(value);
  useEffect(() => {
    if (!seen || !m) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = parseFloat(m[0].replace(",", "."));
    const dec = (m[0].split(/[.,]/)[1] ?? "").length;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const n = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec).replace(".", m[0].includes(",") ? "," : ".");
      setText(value.replace(m[0], n));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);
  return <span ref={ref} {...props}>{text}</span>;
}
