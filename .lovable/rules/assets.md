---
description: "Brand assets shipped by the VizionZ Entertainment design system (logos, icons, illustrations, photography, fonts, videos) with exact import paths. Read before adding any logo, icon, illustration, image, video, or font to the app: use these real assets instead of placeholders, stock photos, or generated images."
---

# VizionZ Entertainment — Assets

These files are copied into `src/design-system/{slug}/assets/` in this project — never generate, placeholder, or substitute an asset that exists here.

Raw files import directly, e.g. `import logo from "@/design-system/{slug}/assets/logos/logo.svg"`.
R2 pointer files (`.asset.json`) are imported as JSON — use the `url` property, e.g. `import hero from "@/design-system/{slug}/assets/hero.png.asset.json"` then `<img src={hero.url} />`.
The full machine-readable catalog lives in this library's `design-system.json` (`assets` array).

## Logos

- `@/design-system/{slug}/assets/logos/clyro-icon.svg` (svg)
- `@/design-system/{slug}/assets/logos/clyro-labs-ai.svg` (svg)
- `@/design-system/{slug}/assets/logos/clyro-logo.svg` (svg)
- `@/design-system/{slug}/assets/logos/visionz-simbolo-fundo-escuro.png` (png)
- `@/design-system/{slug}/assets/logos/visionz-symbol.png` (png)
- `@/design-system/{slug}/assets/logos/vizionz-logo-transparent.png` (png)
- `@/design-system/{slug}/assets/logos/vizionz-logo.svg` (svg)

## Videos

- `@/design-system/{slug}/assets/videos/video_de_intro.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/videos/visionz-hero-bg-720.mp4.asset.json` (mp4, R2 pointer)
- `@/design-system/{slug}/assets/videos/visionz-hero-bg.mp4.asset.json` (mp4, R2 pointer)

## Images

- `@/design-system/{slug}/assets/covers/codigo-zero.jpg` (jpg)
- `@/design-system/{slug}/assets/covers/jukebox-live.jpg` (jpg)
- `@/design-system/{slug}/assets/covers/rios-de-neon.jpg` (jpg)
- `@/design-system/{slug}/assets/covers/trio-alegria.jpg` (jpg)

