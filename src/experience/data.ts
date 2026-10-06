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

/** Cenário de Expansão (Relatório de Expansão + Especificação v2.4). Anos 1–2 seguem as fases da especificação; ano 3 inclui DeFi, PaaS e cross-chain. */
export const projections = [
  { ano: "Ano 1", usuarios: 80_000, receita: 3.2, base: 3.2, ebitda: -38 },
  { ano: "Ano 2", usuarios: 500_000, receita: 24.5, base: 24.5, ebitda: 4 },
  { ano: "Ano 3", usuarios: 2_500_000, receita: 232, base: 110, ebitda: 42 },
];

/** Tokenomics $VZN — 1.000.000.000 de tokens (Especificação v2.4). */
export const tokenomics = [
  { name: "Ecossistema & Comunidade", pct: 40, amount: "400M", vesting: "10% no lançamento, 48 meses lineares" },
  { name: "Venda Pública & Privada", pct: 25, amount: "250M", vesting: "Carência de 6 meses, 18 meses de liberação" },
  { name: "Tesouraria & Liquidez", pct: 15, amount: "150M", vesting: "50% no lançamento para liquidez" },
  { name: "Equipe & Clyro Labs", pct: 12, amount: "120M", vesting: "Carência de 12 meses, 36 meses de liberação" },
  { name: "Conselheiros & Parcerias", pct: 8, amount: "80M", vesting: "Carência de 6 meses, 24 meses de liberação" },
];

export const vaults = [
  { id: "multiply", name: "Multiply Vault", apy: 28 },
  { id: "creator", name: "Creator Yield Pool", apy: 18 },
  { id: "real", name: "Real Yield Staking", apy: 14 },
];

export const risks = [
  { t: "Atraso de oráculos e liquidações", level: "Médio", d: "Pyth + Switchboard redundantes, proteção contra picos falsos e limites dinâmicos." },
  { t: "Falta de liquidez entre redes", level: "Médio", d: "Reserva do tesouro em Base e Arbitrum como última instância." },
  { t: "Direitos autorais e regulação de IA", level: "Controlado", d: "Registro na Solana dos dados de criação e prova de anterioridade." },
  { t: "Falhas em contratos inteligentes", level: "Elevado", d: "Auditorias independentes, limites de depósito no início e Bug Bounty." },
];

export const expansionPhases = [
  { phase: "Fase 1", period: "M1–4", title: "Plataforma & Token" },
  { phase: "Fase 2", period: "M5–8", title: "DeFi & IA Engine" },
  { phase: "Fase 3", period: "M9–12", title: "PaaS & deBridge" },
  { phase: "Fase 4", period: "M13+", title: "DAO & Escala" },
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
