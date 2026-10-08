export type TplNetwork = "solana" | "base" | "arbitrum" | "ethereum";
export type TplId = "token" | "staking" | "vesting" | "royalties" | "auction";
export type TplParam = { key: string; label: string; min: number; max: number; step: number; def: number; suffix?: string };
export type Template = {
  id: TplId; name: string; text: string; about: string; networks: TplNetwork[];
  level: "Iniciante" | "Intermediário" | "Avançado"; minutes: number; costVzn: number;
  features: string[]; params: TplParam[];
};

export const TEMPLATES: Template[] = [
  { id: "token", name: "Token SPL", text: "Crie seu token com regras de emissão fixas.", about: "Cria um token com quantidade total definida na criação. Ninguém pode emitir mais depois, o que dá previsibilidade para a comunidade.",
    networks: ["solana", "base", "arbitrum", "ethereum"], level: "Iniciante", minutes: 5, costVzn: 20,
    features: ["Supply fixo", "Metadados on-chain", "Queima opcional"],
    params: [{ key: "supply", label: "Supply total (milhões)", min: 1, max: 10000, step: 1, def: 100 }, { key: "decimals", label: "Casas decimais", min: 0, max: 9, step: 1, def: 6 }] },
  { id: "staking", name: "Staking", text: "Recompense quem mantém o token travado.", about: "Quem trava tokens por um período recebe recompensas proporcionais. O rendimento abaixo é só um exemplo de simulação.",
    networks: ["solana", "base", "arbitrum"], level: "Intermediário", minutes: 10, costVzn: 45,
    features: ["Período de trava", "Recompensa por bloco", "Saque antecipado com multa"],
    params: [{ key: "apy", label: "Rendimento anual (exemplo)", min: 1, max: 30, step: 1, def: 8, suffix: "%" }, { key: "months", label: "Período de trava (meses)", min: 1, max: 36, step: 1, def: 12 }] },
  { id: "vesting", name: "Vesting linear", text: "Libere tokens do time aos poucos.", about: "Os tokens do time ficam bloqueados e são liberados aos poucos, depois de um período inicial sem liberação (cliff).",
    networks: ["solana", "base", "arbitrum", "ethereum"], level: "Iniciante", minutes: 7, costVzn: 30,
    features: ["Cliff configurável", "Liberação mensal", "Revogável pela DAO"],
    params: [{ key: "cliff", label: "Cliff (meses)", min: 0, max: 24, step: 1, def: 6 }, { key: "duration", label: "Duração total (meses)", min: 6, max: 60, step: 1, def: 24 }] },
  { id: "royalties", name: "Royalties", text: "Divida automaticamente cada venda entre criadores.", about: "Cada venda é dividida na hora entre as pessoas do projeto, nas porcentagens que você escolher. A soma precisa dar 100%.",
    networks: ["solana", "base", "ethereum"], level: "Intermediário", minutes: 8, costVzn: 35,
    features: ["Até 3 participantes", "Pagamento automático", "Relatório por venda"],
    params: [{ key: "a", label: "Criador principal", min: 0, max: 100, step: 5, def: 60, suffix: "%" }, { key: "b", label: "Coautor", min: 0, max: 100, step: 5, def: 30, suffix: "%" }, { key: "c", label: "Estúdio", min: 0, max: 100, step: 5, def: 10, suffix: "%" }] },
  { id: "auction", name: "Leilão", text: "Venda itens raros em leilão com lances on-chain.", about: "Itens raros vão a leilão por um tempo definido. Cada lance fica registrado na rede e o maior lance leva o item.",
    networks: ["solana", "arbitrum", "ethereum"], level: "Avançado", minutes: 12, costVzn: 60,
    features: ["Lance mínimo", "Prorrogação anti-sniping", "Reembolso automático"],
    params: [{ key: "start", label: "Lance inicial (VZN)", min: 1, max: 10000, step: 1, def: 50 }, { key: "hours", label: "Duração (horas)", min: 1, max: 168, step: 1, def: 48 }] },
];

export const defaults = (t: Template) => Object.fromEntries(t.params.map((p) => [p.key, p.def])) as Record<string, number>;

/** Percent of tokens unlocked at the end of each month (0..duration). */
export function vestingSchedule(cliff: number, duration: number): number[] {
  const d = Math.max(1, duration), c = Math.min(cliff, d);
  return Array.from({ length: d + 1 }, (_, m) => (m < c || m === 0 ? 0 : Math.round(((m) / d) * 1000) / 10));
}
/** Example balance growth for 1.000 tokens with monthly compounding. */
export function stakingProjection(apy: number, months: number, base = 1000): number[] {
  const r = apy / 100 / 12;
  return Array.from({ length: months + 1 }, (_, m) => Math.round(base * (1 + r) ** m * 100) / 100);
}
export const splitTotal = (parts: number[]) => parts.reduce((s, n) => s + n, 0);
export const splitValid = (parts: number[]) => splitTotal(parts) === 100 && parts.every((n) => n >= 0);

export function templateSnippet(t: Template, v: Record<string, number>): string {
  switch (t.id) {
    case "token": return `vz.launchpad.token.create({\n  supply: ${v.supply}_000_000,\n  decimals: ${v.decimals},\n  mintAuthority: null,\n});`;
    case "staking": return `vz.launchpad.staking.create({\n  lockMonths: ${v.months},\n  exampleApy: ${v.apy / 100},\n  earlyExitPenalty: 0.05,\n});`;
    case "vesting": return `vz.launchpad.vesting.create({\n  cliffMonths: ${v.cliff},\n  durationMonths: ${v.duration},\n  revocableBy: "dao",\n});`;
    case "royalties": return `vz.launchpad.royalties.create({\n  splits: [${v.a}, ${v.b}, ${v.c}],\n});`;
    case "auction": return `vz.launchpad.auction.create({\n  startBid: ${v.start},\n  durationHours: ${v.hours},\n  antiSnipingMin: 5,\n});`;
  }
}
