import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Copy, KeyRound } from "lucide-react";
import { Badge, Button, Card, CardTitle, useToast } from "@/vizionz";
import { JukeboxIcon, SmartFilterIcon, SynthIcon } from "./api-icons";

type Id = "filter" | "synth" | "jukebox";
const CFG = {
  filter: { name: "API do Filtro Inteligente", icon: SmartFilterIcon, path: "/v1/smart-filter/check", price: "0,02 VZN / vídeo", fn: "smartFilter.check", body: `{ url: "https://cdn.meuapp.gg/video.mp4" }`, use: "Use o resultado (classificação e motivo) para liberar ou segurar o envio." },
  synth: { name: "API do Clyro Synth", icon: SynthIcon, path: "/v1/synth/generate", price: "0,10 VZN / imagem", fn: "synth.generate", body: `{ prompt: "cidade neon ao amanhecer", aspect: "16:9" }`, use: "Receba a cena pronta e mostre no seu jogo ou app." },
  jukebox: { name: "API do Clyro Jukebox", icon: JukeboxIcon, path: "/v1/jukebox/compose", price: "0,25 VZN / faixa", fn: "jukebox.compose", body: `{ mood: "épico, synthwave, 90 bpm" }`, use: "Toque a faixa gerada com autoria registrada." },
} as const;

const KEY = "vz-api-key";
const rid = () => Math.random().toString(36).slice(2, 10);

/** Reserved slot on each tool page for using the Launchpad APIs in your own app. */
export function ApiAccess({ api }: { api: Id }) {
  const c = CFG[api];
  const Icon = c.icon;
  const toast = useToast();
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => { setKey(localStorage.getItem(KEY)); }, []);
  const gen = () => { const k = `vz_test_${rid()}${rid()}`; localStorage.setItem(KEY, k); setKey(k); };
  const code = `import { VisionZ } from "@visionz/sdk";\n\nconst vz = new VisionZ({ apiKey: "${key ?? "vz_test_••••••••"}" });\nconst res = await vz.${c.fn}(${c.body});`;
  const copy = (t: string) => { navigator.clipboard?.writeText(t); toast({ title: "Copiado" }); };
  const steps = ["Gere sua chave de teste (grátis, sem cobrança).", "Instale o SDK: npm i @visionz/sdk", "Chame a API com o código ao lado.", c.use];

  return (
    <Card padding="lg" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-cyan/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-cyan/60 bg-cyan/10 text-cyan shadow-glow-cyan"><Icon className="size-7" /></span>
            <div className="min-w-0">
              <p className="label-eyebrow text-cyan">Para desenvolvedores</p>
              <CardTitle>{c.name}</CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Use esta ferramenta dentro do seu próprio app ou jogo.</p>
          <div className="flex flex-wrap gap-2"><Badge size="sm" variant="neutral"><span className="font-mono">POST {c.path}</span></Badge><Badge size="sm" variant="cyan"><span className="font-mono">{c.price}</span></Badge></div>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-brand font-mono text-xs text-white">{i + 1}</span><span className="pt-0.5">{s}</span></li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            {key ? <Button size="sm" variant="secondary" onClick={() => copy(key)}><Copy className="size-4" />Copiar chave</Button>
              : <Button size="sm" variant="secondary" onClick={gen}><KeyRound className="size-4" />Gerar chave</Button>}
            <Link to="/app/launchpad" search={{ tab: "apis" }} className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm text-cyan hover:bg-cyan/10 focus-visible:ring-2 focus-visible:ring-ring">Testar na Launchpad<ArrowRight className="size-4" /></Link>
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Exemplo em TypeScript</p><Button size="sm" variant="ghost" aria-label="Copiar código" onClick={() => copy(code)}><Copy className="size-4" /></Button></div>
          <pre data-no-translate className="overflow-x-auto rounded-xl border bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90">{code}</pre>
          <p className="text-xs text-muted-foreground">Ambiente de testes · respostas simuladas, nenhuma chave real é criada</p>
        </div>
      </div>
    </Card>
  );
}
