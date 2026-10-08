import { CheckCircle2, Flame, Gift, Sparkles, Target } from "lucide-react";
import { Badge, Button, Card, CardTitle, cn, useToast } from "@/index";
import { useExperience } from "./store";
import { DAILY_CAP, LEVELS, levelFor, missionReward, XP_SHOP, type RewardSource } from "./rewards";

export const SOURCE_LABEL: Record<RewardSource, string> = { missao: "Missão", conclusao: "Conclusão", sequencia: "Sequência", criacao: "Criação", compra: "Compra" };

export function DailyCapBar({ className }: { className?: string }) {
  const { earnedToday, kids } = useExperience();
  const pct = Math.min(100, (earnedToday / DAILY_CAP) * 100);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Limite diário de $VZN</span>
        <span className="font-mono">{earnedToday.toLocaleString("pt-BR")}/{DAILY_CAP} $VZN</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-brand transition-all" style={{ width: `${pct}%` }} /></div>
      {kids && <p className="text-xs text-cyan">Perfil infantil: ganha só XP, nunca $VZN.</p>}
    </div>
  );
}

export function MissionsCard() {
  const { xp, watchMin, completed, owned, claimed, claimMission, streak, streakClaimed, claimStreak, items, buyItem, kids } = useExperience();
  const toast = useToast();
  const lv = levelFor(xp);
  const next = LEVELS.find((l) => l.minXp > xp);
  const missions = [
    { id: "assistir30", label: "Assistir 30 minutos", done: watchMin >= 30, progress: `${Math.min(30, watchMin)}/30 min` },
    { id: "concluir1", label: "Concluir um título", done: completed.length >= 1, progress: `${Math.min(1, completed.length)}/1` },
    { id: "comprar1", label: "Comprar um título avulso", done: owned.length >= 1, progress: `${Math.min(1, owned.length)}/1` },
  ];
  const reward = missionReward(xp);
  const tell = (g: number) => toast(g > 0 ? { title: `+${g.toLocaleString("pt-BR")} VZN`, description: "Recompensa da gamificação.", variant: "reward" } : { title: "Sem $VZN agora", description: kids ? "Perfil infantil ganha só XP." : "Limite de hoje atingido.", variant: "default" });

  return (
    <Card variant="featured" padding="lg" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle className="inline-flex items-center gap-2 text-lg"><Target className="size-5 text-magenta" />Missões do dia</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="cyan" size="sm"><Sparkles className="size-3" />{lv.name} · {xp} XP</Badge>
          <Badge variant="warning" size="sm"><Flame className="size-3" />{streak} dias seguidos</Badge>
        </div>
      </div>
      {next && <p className="text-xs text-muted-foreground"><span>Próximo nível:</span> {next.name} <span>em</span> {next.minXp - xp} XP · <span>missões rendem</span> ×{next.mult.toLocaleString("pt-BR")}</p>}
      <ul className="grid gap-3 md:grid-cols-3">
        {missions.map((m) => {
          const got = claimed.includes(m.id);
          return (
            <li key={m.id} className="flex flex-col gap-2 rounded-xl border bg-background/60 p-4">
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="font-mono text-xs text-muted-foreground">{m.progress} · {reward.toLocaleString("pt-BR")} $VZN</p>
              <Button size="sm" variant={m.done && !got ? "primary" : "secondary"} disabled={!m.done || got} onClick={() => tell(claimMission(m.id, m.label))} className="mt-auto">
                {got ? <><CheckCircle2 />Resgatada</> : m.done ? "Resgatar" : "Em andamento"}
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-3 rounded-xl border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm"><span className="font-semibold">Sequência de 7 dias:</span> <span>bônus de 5 $VZN, fora do limite diário.</span></p>
        <Button size="sm" variant="secondary" disabled={streak < 7 || streakClaimed} onClick={() => tell(claimStreak())}>{streakClaimed ? "Bônus resgatado" : streak < 7 ? "Faltam dias" : "Pegar bônus"}</Button>
      </div>
      <DailyCapBar />
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold"><Gift className="size-4 text-cyan" />Use seu XP</p>
        <p className="text-xs text-muted-foreground">XP não vira $VZN nem dinheiro: ele sobe seu nível (missões rendem mais) e troca por itens do seu perfil.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {XP_SHOP.filter((i) => !kids || i.kids).map((i) => {
            const has = items.includes(i.id);
            return (
              <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-3">
                <span className="text-sm">{i.name}</span>
                <Button size="sm" variant="secondary" disabled={has || xp < i.cost} onClick={() => { if (buyItem(i.id)) toast({ title: "Item desbloqueado", description: i.name, variant: "success" }); }}>{has ? "Seu" : `${i.cost} XP`}</Button>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
