/** Shared, client-safe rules for Clyro Synth and Clyro Jukebox. */
export const AGE_RATINGS = ["L", "10", "12", "14", "16", "18"] as const;
export type Age = (typeof AGE_RATINGS)[number];

export const CAMERAS = ["zoom-in", "zoom-out", "pan-left", "pan-right", "tilt-up", "orbit", "parallax"] as const;
export type Camera = (typeof CAMERAS)[number];
export const TRANSITIONS = ["cut", "fade", "wipe"] as const;
export type Transition = (typeof TRANSITIONS)[number];
export const ASPECTS = ["16:9", "9:16", "1:1", "4:3", "21:9"] as const;
export type Aspect = (typeof ASPECTS)[number];
export const RESOLUTIONS = ["2K", "4K", "8K"] as const;
export type Resolution = (typeof RESOLUTIONS)[number];
export const LANGS = ["pt", "en", "es", "zh"] as const;
export type BoardLang = (typeof LANGS)[number];

export interface Scene { title: string; description: string; narration: string; image_prompt: string; camera: Camera; duration_sec: number; transition: Transition }
/** Text-only copy of a storyboard in one language. */
export interface BoardText { title: string; logline: string; scenes: { title: string; description: string; narration: string }[] }
export interface Storyboard { title: string; logline: string; scenes: Scene[]; lang?: BoardLang; i18n?: Partial<Record<BoardLang, BoardText>> }

const oneOf = <T extends string>(list: readonly T[], v: unknown, fb: T): T => ((list as readonly string[]).includes(String(v)) ? (String(v) as T) : fb);

export function normalizeText(raw: unknown, sceneCount: number): BoardText | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const scenes = (Array.isArray(r.scenes) ? r.scenes : []).slice(0, sceneCount).map((s) => {
    const o = (s ?? {}) as Record<string, unknown>;
    return { title: str(o.title, 80), description: str(o.description, 500), narration: str(o.narration, 400) };
  });
  const title = str(r.title, 100);
  return title ? { title, logline: str(r.logline, 300), scenes } : null;
}

/** Picks the text for `lang`, falling back to the original per field. */
export function localizeBoard(b: Storyboard, lang: string): BoardText {
  const t = (b.lang ?? "pt") === lang ? undefined : b.i18n?.[lang as BoardLang];
  return {
    title: t?.title || b.title, logline: t?.logline || b.logline,
    scenes: (b.scenes ?? []).map((s, i) => ({ title: t?.scenes[i]?.title || s.title, description: t?.scenes[i]?.description || s.description, narration: t?.scenes[i]?.narration || s.narration })),
  };
}

/** Total film length in seconds. */
export const filmLength = (scenes: { duration_sec?: number }[]) => scenes.reduce((n, s) => n + (s.duration_sec ?? 5), 0);

export interface Note { n: number | null; d: number } // midi pitch (null = rest), duration in beats
export interface Composition {
  title: string; lyrics: string; bpm: number; key: string; mood: string;
  chords: string[]; melody: Note[]; tags: string[];
}

const str = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function normalizeStoryboard(raw: unknown, sceneCount: number): Storyboard {
  const r = (raw ?? {}) as Record<string, unknown>;
  const scenes = (Array.isArray(r.scenes) ? r.scenes : [])
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return { title: str(o.title, 80), description: str(o.description, 500), narration: str(o.narration, 400), image_prompt: str(o.image_prompt, 800),
        camera: oneOf(CAMERAS, o.camera, "zoom-in"), duration_sec: clamp(Math.round(Number(o.duration_sec) || 5), 3, 8), transition: oneOf(TRANSITIONS, o.transition, "fade") };
    })
    .filter((s) => s.description || s.image_prompt)
    .slice(0, clamp(sceneCount, 1, 8));
  const n = scenes.length;
  const i18nRaw = (r.i18n ?? {}) as Record<string, unknown>;
  const i18n: Partial<Record<BoardLang, BoardText>> = {};
  for (const l of LANGS) { const t = normalizeText(i18nRaw[l], n); if (t) i18n[l] = t; }
  return { title: str(r.title, 100, "Sem título") || "Sem título", logline: str(r.logline, 300), scenes, lang: "pt", i18n };
}

const CHORD = /^[A-G](#|b)?(m|maj7|m7|7|sus2|sus4|dim)?$/;

export function normalizeComposition(raw: unknown): Composition {
  const r = (raw ?? {}) as Record<string, unknown>;
  const melody = (Array.isArray(r.melody) ? r.melody : [])
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      const n = o.n === null ? null : Number(o.n);
      const d = Number(o.d);
      return { n: n === null || Number.isNaN(n) ? null : clamp(Math.round(n), 48, 84), d: Number.isFinite(d) ? clamp(d, 0.25, 4) : 1 };
    })
    .slice(0, 128);
  const chords = (Array.isArray(r.chords) ? r.chords : []).map((c) => str(c, 8)).filter((c) => CHORD.test(c)).slice(0, 16);
  return {
    title: str(r.title, 100, "Sem título") || "Sem título",
    lyrics: str(r.lyrics, 3000),
    bpm: clamp(Math.round(Number(r.bpm) || 100), 60, 180),
    key: str(r.key, 12, "C"),
    mood: str(r.mood, 40),
    chords: chords.length ? chords : ["C", "G", "Am", "F"],
    melody: melody.length ? melody : [{ n: 60, d: 1 }, { n: 64, d: 1 }, { n: 67, d: 2 }],
    tags: (Array.isArray(r.tags) ? r.tags : []).map((t) => str(t, 24)).filter(Boolean).slice(0, 6),
  };
}

/** Final rating is the stricter of the creator's choice and the AI's. */
export function stricterRating(a: Age, b: Age): Age {
  return AGE_RATINGS[Math.max(AGE_RATINGS.indexOf(a), AGE_RATINGS.indexOf(b))];
}

export function asAge(v: unknown): Age {
  return (AGE_RATINGS as readonly string[]).includes(String(v)) ? (String(v) as Age) : "18";
}

/** Chord symbol → MIDI notes (root position, octave 3). */
export function chordNotes(symbol: string): number[] {
  const m = symbol.match(/^([A-G])(#|b)?(.*)$/);
  if (!m) return [48, 52, 55];
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1] as "C"] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  const q = m[3];
  const iv = q.startsWith("m") && !q.startsWith("maj") ? [0, 3, 7] : q === "dim" ? [0, 3, 6] : q === "sus2" ? [0, 2, 7] : q === "sus4" ? [0, 5, 7] : [0, 4, 7];
  if (q.includes("7")) iv.push(q.includes("maj") ? 11 : 10);
  return iv.map((i) => 48 + ((base + 12) % 12) + i);
}
