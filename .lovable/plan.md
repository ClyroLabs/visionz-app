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
