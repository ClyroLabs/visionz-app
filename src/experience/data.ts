import trio from "@/assets/covers/trio-alegria.jpg";
import codigo from "@/assets/covers/codigo-zero.jpg";
import rios from "@/assets/covers/rios-de-neon.jpg";
import jukebox from "@/assets/covers/jukebox-live.jpg";
import type { Rating } from "./logic";

export interface Title {
  id: string; title: string; creator: string; duration: string; rating: Rating; price?: string; priceValue?: number;
  cover: string; row: "alta" | "synth" | "familia"; blockReason?: string;
}

export const catalog: Title[] = [
  { id: "trio", title: "Aventuras do Trio Alegria", creator: "Clyro Synth Studio", duration: "12 ep.", rating: "L", cover: trio, row: "synth" },
  { id: "rebeca", title: "Rebeca e sua turma", creator: "Clyro Synth Studio", duration: "10 ep.", rating: "L", cover: trio, row: "familia" },
  { id: "rios", title: "Rios de Neon", creator: "Luana Costa", duration: "1h 42m", rating: "10", price: "R$ 9,90", priceValue: 9.9, cover: rios, row: "alta" },
  { id: "codigo", title: "Código Zero", creator: "Rafael Mendes", duration: "8 ep.", rating: "16", price: "R$ 19,90", priceValue: 19.9, cover: codigo, row: "alta", blockReason: "Violência e linguagem imprópria" },
  { id: "pulso", title: "Pulso Ao Vivo", creator: "Clyro Jukebox", duration: "58m", rating: "12", cover: jukebox, row: "alta", blockReason: "Classificação 12 anos" },
  { id: "amazonia", title: "Amazônia Viva", creator: "Estúdio Aurora", duration: "52m", rating: "L", price: "R$ 6,90", priceValue: 6.9, cover: rios, row: "familia" },
  { id: "noite", title: "Noite Sintética", creator: "Clyro Synth Studio", duration: "1h 28m", rating: "14", price: "R$ 12,90", priceValue: 12.9, cover: codigo, row: "synth", blockReason: "Classificação 14 anos" },
  { id: "batida", title: "Batida do Futuro", creator: "Clyro Jukebox", duration: "6 faixas", rating: "L", cover: jukebox, row: "synth" },
];

/** Cenário inicial recalculado (conservador) — ver nota na página de investidores. */
export const projections = [
  { ano: "Ano 1", usuarios: 60_000, receita: 2.4, ebitda: -38 },
  { ano: "Ano 2", usuarios: 350_000, receita: 16, ebitda: 4 },
  { ano: "Ano 3", usuarios: 1_200_000, receita: 58, ebitda: 21 },
];

export const roadmap = [
  { phase: "MVP", period: "0–1 mês", title: "Orquestrador + catálogo", items: ["Gateway e login", "Agent Core com Marketing e Dev", "Filtro Inteligente v1", "Carteira interna"], status: "current" as const },
  { phase: "Beta", period: "2–4 meses", title: "Ecossistema ativo", items: ["Web3Agent em testnet", "Clyro Synth e Jukebox", "Ambassadors", "Observabilidade"], status: "next" as const },
  { phase: "Produção", period: "4–5 meses", title: "Escala global", items: ["Multi-região", "Mainnet multichain", "Conformidade LGPD", "Licenciamento da IA"], status: "next" as const },
];

export const agents = [
  { name: "Agent Core", role: "Orquestrador", load: 62 },
  { name: "ModerationAgent", role: "Filtro Inteligente", load: 81 },
  { name: "MarketingAgent", role: "Campanhas", load: 34 },
  { name: "Web3Agent", role: "Carteira e redes", load: 47 },
  { name: "DevAgent", role: "Deploy e CI", load: 22 },
  { name: "R&D Agent", role: "Synth / Jukebox", load: 55 },
];
