import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck, Baby, Clock, Coins, Maximize, Pause, Play, ShieldCheck, TrendingUp, Volume2, Wallet } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Card } from "./display";
import { Select, Switch } from "./form";

/* ---------------- Logos ---------------- */
import vizionzLogo from "../../assets/logos/vizionz-logo.svg";
import clyroLogo from "../../assets/logos/clyro-logo.svg";
import clyroIcon from "../../assets/logos/clyro-icon.svg";
import clyroLabsAi from "../../assets/logos/clyro-labs-ai.svg";
import visionzSymbol from "../../assets/logos/visionz-symbol.png";
import vizionzTransparent from "../../assets/logos/vizionz-logo-transparent.png";
import synthLogo from "../../assets/logos/synth-logo.webp.asset.json";
import jukeboxLogo from "../../assets/logos/jukebox-logo.webp.asset.json";

const logoSources = { vizionz: vizionzLogo, "vizionz-transparent": vizionzTransparent, "visionz-symbol": visionzSymbol, clyro: clyroLogo, "clyro-icon": clyroIcon, "clyro-labs-ai": clyroLabsAi, "clyro-synth": synthLogo.url, "clyro-jukebox": jukeboxLogo.url } as const;
const logoAlt = { vizionz: "VisionZ Entertainment", "vizionz-transparent": "VisionZ Entertainment", "visionz-symbol": "VisionZ", clyro: "Clyro", "clyro-icon": "Clyro", "clyro-labs-ai": "Clyro Labs AI", "clyro-synth": "Clyro Synth", "clyro-jukebox": "Clyro Jukebox" } as const;

export const logoVariants = cva("block object-contain", {
  variants: { size: { sm: "h-8", md: "h-14", lg: "h-24", xl: "h-40" } },
  defaultVariants: { size: "md" },
});
export interface LogoProps extends Omit<ComponentProps<"img">, "src">, VariantProps<typeof logoVariants> {
  brand: keyof typeof logoSources;
}

/** Official brand logo. Never redraw or recolor. */
export function Logo({ brand, size, className, alt, ...props }: LogoProps) {
  return <img src={logoSources[brand]} alt={alt ?? logoAlt[brand]} className={cn(logoVariants({ size }), className)} {...props} />;
}

/* ---------------- Network tag ---------------- */
export const networks = {
  polygon: { label: "Polygon", dot: "bg-primary" },
  ethereum: { label: "Ethereum", dot: "bg-steel-light" },
  solana: { label: "Solana", dot: "bg-cyan" },
  bnb: { label: "BNB Chain", dot: "bg-warning" },
  base: { label: "Base", dot: "bg-cyan-deep" },
  arbitrum: { label: "Arbitrum", dot: "bg-indigo" },
} as const;
export type Network = keyof typeof networks;

export interface NetworkTagProps extends ComponentProps<"span"> { network: Network }

/** Shows which chain an asset or reward lives on. */
export function NetworkTag({ network, className, ...props }: NetworkTagProps) {
  const n = networks[network];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border bg-surface-raised px-2 py-0.5 font-mono text-xs text-muted-foreground", className)} {...props}>
      <span className={cn("size-2 rounded-full", n.dot)} aria-hidden />
      {n.label}
    </span>
  );
}

/* ---------------- Age rating ---------------- */
export const ageRatingVariants = cva("inline-flex items-center justify-center rounded-sm font-display font-bold text-background", {
  variants: {
    rating: { L: "bg-success", "10": "bg-cyan", "12": "bg-warning", "14": "bg-ember", "16": "bg-destructive", "18": "bg-foreground" },
    size: { sm: "h-5 min-w-5 px-1 text-[10px]", md: "h-7 min-w-7 px-1.5 text-xs" },
  },
  defaultVariants: { rating: "L", size: "md" },
});
export type AgeRatingValue = "L" | "10" | "12" | "14" | "16" | "18";
export interface AgeRatingProps extends ComponentProps<"span">, Omit<VariantProps<typeof ageRatingVariants>, "rating"> { rating: AgeRatingValue }

/** Brazilian ClassInd-style age rating. */
export function AgeRating({ rating, size, className, ...props }: AgeRatingProps) {
  const label = rating === "L" ? "Livre para todos os públicos" : `Não recomendado para menores de ${rating} anos`;
  return <span role="img" aria-label={label} title={label} className={cn(ageRatingVariants({ rating, size }), className)} {...props}>{rating}</span>;
}

/* ---------------- AI verified ---------------- */
export const aiVerifiedVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium [&_svg]:size-3.5", {
  variants: {
    status: {
      verified: "border-cyan/40 bg-cyan/10 text-cyan",
      reviewing: "border-warning/40 bg-warning/10 text-warning",
      blocked: "border-destructive/40 bg-destructive/10 text-destructive",
    },
  },
  defaultVariants: { status: "verified" },
});
export interface AIVerifiedBadgeProps extends ComponentProps<"span">, VariantProps<typeof aiVerifiedVariants> {}
const aiLabels = { verified: "Verificado por IA", reviewing: "Em análise", blocked: "Bloqueado" };

/** Automatic moderation status from the Clyro AI layer. */
export function AIVerifiedBadge({ status, className, children, ...props }: AIVerifiedBadgeProps) {
  return (
    <span className={cn(aiVerifiedVariants({ status }), className)} {...props}>
      <ShieldCheck aria-hidden />
      {children ?? aiLabels[status ?? "verified"]}
    </span>
  );
}

/* ---------------- Kids mode ---------------- */
export interface KidsModeToggleProps extends Omit<ComponentProps<"div">, "onChange"> {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
}

/** Parental control: restricts the catalog to content rated L / 10. */
export function KidsModeToggle({ enabled, onEnabledChange, className, ...props }: KidsModeToggleProps) {
  return (
    <div className={cn("flex items-center gap-4 rounded-lg border p-4", enabled ? "border-success/50 bg-success/5" : "bg-surface", className)} {...props}>
      <span className={cn("flex size-10 items-center justify-center rounded-full", enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
        <Baby className="size-5" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">Modo infantil</p>
        <p className="text-xs text-muted-foreground">{enabled ? "Só conteúdos Livre e 10 anos, verificados por IA." : "Todo o catálogo liberado para este perfil."}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label="Modo infantil" />
    </div>
  );
}

/* ---------------- Content card ---------------- */
export const contentCardVariants = cva("group overflow-hidden rounded-xl border bg-surface transition-all focus-within:shadow-glow-cyan hover:-translate-y-0.5 hover:border-cyan/40", {
  variants: { orientation: { portrait: "w-48", landscape: "w-80" } },
  defaultVariants: { orientation: "landscape" },
});
export interface ContentCardProps extends Omit<ComponentProps<"article">, "title">, VariantProps<typeof contentCardVariants> {
  title: string;
  creator: string;
  duration: string;
  rating: AgeRatingValue;
  /** Price in BRL for à la carte; omit when included in subscription. */
  price?: string;
  cover?: ReactNode;
  verified?: boolean;
  href?: string;
}

/** Catalog item: cover, rating, duration and à-la-carte or included pricing. */
export function ContentCard({ title, creator, duration, rating, price, cover, verified = true, href = "#", orientation, className, ...props }: ContentCardProps) {
  return (
    <article className={cn(contentCardVariants({ orientation }), className)} {...props}>
      <a href={href} className="block outline-none">
        <div className={cn("relative bg-gradient-tech", orientation === "portrait" ? "aspect-[2/3]" : "aspect-video")}>
          {cover}
          <div className="absolute left-2 top-2 flex gap-1.5"><AgeRating rating={rating} size="sm" /></div>
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            <Clock className="size-3" aria-hidden />{duration}
          </span>
        </div>
        <div className="space-y-2 p-3">
          <h3 className="line-clamp-1 font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{creator}</p>
          <div className="flex items-center justify-between gap-2">
            {price ? <span className="text-sm font-semibold text-gradient-brand">{price}</span> : <span className="text-xs font-medium text-cyan">Incluído no plano</span>}
            {verified && <BadgeCheck className="size-4 text-cyan" aria-label="Verificado por IA" />}
          </div>
        </div>
      </a>
    </article>
  );
}

/* ---------------- Wallet ---------------- */
export interface WalletBalanceProps extends Omit<ComponentProps<"div">, "onChange"> {
  balance: string;
  token: string;
  fiat: string;
  network: Network;
  onNetworkChange: (n: Network) => void;
}

/** Multichain rewards wallet with network selector. */
export function WalletBalance({ balance, token, fiat, network, onNetworkChange, className, ...props }: WalletBalanceProps) {
  return (
    <Card variant="glass" className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="size-4" aria-hidden />Saldo de recompensas</span>
        <NetworkTag network={network} />
      </div>
      <div>
        <p className="font-display text-3xl font-bold tracking-wide">{balance} <span className="text-base text-cyan">{token}</span></p>
        <p className="text-sm text-muted-foreground">≈ {fiat}</p>
      </div>
      <div className="flex gap-2">
        <Select aria-label="Rede" size="sm" value={network} onChange={(e) => onNetworkChange(e.target.value as Network)}>
          {Object.entries(networks).map(([k, n]) => <option key={k} value={k}>{n.label}</option>)}
        </Select>
        <Button size="sm" variant="neon"><Coins />Resgatar</Button>
      </div>
    </Card>
  );
}

/* ---------------- Earnings ---------------- */
export interface EarningsCardProps extends ComponentProps<"div"> {
  label: string;
  value: string;
  change: string;
  trend?: "up" | "down";
  points?: number[];
}

/** Creator earnings metric with sparkline. */
export function EarningsCard({ label, value, change, trend = "up", points = [4, 6, 5, 8, 7, 10, 12], className, ...props }: EarningsCardProps) {
  const max = Math.max(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 100},${30 - (p / max) * 28}`).join(" ");
  return (
    <Card className={cn("space-y-3", className)} {...props}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-end justify-between gap-4">
        <p className="font-display text-2xl font-bold">{value}</p>
        <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", trend === "up" ? "text-success" : "text-destructive")}>
          <TrendingUp className={cn("size-3.5", trend === "down" && "rotate-180")} aria-hidden />{change}
        </span>
      </div>
      <svg viewBox="0 0 100 32" className="h-10 w-full" aria-hidden preserveAspectRatio="none">
        <polyline points={d} fill="none" stroke="var(--magenta)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </Card>
  );
}

/* ---------------- Player bar ---------------- */
export interface PlayerBarProps extends ComponentProps<"div"> {
  playing: boolean;
  onPlayingChange: (v: boolean) => void;
  /** 0–100 */
  progress: number;
  current: string;
  total: string;
  quality?: string;
}

/** Video player control strip. */
export function PlayerBar({ playing, onPlayingChange, progress, current, total, quality = "4K", className, ...props }: PlayerBarProps) {
  return (
    <div className={cn("space-y-2 rounded-lg border border-cyan/20 bg-background/80 p-3 backdrop-blur", className)} {...props}>
      <div role="slider" aria-label="Posição do vídeo" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} tabIndex={0} className="h-1.5 w-full rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative h-full rounded-full bg-gradient-brand" style={{ width: `${progress}%` }}>
          <span className="absolute -right-1.5 -top-1 size-3.5 rounded-full bg-foreground shadow-glow-brand" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" aria-label={playing ? "Pausar" : "Reproduzir"} onClick={() => onPlayingChange(!playing)}>{playing ? <Pause /> : <Play />}</Button>
        <Button size="icon" variant="ghost" aria-label="Volume"><Volume2 /></Button>
        <span className="font-mono text-xs text-muted-foreground">{current} / {total}</span>
        <span className="ml-auto rounded border border-cyan/40 px-1.5 py-0.5 font-mono text-[10px] text-cyan">{quality}</span>
        <Button size="icon" variant="ghost" aria-label="Tela cheia"><Maximize /></Button>
      </div>
    </div>
  );
}
