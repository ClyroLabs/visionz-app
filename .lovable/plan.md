# VisionZ hackathon pitch deck (8 slides, English, PDF)

A 16:9 PDF in the VisionZ look: dark violet base, brand gradient, Orbitron headings with Inter body text, and the real VisionZ and Clyro Labs logos. Every slide that shows the product uses real screenshots of the prototype.

## Slides
1. **Cover.** "VisionZ: create, stream and earn, safely." It has the logo, a one-line pitch, "Powered by Clyro Labs" and the hackathon tag.
2. **Problem and solution.**
   - Problem: creators lose up to 70% of revenue to middlemen and wait about 90 days to get paid, and kids' content is hard to keep safe.
   - Solution: one platform for AI creation, on-demand and pay-per-title streaming, AI moderation and $VZN rewards.
3. **Product tour 1: watch and stay safe.**
   - Screenshots: the Vitrine catalog (series, episodes and chapters), the title details window, and parental control (face check plus kids mode).
   - Each screenshot has a short caption explaining what it does.
4. **Product tour 2: create with AI.**
   - Screenshots: Clyro Synth (one continuous film with camera moves and formats from 2K to 8K), Clyro Jukebox, and "Publicar vídeo" with the AI rating check.
5. **Product tour 3: wallet, rewards and ecosystem.**
   - Screenshots: the Wallet (convert between fiat and $VZN, withdraw), the Launchpad presale checkout, and the APIs.
   - A note on the rewards model: watching earns XP only, and $VZN rewards are capped and budgeted.
6. **Business model.**
   - Plans: Free (R$ 0), Premium R$ 29.90, Family R$ 44.90, Creator Pro R$ 49.90. AI usage is capped per plan.
   - Other revenue: pay-per-title rentals, API usage, Launchpad fees and DeFi fees.
   - Token: $VZN on Solana, with 10% of AI usage burned and 20% of profit used for buybacks.
7. **Revenue forecast.**
   - A bar chart for years 1 to 3, using the same numbers as the site:
     - Base case (headline): R$ 3.2M, R$ 24.5M, R$ 110M.
     - Expansion upside: R$ 232M in year 3.
   - Users: 80k, 500k, 2.5M. EBITDA: -38%, +4%, +42%. Break-even around month 11.
   - The slide also shows the conversion math behind the numbers (average revenue per user and paid share), labeled "Estimates, not guarantees".
8. **Roadmap, goals and the ask.**
   - Roadmap: MVP (0–1 month), Beta (2–4 months), Production (4–5 months), then the DeFi, PaaS and DAO phases.
   - Goals for the next 12 months: concrete targets taken from the year 1 base case.
   - The ask from the hackathon: pilots, partners and mentorship. Also a link to the live demo at visionz.clyrolabs.tech.

## Realism checks
- Every number comes from the project's existing data, rounded the same way it is on the site.
- I'll check that revenue ÷ users gives a believable average revenue per user (about R$ 40 a year in year 1, and about R$ 44 a year in year 3 on the Base case), and say so on the slide.
- There are no promises of returns. APYs are only examples, and the wording says "rewards" and "earnings in the ecosystem".

## Technical details
- Screenshots: Playwright at 1600x1000, signed in as the existing test user, English language selected. They cover vitrine, the title dialog, synth, jukebox, publicar, carteira, launchpad (presale and APIs) and parental.
- The deck is built as an HTML/CSS slide sheet at 1920x1080 and printed to PDF with Chromium. Fonts are Orbitron and Inter.
- QA: convert every page to an image, inspect them all, and fix any overflow or overlap.
- Output: `/mnt/documents/visionz-pitch-deck.pdf`.
