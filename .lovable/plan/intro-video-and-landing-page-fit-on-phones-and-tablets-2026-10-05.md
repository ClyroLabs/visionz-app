# Intro video and landing page fit on phones and tablets

## What I found
- **Landing on phones:** the page is wider than the screen. On a 360 px phone it measures 500 px, so everything slides sideways and looks cut off. The cause is the new language switcher, which sits in the same header row as the logo, the "Protótipo" button and the menu button, and pushes them off the screen. Tablets (768 px) have the same problem, plus some background glow and carousel cards that spill past the edge.
- **Intro delay:** the four intro videos are saved in a way that makes the browser download the whole file before it can start playing. They are also sent at the same size (1280 × 720) to every screen.
- **Intro framing:** the video is horizontal. On a vertical phone it fills the screen by cropping the sides, so the VisionZ name and the action can be cut off.

## What changes
1. **Header (phones and tablets)**
   - The language switcher moves into the ☰ menu on phones, shown as a row at the top of the panel. From tablet size up it stays in the header, in a smaller version.
   - The logo, the "Protótipo" button and ☰ always fit on one line.
   - The prototype menu and the login page get the same treatment.
2. **Fit on every page:** I'll go through Início, Criadores, Segurança, Investidores, the intro, login and the prototype pages at 360, 390, 768 and 1024 px. Anything that spills over gets fixed: background glows, the orbit ring, carousel cards, tables, long words and the button rows. Nothing should cut off or slide sideways.
3. **Faster intro**
   - The videos are re-saved so they start playing almost right away, while the rest keeps downloading.
   - Phones get a lighter version, about half the size.
   - A dark screen with the VisionZ symbol shows while the video loads, so the screen is never blank.
4. **Intro framing on phones**
   - On a vertical screen the whole video stays visible, centered with no cropping.
   - A soft blurred copy of the same video fills the empty space above and below.
   - Landscape screens keep the full-screen look.
   - The Skip, sound and language buttons get larger touch areas and stay clear of the phone's notch and the bottom bar.

## How I'll check it
Screenshots at 360, 390, 768 and 1024 px for each page, plus an automatic check that no element extends past the screen edge. I'll also confirm the intro starts within about a second on a simulated mobile connection.

## Technical details
- Re-encode with ffmpeg `-movflags +faststart` (moov atom currently at end of file). Add 540p versions (`intro-{lang}-540.mp4`) and pick them with `<source media="(max-width: 767px)">`. Upload with lovable-assets and delete the replaced pointers.
- Intro layout: `object-contain` on portrait (`portrait:` variant), a blurred `object-cover` background copy, `poster`, `preload="auto"`, `100dvh`, `env(safe-area-inset-*)` padding on the controls.
- Header: `grid-cols-[minmax(0,1fr)_auto_auto]` with `min-w-0`; `LanguageSwitcher` gets a `size` variant and is rendered inside the mobile menu below `md`.
- Global guard: `overflow-x: clip` on the site and app wrappers, so a decorative layer can never widen the page. Real overflow causes still get fixed individually; the guard doesn't hide them.
