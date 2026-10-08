import { useEffect, useRef, useState } from "react";
import { ListMusic, Layers, Play, SkipForward, Sparkles, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AgeRating, AIVerifiedBadge, Badge, Button, Dialog, Input, Label, Select, cn, useToast, type AgeRatingValue } from "@/index";
import type { ComponentProps } from "react";
function Textarea({ className, ...p }: ComponentProps<"textarea">) { return <textarea className={cn("w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...p} />; }
import { supabase } from "@/integrations/supabase/client";
import {
  albumTracks, chapterAt, episodeLabel, fmtClock, groupSeries, moreLikeThis, nextEpisode, normalizeMeta, parseChapters,
  type CatalogMeta, type Chapter,
} from "@/lib/catalog-meta";
import { FileImage, useFileUrl, type Creation } from "./creator-ui";
import { demoCover } from "./demo-covers";

const LANG: Record<string, string> = { pt: "Português", en: "Inglês", es: "Espanhol", zh: "Chinês" };
const TOOL: Record<string, string> = { synth: "Produção", jukebox: "Música", video: "Vídeo" };

const progKey = (id: string) => `vz-prog:${id}`;
const getProg = (id: string) => (typeof localStorage === "undefined" ? 0 : Number(localStorage.getItem(progKey(id)) ?? 0));

/** Cover from storage path or bundled demo key. */
export function Cover({ c, className }: { c: Creation; className?: string }) {
  const d = c.data as { cover_key?: string };
  const demo = demoCover(d.cover_key);
  if (demo) return <img src={demo} alt={c.title} loading="lazy" className={className} />;
  if (c.cover_path) return <FileImage path={c.cover_path} alt={c.title} className={className} />;
  return <div className={cn("bg-gradient-to-br from-violet/30 via-magenta/20 to-ember/20", className)} aria-hidden />;
}

/** Video source: private file or external demo URL. */
export function useVideoSrc(c: Creation | null) {
  const d = (c?.data ?? {}) as { video_path?: string; video_url?: string };
  const signed = useFileUrl(d.video_url ? null : d.video_path);
  return d.video_url ?? signed;
}

/** Small labels for catalog cards. */
export function CardTags({ c, all }: { c: Creation; all: Creation[] }) {
  const m = normalizeMeta(c);
  const g = m.series ? groupSeries(all, m.series.id) : null;
  const album = m.album ? albumTracks(all, m.album.title).length : 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] sm:justify-start">
      <OriginBadge m={m} compact />
      {g && <span className="rounded-full border px-2 py-0.5 text-muted-foreground"><Layers className="mr-1 inline size-3" />{g.seasons.length === 1 ? "1 temporada" : `${g.seasons.length} temporadas`}</span>}
      {m.series && <span className="rounded-full border border-cyan/40 px-2 py-0.5 font-mono text-cyan">{episodeLabel(m.series)}</span>}
      {m.album && <span className="rounded-full border px-2 py-0.5 text-muted-foreground"><ListMusic className="mr-1 inline size-3" /><span>Álbum</span>{` · ${album} `}<span>faixas</span></span>}
      {m.genres[0] && <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{m.genres[0]}</span>}
    </div>
  );
}

function OriginBadge({ m, compact }: { m: CatalogMeta; compact?: boolean }) {
  return m.origin === "platform"
    ? <Badge variant="brand" size="sm"><Sparkles className="size-3" />{compact ? "Criado na VisionZ" : "Criado na VisionZ"}</Badge>
    : <Badge variant="neutral" size="sm"><Upload className="size-3" />{compact ? "Produção externa" : "Enviado pelo criador · produção externa"}</Badge>;
}

/** Full Netflix/Deezer-style details block. */
export function TitleDetails({ c, all, onSelect, onSeek, time = 0 }: { c: Creation; all: Creation[]; onSelect: (c: Creation) => void; onSeek?: (t: number) => void; time?: number }) {
  const m = normalizeMeta(c);
  const dur = (c.data as { duration_sec?: number }).duration_sec;
  const g = m.series ? groupSeries(all, m.series.id) : null;
  const [season, setSeason] = useState(m.series?.season ?? 1);
  useEffect(() => { if (m.series) setSeason(m.series.season); }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const tracks = m.album ? albumTracks(all, m.album.title) : [];
  const related = moreLikeThis(all, c);
  const curCh = chapterAt(m.chapters, time);

  return (
    <div className="space-y-5 text-left">
      <div className="space-y-2">
        {m.series && <p className="label-eyebrow text-xs"><span data-no-translate>{m.series.title}</span>{` · ${episodeLabel(m.series)}`}</p>}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{m.year}</span>
          {dur ? <span className="font-mono">{fmtClock(dur)}</span> : null}
          <AgeRating rating={c.age_rating as AgeRatingValue} />
          <AIVerifiedBadge />
          <span>{TOOL[c.tool] ?? c.tool}</span>
        </div>
        {m.ratingReasons.length > 0 && <p className="text-xs text-muted-foreground"><span>Classificação</span>{" "}{c.age_rating}{": "}<span>{m.ratingReasons.join(", ")}</span></p>}
        {m.genres.length > 0 && <div className="flex flex-wrap gap-1.5">{m.genres.map((x) => <span key={x} className="rounded-full border border-magenta/40 px-2.5 py-0.5 text-xs">{x}</span>)}</div>}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <OriginBadge m={m} />
          <span><span>Áudio</span>{": "}<span>{LANG[m.language] ?? m.language}</span></span>
          {m.subtitles.length > 0 && <span><span>Legendas</span>{": "}{m.subtitles.map((s, i) => <span key={s}>{i ? ", " : ""}<span>{LANG[s] ?? s}</span></span>)}</span>}
        </div>
        {m.series?.synopsis && <p data-no-translate className="text-sm">{m.series.synopsis}</p>}
      </div>

      {m.chapters.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between"><p className="label-eyebrow text-xs">Capítulos</p>{curCh && <span className="text-xs text-cyan" data-no-translate>{curCh.title}</span>}</div>
          <ol className="grid gap-1 sm:grid-cols-2">
            {m.chapters.map((ch: Chapter, i) => (
              <li key={i}><button type="button" onClick={() => onSeek?.(ch.t)} disabled={!onSeek}
                className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition hover:border-cyan", curCh === ch && "border-cyan bg-cyan/10")}>
                <span className="font-mono text-xs text-muted-foreground">{fmtClock(ch.t)}</span><span data-no-translate className="truncate">{ch.title}</span>
              </button></li>
            ))}
          </ol>
        </section>
      )}

      {g && (
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="label-eyebrow text-xs">Episódios</p>
            <Select aria-label="Temporada" value={String(season)} onChange={(e) => setSeason(Number(e.target.value))} className="w-auto">
              {g.seasons.map((s) => <option key={s.season} value={s.season}>{`Temporada ${s.season}`}</option>)}
            </Select>
          </div>
          <ol className="space-y-2">
            {(g.seasons.find((s) => s.season === season)?.episodes ?? []).map((e) => {
              const em = normalizeMeta(e).series!; const ed = (e.data as { duration_sec?: number }).duration_sec ?? 0;
              const pct = ed ? Math.min(100, (getProg(e.id) / ed) * 100) : 0; const cur = e.id === c.id;
              return (
                <li key={e.id}>
                  <button type="button" onClick={() => onSelect(e)} className={cn("flex w-full gap-3 rounded-lg border p-2 text-left transition hover:border-cyan", cur && "border-magenta bg-magenta/10")}>
                    <div className="relative w-28 shrink-0 overflow-hidden rounded-md">
                      <Cover c={e} className="aspect-video w-full object-cover" />
                      <span className="absolute inset-0 grid place-items-center bg-background/30"><Play className="size-5" /></span>
                      {pct > 0 && <span className="absolute bottom-0 left-0 h-1 bg-magenta" style={{ width: `${pct}%` }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline justify-between gap-2 text-sm font-medium"><span className="truncate"><span className="font-mono text-xs text-muted-foreground">{`${em.episode}. `}</span><span data-no-translate>{e.title}</span></span>{ed ? <span className="shrink-0 font-mono text-xs text-muted-foreground">{fmtClock(ed)}</span> : null}</p>
                      {em.synopsis && <p data-no-translate className="line-clamp-2 text-xs text-muted-foreground">{em.synopsis}</p>}
                      {cur && <p className="mt-1 text-[11px] text-magenta">Assistindo agora</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {m.album && tracks.length > 0 && (
        <section className="space-y-2">
          <p className="label-eyebrow text-xs"><span>Álbum</span>{" · "}<span data-no-translate>{m.album.title}</span>{" · "}<span>{`Faixa ${m.album.track} de ${m.album.total ?? tracks.length}`}</span></p>
          <ol className="divide-y rounded-lg border">
            {tracks.map((t) => { const tm = normalizeMeta(t); const td = (t.data as { duration_sec?: number }).duration_sec; return (
              <li key={t.id}><button type="button" onClick={() => onSelect(t)} className={cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/40", t.id === c.id && "bg-magenta/10 text-magenta")}>
                <span className="w-5 font-mono text-xs text-muted-foreground">{tm.album!.track}</span><span data-no-translate className="flex-1 truncate">{t.title}</span>{td ? <span className="font-mono text-xs text-muted-foreground">{fmtClock(td)}</span> : null}
              </button></li>); })}
          </ol>
        </section>
      )}

      {(m.bpm || m.key || m.mood) && (
        <dl className="grid grid-cols-3 gap-2 text-center text-xs">
          {m.mood && <div className="rounded-lg border p-2"><dt className="text-muted-foreground">Clima</dt><dd data-no-translate>{m.mood}</dd></div>}
          {m.bpm && <div className="rounded-lg border p-2"><dt className="text-muted-foreground">BPM</dt><dd className="font-mono">{m.bpm}</dd></div>}
          {m.key && <div className="rounded-lg border p-2"><dt className="text-muted-foreground">Tom</dt><dd className="font-mono">{m.key}</dd></div>}
        </dl>
      )}
      {m.lyrics && <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm">Letra</summary><p data-no-translate className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{m.lyrics}</p></details>}

      {m.credits.length > 0 && (
        <section className="space-y-1">
          <p className="label-eyebrow text-xs">Créditos</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">{m.credits.map((x, i) => <div key={i} className="flex gap-2"><dt className="text-muted-foreground">{x.role}</dt><dd data-no-translate className="truncate">{x.name}</dd></div>)}{m.model && <div className="flex gap-2"><dt className="text-muted-foreground">Modelo de IA</dt><dd className="font-mono text-xs">{m.model}</dd></div>}</dl>
        </section>
      )}

      {related.length > 0 && (
        <section className="space-y-2">
          <p className="label-eyebrow text-xs">Títulos semelhantes</p>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {related.map((r) => <button key={r.id} type="button" onClick={() => onSelect(r)} className="w-36 shrink-0 text-left"><Cover c={r} className="aspect-video w-full rounded-md object-cover" /><p data-no-translate className="mt-1 truncate text-xs">{r.title}</p></button>)}
          </div>
        </section>
      )}
    </div>
  );
}

/** Video player with chapter indicator, progress memory and next-episode autoplay. */
export function VideoWatch({ c, all, onSelect }: { c: Creation; all: Creation[]; onSelect: (c: Creation) => void }) {
  const src = useVideoSrc(c);
  const ref = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState(false);
  const [buf, setBuf] = useState(true);
  const [retry, setRetry] = useState(0);
  const m = normalizeMeta(c);
  const next = nextEpisode(all, c);
  useEffect(() => { setCount(null); setTime(0); setErr(false); setBuf(true); }, [c.id]);
  useEffect(() => {
    if (count === null) return;
    if (count <= 0) { if (next) onSelect(next); return; }
    const t = setTimeout(() => setCount(count - 1), 1000); return () => clearTimeout(t);
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps
  const ch = chapterAt(m.chapters, time);
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-lg bg-black">
        {m.series && <p className="absolute left-3 top-3 z-10 rounded bg-background/70 px-2 py-1 text-xs"><span className="font-mono">{episodeLabel(m.series)}</span>{" · "}<span data-no-translate>{c.title}</span></p>}
        {ch && <p className="absolute bottom-14 left-3 z-10 rounded bg-background/70 px-2 py-0.5 text-[11px] text-cyan" data-no-translate>{ch.title}</p>}
        {src && buf && !err && <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center"><span className="size-10 animate-spin rounded-full border-2 border-cyan border-t-transparent" aria-label="Carregando…" /></div>}
        {err && <div className="absolute inset-0 z-20 grid place-items-center bg-background/90 p-4 text-center"><div className="space-y-3"><p className="text-sm">Não foi possível carregar a mídia</p><Button size="sm" onClick={() => { setErr(false); setBuf(true); setRetry((r) => r + 1); }}>Tentar de novo</Button></div></div>}
        {src ? <video key={`${c.id}-${retry}`} ref={ref}
          onError={() => setErr(true)} onWaiting={() => setBuf(true)} onPlaying={() => setBuf(false)} onCanPlay={() => setBuf(false)} src={src} controls autoPlay playsInline className="aspect-video w-full"
          onLoadedMetadata={(e) => { const p = getProg(c.id); if (p && p < e.currentTarget.duration - 3) e.currentTarget.currentTime = p; }}
          onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; setTime(t); localStorage.setItem(progKey(c.id), String(Math.floor(t))); }}
          onEnded={() => next && setCount(5)} /> : <div className="grid aspect-video place-items-center text-sm text-muted-foreground">Carregando…</div>}
        {count !== null && next && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-background/80 p-4 text-center">
            <div className="space-y-3">
              <p className="label-eyebrow text-xs">Próximo episódio</p>
              <p className="font-display text-lg tracking-wide"><span className="font-mono">{episodeLabel(normalizeMeta(next).series!)}</span>{" · "}<span data-no-translate>{next.title}</span></p>
              <p className="text-sm text-muted-foreground">{`Começa em ${count} s`}</p>
              <div className="flex justify-center gap-2"><Button size="sm" onClick={() => onSelect(next)}><SkipForward />Assistir agora</Button><Button size="sm" variant="ghost" onClick={() => setCount(null)}>Cancelar</Button></div>
            </div>
          </div>
        )}
      </div>
      {next && count === null && <div className="flex justify-end"><Button size="sm" variant="soft" onClick={() => onSelect(next)}><SkipForward />Próximo episódio</Button></div>}
      <TitleDetails c={c} all={all} onSelect={onSelect} time={time} onSeek={(t) => { if (ref.current) { ref.current.currentTime = t; ref.current.play().catch(() => {}); } }} />
    </div>
  );
}

/** Owner editor for catalog details (genres, rating reasons, series, chapters, album). */
export function MetaEditor({ c }: { c: Creation }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();
  const m = normalizeMeta(c);
  const [f, setF] = useState<MetaForm>(() => ({
    genres: m.genres.join(", "), reasons: m.ratingReasons.join(", "), origin: m.origin,
    sTitle: m.series?.title ?? "", season: String(m.series?.season ?? 1), episode: String(m.series?.episode ?? 1), synopsis: m.series?.synopsis ?? "",
    chapters: m.chapters.map((x) => `${fmtClock(x.t)} ${x.title}`).join("\n"), album: m.album?.title ?? "", track: String(m.album?.track ?? 1),
  }));
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    const meta = { ...((c.data as { meta?: object }).meta ?? {}), ...metaFromForm(f) };
    const { error } = await supabase.from("creations").update({ data: { ...(c.data as object), meta } }).eq("id", c.id);
    if (error) return toast({ title: "Não foi possível salvar", description: error.message, variant: "error" });
    qc.invalidateQueries({ queryKey: ["creations"] }); qc.invalidateQueries({ queryKey: ["vitrine"] });
    toast({ title: "Detalhes salvos", variant: "success" }); setOpen(false);
  };
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Detalhes do catálogo</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Detalhes do catálogo" description={c.title} className="sm:w-[min(92vw,36rem)]">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <MetaFields f={f} set={set} tool={c.tool} />
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>Salvar</Button></div>
        </div>
      </Dialog>
    </>
  );
}

export type MetaForm = { genres: string; reasons: string; origin: "platform" | "external"; sTitle: string; season: string; episode: string; synopsis: string; chapters: string; album: string; track: string };
export function MetaFields({ f, set, tool }: { f: MetaForm; set: (k: keyof MetaForm) => (e: { target: { value: string } }) => void; tool: string }) {
  return (
    <div className="space-y-3 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label htmlFor="mf-g">Gênero / estilo</Label><Input id="mf-g" placeholder="Ficção científica, Animação 3D" value={f.genres} onChange={set("genres")} /></div>
        <div className="space-y-1"><Label htmlFor="mf-r">Motivos da classificação</Label><Input id="mf-r" placeholder="violência leve, linguagem" value={f.reasons} onChange={set("reasons")} /></div>
      </div>
      <div className="space-y-1"><Label htmlFor="mf-o">Origem</Label>
        <Select id="mf-o" value={f.origin} onChange={set("origin")}><option value="platform">Criado na VisionZ</option><option value="external">Produção externa</option></Select></div>
      {tool !== "jukebox" ? (
        <fieldset className="space-y-2 rounded-lg border p-3">
          <legend className="px-1 text-xs text-muted-foreground">Série (opcional)</legend>
          <Input aria-label="Nome da série" placeholder="Nome da série" value={f.sTitle} onChange={set("sTitle")} />
          <div className="grid grid-cols-2 gap-2"><Input aria-label="Temporada" type="number" min={1} placeholder="Temporada" value={f.season} onChange={set("season")} /><Input aria-label="Episódio" type="number" min={1} placeholder="Episódio" value={f.episode} onChange={set("episode")} /></div>
          <Textarea aria-label="Sinopse do episódio" placeholder="Sinopse do episódio" rows={2} value={f.synopsis} onChange={set("synopsis")} />
        </fieldset>
      ) : (
        <fieldset className="grid grid-cols-[1fr_6rem] gap-2 rounded-lg border p-3">
          <legend className="px-1 text-xs text-muted-foreground">Álbum (opcional)</legend>
          <Input aria-label="Nome do álbum" placeholder="Nome do álbum" value={f.album} onChange={set("album")} /><Input aria-label="Faixa" type="number" min={1} value={f.track} onChange={set("track")} />
        </fieldset>
      )}
      <div className="space-y-1"><Label htmlFor="mf-c">Capítulos (um por linha: 0:00 Título)</Label><Textarea id="mf-c" rows={3} placeholder={"0:00 Abertura\n1:30 O encontro"} value={f.chapters} onChange={set("chapters")} /></div>
    </div>
  );
}
export const emptyMetaForm = (origin: "platform" | "external"): MetaForm => ({ genres: "", reasons: "", origin, sTitle: "", season: "1", episode: "1", synopsis: "", chapters: "", album: "", track: "1" });
export function metaFromForm(f: MetaForm) {
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8);
  return {
    genres: list(f.genres), ratingReasons: list(f.reasons), origin: f.origin,
    series: f.sTitle.trim() ? { id: f.sTitle.trim().toLowerCase().replace(/\W+/g, "-"), title: f.sTitle.trim(), season: Number(f.season) || 1, episode: Number(f.episode) || 1, synopsis: f.synopsis.trim() || undefined } : undefined,
    chapters: parseChapters(f.chapters), album: f.album.trim() ? { title: f.album.trim(), track: Number(f.track) || 1 } : undefined,
  };
}
