# Launchpad: complete presale contribution flow (simulated)

## Problem
- The project details window is a native modal, which the browser always draws above everything else. The "Apoio registrado" notice is a regular floating notice, so it ends up hidden behind the window.
- Clicking "Apoiar" does nothing except show that notice. There is no wallet, no token choice, no balance check and no receipt.

## What the user will see
Inside the project details window, "Apoiar (demonstração)" opens a guided checkout **in the same window**, with a step bar, a "Voltar" button and the "Ambiente de testes · nenhum valor real é cobrado" badge:

1. **Conectar carteira**: Phantom (Solana) or MetaMask (Base, Arbitrum, Ethereum), depending on the project's network. A real extension is used if one is installed, using the same connection as the Wallet. Otherwise a "Carteira de demonstração" connects with a fake address, so the flow always works.
2. **Escolher moeda**: VZN from the internal balance, plus USDC, plus the network's own coin (SOL or ETH). Each option shows a simulated wallet balance. Enter an amount, or use the quick buttons 25%, 50% and Máx. A live quote shows how many project tokens you get, the network fee, the minimum and maximum per person, and the remaining allocation.
3. **Revisar e assinar**: a summary card, then a signature popup inside the window ("Aguardando assinatura…"). It shows clear errors for not enough balance, below the minimum, above the maximum, or the round being full.
4. **Processando**: a live timeline (Enviada, then Confirmando 1/3, 2/3, 3/3, then Concluída) with a fake transaction ID and a "ver no explorador (exemplo)" link.
5. **Comprovante**: a success screen with the tokens acquired, amount paid, fee, release schedule (taken from the project's vesting) and a "Ver minhas cotas" button.

After confirming:
- The project's raised amount and backer count go up on the card and in the window right away.
- The chosen balance goes down. If VZN was used, the change appears in the Wallet history as "Apoio presale · <projeto>".
- A new **"Minhas cotas"** panel in the window, plus a "Minhas cotas" tab in the Launchpad, lists every contribution: tokens, amount paid, network, transaction ID, status and release schedule. This lets the user confirm the contribution really happened.
- Notices appear inside the window, so nothing gets hidden behind it again.
- Kids' profiles can't contribute: they see a lock message.

All amounts are examples and nothing is sent on any network. The usual "Demonstração · exemplo, não é promessa" badge stays.

## Technical details
- **Fix the hidden notice:** render the notice area inside the open modal, or switch it to a `popover` element so it sits in the top layer. The change goes in the design-system overlay, so every modal benefits.
- **New `src/experience/presale.ts`** (pure logic plus tests):
  - `PAY_TOKENS` per network: symbol, example rate to USD, fee.
  - `quote(project, token, amount)` returns tokens, fee, minimum/maximum and remaining allocation.
  - `validate` returns error codes.
  - `releaseSchedule(project, tokens)`.
  - Simulated wallet balances, seeded by address.
- **New `src/experience/presale-ui.tsx`:** `PresaleCheckout` (step state machine with simulated delays for signing and confirmations) and `MyAllocations`.
- **Contributions are saved in the browser** (`vz-presale`, per user), and the project progress shown is the base data plus the user's contributions. No database change is needed: this stays a prototype. Paying in VZN uses the existing `adjust()` in the store.
- **Reuse existing code:** `connectPhantom` and `connectEvm` from `web3.ts`, `fakeTxHash` and the explorer links from the Wallet conversion feature.
- **Launchpad:** add a "cotas" tab to the `validateSearch` tab param.
- **Translations:** all new PT-BR text gets EN/ES/ZH entries in `dict.ts`.
- **Tests:** `presale.test.ts` covers the quote math, minimum/maximum, insufficient balance, the round-full limit and the release-schedule totals.
- **Check with Playwright:** run a full contribution with the demo wallet, confirm the notice is visible, and confirm "Minhas cotas" and the progress update.

---

# Part 2: Richer production details in Vitrine (Netflix / Deezer style)

## What the user will see
Clicking any video, Synth production or song in Vitrine opens a full details page in a window.

**Header**
- Cover, title, year and duration.
- Age rating with its reasons (for example "violência leve").
- "Verificado por IA" badge.
- Genre/style chips (for example Ficção científica · Animação 3D · Cinematográfico).
- Language and subtitles.

**Origin badge**
- "Criado na VisionZ" (Synth / Jukebox / Publicar), or "Enviado pelo criador · produção externa".
- Credits: creator, tool used and AI model when applicable.

**Series (videos/Synth)**
- A season selector ("Temporada 1 ▾").
- An episode list with number, title, synopsis, duration and progress bar.
- The player title always reads "T1:E3 · <episode title>".
- "Próximo episódio" at the end, with an autoplay countdown.

**Chapters**
- A chapter list with timestamps. Clicking one jumps the player.
- The current chapter is shown above the progress bar.

**Music (Deezer style)**
- Album or single, track list with number, title and duration, plus "Faixa 2 de 8".
- Genre, mood, BPM/key when known, and lyrics.
- Full credits (composition, producer, "Gerado com Jukebox").

**More like this**
- A row of related productions with the same genre.

Cards also gain small labels: rating, origin, "3 temporadas" or "Álbum · 8 faixas", and genre.

## Publishing side
**Publish video** and the Synth/Jukebox save screens get optional fields:
- Genre/style, rating reasons and origin. Origin is automatic for in-platform tools, and "externo" for uploads.
- **Série**: create or choose a series, then set the season and episode number.
- **Capítulos**: title + time.
- **Álbum** (music): album name + track number.

Existing productions keep working. Missing data simply hides that section.

## Technical details
- No new tables. A schema-light `data.meta` on `creations` holds: `genres[]`, `ratingReasons[]`, `origin`, `series {id, title, season, episode, synopsis}`, `chapters[{t,title}]`, `album {title, track, total}`, `bpm`, `key`, `lyrics`.
- Episodes are grouped by `series.id` across the creator's published items.
- `src/lib/catalog-meta.ts` holds the pure helpers `normalizeMeta`, `groupSeries`, `episodeLabel`, `chapterAt`, `nextEpisode` and `albumTracks`, plus tests.
- `src/experience/title-details.tsx` holds `TitleDetails`, `SeasonSelector`, `EpisodeList`, `ChapterList`, `TrackList` and `CreditsBlock`. These are used by VideoCard, SynthCard and the music cards.
- A small set of seeded example series and an album, written by migration as published demo items so the selectors are visible right away.
- AI-generated text keeps `data-no-translate`. Labels get EN/ES/ZH entries.
