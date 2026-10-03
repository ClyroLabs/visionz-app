import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as I from "lucide-react";
import { Caption, PageHeader, Shell } from "@/showcase/shell";
import { Input } from "@/index";

export const Route = createFileRoute("/icones")({
  head: () => ({
    meta: [
      { title: "Ícones — VizionZ Design System" },
      { name: "description", content: "Conjunto de ícones Lucide curado para streaming, criação e blockchain." },
      { property: "og:title", content: "Ícones — VizionZ Design System" },
      { property: "og:description", content: "Conjunto de ícones Lucide curado para streaming, criação e blockchain." },
    ],
  }),
  component: Icons,
});

const names = [
  "Play", "Pause", "SkipForward", "Volume2", "Maximize", "Tv", "Film", "Clapperboard", "Video", "Camera", "Mic", "Music",
  "Radio", "Upload", "Download", "Heart", "Share2", "MessageCircle", "Bookmark", "Star", "Search", "Bell", "User", "Users",
  "Wallet", "Coins", "Gem", "Trophy", "Gift", "TrendingUp", "Network", "Link", "Blocks", "Cpu", "Brain", "Bot",
  "ShieldCheck", "ShieldAlert", "Lock", "Baby", "Eye", "EyeOff", "BadgeCheck", "Settings", "Globe", "Sparkles", "Zap", "Flame",
] as const;

function Icons() {
  const [q, setQ] = useState("");
  const list = names.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  return (
    <Shell>
      <PageHeader eyebrow="Fundamentos" title="Ícones">Lucide, traço 1.5–2px. Tamanhos padrão: 16, 20 e 24px. Importe de "lucide-react".</PageHeader>
      <div className="mb-6 max-w-sm"><Input placeholder="Buscar ícone…" aria-label="Buscar ícone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="mb-8 flex items-end gap-6 text-cyan">
        <I.Play className="size-4" /><I.Play className="size-5" /><I.Play className="size-6" /><Caption>size-4 · size-5 · size-6</Caption>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {list.map((n) => {
          const Icon = I[n] as I.LucideIcon;
          return (
            <div key={n} className="flex flex-col items-center gap-2 rounded-lg border bg-surface p-4 hover:border-cyan/40 hover:text-cyan">
              <Icon className="size-6" />
              <Caption>{n}</Caption>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-muted-foreground">Nenhum ícone encontrado para "{q}".</p>}
    </Shell>
  );
}
