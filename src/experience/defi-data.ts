import type { Market, TokenRisk } from "./defi";

export const markets: (Market & { note: string })[] = [
  { id: "sol", asset: "SOL", ltv: 0.75, liq: 0.85, supplied: 4_200_000, borrowed: 2_940_000, eModeLtv: 0.9, note: "eMode com SOL em staking" },
  { id: "usdc", asset: "USDC", ltv: 0.8, liq: 0.88, supplied: 6_800_000, borrowed: 5_712_000, note: "Dólar digital estável" },
  { id: "vzn", asset: "$VZN", ltv: 0.55, liq: 0.7, supplied: 2_100_000, borrowed: 840_000, eModeLtv: 0.9, note: "eMode com $VZN em staking" },
  { id: "rwa", asset: "RWA", ltv: 0.6, liq: 0.75, supplied: 900_000, borrowed: 315_000, note: "Ativos do mundo real tokenizados" },
];

export const prices: Record<string, number> = { sol: 150, usdc: 1, vzn: 0.12, rwa: 100 };

export const vaults = [
  { id: "multiply", name: "Multiply Vault", apy: 28, risk: "Alto", tone: "destructive", steps: ["Deposita $VZN", "Pega USDC emprestado", "Compra mais $VZN", "Deposita de novo"], text: "Multiplica a exposição ao $VZN em ciclos automáticos. Ganhos e perdas também se multiplicam." },
  { id: "creator", name: "Creator Yield", apy: 18, risk: "Médio", tone: "warning", steps: ["Financia uma produção", "Synth produz", "Assinaturas e vendas", "Parte da receita volta"], text: "Financia produções originais do Clyro Synth e recebe parte da receita delas." },
  { id: "real", name: "Real Yield", apy: 14, risk: "Baixo", tone: "success", steps: ["Coloca $VZN em staking", "Plataforma cobra taxas", "Taxas divididas", "Recebe em $VZN"], text: "Parte das taxas do Crédito e das transferências vai para quem tem $VZN em staking, sem emitir tokens novos." },
] as const;

export const radarTokens: { symbol: string; name: string; price: number; change: number; whales: number; sentiment: number; risk: TokenRisk; trend: number[] }[] = [
  { symbol: "VZN", name: "VisionZ", price: 0.12, change: 4.2, whales: 3, sentiment: 72, risk: { top10: 0.22, lockedLiquidity: 0.92, mintAuth: false, freezeAuth: false }, trend: [100, 102, 101, 105, 107, 106, 110, 112] },
  { symbol: "SOL", name: "Solana", price: 150, change: 1.1, whales: 5, sentiment: 68, risk: { top10: 0.18, lockedLiquidity: 0.95, mintAuth: false, freezeAuth: false }, trend: [100, 99, 101, 103, 102, 104, 103, 105] },
  { symbol: "KODA", name: "Koda", price: 0.04, change: -2.3, whales: 1, sentiment: 55, risk: { top10: 0.38, lockedLiquidity: 0.7, mintAuth: false, freezeAuth: false }, trend: [100, 98, 97, 99, 96, 95, 97, 96] },
  { symbol: "MOON", name: "MoonPup", price: 0.0003, change: 38.5, whales: 8, sentiment: 91, risk: { top10: 0.71, lockedLiquidity: 0.2, mintAuth: true, freezeAuth: true }, trend: [100, 120, 160, 150, 190, 170, 210, 180] },
  { symbol: "PIXL", name: "Pixel Arena", price: 0.21, change: -6.4, whales: 2, sentiment: 44, risk: { top10: 0.45, lockedLiquidity: 0.4, mintAuth: true, freezeAuth: false }, trend: [100, 97, 93, 95, 90, 88, 86, 85] },
];

export const launchProjects = [
  { name: "Pixel Arena", kind: "Jogo Web3", status: "Ativo", text: "Arena de batalhas com itens criados no Synth." },
  { name: "Estúdio Aurora", kind: "Estúdio", status: "Em análise", text: "Séries animadas infantis com Filtro Inteligente." },
  { name: "BeatDAO", kind: "App de música", status: "Ativo", text: "Rádio de criadores com trilhas do Jukebox." },
  { name: "EduVerse", kind: "Educação", status: "Captação", text: "Mundo virtual de aulas conectado à Koda." },
];

export const templates = [
  { name: "Token SPL", text: "Crie seu token com regras de emissão fixas." },
  { name: "Staking", text: "Recompense quem mantém o token travado." },
  { name: "Vesting linear", text: "Libere tokens do time aos poucos." },
  { name: "Royalties", text: "Divida automaticamente cada venda entre criadores." },
  { name: "Leilão", text: "Venda itens raros em leilão com lances on-chain." },
];

export const kodaTracks = [
  { id: "synth", title: "Criar no Synth", lessons: 4, perLesson: 10, bonus: 50, perk: "Taxa 10% menor no Crédito", quiz: { q: "Quem aprova o vídeo final no Synth?", options: ["A IA sozinha", "Você ou sua equipe", "Ninguém"], answer: 1 } },
  { id: "defi", title: "DeFi com segurança", lessons: 5, perLesson: 12, bonus: 80, perk: "Limite de empréstimo +5%", quiz: { q: "O que acontece quando a saúde da posição fica abaixo de 1?", options: ["Nada", "A posição pode ser liquidada", "Ganha bônus"], answer: 1 } },
  { id: "web3", title: "Primeiros passos em Web3", lessons: 3, perLesson: 8, bonus: 30, perk: "Selo de iniciante", quiz: { q: "Quem guarda a chave da sua carteira?", options: ["A VisionZ", "Você", "A rede"], answer: 1 } },
];
