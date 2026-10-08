# Launchpad: make the "Modelos" tab interactive

## Finding
The "Modelos" tab is meant to be interactive. These 5 cards are contract templates (Token SPL, Staking, Vesting linear, Royalties, Leilão), the same ones offered in step 2 of "Enviar meu projeto". Right now they only show a name and a single line of text: you can't open a card or use the template from there.

## What changes
**Card redesign:** each card gets:
- an icon
- a "Pré-auditado" badge
- the networks it works on (Solana, Base, Arbitrum, Ethereum)
- difficulty and estimated setup time
- example cost in VZN
- 2–3 short key features

The grid shows 1, 2 or 3 columns depending on screen size. Hovering or focusing a card lights it up.

**Card actions:** clicking a card opens a details window with:
- **What it does:** a plain-language explanation.
- **Settings:** fields you can edit for that template, such as supply and decimals for Token SPL, APY example and lock period for Staking, cliff and duration for Vesting, splits for Royalties, and starting bid and duration for Leilão.
- **Preview:**
  - Vesting and Staking: a simple chart.
  - Royalties: split bars.
  - Leilão: a timeline.
- **Contract example:** a short code snippet with a copy button.
- **"Usar este modelo":** switches to the "Enviar meu projeto" tab with the template and its settings already filled in.

**Filters:** chips at the top filter the templates by network.

Every screen keeps the "Demonstração · exemplo, não é promessa" badge, nothing is deployed, and all new text is translated into EN/ES/ZH. In the details window, the window takes the full screen on mobile.

## Technical details
- `defi-data.ts`: extend `templates` with id, icon, networks, level, minutes, costVzn, features, params schema, and a snippet.
- New `src/experience/template-ui.tsx` (TemplateGallery, TemplateDialog), reusing Card, Dialog, Badge, NetworkTag and Input.
- Pure helpers (vestingSchedule, stakingProjection, royaltySplit validation, so splits add up to 100%) go in `templates.ts` with tests.
- `app.launchpad.tsx`: control the tabs; `onUse(template, params)` sets the wizard draft (`template`, plus the params stored in its data) and switches to "enviar".
- Add dict.ts entries for the new strings.
