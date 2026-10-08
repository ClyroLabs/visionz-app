import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Code2, Rocket } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, Select, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@/index";
import { DemoHeader, useLocal } from "@/experience/defi-ui";
import { launchProjects, templates } from "@/experience/defi-data";

export const Route = createFileRoute("/app/launchpad")({
  head: () => ({
    meta: [
      { title: "Launchpad — Protótipo VisionZ" },
      { name: "description", content: "Lance jogos, estúdios e apps na infraestrutura VisionZ com modelos pré-auditados e APIs da Clyro." },
      { property: "og:title", content: "Launchpad — Protótipo VisionZ" },
      { property: "og:description", content: "Plataforma para projetos de terceiros no ecossistema VisionZ." },
    ],
  }),
  component: Launchpad,
});

const STEPS = ["Dados", "Contrato", "Uso do $VZN", "Revisão"] as const;
type Draft = { name: string; kind: string; template: string; vzn: string; sent: boolean };
const EMPTY: Draft = { name: "", kind: "Jogo Web3", template: "Token SPL", vzn: "Token de utilidade secundário", sent: false };

const snippet = `import { VisionZ } from "@visionz/sdk";

const vz = new VisionZ({ apiKey: "vz_test_demo_123" });
const result = await vz.smartFilter.check({ url: videoUrl });
if (result.rating === "L") publish(videoUrl);`;

function Launchpad() {
  const [step, setStep] = useState(0);
  const [d, setD] = useLocal<Draft>("vz-launchpad", EMPTY);
  const up = (p: Partial<Draft>) => setD({ ...d, ...p });
  const statusTone = { Ativo: "success", "Em análise": "warning", Captação: "cyan" } as const;
  return (
    <div className="space-y-8">
      <DemoHeader title="Launchpad" text="Estúdios, jogos e apps podem nascer na infraestrutura VisionZ, usando modelos de contrato prontos e as APIs do Filtro Inteligente, Synth e Jukebox." />
      <Tabs defaultValue="vitrine" className="space-y-6">
        <TabsList><TabsTrigger value="vitrine">Projetos</TabsTrigger><TabsTrigger value="enviar">Enviar meu projeto</TabsTrigger><TabsTrigger value="modelos">Modelos</TabsTrigger><TabsTrigger value="apis">APIs</TabsTrigger></TabsList>
        <TabsContent value="vitrine">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {launchProjects.map((p) => (
              <Card key={p.name} padding="lg" className="space-y-2">
                <div className="flex items-center justify-between gap-2"><CardTitle>{p.name}</CardTitle><Badge variant={statusTone[p.status as keyof typeof statusTone]} size="sm">{p.status}</Badge></div>
                <p className="text-xs text-cyan">{p.kind}</p>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="enviar">
          {d.sent ? (
            <Card variant="featured" padding="lg" className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto size-10 text-success" />
              <CardTitle>“{d.name}” — Em análise pela governança</CardTitle>
              <p className="text-sm text-muted-foreground">Na versão final, quem tem $VZN vota na aprovação. Projetos aprovados recebem ajuda nas taxas da Solana.</p>
              <Button variant="secondary" onClick={() => { setD(EMPTY); setStep(0); }}>Enviar outro projeto</Button>
            </Card>
          ) : (
            <Card padding="lg" className="space-y-5">
              <ol className="flex flex-wrap gap-2">{STEPS.map((s, i) => <li key={s} className={cn("rounded-full border px-3 py-1 text-xs", i === step ? "border-magenta bg-magenta/10 text-magenta" : i < step ? "border-success/50 text-success" : "text-muted-foreground")}>{i + 1}. {s}</li>)}</ol>
              {step === 0 && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="lp-n">Nome do projeto</Label><Input id="lp-n" value={d.name} maxLength={80} onChange={(e) => up({ name: e.target.value })} /></div><div className="space-y-1.5"><Label htmlFor="lp-k">Tipo</Label><Select id="lp-k" value={d.kind} onChange={(e) => up({ kind: e.target.value })}><option>Jogo Web3</option><option>Estúdio</option><option>App de música</option><option>Educação</option></Select></div></div>}
              {step === 1 && <div className="space-y-1.5"><Label htmlFor="lp-t">Modelo de contrato</Label><Select id="lp-t" value={d.template} onChange={(e) => up({ template: e.target.value })}>{templates.map((t) => <option key={t.name}>{t.name}</option>)}</Select></div>}
              {step === 2 && <div className="space-y-1.5"><Label htmlFor="lp-v">Como o projeto usa o $VZN</Label><Select id="lp-v" value={d.vzn} onChange={(e) => up({ vzn: e.target.value })}><option>Token de utilidade secundário</option><option>Ativo de reserva</option><option>Pagamento de renderização</option></Select><p className="text-xs text-muted-foreground">Projetos no Launchpad usam o $VZN e deixam uma parte travada como garantia.</p></div>}
              {step === 3 && <dl className="grid grid-cols-2 gap-2 text-sm"><dt className="text-muted-foreground">Projeto</dt><dd>{d.name}</dd><dt className="text-muted-foreground">Tipo</dt><dd>{d.kind}</dd><dt className="text-muted-foreground">Contrato</dt><dd>{d.template}</dd><dt className="text-muted-foreground">$VZN</dt><dd>{d.vzn}</dd></dl>}
              <div className="flex justify-between gap-2">
                <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Voltar</Button>
                {step < 3 ? <Button disabled={step === 0 && d.name.trim().length < 2} onClick={() => setStep(step + 1)}>Continuar</Button> : <Button onClick={() => up({ sent: true })}><Rocket />Enviar</Button>}
              </div>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="modelos">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{templates.map((t) => <Card key={t.name} padding="lg" className="space-y-2"><Badge variant="success" size="sm">Pré-auditado</Badge><CardTitle>{t.name}</CardTitle><p className="text-sm text-muted-foreground">{t.text}</p></Card>)}</div>
        </TabsContent>
        <TabsContent value="apis">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {[["Filtro Inteligente", "Modere o que seus usuários enviam, em tempo real."], ["Clyro Synth", "Gere cenas e capas para o seu jogo ou app."], ["Clyro Jukebox", "Crie trilhas com autoria registrada."]].map(([n, t]) => <Card key={n} className="space-y-1"><CardTitle>{n}</CardTitle><p className="text-sm text-muted-foreground">{t}</p></Card>)}
              <p className="text-xs text-muted-foreground">Taxas pagas em $VZN com desconto. Chave de teste falsa, só para demonstração.</p>
            </div>
            <Card padding="lg" className="space-y-2"><div className="flex items-center gap-2"><Code2 className="size-5 text-cyan" /><CardTitle>Exemplo em TypeScript</CardTitle></div><pre data-no-translate className="overflow-x-auto rounded-xl border bg-background p-4 font-mono text-xs text-cyan">{snippet}</pre></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
