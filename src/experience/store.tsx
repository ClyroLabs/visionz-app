import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Network } from "@/index";
import { redeem as redeemLogic } from "./logic";
import { applyDailyCap, missionReward, PURCHASE_VZN, STREAK7_BONUS, XP_SHOP, type RewardSource } from "./rewards";

export interface Tx { id: number; label: string; amount: number; kind: "in" | "out"; when: string; source?: RewardSource }
export interface Flag { id: number; title: string; reason: string; confidence: number; timestamp: string; severity: "low" | "medium" | "high" }

interface Store {
  kids: boolean; setKids: (v: boolean) => void;
  vzn: number; brl: number; network: Network; setNetwork: (n: Network) => void;
  txs: Tx[]; owned: string[];
  earn: (label: string, amount: number, source: RewardSource) => number;
  xp: number; addXp: (n: number) => void; earnedToday: number; streak: number;
  watchMin: number; addWatchMin: (n: number) => void; completed: string[]; complete: (id: string) => boolean;
  claimed: string[]; claimMission: (id: string, label: string) => number; claimStreak: () => number; streakClaimed: boolean;
  items: string[]; buyItem: (id: string) => boolean;
  buy: (id: string, title: string, price: number) => boolean;
  redeem: (amount: number) => boolean;
  deposit: (amount: number) => void;
  flags: Flag[]; retrained: number; decide: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
const now = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [kids, setKids] = useState(false);
  const [vzn, setVzn] = useState(1284.5);
  const [brl, setBrl] = useState(48.6);
  const [network, setNetwork] = useState<Network>("solana");
  const [owned, setOwned] = useState<string[]>([]);
  const [txs, setTxs] = useState<Tx[]>([
    { id: 1, label: "Missão: Concluir um título", amount: 1, kind: "in", when: "ontem", source: "missao" },
    { id: 2, label: "Criação aprovada pela IA", amount: 10, kind: "in", when: "2 dias", source: "criacao" },
    { id: 3, label: "Resgate para carteira externa", amount: 120, kind: "out", when: "5 dias" },
  ]);
  const [flags, setFlags] = useState<Flag[]>([
    { id: 1, title: "Clipe enviado: “Rua 23”", reason: "Gesto impróprio detectado", confidence: 74, timestamp: "02:14", severity: "high" },
    { id: 2, title: "Podcast: “Papo Gamer #12”", reason: "Tom agressivo no áudio", confidence: 61, timestamp: "18:40", severity: "medium" },
    { id: 3, title: "Animação: “Robôs da Praia”", reason: "Possível marca de terceiros", confidence: 52, timestamp: "00:47", severity: "low" },
  ]);
  const [retrained, setRetrained] = useState(1842);
  const addTx = (label: string, amount: number, kind: Tx["kind"], source?: RewardSource) => setTxs((t) => [{ id: Date.now() + Math.random(), label, amount, kind, when: now(), source }, ...t]);
  const [xp, setXp] = useState(420);
  const [earnedToday, setEarned] = useState(0);
  const [watchMin, setWatchMin] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const streak = 6 + (claimed.length > 0 ? 1 : 0);
  const today = new Date().toDateString();
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("vz-rewards") ?? "null");
      if (!d) return;
      setXp(d.xp ?? 420); setItems(d.items ?? []);
      if (d.date === today) { setEarned(d.earnedToday ?? 0); setWatchMin(d.watchMin ?? 0); setClaimed(d.claimed ?? []); setCompleted(d.completed ?? []); setStreakClaimed(!!d.streakClaimed); }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    localStorage.setItem("vz-rewards", JSON.stringify({ date: today, xp, items, earnedToday, watchMin, claimed, completed, streakClaimed }));
  }, [xp, items, earnedToday, watchMin, claimed, completed, streakClaimed, today]);
  const earn = (label: string, amount: number, source: RewardSource) => {
    const r = applyDailyCap(earnedToday, amount, { source, kids });
    if (source !== "sequencia") setEarned(r.earnedToday);
    if (r.granted > 0) { setVzn((v) => Math.round((v + r.granted) * 100) / 100); addTx(label, r.granted, "in", source); }
    return r.granted;
  };

  const store: Store = {
    kids, setKids, vzn, brl, network, setNetwork, txs, owned,
    earn, xp, addXp: (n) => setXp((x) => x + n), earnedToday, streak, watchMin,
    addWatchMin: (n) => setWatchMin((m) => m + n), completed,
    complete: (id) => { if (completed.includes(id)) return false; setCompleted((c) => [...c, id]); return true; },
    claimed, streakClaimed, items,
    claimMission: (id, label) => { if (claimed.includes(id)) return 0; setClaimed((c) => [...c, id]); return earn(`Missão: ${label}`, missionReward(xp), "missao"); },
    claimStreak: () => { if (streakClaimed || streak < 7) return 0; setStreakClaimed(true); return earn("Sequência de 7 dias", STREAK7_BONUS, "sequencia"); },
    buyItem: (id) => { const it = XP_SHOP.find((i) => i.id === id); if (!it || items.includes(id) || xp < it.cost || (kids && !it.kids)) return false; setXp((x) => x - it.cost); setItems((i) => [...i, id]); return true; },
    buy: (id, title, price) => {
      const r = redeemLogic(brl, price);
      if (!r.ok) return false;
      setBrl(r.balance); setOwned((o) => [...o, id]);
      earn(`Compra avulsa: ${title}`, PURCHASE_VZN, "compra");
      return true;
    },
    redeem: (amount) => {
      const r = redeemLogic(vzn, amount);
      if (r.ok) { setVzn(r.balance); addTx("Resgate de recompensas", amount, "out"); }
      return r.ok;
    },
    deposit: (amount) => { setBrl((b) => Math.round((b + amount) * 100) / 100); addTx(`Depósito via Pix: R$ ${amount.toFixed(2)}`, 0, "in"); },
    flags, retrained,
    decide: (id) => { setFlags((f) => f.filter((x) => x.id !== id)); setRetrained((r) => r + 1); },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useExperience() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useExperience outside provider");
  return c;
}
