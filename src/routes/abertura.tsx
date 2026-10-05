import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/index";
import introEn from "@/assets/videos/intro-en.mp4.asset.json";
import introPt from "@/assets/videos/intro-pt.mp4.asset.json";
import introEs from "@/assets/videos/intro-es.mp4.asset.json";
import introZh from "@/assets/videos/intro-zh.mp4.asset.json";
import { LanguageSwitcher, useLang } from "@/experience/i18n";

const INTRO = { en: introEn.url, pt: introPt.url, es: introEs.url, zh: introZh.url } as const;

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

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    sessionStorage.setItem("vz-intro-seen", "1");
    setTimeout(() => navigate({ to: "/site" }), 600);
  };

  useEffect(() => {
    const v = video.current;
    if (v) {
      // Tenta tocar com som; se o navegador bloquear, toca mudo e libera o som no primeiro toque.
      v.muted = false;
      v.play().then(() => setMuted(false)).catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
        const unlock = () => { v.muted = false; setMuted(false); };
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
      });
    }
    const safety = setTimeout(finish, 20000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className={`fixed inset-0 z-50 bg-background transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <video
        ref={video}
        key={lang}
        src={INTRO[lang]}
        className="size-full object-cover"
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onEnded={finish}
        aria-label="Vídeo de abertura da VisionZ"
      />
      <LanguageSwitcher className="absolute right-6 top-6" />
      <div className="absolute bottom-6 right-6 flex gap-2">
        <Button variant="secondary" size="icon" aria-label={muted ? "Ligar som" : "Desligar som"} onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
        <Button variant="secondary" onClick={finish}>Pular</Button>
      </div>
    </div>
  );
}
