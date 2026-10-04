import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { asAge, normalizeComposition, normalizeStoryboard, stricterRating, AGE_RATINGS } from "./creator";

const age = z.enum(AGE_RATINGS);

async function ai() {
  return import("./ai-gateway.server");
}

/** Wraps AI failures into a plain error message the UI can show. */
async function guard<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try { return { ok: true, data: await fn() }; } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Algo deu errado." };
  }
}

export const synthStoryboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ idea: z.string().trim().min(5).max(800), style: z.string().max(60), scenes: z.number().int().min(3).max(6), age }).parse(d))
  .handler(({ data }) => guard(async () => {
    const { askJson } = await ai();
    const raw = await askJson(
      "Você é o roteirista do Clyro Synth, estúdio de mídia sintética da VisionZ. Escreva em português do Brasil.",
      `Crie um storyboard de ${data.scenes} cenas para: "${data.idea}". Estilo visual: ${data.style}. Classificação indicativa: ${data.age} (respeite rigorosamente; para L e 10, nada de violência, medo intenso ou temas adultos).
Formato: {"title": string, "logline": string (1 frase), "scenes": [{"title": string, "description": string (2 frases), "narration": string (fala/narração curta), "image_prompt": string (em inglês, descrição visual detalhada da cena, sem texto escrito na imagem, estilo ${data.style}, enquadramento cinematográfico 16:9)}]}`,
    );
    return normalizeStoryboard(raw, data.scenes);
  }));

export const synthSceneImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ prompt: z.string().trim().min(5).max(1200) }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    const { generateImageBytes } = await ai();
    const bytes = await generateImageBytes(`${data.prompt}. Family-safe, high quality cinematic still, no text, no watermark.`);
    const path = `${context.userId}/synth/${crypto.randomUUID()}.png`;
    const { error } = await context.supabase.storage.from("creations").upload(path, bytes, { contentType: "image/png" });
    if (error) throw new Error("Não foi possível guardar a imagem.");
    return { path };
  }));

export const jukeboxCompose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ idea: z.string().trim().min(3).max(600), genre: z.string().max(40), mood: z.string().max(40), age }).parse(d))
  .handler(({ data }) => guard(async () => {
    const { askJson } = await ai();
    const raw = await askJson(
      "Você é o compositor do Clyro Jukebox, da VisionZ. Escreva letras originais em português do Brasil, nunca copie músicas existentes.",
      `Componha uma canção curta e original sobre: "${data.idea}". Gênero: ${data.genre}. Clima: ${data.mood}. Classificação: ${data.age}.
Formato: {"title": string, "lyrics": string (2 estrofes e refrão, com quebras de linha \\n), "bpm": number, "key": string (ex.: "Am"), "mood": string, "chords": [4 a 8 cifras simples como "Am","F","C","G7"], "melody": [32 a 64 notas {"n": número MIDI entre 55 e 79 ou null para pausa, "d": duração em tempos: 0.5, 1, 1.5 ou 2}], "tags": [3 a 5 palavras]}. A melodia deve ser cantável, combinar com os acordes e ter um refrão marcante.`,
    );
    return normalizeComposition(raw);
  }));

export const jukeboxDescribe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ filename: z.string().max(200), notes: z.string().max(500) }).parse(d))
  .handler(({ data }) => guard(async () => {
    const { askJson } = await ai();
    const r = await askJson<{ title?: string; description?: string; tags?: string[]; cover_prompt?: string }>(
      "Você é o curador do Clyro Jukebox, da VisionZ. Escreva em português do Brasil.",
      `Um criador enviou a faixa "${data.filename}". Notas do criador: "${data.notes || "nenhuma"}".
Formato: {"title": string, "description": string (2 frases), "tags": [3 a 5 palavras], "cover_prompt": string (em inglês, capa de álbum abstrata e marcante, sem texto)}`,
    );
    return {
      title: String(r.title ?? "").slice(0, 100) || data.filename.replace(/\.[^.]+$/, ""),
      description: String(r.description ?? "").slice(0, 500),
      tags: (Array.isArray(r.tags) ? r.tags : []).map(String).slice(0, 6),
      cover_prompt: String(r.cover_prompt ?? "abstract neon album cover, violet and magenta light").slice(0, 800),
    };
  }));

/** AI safety review; publishes or blocks the creation. */
export const publishCreation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    const { data: c } = await context.supabase.from("creations").select("*").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
    if (!c) throw new Error("Criação não encontrada.");
    const d = (c.data ?? {}) as Record<string, unknown>;
    const content = [c.title, c.description, d.logline, d.lyrics, ...(Array.isArray(d.scenes) ? (d.scenes as { description?: string; narration?: string }[]).flatMap((s) => [s.description, s.narration]) : [])]
      .filter(Boolean).join("\n").slice(0, 6000);
    const { askJson } = await ai();
    const review = await askJson<{ allowed?: boolean; rating?: string; reason?: string }>(
      "Você é a IA de moderação da VisionZ (classificação indicativa brasileira: L, 10, 12, 14, 16, 18). Bloqueie discurso de ódio, conteúdo sexual envolvendo menores, incitação à violência real, violação clara de direitos autorais.",
      `Avalie o conteúdo abaixo. Formato: {"allowed": boolean, "rating": "L"|"10"|"12"|"14"|"16"|"18", "reason": string curta em português}.\n---\n${content}`,
    );
    const allowed = review.allowed === true;
    const rating = stricterRating(asAge(c.age_rating), asAge(review.rating));
    const note = String(review.reason ?? "").slice(0, 300);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("creations").update({ status: allowed ? "published" : "blocked", age_rating: rating, moderation_note: note }).eq("id", c.id);
    if (error) throw new Error("Não foi possível publicar agora.");
    return { allowed, rating, note };
  }));

export const unpublishCreation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    const { error } = await context.supabase.from("creations").update({ status: "draft" }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível despublicar.");
    return true;
  }));
