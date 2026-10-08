import { MetaFields, emptyMetaForm, metaFromForm, type MetaForm } from "@/experience/title-details";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, Film, ShieldAlert, Upload, X } from "lucide-react";
import { AgeRating, Badge, Button, Card, CardTitle, Input, Label, buttonVariants, cn, useToast, type AgeRatingValue } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { AGE_RATINGS, type Age } from "@/lib/creator";
import { publishCreation } from "@/lib/creator.functions";
import { CreationActions, CreationMeta, EmptyLibrary, FileImage, useMyCreations } from "@/experience/creator-ui";

export const Route = createFileRoute("/app/publicar")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Publicar vídeo — VisionZ" },
      { name: "description", content: "Envie seu vídeo, escolha a classificação indicativa e publique no catálogo VisionZ após a verificação da IA." },
      { property: "og:title", content: "Publicar vídeo — VisionZ" },
      { property: "og:description", content: "Publique seus vídeos no catálogo VisionZ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Publish,
});

const MAX_MB = 200;
const RATING_HINT: Record<Age, string> = {
  L: "Livre para todos os públicos", "10": "Não recomendado para menores de 10", "12": "Não recomendado para menores de 12",
  "14": "Não recomendado para menores de 14", "16": "Não recomendado para menores de 16", "18": "Somente adultos",
};
type Result = { status: string; rating: string; note: string };

/** Captura um quadro do vídeo como capa (PNG). */
function grabFrame(url: string): Promise<{ blob: Blob; duration: number } | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.muted = true; v.preload = "auto"; v.src = url; v.crossOrigin = "anonymous";
    v.onloadedmetadata = () => { v.currentTime = Math.min(1, v.duration / 3 || 0); };
    v.onseeked = () => {
      const c = document.createElement("canvas");
      c.width = 960; c.height = Math.round(960 * (v.videoHeight / v.videoWidth || 9 / 16));
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b ? { blob: b, duration: v.duration } : null), "image/jpeg", 0.85);
    };
    v.onerror = () => resolve(null);
  });
}

function Publish() {
  const { user } = Route.useRouteContext();
  const toast = useToast();
  const qc = useQueryClient();
  const publish = useServerFn(publishCreation);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [age, setAge] = useState<Age>("L");
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const mine = useMyCreations("video");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) return toast({ title: "Escolha um arquivo de vídeo", variant: "error" });
    if (f.size > MAX_MB * 1024 * 1024) return toast({ title: `Envie um vídeo de até ${MAX_MB} MB`, variant: "error" });
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120));
  };
  const reset = () => { setFile(null); setPreview(null); setTitle(""); setDesc(""); setAge("L"); setAgree(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !preview) return;
    if (!title.trim()) return toast({ title: "Dê um título ao vídeo", variant: "error" });
    try {
      const id = crypto.randomUUID();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const videoPath = `${user.id}/video/${id}.${ext}`;
      setStep("Enviando vídeo…");
      const up = await supabase.storage.from("creations").upload(videoPath, file, { contentType: file.type });
      if (up.error) throw new Error("Falha no envio do vídeo");
      setStep("Gerando capa…");
      const frame = await grabFrame(preview);
      let coverPath: string | null = null;
      if (frame) {
        coverPath = `${user.id}/video/${id}-cover.jpg`;
        const c = await supabase.storage.from("creations").upload(coverPath, frame.blob, { contentType: "image/jpeg" });
        if (c.error) coverPath = null;
      }
      const { data: row, error } = await supabase.from("creations").insert({
        user_id: user.id, tool: "video", title: title.trim(), description: desc.trim() || null, age_rating: age,
        cover_path: coverPath, data: { video_path: videoPath, duration_sec: frame ? Math.round(frame.duration) : null, size_mb: Math.round(file.size / 1048576), meta: metaFromForm(meta) },
      }).select("id").single();
      if (error || !row) throw new Error("Não foi possível salvar");
      setStep("IA verificando o conteúdo…");
      const r = await publish({ data: { id: row.id } });
      if (!r.ok) throw new Error(r.error);
      setResult({ status: r.data.status, rating: r.data.rating, note: r.data.note });
      reset();
      qc.invalidateQueries({ queryKey: ["creations", "video"] });
      qc.invalidateQueries({ queryKey: ["vitrine"] });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Algo deu errado", variant: "error" });
      qc.invalidateQueries({ queryKey: ["creations", "video"] });
    } finally { setStep(null); }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-wide">Publicar vídeo</h1>
        <p className="text-muted-foreground">Envie seu vídeo, escolha a classificação e publique. A IA confere antes de entrar no catálogo.</p>
      </header>

      {result && <ResultBanner r={result} onClose={() => setResult(null)} />}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card padding="lg" className="space-y-4">
          <CardTitle className="flex items-center gap-2 text-lg"><Film className="size-5 text-magenta" />1. Vídeo</CardTitle>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border bg-background">
              <video src={preview} controls className="aspect-video w-full bg-background" />
              <button type="button" onClick={reset} disabled={!!step} aria-label="Remover vídeo" className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/80 text-foreground hover:bg-background"><X className="size-4" /></button>
              <p data-no-translate className="truncate border-t px-3 py-2 font-mono text-xs text-muted-foreground">{file?.name} · {Math.round((file?.size ?? 0) / 1048576)} MB</p>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
              className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-magenta/40 p-6 text-center transition-colors hover:bg-magenta/5 focus-visible:ring-2 focus-visible:ring-ring">
              <Upload className="size-10 text-magenta" />
              <span className="font-medium">Arraste o vídeo aqui ou toque para escolher</span>
              <span className="text-xs text-muted-foreground">MP4, MOV ou WEBM · até 200 MB</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="video/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </Card>

        <Card padding="lg" className="space-y-5">
          <CardTitle className="text-lg">2. Detalhes</CardTitle>
          <div className="space-y-1.5"><Label htmlFor="pv-t">Título</Label><Input id="pv-t" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Pôr do sol em Jericoacoara" /></div>
          <div className="space-y-1.5">
            <Label htmlFor="pv-d">Descrição</Label>
            <textarea id="pv-d" value={desc} maxLength={1000} rows={3} onChange={(e) => setDesc(e.target.value)} placeholder="Conte do que se trata o vídeo"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Classificação indicativa</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {AGE_RATINGS.map((a) => (
                <button key={a} type="button" onClick={() => setAge(a)} aria-pressed={age === a}
                  className={cn("grid place-items-center rounded-lg border p-2 transition-all", age === a ? "border-cyan bg-cyan/10 shadow-glow-cyan" : "hover:border-cyan/50")}>
                  <AgeRating rating={a as AgeRatingValue} />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{RATING_HINT[age]}</p>
          </fieldset>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-[var(--cyan)]" />
            <span>Confirmo que tenho os direitos deste vídeo e que a classificação está correta.</span>
          </label>
          <Button type="submit" className="w-full" loading={!!step} disabled={!file || !agree || !title.trim()}><Upload />{step ?? "Publicar no catálogo"}</Button>
          <p className="text-xs text-muted-foreground">A IA pode deixar a classificação mais restrita ou mandar para revisão humana.</p>
        </Card>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-wide">Meus vídeos</h2>
        {mine.isLoading ? <EmptyLibrary text="Carregando…" /> : (mine.data ?? []).length === 0 ? <EmptyLibrary text="Você ainda não publicou vídeos." /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(mine.data ?? []).map((c) => (
              <Card key={c.id} padding="none" className="overflow-hidden">
                {c.cover_path ? <FileImage path={c.cover_path} alt={c.title} className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-muted"><Film className="size-8" /></div>}
                <div className="space-y-3 p-4">
                  <CardTitle className="truncate">{c.title}</CardTitle>
                  <CreationMeta c={c} />
                  {c.status === "blocked" && c.moderation_note && <p className="text-xs text-destructive">{c.moderation_note}</p>}
                  <CreationActions c={c} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ResultBanner({ r, onClose }: { r: Result; onClose: () => void }) {
  const ok = r.status === "published"; const review = r.status === "review";
  const Icon = ok ? CheckCircle2 : review ? Clock : ShieldAlert;
  return (
    <Card padding="lg" className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", ok ? "border-success/50" : review ? "border-cyan/50" : "border-destructive/50")}>
      <Icon className={cn("size-8 shrink-0", ok ? "text-success" : review ? "text-cyan" : "text-destructive")} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-display tracking-wide">{ok ? "Publicado no catálogo!" : review ? "Em revisão" : "Não publicado"}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>Classificação final:</span><AgeRating rating={r.rating as AgeRatingValue} />{review && <Badge variant="neutral" size="sm">Revisão humana</Badge>}</div>
        {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
      </div>
      <div className="flex gap-2">
        {ok && <Link to="/app/vitrine" className={buttonVariants({ size: "sm" })}>Ver no catálogo</Link>}
        <Button size="sm" variant="ghost" onClick={onClose} aria-label="Fechar"><X className="size-4" /></Button>
      </div>
    </Card>
  );
}
