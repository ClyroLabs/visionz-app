# VisionZ Design System

VisionZ is a blockchain multiplatform for audiovisual creation and on-demand / à-la-carte streaming, with a multichain, gamified rewards ecosystem and AI-moderated content (safe for children). Technology layer: Clyro Labs. Product language: Brazilian Portuguese.

## Identity
- Futuristic, premium, energetic — never cartoonish. Dark-first (near-black with a violet tint), light as a design element: neon glow, diagonal light streaks (`bg-light-streaks`), stage glow (`bg-stage-glow`), wet-floor reflection (`floor-reflection`), gradient orbit (`<OrbitRing/>`).
- Type: big hero words in `text-metallic`, wide-tracked uppercase labels via `<Eyebrow/>` (`label-eyebrow`), short gradient underline `underline-brand`. Highlighted cards use `border-gradient-brand` (`Card variant="featured"`).
- Two accent energies, each with a job:
  - **Brand gradient** (`bg-gradient-brand`, `text-gradient-brand`: indigo → violet → magenta → ember → gold) = creation, primary actions, earnings, prices.
  - **Cyan** (`cyan`, `shadow-glow-cyan`) = technology, focus, network, safety/AI.
- Don't mix both energies in one small control.

## Setup
```css
/* styles.css */
@import "tailwindcss";
@import "./design-system/vizionz/vizionz/styles/theme.css";
```
Load fonts in the document head: Orbitron (500–800), Inter (400–700), JetBrains Mono (400–500). Dark is default; add `.light` to `<html>` for light theme. Mount `<ToastProvider>` once to use `useToast()`.

## Hard rules
- Use tokens only (`bg-surface`, `text-muted-foreground`, `border-border`, `text-cyan`…). Never raw hex/rgb, never inline `style` for colors/spacing.
- Headings use `font-display` with `tracking-wide`; body uses `font-sans`; addresses, hashes, durations use `font-mono`.
- Logos: always `<Logo brand="vizionz|clyro|clyro-labs-ai|clyro-icon" />`. Never redraw, recolor, or generate substitutes. Use `brand="vizionz"` on light backgrounds, `brand="vizionz-transparent"` on dark ones, and `brand="visionz-symbol"` (VZ symbol) for compact headers and app icons. Animate with `<Reveal>` / `<CountUp>` and the `animate-*` utilities; all motion is disabled under reduced-motion.
- Every content item shows `AgeRating`; show `AIVerifiedBadge` where moderation status matters. Kids-facing screens must respect `KidsModeToggle` (only L / 10).
- Prices in BRL (`R$ 9,90`). Rewards token is `$VZN` — use `<TokenBadge/>` for the medallion, `NetworkTag` for its chain.
- Never promise guaranteed returns in copy; say "recompensas" / "ganhos no ecossistema".

## Components
Compose existing components (see `components.md`) before writing new ones. Variants via `variant` / `size` props — no one-off booleans. Accept `className`, spread props.

## Accessibility
Semantic elements (`button`, `a`, `label`), visible focus (`focus-visible:ring-ring`), `aria-label` on icon-only buttons, AA contrast — use the foreground token paired with its background.

## Responsive
- Mobile-first. Below 1024px, card, stat and heading content is centered — wrap the page in `responsive-center`; desktop keeps start alignment.
- Navigation below 1024px uses `<MobileNav>` (full-screen panel that fits one screen; `layout="grid"` for icon tiles). Never a horizontally scrolling link row.
- Display type scales with `clamp()`; never let a page scroll sideways (`overflow-x-clip` on the page root, `min-w-0` on grid items).
