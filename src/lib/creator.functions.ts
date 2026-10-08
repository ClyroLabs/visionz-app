import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { asAge, normalizeComposition, normalizeStoryboard, normalizeText, stricterRating, AGE_RATINGS, ASPECTS, CAMERAS, LANGS } from "./creator";

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

const CAMERA_EN: Record<(typeof CAMERAS)[number], string> = {
  "zoom-in": "slow push-in toward the subject", "zoom-out": "slow pull-back revealing the scene", "pan-left": "smooth pan to the left",
  "pan-right": "smooth pan to the right", "tilt-up": "gentle tilt upward", orbit: "slow orbit around the subject", parallax: "subtle parallax dolly with depth",
};

export const synthStoryboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ idea: z.string().trim().min(5).max(800), style: z.string().max(60), scenes: z.number().int().min(3).max(6), age, aspect: z.enum(ASPECTS) }).parse(d))
  .handler(({ data }) => guard(async () => {
    const { askJson } = await ai();
    // One call returns the film plan plus EN/ES/ZH copies of the short texts, so viewers never trigger extra translations.
    const raw = await askJson(
      "Você é o diretor do Clyro Synth, estúdio de filmes com IA da VisionZ. Seja conciso.",
      `Planeje um filme curto de ${data.scenes} cenas para: "${data.idea}". Estilo: ${data.style}. Formato ${data.aspect}. Classificação: ${data.age} (para L e 10, nada de violência, medo intenso ou temas adultos).
Textos curtos: título até 6 palavras, logline 1 frase, descrição 1 frase, narração até 15 palavras.
Formato JSON: {"title","logline","scenes":[{"title","description","narration","image_prompt" (inglês, visual detalhado, sem texto na imagem, estilo ${data.style}, enquadramento ${data.aspect}),"camera" (um de: ${CAMERAS.join(", ")}),"duration_sec" (3 a 8),"transition" ("cut"|"fade"|"wipe")}],
"i18n":{"en":{"title","logline","scenes":[{"title","description","narration"}]},"es":{...mesmo formato},"zh":{...mesmo formato, chinês simplificado}}}. Textos principais em português do Brasil.`,
    );
    return normalizeStoryboard(raw, data.scenes);
  }));

const SIZE: Record<(typeof ASPECTS)[number], string> = { "16:9": "1536x1024", "21:9": "1536x1024", "4:3": "1536x1024", "1:1": "1024x1024", "9:16": "1024x1536" };

export const synthSceneImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ prompt: z.string().trim().min(5).max(1200), aspect: z.enum(ASPECTS).default("16:9") }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    const { generateImageBytes } = await ai();
    const bytes = await generateImageBytes(`${data.prompt}. Composition for ${data.aspect} frame. Family-safe, high quality cinematic still, no text, no watermark.`, SIZE[data.aspect]);
    const path = `${context.userId}/synth/${crypto.randomUUID()}.png`;
    const { error } = await context.supabase.storage.from("creations").upload(path, bytes, { contentType: "image/png" });
    if (error) throw new Error("Não foi possível guardar a imagem.");
    return { path };
  }));

/** Starts an AI clip from a scene image the caller owns. Runs only on an explicit click. */
export const synthClipStart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ imagePath: z.string().max(300), prompt: z.string().trim().min(3).max(1200), camera: z.enum(CAMERAS), aspect: z.enum(ASPECTS), seconds: z.number().int().min(3).max(8) }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    if (!data.imagePath.startsWith(`${context.userId}/`)) throw new Error("Imagem inválida.");
    const { data: blob, error } = await context.supabase.storage.from("creations").download(data.imagePath);
    if (error || !blob) throw new Error("Imagem da cena não encontrada.");
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = ""; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    const { createVideoJob } = await ai();
    const job = await createVideoJob(
      `Animate the image: ${CAMERA_EN[data.camera]}, in a single continuous shot, no scene cuts. ${data.prompt}. Keep the characters, colors and layout of the image unchanged. Family-safe. Audio: soft ambient score matching the mood. No dialogue. No on-screen text.`,
      { b64: btoa(bin), mime: blob.type || "image/png" }, data.aspect === "9:16" ? "9:16" : "16:9", data.seconds,
    );
    return { id: job.id };
  }));

/** Polls a clip job; when done, stores the MP4 in the caller's folder once. */
export const synthClipStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().min(3).max(200) }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    const { getVideoJob, downloadVideo } = await ai();
    const job = await getVideoJob(data.id);
    if (job.status === "failed") return { status: "failed" as const, error: job.error?.message ?? "O clipe não foi gerado." };
    if (job.status !== "completed") return { status: "running" as const, progress: job.progress ?? 0 };
    const path = `${context.userId}/synth/clips/${data.id.replace(/[^\w-]/g, "")}.mp4`;
    const dir = path.slice(0, path.lastIndexOf("/"));
    const { data: existing } = await context.supabase.storage.from("creations").list(dir, { search: path.slice(dir.length + 1) });
    if (!existing?.length) {
      const bytes = await downloadVideo(data.id);
      const { error } = await context.supabase.storage.from("creations").upload(path, bytes, { contentType: "video/mp4" });
      if (error) throw new Error("Não foi possível guardar o clipe.");
    }
    return { status: "done" as const, path };
  }));

/** Public: returns a production's text in `lang`, translating once and caching it on the record. */
export const translateCreation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), lang: z.enum(LANGS) }).parse(d))
  .handler(({ data }) => guard(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("creations").select("id, data, status, tool").eq("id", data.id).maybeSingle();
    if (!row || row.status !== "published" || row.tool !== "synth") throw new Error("Produção não encontrada.");
    const d = (row.data ?? {}) as Record<string, any>;
    const src = (d.lang ?? "pt") as string;
    if (src === data.lang) return null;
    if (d.i18n?.[data.lang]) return d.i18n[data.lang];
    const scenes = Array.isArray(d.scenes) ? d.scenes : [];
    const payload = { title: d.title, logline: d.logline, scenes: scenes.map((s: any) => ({ title: s.title, description: s.description, narration: s.narration })) };
    const name = { pt: "português do Brasil", en: "English", es: "español", zh: "简体中文" }[data.lang];
    const { askJson } = await ai();
    const raw = await askJson("Você traduz textos curtos de filmes. Mantenha nomes próprios.", `Traduza para ${name}, mantendo exatamente a mesma estrutura JSON: ${JSON.stringify(payload)}`);
    const t = normalizeText(raw, scenes.length);
    if (!t) throw new Error("Tradução indisponível agora.");
    await supabaseAdmin.from("creations").update({ data: { ...d, i18n: { ...(d.i18n ?? {}), [data.lang]: t } } }).eq("id", data.id);
    return t;
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
    const { analyzeContent, creationText, routeDecision } = await import("./moderation.server");
    const a = await analyzeContent(creationText(c));
    const status = routeDecision(a);
    const allowed = status === "published";
    const rating = stricterRating(asAge(c.age_rating), asAge(a.rating));
    const note = (status === "review" ? "Em revisão por uma pessoa. " : "") + a.reasons.join(" ").slice(0, 280);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("creations").update({ status, age_rating: rating, moderation_note: note, ai_analysis: a as never }).eq("id", c.id);
    if (error) throw new Error("Não foi possível publicar agora.");
    return { allowed, rating, note, status };
  }));

export const unpublishCreation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(({ data, context }) => guard(async () => {
    const { error } = await context.supabase.from("creations").update({ status: "draft" }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível despublicar.");
    return true;
  }));
