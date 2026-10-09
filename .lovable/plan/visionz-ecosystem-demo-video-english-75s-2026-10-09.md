# VisionZ Ecosystem Demo video (English, ~75s)

An animated demo video that follows your 6-scene master prompt and uses real screens from the prototype. Delivered as an MP4 in Files; the website does not change.

## Scenes (following your script, in English)
1. **Entry (0:00–0:10)** — Real Vitrine screen with a slow dolly-in, violet light streaks, original series and the AI-verified badge.
2. **Video + XP (0:10–0:25)** — Real player with "Trio Meninada — Ep. 1". Session HUD, progress bar filling, particle burst "+10 XP".
3. **Audio + mission (0:25–0:38)** — Real Jukebox screen, pulsing cyan waveform, card "Daily Mission Complete: Watch 30 min", $VZN medallion "ready to claim".
4. **On-chain claim (0:38–0:50)** — Real Wallet screen, claim button, Phantom-style approval, "Confirmed on Solana Devnet", balance counting up, real Explorer link (public mint address).
5. **DeFi (0:50–1:05)** — Real Vaults, AI Radar and Bridge screens (Solana, Base, Arbitrum), each labeled "Sandbox demo".
6. **Close (1:05–1:15)** — Screen floating over a reflective floor, official VisionZ logo with orbit ring, "Streaming. Creation. Rewards. — Powered by Clyro Labs", visionz.clyrolabs.tech.

Footer on every scene: "Educational demo · Devnet rewards · No promise of financial returns · Kids profiles earn XP only".

## Narration (English)
English AI voice-over, using your script lines translated, with changes so the video stays accurate:
- "+50 XP" becomes "+10 XP" (the real rule: 10 XP per 10 minutes watched).
- "Without abusive middlemen… instant speed, total transparency" becomes "Claims go straight to your wallet on Solana devnet, recorded on-chain."
- "Real rewards" becomes "rewards in the ecosystem"; the vaults show "example estimates", not returns.
- The bridge and radar are presented as previews, not live features.
Subtle synthwave-style background music generated with AI, plus soft interface sounds.

## Technical details
- Remotion in `/tmp/remotion`, 1920×1080, 30 fps (60 fps doubles render time for little visual gain), h264 to `/mnt/documents/visionz-ecosystem-demo-en.mp4`.
- Screenshots captured with Playwright on localhost with the site set to English: `/app/vitrine`, `/app/assistir`, `/app/jukebox`, `/app/carteira`, `/app/cofres`, `/app/radar`, `/app/ponte`. Official logos from `src/assets/logos/`.
- Narration via Lovable AI text-to-speech, timing of scenes adjusted to the audio length.
- Checks: stills of key frames reviewed before the final render.
