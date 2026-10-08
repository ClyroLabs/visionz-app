# MVP: parental control with face recognition + new moderation center

## What the user will get

### 1. Parent face registration (Minha conta → Controle parental)
- Consent screen in plain words (LGPD): what is stored (a numeric "face fingerprint", **never the photo**), what it is for, how to delete it. The parent must tick a box to continue.
- Camera opens; the parent centers their face, blinks when asked (a simple "is this a real person" check) and the system captures 3 samples.
- "Delete my face data" button that erases it right away.
- Only signed-in adult accounts can register. Kids profiles never can.

### 2. Face check before sensitive changes
A camera window ("Confirm it's you") appears and must match the registered parent for:
- **Changing the max age rating** of each child profile (L, 10, 12, 14, 16, 18).
- **Turning kids mode off.**
- **Changing the daily screen time** of a child profile.
- **Approving a single-title purchase** made from a kids profile.
- After 3 failed attempts, it locks for 5 minutes. Every attempt (approved or denied) goes to an "Activity log" the parent can see.
- If the parent has no face registered yet, the screen offers to register first.

### 3. Child profiles that actually follow the rules
- Profiles saved in the account (name, max rating, daily minutes), replacing the two fixed demo profiles.
- The catalog, the Showcase and the player respect each child's max rating.
- The player counts screen time and stops with a friendly message when the daily limit ends.
- Purchases from a kids profile become "Waiting for parent approval" until the face check passes.

### 4. Modern moderation center
- **Real queue**: Synth/Jukebox creations that the AI blocked or was unsure about, plus titles reported by parents, instead of fixed examples.
- **AI explanation per item**: the AI looks at the cover, title and description and returns reasons, confidence, risk categories (violence, language, scary content, etc.) and a suggested age rating.
- **Decision**: approve (publishes with the chosen rating), block (with a note shown to the creator) or change the rating.
- **Filters**: severity, type (creation or report), status; plus a **history** tab with past decisions, who decided and when.
- **Parent reports**: a "Report" button on the player and the Showcase; the parent picks a reason and it enters the queue.
- Only accounts with the **moderator** role can open the center. I will make your account a moderator.

## Important limits (MVP)
- The face check runs on the device camera with an open-source recognition model. It is good for a first version but is **not bank-level**: a good video of the parent could fool it. Stronger liveness checks would be a later step.
- Face data is personal and sensitive under LGPD. The consent text I write will be a draft; it should be reviewed by a lawyer before launch.
- Works in browsers that allow camera access (HTTPS, permission granted).

## Technical details
- **Face recognition**: `@vladmandic/face-api` in the browser (models loaded lazily, client-only), 128-number descriptor averaged from 3 samples; blink check via eye landmarks. The photo is never uploaded.
- **Matching on the server**: `src/lib/parental.functions.ts` (`requireSupabaseAuth` + zod). `enrollFace`, `deleteFace`, `verifyFace` (Euclidean distance threshold 0.5, attempt counter and 5-min lock), returning a short-lived verification (5 min) required by `setChildRule`, `disableKidsMode`, `approvePurchase`.
- **Database (migration)**:
  - `parent_biometrics` (user_id PK, descriptor float8[], consent_at, failed_attempts, locked_until) — RLS: owner can read only consent/lock fields via a view; descriptor never returned to the browser (server reads with admin client after auth).
  - `child_profiles` (id, user_id, name, max_rating, daily_minutes) — owner-only RLS.
  - `parental_events` (user_id, action, result, created_at) — owner read, server insert.
  - `purchase_requests` (child_profile_id, title_id, status pending/approved/denied).
  - `content_reports` (reporter_id, title_ref, reason, status).
  - `moderation_decisions` (target, decision, rating, note, moderator_id, created_at).
  - `creations.status` gains `review`; AI-uncertain publications go to `review` instead of straight to published/blocked. `creations.ai_analysis jsonb` stores the explanation.
  - `user_roles` table + `app_role` enum (`moderator`) and `has_role()` security-definer function; moderation server functions check it.
- **AI analysis**: `openai/gpt-6-astra` via Responses API with a strict JSON schema (reasons, confidence, categories, suggested rating), cover sent as image; run on publish and on demand from the center.
- **Routes**: `app.conta.tsx` new "Controle parental" tab, `app.perfis.tsx` rewritten (real profiles + face-gated rules), `app.moderacao.tsx` rewritten (queue, filters, history), report dialog in `app.assistir.tsx` and `app.vitrine.tsx`. Store gets active child profile + screen-time counter.
- **Tests**: distance threshold match/mismatch, lock after 3 failures, rating filter per child, screen-time limit, purchase from kids profile requires approval.
- Translations EN/ES/ZH for all new text.
