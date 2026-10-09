# Moderation: human review flow, false negatives and accuracy (honest)

## Facts checked in the project
- The AI publishes on its own only when it is at least 75% confident. Below that, the item goes to the moderation queue and a human moderator approves it, blocks it or changes its rating.
- Parents can report any title. The report enters the same queue, and every decision is logged (who decided, when, what).
- **No accuracy metric has been measured yet.** In the database there are 0 moderation decisions, 0 AI analyses saved and 1 parent report. Any accuracy number would be made up.

## What will change

### 1. Safety page on the site (Security)
- New block, **"When the AI gets it wrong"**, with one sentence in the form:
  "If the AI is less than 75% sure, a human moderator reviews it before publishing. If something inappropriate gets through, any parent can report it, the title is pulled from kids profiles right away, and the moderator's decision retrains the filter."
- Accountability: "VisionZ is responsible for what is published; the moderation team reviews every report."
- Honest accuracy line: "Accuracy metric: not yet measured. We'll publish it after the closed beta (target: report rate below X per 1,000 views)", with no invented number.
- Remove or soften the claims that don't hold up today: "< 200ms per frame", "100% of the catalog checked" (keep only "every publication goes through the filter"), and "photos or videos can't fool it" (the face check isn't bank-level).

### 2. Real quick-protection rule (small code change)
- When a parent reports a title, it is **hidden from kids profiles immediately** until a moderator decides. This makes the sentence above true.

### 3. Moderation center
- A simple counter at the top: decisions made, reports received, and the share of AI calls overturned by humans ("not enough data" while there are fewer than 30 decisions). This becomes the real metric over time.

### 4. Ready-to-paste text for judges (about 450 characters)
"When the AI is less than 75% confident, a human moderator reviews the title before it's published. If something inappropriate slips through, any parent can report it; the title is hidden from kids profiles immediately, a moderator decides, and that decision retrains the filter. VisionZ is responsible for what's published. Accuracy hasn't been measured yet; we'll publish it after the closed beta."

## Technical details
- `site.seguranca.tsx`: new section plus updated stats and bullet text, with EN/ES/ZH dictionary entries.
- New migration: `content_reports` gets `title_ref`-based hiding through a security-definer function `is_title_reported(title_ref)`. Catalog, Vitrine and player filter it out when a kids profile is active (`store.tsx` / `logic.ts`).
- `moderation.functions.ts`: `getModeration` returns the counts plus the overturn rate (decisions where the human differed from `ai_analysis.allowed`).
- Test: a reported title is hidden for kids until a decision; the overturn rate returns "insufficient" when there are fewer than 30 decisions.
