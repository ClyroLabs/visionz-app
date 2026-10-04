import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/index";
import intro from "@/assets/videos/visionz-hero-bg-720.mp4.asset.json";

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
    video.current?.play().catch(() => {});
    const safety = setTimeout(finish, 20000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`fixed inset-0 z-50 bg-background transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <video
        ref={video}
        src={intro.url}
        className="size-full object-cover"
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onEnded={finish}
        aria-label="Vídeo de abertura da VisionZ"
      />
      <div className="absolute bottom-6 right-6 flex gap-2">
        <Button variant="secondary" size="icon" aria-label={muted ? "Ligar som" : "Desligar som"} onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
        <Button variant="secondary" onClick={finish}>Pular</Button>
      </div>
    </div>
  );
}
