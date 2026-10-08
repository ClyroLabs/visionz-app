import { useState } from "react";
import { Copy, KeyRound, Loader2, Play } from "lucide-react";
import { JukeboxIcon, SmartFilterIcon, SynthIcon } from "./api-icons";
import { Badge, Button, Card, CardTitle, Input, cn, useToast } from "@/index";

type ApiId = "filter" | "synth" | "jukebox";
const APIS: { id: ApiId; name: string; text: string; icon: typeof SynthIcon; method: string; path: string; price: string; field: string; sample: string }[] = [
  { id: "filter", name: "Filtro Inteligente", text: "Modere o que seus usuários enviam, em tempo real.", icon: SmartFilterIcon, method: "POST", path: "/v1/smart-filter/check", price: "0,02 VZN / vídeo", field: "url", sample: "https://cdn.meujogo.gg/trailer.mp4" },
  { id: "synth", name: "Clyro Synth", text: "Gere cenas e capas para o seu jogo ou app.", icon: SynthIcon, method: "POST", path: "/v1/synth/generate", price: "0,10 VZN / imagem", field: "prompt", sample: "cidade neon ao amanhecer, estilo cinematográfico" },
  { id: "jukebox", name: "Clyro Jukebox", text: "Crie trilhas com autoria registrada.", icon: JukeboxIcon, method: "POST", path: "/v1/jukebox/compose", price: "0,25 VZN / faixa", field: "mood", sample: "épico, synthwave, 90 bpm" },
];

const rid = () => Math.random().toString(36).slice(2, 10);
function fakeResponse(id: ApiId, input: string) {
  if (id === "filter") return { id: `chk_${rid()}`, url: input, rating: "L", allowed: true, confidence: 0.97, categories: { violence: 0.01, nudity: 0, language: 0.02 } };
  if (id === "synth") return { id: `img_${rid()}`, prompt: input, status: "done", url: `https://cdn.visionz.demo/synth/${rid()}.jpg`, size: "1920x1080" };
  return { id: `trk_${rid()}`, mood: input, status: "done", duration_sec: 92, audio: `https://cdn.visionz.demo/jukebox/${rid()}.mp3`, authorship_hash: `0x${rid()}${rid()}` };
}

export function ApiPlayground() {
  const toast = useToast();
  const [api, setApi] = useState<ApiId>("filter");
  const a = APIS.find((x) => x.id === api)!;
  const [input, setInput] = useState(a.sample);
  const [lang, setLang] = useState<"ts" | "curl">("ts");
  const [key, setKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ms: number; body: string } | null>(null);
  const [calls, setCalls] = useState(0);

  const k = key ?? "vz_test_••••••••";
  const fn = api === "filter" ? "smartFilter.check" : api === "synth" ? "synth.generate" : "jukebox.compose";
  const code = lang === "ts"
    ? `import { VisionZ } from "@visionz/sdk";\n\nconst vz = new VisionZ({ apiKey: "${k}" });\nconst result = await vz.${fn}({ ${a.field}: ${JSON.stringify(input)} });\nconsole.log(result);`
    : `curl -X ${a.method} https://api.visionz.demo${a.path} \\\n  -H "Authorization: Bearer ${k}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify({ [a.field]: input })}'`;

  const pick = (id: ApiId) => { setApi(id); setInput(APIS.find((x) => x.id === id)!.sample); setRes(null); };
  const copy = (t: string) => { navigator.clipboard?.writeText(t); toast({ title: "Copiado", variant: "success" }); };
  const run = async () => {
    if (!input.trim()) return;
    setBusy(true); setRes(null);
    const ms = 180 + Math.round(Math.random() * 500);
    await new Promise((r) => setTimeout(r, ms + 400));
    setRes({ ms, body: JSON.stringify(fakeResponse(api, input.trim()), null, 2) });
    setCalls((c) => c + 1); setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {APIS.map((x) => {
          const Icon = x.icon; const on = x.id === api;
          return (
            <button key={x.id} type="button" onClick={() => pick(x.id)} aria-pressed={on}
              className={cn("rounded-xl border bg-surface/60 p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring", on ? "border-cyan shadow-glow-cyan" : "hover:border-cyan/50")}>
              <div className="flex items-center gap-3">
                <span className={cn("relative grid size-12 shrink-0 place-items-center rounded-xl border transition-all", on ? "border-cyan/60 bg-cyan/10 text-cyan shadow-glow-cyan" : "border-border bg-background text-muted-foreground")}><Icon className="size-7" /></span>
                <div className="min-w-0"><p className="truncate font-display text-sm tracking-wide">{x.name}</p><p className="font-mono text-[10px] text-muted-foreground">{x.price}</p></div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{x.text}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Testar agora</CardTitle>
            <Badge variant="neutral" size="sm"><span className="font-mono">{a.method} {a.path}</span></Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Chave de teste</p>
            <div className="flex gap-2">
              <code data-no-translate className="min-w-0 flex-1 truncate rounded-md border bg-background px-3 py-2 font-mono text-xs">{k}</code>
              {key ? <Button size="sm" variant="ghost" aria-label="Copiar chave" onClick={() => copy(key)}><Copy className="size-4" /></Button>
                : <Button size="sm" variant="secondary" onClick={() => setKey(`vz_test_${rid()}${rid()}`)}><KeyRound className="size-4" />Gerar chave</Button>}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Entrada ({a.field})</p>
            <Input value={input} onChange={(e) => setInput(e.target.value)} data-no-translate />
          </div>
          <Button className="w-full" onClick={run} disabled={busy || !key || !input.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}{busy ? "Enviando…" : "Executar"}
          </Button>
          {!key && <p className="text-xs text-muted-foreground">Gere uma chave de teste para executar.</p>}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
            <div><p className="text-muted-foreground">Chamadas hoje</p><p className="font-mono text-base">{calls} / 1000</p></div>
            <div><p className="text-muted-foreground">Taxas</p><p>Pagas em $VZN com desconto</p></div>
          </div>
        </Card>

        <Card padding="lg" className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex rounded-full border p-0.5 text-xs">
              {(["ts", "curl"] as const).map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={cn("rounded-full px-3 py-1", lang === l ? "bg-cyan/15 text-cyan" : "text-muted-foreground")}>{l === "ts" ? "TypeScript" : "cURL"}</button>)}
            </div>
            <Button size="sm" variant="ghost" aria-label="Copiar código" onClick={() => copy(code)}><Copy className="size-4" /></Button>
          </div>
          <pre data-no-translate className="max-h-56 overflow-auto rounded-xl border bg-background p-4 font-mono text-xs text-cyan">{code}</pre>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Resposta</span>
            {res && <span className="font-mono text-success">200 OK · {res.ms} ms</span>}
          </div>
          <pre data-no-translate className="min-h-32 max-h-64 overflow-auto rounded-xl border bg-background p-4 font-mono text-xs text-foreground">
            {busy ? "…" : res?.body ?? "// execute para ver a resposta"}
          </pre>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Ambiente de testes · respostas simuladas, nenhuma chave real é criada.</p>
    </div>
  );
}
