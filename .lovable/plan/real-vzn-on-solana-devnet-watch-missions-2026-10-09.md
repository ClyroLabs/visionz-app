# Real $VZN on Solana devnet: watch + missions

Goal: when a signed-in adult user finishes a title or claims a mission, real devnet $VZN lands in their Phantom wallet, with a link to the transaction on Solana Explorer. Everything else (presale, conversion, Base/Arbitrum) stays sandbox.

## What the user will see
- Wallet page: "Connect Phantom (devnet)" card. Connect once, sign a short message to prove the wallet is yours, and it's saved to your account.
- Missions card and "title completed" notice: after a claim, a status shows "Sending…" then "Sent on devnet" with a "View on Solana Explorer" link.
- New "On-chain history" list in the Wallet: amount, reason, date, explorer link.
- Clear label everywhere: "Solana devnet · test tokens, no real value".
- Kids profiles: still XP only, no token sends.

## How it works
1. **Create the token (one-time, by me):** a script creates the $VZN token on devnet (9 decimals) and a VisionZ reward wallet funded with free devnet SOL, then mints a reward pool (e.g. 1,000,000 test $VZN). The reward wallet's private key is saved as a backend secret; the token address is public and goes in the code.
2. **Watch tracking on the server:** the player reports progress every ~30 s (only while playing, visible and unmuted, same rules as today). A title counts as completed at 80%, checked from these server records — not from the browser's word.
3. **Claiming:** missions and completions call the server. The server checks: signed in, not kids, wallet linked, mission actually done, not already claimed, and the existing daily cap (5 $VZN/day; 7-day streak bonus outside the cap). Amounts reuse the current rules (completion 0,5, mission 1 × level multiplier).
4. **Sending:** the server signs a token transfer from the reward wallet to the user's wallet (creating their token account if needed), records it in a ledger, and returns the transaction id. Failures are recorded and can be retried; nothing is ever paid twice (unique claim key).
5. **Limits/safety:** per-user and per-wallet daily caps, a global daily ceiling for the pool, and a pause switch.

## Technical details
- Migration: `wallet_links` (user_id, address, verified_at; one wallet per user, address unique), `watch_sessions` (user_id, title_ref, seconds, duration, updated_at), `vzn_rewards` (user_id, claim_key unique, source, amount, status pending/sent/failed, signature, created_at). RLS own-row SELECT; writes only via server functions with admin client after auth.
- Secrets: `VZN_DEVNET_TREASURY_KEY` (base58 secret key, set via generated value from the setup script), `SOLANA_DEVNET_RPC` (default `https://api.devnet.solana.com`).
- Libraries: `@solana/kit` + `@solana-program/token` (fetch-based, works on Cloudflare Workers; avoid Node-only `@solana/web3.js` internals), `tweetnacl`/`@noble/ed25519` for wallet signature verification.
- `src/lib/vzn-devnet.server.ts` (build/sign/send transfer, ATA creation), `src/lib/vzn-rewards.functions.ts` (`linkWallet`, `reportWatch`, `claimReward`, `listOnchainRewards`) with `requireSupabaseAuth`.
- Client: `web3.ts` gains `signMessage`; `store.tsx` claim functions call the server and fall back to clear errors; `rewards-ui.tsx` and `app.carteira.tsx` show status + explorer links. New PT strings + EN/ES/ZH in dict.
- Tests: claim rules (kids blocked, cap 5/day, streak outside cap, duplicate claim rejected, 80% completion threshold).
- Verification: run a real devnet transfer end-to-end with a test wallet address and confirm it on Explorer; update AGENTS.md (devnet path real, rest sandbox).

## Notes
- Devnet SOL faucet can be rate-limited; if so I'll retry or ask you to fund the reward wallet address from faucet.solana.com.
- Phantom must be switched to devnet by the user to see the tokens (I'll add a short hint).
