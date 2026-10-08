import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button, Logo } from "@/index";
import introEn from "@/assets/videos/intro-en.mp4.asset.json";
import introPt from "@/assets/videos/intro-pt.mp4.asset.json";
import introEs from "@/assets/videos/intro-es.mp4.asset.json";
import introZh from "@/assets/videos/intro-zh.mp4.asset.json";
import { LanguageSwitcher, useLang } from "@/experience/i18n";

import introEnS from "@/assets/videos/intro-en-540.mp4.asset.json";
import introPtS from "@/assets/videos/intro-pt-540.mp4.asset.json";
import introEsS from "@/assets/videos/intro-es-540.mp4.asset.json";
import introZhS from "@/assets/videos/intro-zh-540.mp4.asset.json";
import poster from "@/assets/videos/intro-poster.jpg.asset.json";

const INTRO = { en: introEn.url, pt: introPt.url, es: introEs.url, zh: introZh.url } as const;
const INTRO_SMALL = { en: introEnS.url, pt: introPtS.url, es: introEsS.url, zh: introZhS.url } as const;

export const Route = createFileRoute("/abertura")({
  head: () => ({
    meta: [
      { title: "VisionZ — Abertura" },
      { name: "description", content: "Vídeo de abertura da VisionZ, o streaming ético, criativo e lucrativo." },
      { property: "og:title", content: "VisionZ — Abertura" },
      { property: "og:description", content: "Assista à abertura da VisionZ antes de entrar." },
    ],
  }),
  component: Intro,
});

function Intro() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [small, setSmall] = useState<boolean | null>(null);
  useEffect(() => { const t = setTimeout(() => setReady(true), 2500); return () => clearTimeout(t); }, []);
  useEffect(() => { setSmall(window.matchMedia("(max-width: 767px)").matches); }, []);
  const src = small == null ? undefined : (small ? INTRO_SMALL : INTRO)[lang];

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    sessionStorage.setItem("vz-intro-seen", "1");
    setTimeout(() => navigate({ to: "/site" }), 600);
  };

  const setSound = (on: boolean) => {
    const v = video.current;
    if (v) { v.muted = !on; if (on) v.play().catch(() => {}); }
    setMuted(!on);
  };

  // Phones/tablets forbid sound before a tap. Instead of playing muted, the intro waits on a
  // full-screen "tap to start" layer, so it always begins from 0s with sound on every device.
  const [gate, setGate] = useState(false);
  const started = useRef(false);
  const start = () => {
    const v = video.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play().then(() => { setMuted(false); setGate(false); started.current = true; }).catch(() => {});
  };

  useEffect(() => {
    const v = video.current;
    if (v && !started.current) {
      v.muted = false;
      v.play().then(() => { setMuted(false); started.current = true; }).catch(() => {
        v.pause();
        setGate(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, src]);

  useEffect(() => {
    if (gate) return;
    const safety = setTimeout(finish, 20000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate]);


  return (
    <div className={`fixed inset-0 z-50 h-dvh overflow-hidden bg-background transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      {/* Portrait backdrop: live blurred copy of the video + brand light, so the clip blends into one scene. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 landscape:hidden">
        <img src={poster.url} alt="" className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl" />
        {src && (
          <video ref={bg} key={`bg-${src}`} src={src} muted playsInline preload="auto" tabIndex={-1}
            className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-3xl" />
        )}
        <div className="absolute inset-0 bg-stage-glow animate-breathe" />
        <div className="absolute inset-0 bg-light-streaks opacity-30" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 floor-reflection" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_50%,transparent_40%,var(--background)_100%)]" />
        <Logo brand="visionz-symbol" alt="" className="absolute left-1/2 top-[calc(max(1rem,env(safe-area-inset-top))+3.5rem)] h-10 w-auto -translate-x-1/2 opacity-80 drop-shadow-[0_0_14px_var(--magenta)]" />
      </div>
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`} aria-hidden>
        <Logo brand="visionz-symbol" alt="" className="h-16 w-auto animate-breathe drop-shadow-[0_0_14px_var(--magenta)]" />
      </div>
      {src && (
        <video
          ref={video}
          key={src}
          src={src}
          poster={poster.url}
          className={`absolute inset-x-0 top-1/2 aspect-video w-full -translate-y-1/2 object-cover transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] [-webkit-box-reflect:below_0_linear-gradient(transparent_60%,rgb(255_255_255/0.22))] landscape:inset-0 landscape:aspect-auto landscape:h-dvh landscape:translate-y-0 landscape:[mask-image:none] landscape:[-webkit-box-reflect:unset] ${ready ? "opacity-100" : "opacity-0"}`}
          playsInline
          preload="auto"
          onPlaying={() => { setReady(true); syncBg(true); }}
          onPause={() => bg.current?.pause()}
          onSeeked={() => syncBg(false)}
          onTimeUpdate={() => syncBg(false)}
          onLoadedData={() => setReady(true)}
          onEnded={finish}
          aria-label="Vídeo de abertura da VisionZ"
        />
      )}
      {gate && !leaving && (
        <button type="button" onClick={start} aria-label="Toque para começar" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background/60 backdrop-blur-sm focus-visible:outline-none">
          <Logo brand="visionz-symbol" alt="" className="h-20 w-auto drop-shadow-[0_0_18px_var(--magenta)]" />
          <span className="flex items-center gap-2 rounded-full border border-magenta/50 bg-background/70 px-6 py-3 text-base font-medium text-foreground shadow-glow-brand animate-breathe">
            <Volume2 className="size-5 text-magenta" />Toque para começar
          </span>
        </button>
      )}
      <LanguageSwitcher className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))]" />
      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] flex gap-2">
        <Button variant="secondary" size="icon" className="size-11" aria-label={muted ? "Ligar som" : "Desligar som"} onClick={() => setSound(muted)}>
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
        <Button variant="secondary" className="h-11 px-5" onClick={finish}>Pular</Button>
      </div>
    </div>
  );
}
