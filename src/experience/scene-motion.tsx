import { useEffect, useMemo, useRef, useState } from "react";
import { buildTimeline, cameraTransform, filmDuration, fmtTime, layersAt, sceneAt, type Layer } from "./film-engine";
import { exportFilm } from "./film-export";
import { Download, Maximize, Pause, Play, Repeat } from "lucide-react";
import { Button, cn } from "@/index";
import { useFileUrl } from "./creator-ui";
import type { Aspect, Camera, Transition } from "@/lib/creator";

export const ASPECT_CLASS: Record<Aspect, string> = { "16:9": "aspect-video", "9:16": "aspect-[9/16]", "1:1": "aspect-square", "4:3": "aspect-[4/3]", "21:9": "aspect-[21/9]" };
export const CAMERA_LABEL: Record<Camera, string> = { "zoom-in": "Aproximar", "zoom-out": "Afastar", "pan-left": "Panorâmica à esquerda", "pan-right": "Panorâmica à direita", "tilt-up": "Inclinar para cima", orbit: "Órbita", parallax: "Paralaxe" };
export const TRANSITION_LABEL: Record<Transition, string> = { cut: "Corte seco", fade: "Fusão", wipe: "Cortina" };

export type FilmScene = { image?: string | null; clip?: string | null; camera: Camera; duration_sec: number; transition: Transition; title: string; narration: string };

/** One scene in motion: the AI clip if there is one, otherwise the still with a CSS camera move. */
export function MotionFrame({ image, clip, camera, duration, alt, className, playing = true, loop = false }: { image?: string | null; clip?: string | null; camera: Camera; duration: number; alt: string; className?: string; playing?: boolean; loop?: boolean }) {
  const imgUrl = useFileUrl(clip ? null : image);
  const clipUrl = useFileUrl(clip);
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {clipUrl ? <video src={clipUrl} autoPlay={playing} muted loop={loop} playsInline className="size-full object-cover" />
        : imgUrl ? <img src={imgUrl} alt={alt} className="cam size-full object-cover"
            style={{ animationName: `cam-${camera}`, animationDuration: `${duration}s`, animationIterationCount: loop ? "infinite" : 1, animationDirection: loop ? "alternate" : "normal", animationPlayState: playing ? "running" : "paused" }} />
        : <div className="size-full animate-pulse bg-muted" aria-hidden />}
    </div>
  );
}

type Urls = Record<number, { url?: string; clipUrl?: string }>;

function FilmLayer({ scene, index, layer, t, start, playing, urls }: { scene: FilmScene; index: number; layer?: Layer; t: number; start: number; playing: boolean; urls: React.MutableRefObject<Urls> }) {
  const img = useFileUrl(scene.image);
  const clip = useFileUrl(scene.clip);
  const vref = useRef<HTMLVideoElement>(null);
  urls.current[index] = { url: img, clipUrl: clip };
  useEffect(() => { if (img) { const i = new Image(); i.src = img; i.decode?.().catch(() => {}); } }, [img]);
  const visible = !!layer;
  useEffect(() => {
    const v = vref.current; if (!v) return;
    if (visible && playing) { const local = Math.max(0, t - start); if (Math.abs(v.currentTime - local) > 0.4) v.currentTime = local % (v.duration || 1e9); v.play().catch(() => {}); }
    else v.pause();
  }, [visible, playing, Math.floor(t * 2)]); // eslint-disable-line react-hooks/exhaustive-deps
  const style: React.CSSProperties = { opacity: layer?.opacity ?? 0, clipPath: layer && layer.reveal < 1 ? `inset(0 ${100 - layer.reveal * 100}% 0 0)` : undefined, visibility: visible ? "visible" : "hidden" };
  return (
    <div className="absolute inset-0 overflow-hidden" style={style} aria-hidden={!visible}>
      {clip ? <video ref={vref} src={clip} muted playsInline loop preload="auto" className="size-full object-cover" style={{ transform: "scale(1.02)" }} />
        : img ? <img src={img} alt={scene.title} className="size-full object-cover will-change-transform" style={{ transform: cameraTransform(scene.camera, layer?.progress ?? 0) }} />
        : <div className="size-full bg-gradient-to-br from-violet/40 via-background to-cyan/20" style={{ transform: cameraTransform(scene.camera, layer?.progress ?? 0) }}><div className="size-full animate-pulse bg-primary/20" /></div>}
    </div>
  );
}

/** One continuous film: every scene on a single clock, blending into the next with no pauses or blank frames. */
export function FilmPlayer({ scenes, aspect, className, mini = false, seek, title = "filme" }: { scenes: FilmScene[]; aspect: Aspect; className?: string; mini?: boolean; seek?: { t: number; n: number }; title?: string }) {
  const slots = useMemo(() => buildTimeline(scenes), [scenes]);
  const total = filmDuration(slots);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(mini);
  const [exporting, setExporting] = useState<number | null>(null);
  const tRef = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const urls = useRef<Urls>({});
  useEffect(() => { if (seek) { tRef.current = Math.min(seek.t, total); setT(tRef.current); setPlaying(true); } }, [seek?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!playing || total <= 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now(); let raf = 0;
    const tick = (now: number) => {
      tRef.current += (now - last) / 1000; last = now;
      if (tRef.current >= total) { if (loop) tRef.current = 0; else { tRef.current = total; setT(total); setPlaying(false); return; } }
      setT(reduce ? Math.floor(tRef.current) : tRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, loop, total]);
  if (!scenes.length) return null;
  const layers = layersAt(slots, scenes, t);
  const byIndex = new Map(layers.map((l) => [l.index, l]));
  const cur = sceneAt(slots, t);
  const go = (v: number) => { tRef.current = v; setT(v); };
  const toggle = () => { if (!playing && tRef.current >= total) go(0); setPlaying(!playing); };
  const doExport = async () => {
    setExporting(0);
    try { await exportFilm(scenes.map((s, i) => ({ ...s, ...urls.current[i] })), aspect, title, setExporting); } finally { setExporting(null); }
  };
  return (
    <div className={cn("space-y-3", className)}>
      <div ref={box} className={cn("group relative mx-auto overflow-hidden rounded-xl bg-background", !mini && "max-h-[65vh]", ASPECT_CLASS[aspect], aspect === "9:16" && !mini && "max-w-xs")} onClick={mini ? undefined : toggle}>
        {scenes.map((s, i) => <FilmLayer key={i} scene={s} index={i} layer={byIndex.get(i)} t={t} start={slots[i].start} playing={playing} urls={urls} />)}
        {!mini && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />}
        {!mini && scenes.map((s, i) => s.narration && (
          <p key={i} data-no-translate className="absolute inset-x-6 bottom-5 text-center text-sm font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.9)] transition-opacity duration-500 sm:text-base" style={{ opacity: i === cur ? 1 : 0 }}>{s.narration}</p>
        ))}
      </div>
      {!mini && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="soft" aria-label={playing ? "Pausar" : "Reproduzir"} onClick={toggle}>{playing ? <Pause /> : <Play />}</Button>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{fmtTime(t)}</span>
          <input type="range" min={0} max={total} step={0.05} value={t} onChange={(e) => go(Number(e.target.value))} aria-label="Linha do tempo do filme" className="h-1.5 flex-1 cursor-pointer accent-cyan" />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{fmtTime(total)}</span>
          <Button size="sm" variant={loop ? "soft" : "ghost"} aria-label="Repetir" aria-pressed={loop} onClick={() => setLoop(!loop)}><Repeat /></Button>
          <Button size="sm" variant="ghost" aria-label="Tela cheia" onClick={() => box.current?.requestFullscreen?.()}><Maximize /></Button>
          <Button size="sm" variant="ghost" aria-label="Baixar filme" disabled={exporting !== null} onClick={doExport}><Download />{exporting !== null && <span className="font-mono text-xs">{Math.round(exporting * 100)}%</span>}</Button>
        </div>
      )}
    </div>
  );
}

/** Editor strip: one thumbnail per scene, width proportional to its length, transitions marked between. */
export function SceneTimeline({ scenes, paths, clips, aspect, sel, onPick }: { scenes: { title: string; camera: Camera; duration_sec: number; transition: Transition }[]; paths: (string | null)[]; clips: (string | null)[]; aspect: Aspect; sel: number; onPick: (i: number) => void }) {
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto pb-1" role="list" aria-label="Linha do tempo das cenas">
      {scenes.map((s, i) => (
        <div key={i} role="listitem" className="flex items-center gap-1" style={{ flex: `${s.duration_sec} 0 ${s.duration_sec * 18}px` }}>
          {i > 0 && <span className="shrink-0 font-mono text-[10px] text-cyan" title={TRANSITION_LABEL[s.transition]}>{s.transition === "cut" ? "|" : s.transition === "wipe" ? "»" : "◇"}</span>}
          <button type="button" onClick={() => onPick(i)} aria-pressed={sel === i} aria-label={`Cena ${i + 1}`}
            className={cn("relative h-14 w-full overflow-hidden rounded-md border transition-all focus-visible:ring-2 focus-visible:ring-ring", sel === i ? "border-cyan shadow-glow-cyan" : "border-border opacity-80 hover:opacity-100")}>
            {paths[i] ? <MotionFrame image={paths[i]} camera={s.camera} duration={s.duration_sec} alt={s.title} playing={false} className="size-full" /> : <div className="size-full animate-pulse bg-primary/15" />}
            <span className="absolute bottom-0.5 left-1 font-mono text-[10px] text-white drop-shadow">{`${i + 1} · ${s.duration_sec}s`}</span>
            {clips[i] && <span className="absolute right-1 top-0.5 rounded bg-cyan/80 px-1 font-mono text-[9px] text-background">IA</span>}
          </button>
        </div>
      ))}
    </div>
  );
}
