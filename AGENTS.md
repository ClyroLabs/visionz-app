# AGENTS

- Design-system code lives in `src/vizionz/` (components, lib, styles) and brand files in `src/assets/logos/`; all exported via `src/index.ts` — keeps the library self-contained for file-copy attach.
- Showcase lives in `src/showcase/` + `src/routes/*`, excluded via `.dsignore` — preview-only, never shipped to consumers.
- Tokens are CSS variables in `src/vizionz/styles/theme.css` mapped with Tailwind v4 `@theme inline`; dark default, `.light` class for light — single canonical theme entry.
- Components use CVA variant maps, no extra UI deps (native dialog/select) — keeps consumer install light.
