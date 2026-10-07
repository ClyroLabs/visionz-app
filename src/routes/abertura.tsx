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

  useEffect(() => {
    const v = video.current;
    if (v) {
      // Tenta tocar com som; se o navegador bloquear (comum no celular), toca mudo e mostra o aviso para ligar o som.
      v.muted = false;
      v.play().then(() => setMuted(false)).catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
    const safety = setTimeout(finish, 20000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, src]);


  return (
    <div className={`fixed inset-0 z-50 h-dvh overflow-hidden bg-background transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      {/* Blurred fill so portrait screens never show empty bars. */}
      <img src={poster.url} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-2xl landscape:hidden" />
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`} aria-hidden>
        <Logo brand="visionz-symbol" alt="" className="h-16 w-auto animate-breathe drop-shadow-[0_0_14px_var(--magenta)]" />
      </div>
      {src && (
        <video
          ref={video}
          key={src}
          src={src}
          poster={poster.url}
          className={`relative h-dvh w-full object-contain transition-opacity duration-500 landscape:object-cover ${ready ? "opacity-100" : "opacity-0"}`}
          autoPlay
          playsInline
          preload="auto"
          onPlaying={() => setReady(true)}
          onLoadedData={() => setReady(true)}
          onEnded={finish}
          aria-label="Vídeo de abertura da VisionZ"
        />
      )}
      {muted && ready && !leaving && (
        <button type="button" onClick={() => setSound(true)} className="absolute inset-x-0 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+4rem)] mx-auto flex w-max max-w-[90vw] items-center gap-2 rounded-full border border-magenta/50 bg-background/70 px-5 py-3 text-sm font-medium text-foreground shadow-glow-brand backdrop-blur animate-breathe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
          <Volume2 className="size-5 text-magenta" />Toque para ativar o som
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
