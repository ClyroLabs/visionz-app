# Fix: Vitrine titles don't play

## What's wrong
- All 6 sample videos in Vitrine ("O despertar", "Luzes na torre", "Código escarlate", "Nova geração", "O abismo azul", "Gigantes de luz") point to an outside video address that now refuses access (error 403). So pressing Play opens a black player that never starts.
- I checked the other titles. The music tracks still load fine. The Synth productions' images also load for any visitor, so the problem is only the sample videos.
- The player gives no feedback when a video fails, so it looks like Play is broken.

## Fix
1. **Host the sample videos ourselves.** Download two free open-licence films (Big Buck Bunny and Elephants Dream, Creative Commons, from the Blender Foundation) in a light 720p version. Store them in the platform's own file storage under the demo creator's folder, and point the 6 sample titles at them. They won't depend on outside sites any more.
2. **Clear error state in the player.** If any video, music track or AI clip fails to load, show "Não foi possível carregar a mídia" with a "Tentar de novo" button instead of a silent black screen. This works in all 4 languages.
3. **Loading state.** Show a spinner while the video is buffering after Play.
4. **Verify.** Open Vitrine with an automated browser as a signed-in user and as a visitor. Press Play on a video, a Synth production and a track, and confirm each one actually plays (time moves forward).

## Technical details
- New migration updates `creations.data` for the demo rows: it removes `video_url` and sets `video_path` to `00000000-0000-4000-8000-0000000000de/video/{bbb,ed}-720.mp4`, uploaded to the `creations` bucket. The existing public-read policy already allows `data->>'video_path'` of published creations.
- If uploading to the bucket isn't possible, the fallback is a Lovable Assets URL in `video_url`.
- `useVideoSrc` keeps its current priority (external URL first, then signed path).
- `VideoWatch` / `TrackCard` / `MotionFrame` get `onError` / `onWaiting` / `onPlaying` handlers. A small `MediaError` overlay goes in `title-details.tsx`.
- New PT strings get EN/ES/ZH entries in dict.ts.
