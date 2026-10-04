import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";
const TEXT_MODEL = "openai/gpt-6-astra";
const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
const RUN_ID = "X-Lovable-AIG-Run-ID";

export class AiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function key() {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new AiError(500, "IA não configurada.");
  return k;
}

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

export function friendlyAiError(status: number): string {
  if (status === 402) return "Os créditos de IA acabaram. Adicione créditos em Settings → Plans & credits.";
  if (status === 429) return "Muitos pedidos ao mesmo tempo. Aguarde alguns segundos e tente de novo.";
  if (status === 403) return "A IA recusou este pedido.";
  return "A IA não respondeu agora. Tente novamente em instantes.";
}

/** Streams a JSON-only answer from the text model and parses it. */
export async function askJson<T>(system: string, prompt: string): Promise<T> {
  const apiKey = key();
  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });
  let failure: AiError | null = null;
  const result = streamText({
    model: provider.responses(TEXT_MODEL),
    system: `${system}\nResponda SOMENTE com um objeto JSON válido, sem markdown.`,
    prompt,
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    onError: ({ error }) => {
      const status = (error as { statusCode?: number })?.statusCode ?? 500;
      console.error("AI text error", status, error);
      failure = new AiError(status, friendlyAiError(status));
    },
  });
  let text = "";
  try { text = await result.text; } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode ?? 500;
    throw failure ?? new AiError(status, friendlyAiError(status));
  }
  if (failure) throw failure;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new AiError(500, "A IA não devolveu um resultado válido. Tente de novo.");
  try { return JSON.parse(match[0]) as T; } catch { throw new AiError(500, "A IA não devolveu um resultado válido. Tente de novo."); }
}

/** Generates one image and returns its PNG bytes. */
export async function generateImageBytes(prompt: string): Promise<Uint8Array> {
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: IMAGE_MODEL, prompt, size: "1536x1024", quality: "low" }),
  });
  if (!res.ok) {
    console.error("AI image error", res.status, await res.text());
    throw new AiError(res.status, friendlyAiError(res.status));
  }
  const json = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new AiError(500, "A imagem não foi gerada. Tente de novo.");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
