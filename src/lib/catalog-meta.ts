// Catalog metadata (Netflix/Deezer-style) stored in creations.data.meta. Pure helpers.
export type Origin = "platform" | "external";
export type Chapter = { t: number; title: string };
export type SeriesRef = { id: string; title: string; season: number; episode: number; synopsis?: string };
export type AlbumRef = { title: string; track: number; total?: number };
export type CatalogMeta = {
  genres: string[]; ratingReasons: string[]; origin: Origin; year: number; language: string; subtitles: string[];
  series?: SeriesRef; chapters: Chapter[]; album?: AlbumRef; bpm?: number; key?: string; lyrics?: string; mood?: string;
  credits: { role: string; name: string }[]; model?: string;
};
type Item = { id: string; tool: string; title: string; created_at: string; age_rating: string; data: unknown };

const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim()) : []);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);

export function normalizeMeta(c: Item): CatalogMeta {
  const d = (c.data ?? {}) as Record<string, unknown>;
  const m = (d.meta ?? {}) as Record<string, unknown>;
  const fallbackGenres = [d.style, d.genre, d.mood].filter((x): x is string => typeof x === "string" && !!x);
  const s = m.series as Partial<SeriesRef> | undefined;
  const a = m.album as Partial<AlbumRef> | undefined;
  const origin: Origin = m.origin === "platform" || m.origin === "external" ? m.origin : c.tool === "video" ? "external" : "platform";
  const credits = Array.isArray(m.credits) ? (m.credits as { role: string; name: string }[]).filter((x) => x?.role && x?.name) : [];
  if (c.tool === "synth" && !credits.some((x) => x.role === "Ferramenta")) credits.push({ role: "Ferramenta", name: "Clyro Synth" });
  if (c.tool === "jukebox" && !credits.some((x) => x.role === "Ferramenta")) credits.push({ role: "Ferramenta", name: "Clyro Jukebox" });
  return {
    genres: arr(m.genres).length ? arr(m.genres) : [...new Set([...fallbackGenres, ...arr(d.tags)])].slice(0, 4),
    ratingReasons: arr(m.ratingReasons),
    origin,
    year: num(m.year) || new Date(c.created_at).getFullYear(),
    language: typeof m.language === "string" ? m.language : typeof d.lang === "string" ? d.lang : "pt",
    subtitles: arr(m.subtitles),
    series: s?.id && s.title ? { id: s.id, title: s.title, season: Math.max(1, num(s.season)), episode: Math.max(1, num(s.episode)), synopsis: s.synopsis } : undefined,
    chapters: (Array.isArray(m.chapters) ? (m.chapters as Chapter[]) : []).filter((x) => x && typeof x.title === "string").map((x) => ({ t: Math.max(0, num(x.t)), title: x.title })).sort((x, y) => x.t - y.t),
    album: a?.title ? { title: a.title, track: Math.max(1, num(a.track)), total: a.total ? num(a.total) : undefined } : undefined,
    bpm: num(m.bpm ?? d.tempo) || undefined,
    key: typeof (m.key ?? d.key) === "string" ? String(m.key ?? d.key) : undefined,
    lyrics: typeof (m.lyrics ?? d.lyrics) === "string" ? String(m.lyrics ?? d.lyrics) : undefined,
    mood: typeof (m.mood ?? d.mood) === "string" ? String(m.mood ?? d.mood) : undefined,
    credits, model: typeof m.model === "string" ? m.model : undefined,
  };
}

export const episodeLabel = (s: SeriesRef) => `T${s.season}:E${s.episode}`;

export type SeriesGroup<T> = { id: string; title: string; seasons: { season: number; episodes: T[] }[] };
export function groupSeries<T extends Item>(list: T[], id: string): SeriesGroup<T> | null {
  const eps = list.filter((c) => normalizeMeta(c).series?.id === id);
  if (!eps.length) return null;
  const by = new Map<number, T[]>();
  for (const e of eps) { const s = normalizeMeta(e).series!; by.set(s.season, [...(by.get(s.season) ?? []), e]); }
  const seasons = [...by.entries()].sort((a, b) => a[0] - b[0]).map(([season, episodes]) => ({ season, episodes: episodes.sort((a, b) => normalizeMeta(a).series!.episode - normalizeMeta(b).series!.episode) }));
  return { id, title: normalizeMeta(eps[0]).series!.title, seasons };
}

export function nextEpisode<T extends Item>(list: T[], c: T): T | null {
  const s = normalizeMeta(c).series; if (!s) return null;
  const flat = groupSeries(list, s.id)!.seasons.flatMap((x) => x.episodes);
  const i = flat.findIndex((x) => x.id === c.id);
  return i >= 0 && i < flat.length - 1 ? flat[i + 1] : null;
}

export function chapterAt(ch: Chapter[], t: number): Chapter | null {
  let cur: Chapter | null = null;
  for (const c of ch) if (c.t <= t) cur = c;
  return cur;
}

export function albumTracks<T extends Item>(list: T[], title: string): T[] {
  return list.filter((c) => normalizeMeta(c).album?.title === title).sort((a, b) => normalizeMeta(a).album!.track - normalizeMeta(b).album!.track);
}

/** "00:00 Title" lines → chapters. */
export function parseChapters(text: string): Chapter[] {
  return text.split("\n").map((l) => l.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})\s+(.+)$/)).filter(Boolean)
    .map((m) => ({ t: num(m![1]) * 3600 + num(m![2]) * 60 + num(m![3]), title: m![4] })).sort((a, b) => a.t - b.t);
}
export const fmtClock = (t: number) => { const s = Math.floor(t); const h = Math.floor(s / 3600); const mm = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, "0"); return `${h ? h + ":" : ""}${mm}:${String(s % 60).padStart(2, "0")}`; };

export function moreLikeThis<T extends Item>(list: T[], c: T, n = 6): T[] {
  const g = new Set(normalizeMeta(c).genres.map((x) => x.toLowerCase()));
  const sid = normalizeMeta(c).series?.id;
  return list.filter((x) => x.id !== c.id && (!sid || normalizeMeta(x).series?.id !== sid))
    .map((x) => ({ x, s: normalizeMeta(x).genres.filter((y) => g.has(y.toLowerCase())).length + (x.tool === c.tool ? 0.5 : 0) }))
    .filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map((r) => r.x);
}
