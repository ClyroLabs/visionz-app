# Clyro Synth: from still storyboards to films with motion, in every language

## Goal
- Production cards and storyboards in Vitrine follow the selected language (PT/EN/ES/ZH).
- Synth becomes a film tool: scenes move (camera moves and AI video clips), with format and resolution choices (2K to 8K).
- AI spend stays as low as possible.

## 1. Translations that follow the language
- **New productions:** the script is written once, and the same AI call also returns the titles, logline, descriptions and narration in all 4 languages. That is one call instead of four.
- **Existing productions:** the first time someone opens one in another language, the text is translated once and saved. After that it loads from the save, with no new AI call.
- The cards (title, logline, number of scenes) and the storyboard window in Vitrine show the text for the current language. Until a translation is ready, they show the original text.
- This replaces the old rule that Vitrine content stays in the creator's language. I'll update the project memory.

## 2. Scenes with motion
For each scene in Synth, the creator picks a camera move: slow zoom in, zoom out, pan left/right, tilt, orbit, or parallax. They also pick a duration of 3–8 s and a transition (cut, fade or wipe).
- **Motion preview (free):** the scene image is animated in the browser with the chosen move, then each scene plays in order with narration subtitles, like a film. It uses no AI.
- **AI clip (optional, per scene):** a button "Gerar clipe com IA" turns the scene image into a short video clip with real motion. It runs only when you click it, for one scene at a time. It's saved and reused, and never re-created by itself.
- **Vitrine:** "Assistir" plays the film. Each scene shows its AI clip if one exists, and the animated image if not.

## 3. Formats and resolution
- **Format:** 16:9, 9:16 (vertical), 1:1, 4:3 or 21:9 (cinema). The scene images and clips are made in that shape.
- **Export resolution:** 2K, 4K or 8K is saved with the production and shown on its card. The AI clips themselves come out at the video model's maximum quality, so the 2K/4K/8K setting is marked "exportação final (demonstração)". I'm not going to promise real 8K.

## 4. Saving AI usage
- **Script:** one call returns the storyboard in 4 languages, with short, capped text.
- **Translation:** existing productions are translated only when needed, once per language, and the result is saved and reused.
- **Scene images:** one per scene, as now, and reused as the starting frame of the AI clip.
- **Camera moves and transitions:** done in code, at no cost.
- **AI video clips:** only on a click, one at a time, lowest-cost setting by default, never re-generated automatically.
- A counter before each action shows how much it will use, for example "este clipe usa ~X créditos de exemplo".

## Technical details
- **`synthStoryboard`:** a strict JSON schema with `i18n: { en, es, zh }` for title/logline/scenes[].title/description/narration. `image_prompt` stays in English only, and it gets `camera` (enum), `duration_sec` and `aspect` fields. `normalizeStoryboard` is extended with tests.
- **New `translateCreation` server function:**
  - Public read path, rate-limited per creation and language.
  - Checks `data.i18n[lang]` and returns it if present.
  - Otherwise it makes one `askJson` call (gpt-6-astra, reasoning low).
  - It writes the result into `creations.data.i18n` through a narrow privileged update, and only for that key.
- **New `synthSceneClip` server function:**
  - Requires auth and runs in the background.
  - Calls `/v1/videos` with `google/gemini-omni-1.1-flash`, using the scene image as its starting frame, the camera prompt, and the shortest duration at lowest resolution.
  - Polls, then saves the MP4 to `creations/{uid}/synth/clips/`.
  - Stores `scene_clips[i]` on the creation.
  - Handles gateway 402/403/429 per the error rules.
- **Images:**
  - `synthSceneImage` gets `aspect` (16:9 / 9:16 / 1:1 / 4:3 / 21:9).
  - A new `src/experience/scene-motion.tsx` holds the Ken Burns / parallax CSS keyframe player and the sequential film player.
  - The animated scenes respect reduced-motion: they show still images if motion is turned off.
- **Language:** `useLang()` reads vz-lang. The Vitrine `SynthCard` and its dialog choose text from `data.i18n[lang]` and fall back to the original.
- **Synth page:** adds pickers for format, resolution, camera, duration and transition per scene, a cost hint, and the preview player.
- New PT strings get matching dict.ts entries, and the memory rule about Vitrine languages is updated.
