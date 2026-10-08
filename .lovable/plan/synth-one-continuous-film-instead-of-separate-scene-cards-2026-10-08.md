# Synth: one continuous film instead of separate scene cards

## Goal
Every creation plays as one smooth film with no pauses, blank frames or hard restarts between scenes. The page that lists scenes one by one as separate boxes becomes an editor: a large player on top with a timeline strip below it.

## What the user will see

**1. Continuous player (Synth preview and Vitrine)**
- One player for the whole film. Scenes blend into each other: the next scene starts moving *before* the current one ends, so there is never a still or empty frame.
- The camera never stops. Each move (zoom, pan, orbit, parallax) carries into the crossfade, and the next move picks it up.
- All images and clips load ahead of time, so nothing goes blank or flashes while loading.
- Subtitles fade between scenes instead of jumping.
- One progress bar for the whole film that you can click or drag to jump around (no more per-scene segments). Shows elapsed and total time, with a loop option.
- Fullscreen button.
- Scene transitions become blends: "Fusão" (smooth crossfade), "Cortina" (soft sweep with movement) and "Corte" (a fast cut timed to the camera move, never a freeze).

**2. Synth page turned into an editor**
- Once the script exists, the film plays at the top straight away, using the scenes that are ready so far.
- The grid of separate scene cards goes away. In its place is a thin timeline strip of small thumbnails, each as wide as its scene is long, with the transitions marked between them.
- Clicking a thumbnail jumps the player to that scene and opens one compact editing panel (camera, duration, transition, narration, generate image or clip). Changes show up in the player right away.
- Scenes still being generated show a moving placeholder in the film, so playback keeps going.

**3. Vitrine and "Minhas produções"**
- Film cards play a short silent loop of the actual film when you hover them or scroll them into view, instead of showing a still cover. Clicking opens the full player.

**4. "Baixar filme" (no AI cost)**
- Saves the whole film as one video file, made in the browser from the images or clips, the camera moves and the blends. It is labelled a preview export. 2K/4K/8K stay a demonstration.

## Saving AI credits
- No new AI calls. The motion and blends cost nothing and run on the device.
- AI clips are still made only when you click "Gerar clipe com IA" on a scene.

## Technical details
- `src/experience/film-engine.ts` (pure): `buildTimeline(scenes, overlap=0.8s)` returns start/end/overlap for each scene, plus `sceneAt(t)`, `layerState(t)` (opacity, transform progress per layer) and `filmDuration`. Unit tests in `film-engine.test.ts` cover the total length with overlaps, the active layers at a boundary, and seeking.
- `scene-motion.tsx`: rewrite `FilmPlayer` around one `requestAnimationFrame` clock. All scene layers are mounted and preloaded (`img.decode()`, `<video preload="auto">`), the 2 active layers render with opacity and transform worked out from the clock (camera keyframes as JS functions, not restarting CSS animations), and clips are seeked and played in sync. Scrubbable `<input type="range">`, loop, fullscreen API, `prefers-reduced-motion` respected. Keep `MotionFrame` for thumbnails.
- `film-export.ts`: draw the same clock onto a canvas, record it with `MediaRecorder` and download it as WebM.
- `app.synth.tsx`: replace the scene card grid with a `FilmPlayer` (controlled `seekTo`) + `SceneTimeline` + `SceneEditor` panel.
- `app.vitrine.tsx` and the library cards: an `IntersectionObserver` or hover starts a muted mini `FilmPlayer`.
- New PT strings get EN/ES/ZH entries in `dict.ts`. Subtitles keep `data-no-translate`.
