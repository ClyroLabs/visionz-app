# "Viajando com Trio Meninada — Ep. 1: O Piloto" in one file, in the catalog

## What you sent
- Cover: a "Viajando com Trio Meninada" title image (1920x1080).
- Opening: "Piloto do Episódio 1", 37 s.
- Scene 1, "Estilo 2D": 8 s.
- Scene 2, "Chegada em Belém": 8 s.
- Scene 3, "Gabriel aparece!": 8 s.

## Steps
1. **Organize.** Rename the files in a clear order:
   - `00-capa.jpg`
   - `01-abertura.mp4`
   - `02-cena-1-estilo-2d.mp4`
   - `03-cena-2-chegada-em-belem.mp4`
   - `04-cena-3-gabriel-aparece.mp4`
   - `05-cena-final.mp4`
2. **Create the closing scene (about 8 s).** I'll use AI to animate the cover image into a short closing shot: the logo glows, sparkles drift, and the camera pulls back slowly. Over it go the words "Fim do episódio 1", "Continua…" and "Uma produção VisionZ · Clyro Synth", with a fade to the end.
3. **Join everything into one film (about 70 s, 1280x720).** I'll put the pieces in order: opening, scene 1, scene 2, scene 3, closing. Each change between pieces gets a short 0.5 s crossfade, picture and sound, so there are no jumps. Sound levels will be evened out, and the opening's slightly different shape (1280x674) is fitted without stretching.
4. **Name it and add it to the catalog.** It will be called **"Viajando com Trio Meninada — Ep. 1: O Piloto"**:
   - Series "Viajando com Trio Meninada", Season 1, Episode 1, rated L (free for all ages, so it shows in kids mode).
   - Genres: Animação, Infantil, Aventura. Origin: Criado na VisionZ.
   - Clickable chapters: Abertura, Estilo 2D, Chegada em Belém, Gabriel aparece!, Final.
   - Your cover as the thumbnail. A short description, which I'll write and which you can edit later in "Detalhes do catálogo".
5. **Check it.** I'll open the catalog, press Play, and confirm the film plays to the end and the chapters jump to the right spots.

## Technical details
- Closing scene: `videogen--generate_video` with `starting_frame` set to the cover (16:9, about 8 s). Text overlay is done with ffmpeg `drawtext`. If AI generation fails, a slow zoom on the cover is made with ffmpeg instead.
- Join: ffmpeg scales and pads every input to 1280x720 at 24 fps, then uses an `xfade`/`acrossfade` chain, `loudnorm`, H.264 + AAC, `+faststart`.
- Hosted with lovable-assets: video and cover. A demo-catalog row goes into `creations` (tool `video`, status `published`, demo creator id), with `data.video_url`, `data.cover_url`/cover key, `duration_sec` and `meta` (series, chapters, genres). This needs a small check that `Cover` accepts a direct cover URL. If it doesn't, I'll add that.
