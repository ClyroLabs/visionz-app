# VizionZ Entertainment — Guidelines

## Components

The design system exports these components — import them from `@ws-dsemu75buanfvmj07xd6/80f50366-df9f-44b1-8a4e-23a11b0357e9` and compose them before building anything from scratch:

`AIVerifiedBadge`, `AgeRating`, `Avatar`, `Badge`, `Button`, `CardDescription`, `CardTitle`, `Card`, `Checkbox`, `ContentCard`, `CountUp`, `Dialog`, `EarningsCard`, `Eyebrow`, `Input`, `KidsModeToggle`, `Label`, `Logo`, `Menu`, `ModerationItem`, `NetworkTag`, `OrbitRing`, `PlayerBar`, `PricingCard`, `Progress`, `Reveal`, `SectionHeading`, `Select`, `Skeleton`, `Stat`, `Switch`, `TabsContent`, `TabsList`, `TabsTrigger`, `Tabs`, `Timeline`, `ToastProvider`, `TokenBadge`, `Tooltip`, `WalletBalance`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-dsemu75buanfvmj07xd6/80f50366-df9f-44b1-8a4e-23a11b0357e9/vizionz/styles/theme.css` (source — preferred import)
- `@ws-dsemu75buanfvmj07xd6/80f50366-df9f-44b1-8a4e-23a11b0357e9/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

