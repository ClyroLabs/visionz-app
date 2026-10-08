import p1 from "@/assets/launchpad/p1.jpg";
import p2 from "@/assets/launchpad/p2.jpg";
import p3 from "@/assets/launchpad/p3.jpg";
import p4 from "@/assets/launchpad/p4.jpg";
import p5 from "@/assets/launchpad/p5.jpg";
import p6 from "@/assets/launchpad/p6.jpg";
import p7 from "@/assets/launchpad/p7.jpg";
import p8 from "@/assets/launchpad/p8.jpg";
import p9 from "@/assets/launchpad/p9.jpg";
import p10 from "@/assets/launchpad/p10.jpg";
import p11 from "@/assets/launchpad/p11.jpg";
import p12 from "@/assets/launchpad/p12.jpg";

/** Simulated Launchpad catalog — demonstration data only. */
export type LpNetwork = "solana" | "base" | "arbitrum" | "ethereum";
export type LpStatus = "Captação" | "Ativo" | "Em análise" | "Encerrado";
export const LP_CATEGORIES = ["Jogos", "Estúdios", "Música", "Educação infantil", "Ferramentas IA", "Metaverso", "Colecionáveis", "Infra/DeFi"] as const;
export type LpCategory = (typeof LP_CATEGORIES)[number];
export const LP_NETWORKS: LpNetwork[] = ["solana", "base", "arbitrum", "ethereum"];
export const LP_STATUSES: LpStatus[] = ["Captação", "Ativo", "Em análise", "Encerrado"];

export type LaunchProject = {
  id: string; name: string; symbol: string; category: LpCategory; network: LpNetwork; status: LpStatus;
  image: string; text: string; launch: string; // ISO date
  totalSupply: number; circulating: number; priceUsd: number;
  raised: number; goal: number; backers: number; audited: boolean;
  allocation: { community: number; team: number; treasury: number; liquidity: number };
  vestingMonths: number; contract: string; site: string;
};

const addr = (n: LpNetwork, seed: string) => {
  const hex = Array.from(seed).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padStart(8, "0");
  return n === "solana" ? `${seed.slice(0, 3).toUpperCase()}${hex}vZ9kLp${hex.slice(0, 4)}Demo` : `0x${hex}${hex}a1b2c3d4${hex}demo`;
};
const P = (o: Omit<LaunchProject, "contract">): LaunchProject => ({ ...o, contract: addr(o.network, o.id) });
const A = (community: number, team: number, treasury: number, liquidity: number) => ({ community, team, treasury, liquidity });

export const LP_PROJECTS: LaunchProject[] = [
  P({ id: "pixel-arena", name: "Pixel Arena", symbol: "PIXL", category: "Jogos", network: "solana", status: "Ativo", image: p1, text: "Arena de batalhas com itens criados no Synth.", launch: "2026-06-12", totalSupply: 1_000_000_000, circulating: 420_000_000, priceUsd: 0.021, raised: 250_000, goal: 250_000, backers: 3120, audited: true, allocation: A(50, 15, 20, 15), vestingMonths: 24, site: "pixelarena.demo" }),
  P({ id: "neon-drift", name: "Neon Drift", symbol: "DRFT", category: "Jogos", network: "arbitrum", status: "Captação", image: p9, text: "Corridas futuristas com carros colecionáveis.", launch: "2026-11-02", totalSupply: 500_000_000, circulating: 60_000_000, priceUsd: 0.035, raised: 182_000, goal: 300_000, backers: 1460, audited: true, allocation: A(45, 18, 22, 15), vestingMonths: 18, site: "neondrift.demo" }),
  P({ id: "aurora", name: "Estúdio Aurora", symbol: "AURA", category: "Estúdios", network: "base", status: "Em análise", image: p2, text: "Séries animadas infantis com Filtro Inteligente.", launch: "2026-12-15", totalSupply: 200_000_000, circulating: 0, priceUsd: 0.05, raised: 0, goal: 400_000, backers: 0, audited: false, allocation: A(40, 20, 25, 15), vestingMonths: 36, site: "aurora.demo" }),
  P({ id: "lumen-docs", name: "Lumen Docs", symbol: "LUMN", category: "Estúdios", network: "ethereum", status: "Captação", image: p10, text: "Documentários independentes financiados pela comunidade.", launch: "2026-10-28", totalSupply: 100_000_000, circulating: 12_000_000, priceUsd: 0.12, raised: 410_000, goal: 600_000, backers: 980, audited: true, allocation: A(50, 15, 20, 15), vestingMonths: 24, site: "lumen.demo" }),
  P({ id: "beatdao", name: "BeatDAO", symbol: "BEAT", category: "Música", network: "solana", status: "Ativo", image: p3, text: "Rádio de criadores com trilhas do Jukebox.", launch: "2026-04-03", totalSupply: 800_000_000, circulating: 510_000_000, priceUsd: 0.014, raised: 150_000, goal: 150_000, backers: 4870, audited: true, allocation: A(55, 12, 18, 15), vestingMonths: 12, site: "beatdao.demo" }),
  P({ id: "stagepass", name: "StagePass", symbol: "STGE", category: "Música", network: "base", status: "Captação", image: p11, text: "Ingressos de shows on-chain com área VIP para fãs.", launch: "2026-11-20", totalSupply: 300_000_000, circulating: 30_000_000, priceUsd: 0.04, raised: 96_000, goal: 200_000, backers: 2210, audited: true, allocation: A(48, 16, 21, 15), vestingMonths: 18, site: "stagepass.demo" }),
  P({ id: "eduverse", name: "EduVerse", symbol: "EDU", category: "Educação infantil", network: "solana", status: "Captação", image: p4, text: "Mundo virtual de aulas conectado à Koda.", launch: "2026-11-10", totalSupply: 400_000_000, circulating: 40_000_000, priceUsd: 0.02, raised: 120_000, goal: 180_000, backers: 1730, audited: true, allocation: A(50, 15, 25, 10), vestingMonths: 24, site: "eduverse.demo" }),
  P({ id: "robo-tales", name: "RoboTales", symbol: "TALE", category: "Educação infantil", network: "ethereum", status: "Ativo", image: p12, text: "Histórias narradas por um robô amigo, classificação L.", launch: "2026-05-22", totalSupply: 150_000_000, circulating: 90_000_000, priceUsd: 0.06, raised: 220_000, goal: 220_000, backers: 2650, audited: true, allocation: A(52, 13, 20, 15), vestingMonths: 12, site: "robotales.demo" }),
  P({ id: "synapse", name: "Synapse AI", symbol: "SYN", category: "Ferramentas IA", network: "arbitrum", status: "Ativo", image: p5, text: "Legendas e dublagem automáticas para criadores.", launch: "2026-03-18", totalSupply: 1_000_000_000, circulating: 610_000_000, priceUsd: 0.018, raised: 500_000, goal: 500_000, backers: 5320, audited: true, allocation: A(40, 20, 25, 15), vestingMonths: 36, site: "synapse.demo" }),
  P({ id: "frame-forge", name: "FrameForge", symbol: "FRGE", category: "Ferramentas IA", network: "base", status: "Em análise", image: p10, text: "Edição de vídeo assistida por IA direto no navegador.", launch: "2027-01-08", totalSupply: 250_000_000, circulating: 0, priceUsd: 0.08, raised: 0, goal: 350_000, backers: 0, audited: false, allocation: A(45, 20, 20, 15), vestingMonths: 24, site: "frameforge.demo" }),
  P({ id: "neon-city", name: "Neon City", symbol: "NEON", category: "Metaverso", network: "ethereum", status: "Captação", image: p6, text: "Cidade virtual para estreias e festas de lançamento.", launch: "2026-12-01", totalSupply: 2_000_000_000, circulating: 150_000_000, priceUsd: 0.009, raised: 340_000, goal: 800_000, backers: 3900, audited: true, allocation: A(45, 15, 25, 15), vestingMonths: 30, site: "neoncity.demo" }),
  P({ id: "skyhub", name: "SkyHub", symbol: "SKY", category: "Metaverso", network: "arbitrum", status: "Encerrado", image: p6, text: "Salas de cinema virtuais para assistir junto.", launch: "2025-12-10", totalSupply: 600_000_000, circulating: 380_000_000, priceUsd: 0.011, raised: 210_000, goal: 210_000, backers: 1890, audited: true, allocation: A(50, 15, 20, 15), vestingMonths: 24, site: "skyhub.demo" }),
  P({ id: "holo-cards", name: "HoloCards", symbol: "HOLO", category: "Colecionáveis", network: "solana", status: "Captação", image: p7, text: "Cartas holográficas dos personagens da VisionZ.", launch: "2026-10-30", totalSupply: 50_000_000, circulating: 5_000_000, priceUsd: 0.3, raised: 260_000, goal: 300_000, backers: 2740, audited: true, allocation: A(55, 10, 20, 15), vestingMonths: 12, site: "holocards.demo" }),
  P({ id: "trophy-vault", name: "Trophy Vault", symbol: "TRPH", category: "Colecionáveis", network: "base", status: "Encerrado", image: p7, text: "Troféus digitais para conquistas de temporada.", launch: "2026-01-15", totalSupply: 20_000_000, circulating: 18_000_000, priceUsd: 0.45, raised: 120_000, goal: 120_000, backers: 1320, audited: true, allocation: A(60, 10, 15, 15), vestingMonths: 6, site: "trophyvault.demo" }),
  P({ id: "chainlink-bridge", name: "OrbitBridge", symbol: "ORBT", category: "Infra/DeFi", network: "ethereum", status: "Ativo", image: p8, text: "Ponte entre redes para criadores receberem em qualquer lugar.", launch: "2026-02-20", totalSupply: 1_000_000_000, circulating: 700_000_000, priceUsd: 0.025, raised: 650_000, goal: 650_000, backers: 6100, audited: true, allocation: A(40, 18, 27, 15), vestingMonths: 36, site: "orbitbridge.demo" }),
  P({ id: "nodeflow", name: "NodeFlow", symbol: "FLOW", category: "Infra/DeFi", network: "arbitrum", status: "Captação", image: p8, text: "Rede de nós para entregar vídeo com custo menor.", launch: "2026-11-25", totalSupply: 750_000_000, circulating: 50_000_000, priceUsd: 0.03, raised: 140_000, goal: 450_000, backers: 870, audited: false, allocation: A(42, 18, 25, 15), vestingMonths: 24, site: "nodeflow.demo" }),
];

/* ---------- Pure logic ---------- */
export const progressPct = (p: Pick<LaunchProject, "raised" | "goal">) => (p.goal <= 0 ? 0 : Math.min(100, Math.round((p.raised / p.goal) * 100)));
export const marketCap = (p: Pick<LaunchProject, "circulating" | "priceUsd">) => p.circulating * p.priceUsd;
export const fdv = (p: Pick<LaunchProject, "totalSupply" | "priceUsd">) => p.totalSupply * p.priceUsd;

export type LpSort = "recentes" | "captado" | "apoiadores";
export type LpFilter = { category?: LpCategory | "Todas"; network?: LpNetwork | "todas"; status?: LpStatus | "Todos"; q?: string; sort?: LpSort };

export function filterProjects(list: LaunchProject[], f: LpFilter): LaunchProject[] {
  const q = (f.q ?? "").trim().toLowerCase();
  const out = list.filter((p) =>
    (!f.category || f.category === "Todas" || p.category === f.category) &&
    (!f.network || f.network === "todas" || p.network === f.network) &&
    (!f.status || f.status === "Todos" || p.status === f.status) &&
    (!q || p.name.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q)),
  );
  const sort = f.sort ?? "recentes";
  return [...out].sort((a, b) => sort === "captado" ? b.raised - a.raised : sort === "apoiadores" ? b.backers - a.backers : b.launch.localeCompare(a.launch));
}

export const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
