# VisionZ — by Clyro Labs

Blockchain multiplatform for audiovisual creation and on-demand / à-la-carte streaming, with a gamified multichain rewards ecosystem ($VZN) and AI-moderated, kid-safe content.

- Live: https://visionz.clyrolabs.tech
- Status: **working prototype / pre-launch.** Wallet, deposits, withdrawals, presale and Web3 flows run in **sandbox mode — no real money moves.**

## What's inside

| Area | Route | Notes |
|---|---|---|
| Marketing site | `/site/*` | Landing, creators, investors, ecosystem, security, whitepaper/litepaper |
| Intro | `/abertura` | Per-language intro video |
| Prototype app | `/app/*` | Catalog (Vitrine), watch, Synth (AI films), Jukebox (AI music), publish video, wallet, Launchpad, DeFi (credit, vaults, radar, bridge), moderation, parental profiles, account/plans |
| Design system | `/design-system`, `/cores`, `/tipografia`, `/componentes`, `/icones`, `/marca` | Preview-only showcase |

Key features:
- **Catalog:** series/seasons/episodes, chapters, watch progress, autoplay, albums; metadata in `creations.data.meta` (see `src/lib/catalog-meta.ts`).
- **AI creation:** Clyro Synth (script → storyboard → continuous film) and Clyro Jukebox (music); quota-limited per plan.
- **Child safety:** kids mode (L/10 only), parental control with face check, AI moderation before publishing.
- **Plans:** Free / Premium / Family / Creator Pro with monthly AI quotas enforced server-side (`src/lib/plans.ts`, `quota.server.ts`).
- **Rewards:** watching earns XP only; $VZN is capped and earned via missions/streaks/creation (`src/experience/rewards.ts`). Kids earn XP only.
- **Web3 (sandbox):** fiat↔$VZN conversion, Phantom/MetaMask connect, multichain Launchpad presale (Solana, Base, Arbitrum, Ethereum). Presale state is client-only (localStorage).
- **Languages:** EN (default), PT-BR, ES, ZH. PT-BR is the authoring language; translations live in `src/experience/i18n/dict.ts` keyed by exact PT text.

## Stack

- TanStack Start v1 + React 19 + Vite 7, SSR, file-based routes in `src/routes/`
- Server logic via `createServerFn`, deployed to Cloudflare Workers
- Tailwind CSS v4 (tokens in `src/vizionz/styles/theme.css`), CVA variants
- Lovable Cloud backend (Postgres with strict RLS, auth, storage bucket `creations`)
- AI through the Lovable AI Gateway

## Project layout

```
src/vizionz/        design system (components, tokens, styles)
src/experience/     app features (store, i18n, wallet, launchpad, synth engine…)
src/lib/            shared logic + server functions (*.functions.ts, *.server.ts)
src/routes/         pages
supabase/           backend config and migrations
AGENTS.md           architecture rules — read before changing structure
```

## Develop

```sh
bun install
bun run dev
bunx vitest run   # unit tests
```

Environment variables (`VITE_SUPABASE_*`) are provided by Lovable Cloud. Secrets are never committed.

## Guidelines

- Never promise guaranteed returns in copy; financial figures are labeled estimates.
- New screens with simulated money carry the "Demonstração" badge.
- New PT strings need EN/ES/ZH entries in the dictionary.
- Use the official logos via `<Logo />`; never redraw them.

© Clyro Labs
