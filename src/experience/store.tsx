import { createContext, useContext, useState, type ReactNode } from "react";
import type { Network } from "@/index";
import { redeem as redeemLogic } from "./logic";

export interface Tx { id: number; label: string; amount: number; kind: "in" | "out"; when: string }
export interface Flag { id: number; title: string; reason: string; confidence: number; timestamp: string; severity: "low" | "medium" | "high" }

interface Store {
  kids: boolean; setKids: (v: boolean) => void;
  vzn: number; brl: number; network: Network; setNetwork: (n: Network) => void;
  txs: Tx[]; owned: string[];
  earn: (label: string, amount: number) => void;
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
  const [network, setNetwork] = useState<Network>("polygon");
  const [owned, setOwned] = useState<string[]>([]);
  const [txs, setTxs] = useState<Tx[]>([
    { id: 1, label: "Recompensa: 10h assistidas", amount: 25, kind: "in", when: "ontem" },
    { id: 2, label: "Indicação de amigo", amount: 50, kind: "in", when: "2 dias" },
    { id: 3, label: "Resgate para carteira externa", amount: 120, kind: "out", when: "5 dias" },
  ]);
  const [flags, setFlags] = useState<Flag[]>([
    { id: 1, title: "Clipe enviado: “Rua 23”", reason: "Gesto impróprio detectado", confidence: 74, timestamp: "02:14", severity: "high" },
    { id: 2, title: "Podcast: “Papo Gamer #12”", reason: "Tom agressivo no áudio", confidence: 61, timestamp: "18:40", severity: "medium" },
    { id: 3, title: "Animação: “Robôs da Praia”", reason: "Possível marca de terceiros", confidence: 52, timestamp: "00:47", severity: "low" },
  ]);
  const [retrained, setRetrained] = useState(1842);
  const addTx = (label: string, amount: number, kind: Tx["kind"]) => setTxs((t) => [{ id: Date.now(), label, amount, kind, when: now() }, ...t]);

  const store: Store = {
    kids, setKids, vzn, brl, network, setNetwork, txs, owned,
    earn: (label, amount) => { setVzn((v) => v + amount); addTx(label, amount, "in"); },
    buy: (id, title, price) => {
      const r = redeemLogic(brl, price);
      if (!r.ok) return false;
      setBrl(r.balance); setOwned((o) => [...o, id]); setVzn((v) => v + 5);
      addTx(`Compra avulsa: ${title} (+5 VZN)`, 5, "in");
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
