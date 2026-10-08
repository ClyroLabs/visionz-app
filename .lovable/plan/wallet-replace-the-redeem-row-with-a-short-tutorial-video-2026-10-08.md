# Wallet: replace the "Redeem" row with a short tutorial video

## What changes
In the Rewards card (top right of Wallet):
- **Keep:** the VZN balance, the Solana tag and the daily $VZN limit bar.
- **Remove:** the "Amount in VZN" field, the network picker and the "Redeem" button. Withdrawing VZN stays in "Convert & withdraw" below.
- **Add:** a small tutorial video player (16:9, rounded, with a cover image, play button and duration). It also has a "How to convert and withdraw" title and a link that scrolls down to "Convert & withdraw".

## The video (about 25 s, animated, no real footage)
It recreates the VisionZ screens in the same dark style, with captions on screen:
1. **Money to VZN:** type an amount, see the price and the 1% fee, then confirm.
2. **VZN to money:** the same steps in the other direction.
3. **Withdraw money:** pick the currency and Pix or bank transfer, then get a receipt.
4. **Withdraw VZN:** connect Phantom or MetaMask, choose the network and send.
5. Closing card with the VisionZ logo and "Demonstração · exemplo, não é promessa".

Captions are in Portuguese, with soft background music and no narration. Because the captions are part of the picture, the language switch can't translate them. Everything around the player (title, link, note) is translated into EN/ES/ZH.

## Technical details
- Rendered with Remotion at 1920×1080 and 30 fps, then hosted as an app asset (`.asset.json`), together with a poster frame.
- `app.carteira.tsx`: remove the redeem form and its state. Render `<video controls preload="none" poster>` inside the card. Add an anchor id on the WalletConvert section.
- Add dict.ts entries for the new strings.
- Kids profile: the video is still shown, because it's informational only.
