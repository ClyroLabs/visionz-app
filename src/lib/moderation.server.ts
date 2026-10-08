import { askJson } from "./ai-gateway.server";
import { RATINGS } from "./parental";

export const CATEGORIES = ["violencia", "linguagem", "medo", "sexual", "drogas", "odio", "direitos_autorais", "perigo_real"] as const;

export interface Analysis {
  allowed: boolean;
  confidence: number;
  rating: (typeof RATINGS)[number];
  severity: "low" | "medium" | "high";
  categories: string[];
  reasons: string[];
}

export function creationText(c: { title: string; description: string | null; data: unknown }) {
  const d = (c.data ?? {}) as Record<string, unknown>;
  const scenes = Array.isArray(d.scenes) ? (d.scenes as { description?: string; narration?: string }[]).flatMap((s) => [s.description, s.narration]) : [];
  return [c.title, c.description, d.logline, d.lyrics, ...scenes].filter(Boolean).join("\n").slice(0, 6000);
}

/** AI review with reasons, confidence and suggested Brazilian age rating. */
export async function analyzeContent(content: string): Promise<Analysis> {
  const r = await askJson<Partial<Analysis>>(
    "Você é a IA de moderação da VisionZ (classificação indicativa brasileira: L, 10, 12, 14, 16, 18). Proteja crianças. Explique em português simples.",
    `Avalie o conteúdo. Formato: {"allowed": boolean, "confidence": número 0-1, "rating": "L"|"10"|"12"|"14"|"16"|"18", "severity": "low"|"medium"|"high", "categories": lista com valores de [${CATEGORIES.join(", ")}] (vazia se nada), "reasons": 1 a 3 frases curtas}.\n---\n${content}`,
  );
  const rating = RATINGS.includes(r.rating as never) ? (r.rating as Analysis["rating"]) : "18";
  return {
    allowed: r.allowed === true,
    confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
    rating,
    severity: r.severity === "high" || r.severity === "medium" ? r.severity : "low",
    categories: (Array.isArray(r.categories) ? r.categories : []).map(String).filter((x) => (CATEGORIES as readonly string[]).includes(x)),
    reasons: (Array.isArray(r.reasons) ? r.reasons : []).map((x) => String(x).slice(0, 200)).slice(0, 3),
  };
}

/** Confident and allowed → publish; confident and not allowed → block; otherwise a person reviews. */
export function routeDecision(a: Pick<Analysis, "allowed" | "confidence">): "published" | "blocked" | "review" {
  if (a.confidence < 0.75) return "review";
  return a.allowed ? "published" : "blocked";
}
