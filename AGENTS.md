# AGENTS

- Design-system code lives in `src/vizionz/` (components, lib, styles) and brand files in `src/assets/logos/`; all exported via `src/index.ts` — keeps the library self-contained for file-copy attach.
- Showcase lives in `src/showcase/` + `src/routes/*`, excluded via `.dsignore` — preview-only, never shipped to consumers.
- Tokens are CSS variables in `src/vizionz/styles/theme.css` mapped with Tailwind v4 `@theme inline`; dark default, `.light` class for light — single canonical theme entry.
- Components use CVA variant maps, no extra UI deps (native dialog/select) — keeps consumer install light.
- Scroll reveals use CSS scroll-driven animations (`reveal-*` in theme.css) with visible fallback — content never hidden if JS or support is missing.
- UI translation is a DOM-level translator (`src/experience/i18n/`) keyed by the exact PT-BR source text in `dict.ts`; PT stays the authoring language — new PT strings need a matching dict entry or they render untranslated.
- Synth multilingual text lives in `creations.data.i18n[lang]`, filled at generation or lazily by `translateCreation` and cached — viewers never pay repeat AI calls.
- Synth scene motion is CSS camera keyframes (`cam-*` in styles.css) with optional per-click AI clips via `synthClipStart/Status` stored in the creator's folder — zero-cost preview by default.
- Launchpad presale contributions are client-only demo state (`vz-presale` localStorage, `src/experience/presale.ts`) — prototype, no real funds or DB writes.
- Catalog metadata (genres, origin, series/season/episode, chapters, album) lives in `creations.data.meta`, normalized by `src/lib/catalog-meta.ts` — no extra tables; missing fields simply hide UI sections.
- Toast container is a `popover="manual"` element re-shown on each toast so notices sit above native `<dialog>` modals in the top layer.
- Real $VZN rewards (watch completion + 2 daily missions) are SPL transfers on Solana devnet from a server-held reward wallet (`src/lib/vzn-devnet.server.ts`, `@solana/kit` for Workers); claims are decided server-side from `watch_sessions` by `src/lib/vzn-rules.ts` and recorded in `vzn_rewards` with a unique claim key — browser state can't mint tokens or pay twice. Everything else Web3 stays sandbox.
