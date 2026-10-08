# Wallet: convert balance ⇄ $VZN and withdraw

## What the user gets
A new "Convert & withdraw" area in the Wallet with three tabs:

1. **Convert**
   - Toggle: fiat → $VZN or $VZN → fiat. A swap button flips the direction.
   - The amount field shows the user's balance and has a "Max" shortcut. Below it is a live quote: rate, 1% fee, what the user receives, and a 30-second countdown that refreshes the quote.
   - Confirming updates both balances right away and adds a "Conversion" entry to the history.
   - Example rate: 1 VZN = R$ 0,25. It is shown in the selected language's currency (R$ / US$ / € / ¥), using the same conversion the site already uses.

2. **Withdraw in money**
   - Pick the currency: BRL, USD, EUR or CNY. Then pick where it goes: a payout account already saved in My account → Payouts, or Pix.
   - Shows the minimum, fee and arrival time ("Pix: instant", "bank transfer: 1 business day"), plus a receipt with a reference number.

3. **Withdraw $VZN to my wallet (web3)**
   - **Connect wallet** uses the wallet extension installed in the browser: Phantom (Solana) or MetaMask (Base / Arbitrum / Ethereum).
   - The connection is real: it reads the real address and network, and asks the user to sign a message proving they own the wallet. If no extension is found, a link to install one appears.
   - Choose network → amount → network fee → confirm. The sending is simulated, because the $VZN contract does not exist yet. The user gets a demo transaction code, an "In progress → Confirmed" status, and a link to the network's explorer marked as an example.

Every screen keeps the "Demonstração · exemplo, não é promessa" seal, with no real money moved. All new text is translated into EN/ES/ZH.

## Rules (with tests)
- 1% conversion fee, and you can't convert more than your balance.
- Conversion minimum 1 VZN or R$ 5.
- Money withdrawal minimum R$ 50 (as in Payouts). Fee: Pix R$ 0; bank transfer R$ 3,50.
- $VZN withdrawal minimum 10 VZN. Network fee example: Solana 0,01, Base 0,05, Arbitrum 0,05, Ethereum 2 VZN.
- Kids profile: convert and withdraw are blocked, with a message to switch to the parent profile.

## Technical details
- `src/experience/convert.ts`: pure functions `quote(dir, amount, rate)`, `validateConvert`, `withdrawFiatFee`, `validateWithdrawVzn`, `fakeTxHash(chain)`; tests in `convert.test.ts`.
- `src/experience/web3.ts`: detect `window.solana?.isPhantom` / `window.ethereum`. Connect with `connect()` / `eth_requestAccounts` and `eth_chainId`, prove ownership with `signMessage` / `personal_sign`, and switch networks with `wallet_switchEthereumChain`. All imports are client-only and run only after the page loads in the browser.
- `src/experience/wallet-convert.tsx`: UI with the existing Tabs/Card/Input/Select/NetworkTag/Dialog.
- Store: add `convert(dir, amount)` and `withdrawFiat` / `withdrawVzn` to `useExperience`, and record entries in `wallet_transactions` when the user is signed in (existing table, no migration).
- Insert into `app.carteira.tsx` between the balance cards and the history.
