import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, Lock, PlayCircle, Plus, Wallet } from "lucide-react";
import { DepositCheckout, methodText } from "@/experience/deposit-checkout";
import { depositLabel } from "@/experience/deposit";
import { useDeposit } from "@/experience/use-deposit";
import { useSession } from "@/lib/use-session";
import { Badge, Button, Card, CardTitle, NetworkTag, useToast } from "@/index";
import { useExperience } from "@/experience/store";
import { WalletConvert } from "@/experience/wallet-convert";
import { DailyCapBar, SOURCE_LABEL } from "@/experience/rewards-ui";
import { DevnetRewardsCard } from "@/experience/devnet-ui";
import tutPt from "@/assets/tutorial/wallet-tutorial-pt.mp4.asset.json";
import tutEn from "@/assets/tutorial/wallet-tutorial-en.mp4.asset.json";
import tutEs from "@/assets/tutorial/wallet-tutorial-es.mp4.asset.json";
import tutZh from "@/assets/tutorial/wallet-tutorial-zh.mp4.asset.json";
import { useLang } from "@/experience/i18n";
const TUTORIAL: Record<string, string> = { pt: tutPt.url, en: tutEn.url, es: tutEs.url, zh: tutZh.url };
function TutorialVideo({ poster }: { poster: string }) {
  const { lang } = useLang();
  return <video key={lang} controls preload="none" playsInline poster={poster} src={TUTORIAL[lang] ?? tutPt.url} className="aspect-video w-full" aria-label="Tutorial: como converter e sacar" />;
}
import tutorialPoster from "@/assets/tutorial/wallet-tutorial-poster.jpg.asset.json";

export const Route = createFileRoute("/app/carteira")({
  head: () => ({
    meta: [
      { title: "Carteira — Protótipo VisionZ" },
      { name: "description", content: "Carteira interna VisionZ: saldo em reais, recompensas VZN multichain e histórico." },
      { property: "og:title", content: "Carteira — Protótipo VisionZ" },
      { property: "og:description", content: "Gerencie saldo e recompensas na VisionZ." },
    ],
  }),
  component: WalletPage,
});

const money = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function WalletPage() {
  const { vzn, brl, network, txs, deposit } = useExperience();
  const toast = useToast();
  const [depOpen, setDepOpen] = useState(false);
  const session = useSession();
  const dep = useDeposit(session?.user.id);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-wide">Carteira</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" padding="lg" className="space-y-4">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Banknote className="size-4" />Saldo em reais</span>
          <p className="font-display text-4xl font-bold">{`R$ ${money(brl)}`}</p>
          <p className="text-sm text-muted-foreground">Usado para compras avulsas e pacotes on-demand.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setDepOpen(true)}><Plus />Depositar</Button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3" />Pix ou cartão · VisionZ Pay</span>
          </div>
          <DepositCheckout open={depOpen} onOpenChange={setDepOpen} methods={dep.methods} onAddMethod={dep.addMethod}
            onComplete={async (r) => { if (r.ok) deposit(r.amount, depositLabel(true, methodText(r.method), r.id)); await dep.record(r); toast(r.ok ? { title: "Depósito aprovado", variant: "success" } : { title: "Pagamento recusado", variant: "error" }); }} />
        </Card>
        <Card variant="glow" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="size-4" />Recompensas</span><NetworkTag network={network} /></div>
          <p className="font-display text-4xl font-bold">{money(vzn)} <span className="text-lg text-cyan">VZN</span></p>
          <DailyCapBar />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium"><PlayCircle className="size-4 text-cyan" />Como converter e sacar</span>
              <a href="#converter-sacar" className="text-xs text-cyan hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">Ir para Converter e sacar</a>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
              <TutorialVideo poster={tutorialPoster.url} />
              <span className="pointer-events-none absolute right-2 top-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">0:26</span>
            </div>
            <p className="text-xs text-muted-foreground">Vídeo de demonstração · legendas no seu idioma</p>
          </div>
        </Card>
      </div>
      <DevnetRewardsCard />
      <WalletConvert />
      <Card padding="lg">
        <CardTitle className="mb-4 text-lg">Histórico</CardTitle>
        <ul className="divide-y">
          {txs.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span className={t.kind === "in" ? "text-success" : "text-ember"}>{t.kind === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span>
              <span className="flex-1 text-sm">{t.label}</span>
              {t.source && <Badge variant="neutral" size="sm">{SOURCE_LABEL[t.source]}</Badge>}
              {t.amount > 0 && <span className="font-mono text-sm">{t.kind === "in" ? "+" : "−"}{money(t.amount)} VZN</span>}
              <span className="w-16 text-right text-xs text-muted-foreground">{t.when}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
