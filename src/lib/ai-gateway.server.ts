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
export async function generateImageBytes(prompt: string, size = "1536x1024"): Promise<Uint8Array> {
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: IMAGE_MODEL, prompt, size, quality: "low" }),
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

const VIDEO_MODEL = "google/gemini-omni-1.1-flash";
export type VideoJob = { id: string; status: string; progress?: number; error?: { code?: string; message?: string } };

/** Starts one short, low-cost image-to-video job. */
export async function createVideoJob(prompt: string, image: { b64: string; mime: string }, aspect: "16:9" | "9:16", seconds: number): Promise<VideoJob> {
  const res = await fetch(`${BASE_URL}/videos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: VIDEO_MODEL,
      input: [{ type: "image", data: image.b64, mime_type: image.mime }, { type: "text", text: prompt }],
      response_format: { type: "video", resolution: "360p", duration: `${seconds}s`, aspect_ratio: aspect },
      generation_config: { thinking_level: "low" },
    }),
  });
  if (!res.ok) { console.error("AI video error", res.status, await res.text()); throw new AiError(res.status, friendlyAiError(res.status)); }
  return (await res.json()) as VideoJob;
}

export async function getVideoJob(id: string): Promise<VideoJob> {
  const res = await fetch(`${BASE_URL}/videos/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${key()}`, "X-Lovable-AIG-SDK": "fetch" } });
  if (!res.ok) throw new AiError(res.status, friendlyAiError(res.status));
  return (await res.json()) as VideoJob;
}

export async function downloadVideo(id: string): Promise<Uint8Array> {
  const res = await fetch(`${BASE_URL}/videos/${encodeURIComponent(id)}/content`, { headers: { Authorization: `Bearer ${key()}`, "X-Lovable-AIG-SDK": "fetch" } });
  if (!res.ok) throw new AiError(res.status, friendlyAiError(res.status));
  return new Uint8Array(await res.arrayBuffer());
}
