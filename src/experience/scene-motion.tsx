import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
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

/** Plays every scene in order with its move, transition and narration subtitle. */
export function FilmPlayer({ scenes, aspect, className }: { scenes: FilmScene[]; aspect: Aspect; className?: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [run, setRun] = useState(0);
  const s = scenes[i];
  useEffect(() => {
    if (!playing || !s) return;
    const t = setTimeout(() => { if (i < scenes.length - 1) setI(i + 1); else setPlaying(false); }, s.duration_sec * 1000);
    return () => clearTimeout(t);
  }, [i, playing, s, scenes.length, run]);
  if (!s) return null;
  const anim = s.transition === "fade" ? "scene-fade 0.6s ease-out" : s.transition === "wipe" ? "scene-wipe 0.7s ease-out" : undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("relative mx-auto max-h-[60vh] overflow-hidden rounded-xl bg-background", ASPECT_CLASS[aspect], aspect === "9:16" && "max-w-xs")}>
        <div key={`${i}-${run}`} className="scene-in absolute inset-0" style={anim ? { animation: anim } : undefined}>
          <MotionFrame image={s.image} clip={s.clip} camera={s.camera} duration={s.duration_sec} alt={s.title} playing={playing} className="size-full" />
        </div>
        {s.narration && <p data-no-translate className="absolute inset-x-4 bottom-4 rounded-lg bg-background/75 px-3 py-1.5 text-center text-sm">{s.narration}</p>}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-0.5 font-mono text-xs">{`${i + 1}/${scenes.length}`}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="soft" aria-label={playing ? "Pausar" : "Reproduzir"} onClick={() => { if (!playing && i === scenes.length - 1) { setI(0); setRun(run + 1); } setPlaying(!playing); }}>{playing ? <Pause /> : <Play />}</Button>
        <Button size="sm" variant="ghost" aria-label="Recomeçar" onClick={() => { setI(0); setRun(run + 1); setPlaying(true); }}><RotateCcw /></Button>
        <div className="flex flex-1 gap-1">{scenes.map((x, j) => <button key={j} type="button" aria-label={`Cena ${j + 1}`} onClick={() => { setI(j); setRun(run + 1); }} className={cn("h-1.5 flex-1 rounded-full", j < i ? "bg-cyan" : j === i ? "bg-gradient-brand" : "bg-muted")} style={{ flexGrow: x.duration_sec }} />)}</div>
      </div>
    </div>
  );
}
