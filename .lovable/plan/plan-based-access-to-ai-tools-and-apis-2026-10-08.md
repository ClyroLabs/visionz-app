# Plan-based access to AI tools and APIs

## Goal

Each plan unlocks only some AI tools and APIs, each with a monthly limit. No plan gets everything, and no plan is unlimited. Limits are checked on the server, so they can't be bypassed from the browser.

## Plans and limits (suggested, editable)

Monthly limits, reset on the 1st:

```text
                         Free/À la carte  Premium   Family    Criador Pro
Price                    R$ 0             R$ 29,90  R$ 44,90  R$ 49,90
Synth scripts            2                10        15        60
Synth scene images       6                40        60        300
Synth AI clips           -                -         2         20
Max export               2K               4K        4K        8K
Jukebox songs            2                10        15        60
Jukebox AI description   2                10        15        60
"Analyze with AI"        -                -         -         30
(moderation)
Developer APIs           -                -         -         yes
API calls per day        -                -         -         500
Test keys                -                -         -         2
```

- Kid profiles: no AI creation, only watching (as today).
- Automatic safety checks when publishing never count toward any limit.
- Free translations of creations (already cached) never count either.
- Clips are the most expensive item, so only Family gets a small taste and only Criador Pro gets a real amount.
- The number of screens per plan was missing from the list of available features.

## What the user will see

- **My account → Plano e uso:** current plan, a bar per tool ("Synth images 12/40"), reset date, and a plan switcher (demonstration, no real charge, labelled "Demonstração · exemplo, não é promessa").
- **On each AI button** (Criar filme, Gerar imagem, Gerar clipe, Compor, etc.): a small "3 left this month" note. Once a limit is reached, the button is locked with an "Upgrade to …" link that names the cheapest plan that unlocks it.
- **Locked features** (clips on Premium, APIs below Criador Pro): a lock badge and short upgrade card instead of the button.
- **Launchpad APIs and the API panels** in Jukebox, Synth and Moderation: test keys and calls only on Criador Pro, with the daily counter shown. Other plans see the panel with instructions plus an upgrade card.
- **Export 2K/4K/8K:** options above the plan's limit are greyed out with a lock.
- All new text translated to EN/ES/ZH.

## Technical details

- Migration: `subscriptions` (user_id, plan enum `free|premium|family|creator_pro`, updated_at) and `ai_usage` (user_id, feature, period `YYYY-MM`, count), with RLS so users can read only their own rows. No direct writes from clients. A SECURITY DEFINER function `consume_quota(feature)` atomically checks the limit and increments, returning remaining or raising `quota_exceeded`. Default plan on first use: `free`.
- `src/lib/plans.ts` (shared, pure): `PLANS`, `LIMITS[plan][feature]`, `canUse`, `remaining`, `cheapestPlanFor(feature)`, `maxResolution`. Tests in `plans.test.ts`: no plan is unlimited, free has no clips or APIs, only creator_pro has APIs and 8K, cheapestPlanFor("clip") = family, and the check refuses once the count reaches the limit.
- Server: `src/lib/quota.server.ts` `requireQuota(supabase, feature)` is called at the top of synthStoryboard, synthSceneImage, synthClipStart (not status polling), jukeboxCompose, jukeboxDescribe, analyzeCreation, and a new `apiCall` server function used by the API playground. Refused calls return a typed `quota_exceeded` / `plan_locked` error that the UI turns into the upgrade card. The blocked call is never billed.
- `src/lib/plans.functions.ts`: `getPlanUsage` (plan + counts) and `setPlan` (demonstration switcher, authenticated, own row only), plus `issueApiKey`, which enforces the key limit per plan.
- UI: a `usePlan()` hook (query), and `QuotaHint` and `PlanGate` components used in app.synth, app.jukebox, app.moderacao, api-playground and api-access. A "Plano e uso" tab in app.conta.
- Memory: save the plan/limit table as a business rule.