import { QuotaHint, usePlan, useRefreshPlan, blocked } from "@/experience/plan-ui";
import { ApiAccess } from "@/experience/api-access";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Music2, Save, Sparkles, Upload, Wand2 } from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, Logo, Select, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { AGE_RATINGS, type Age, type Composition } from "@/lib/creator";
import { jukeboxCompose, jukeboxDescribe, synthSceneImage } from "@/lib/creator.functions";
import { CompositionPlayer, CreationActions, CreationMeta, EmptyLibrary, FileImage, useFileUrl, useMyCreations, type Creation } from "@/experience/creator-ui";

export const Route = createFileRoute("/app/jukebox")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Clyro Jukebox — Música original VisionZ" },
      { name: "description", content: "Componha canções originais com IA ou envie suas faixas no Clyro Jukebox." },
      { property: "og:title", content: "Clyro Jukebox — VisionZ" },
      { property: "og:description", content: "Música original com IA na VisionZ." },
    ],
  }),
  component: Jukebox,
});

const GENRES = ["Pop", "Funk", "MPB", "Eletrônica", "Rock", "Sertanejo", "Infantil", "Lo-fi"];
const MOODS = ["Alegre", "Épico", "Calmo", "Nostálgico", "Energético"];
const ageLabel = (a: Age) => (a === "L" ? "Livre" : `${a} anos`);

function Jukebox() {
  const library = useMyCreations("jukebox");
  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Logo brand="clyro-jukebox" alt="Clyro Jukebox" className="h-16 w-auto drop-shadow-[0_0_12px_var(--magenta)]" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-gradient-brand">Clyro Jukebox</h1>
          <p className="text-muted-foreground">Música original, sem burocracia: quem cria, é dono e recebe pela obra.</p>
        </div>
      </header>
      <Tabs defaultValue="compor" className="space-y-6">
        <TabsList><TabsTrigger value="compor">Compor com IA</TabsTrigger><TabsTrigger value="enviar">Enviar faixa</TabsTrigger></TabsList>
        <TabsContent value="compor"><Compose /></TabsContent>
        <TabsContent value="enviar"><UploadTrack /></TabsContent>
      </Tabs>
      <section className="space-y-4">
        <h2 className="text-center font-display text-xl font-bold tracking-wide sm:text-left">Minhas faixas</h2>
        {library.isLoading ? <EmptyLibrary text="Carregando…" /> : (library.data ?? []).length === 0 ? <EmptyLibrary text="Você ainda não salvou nenhuma faixa." /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{library.data!.map((c) => <TrackCard key={c.id} c={c} owner />)}</div>
        )}
      </section>
      <ApiAccess api="jukebox" />
    </div>
  );
}

function Compose() {
  const { user } = Route.useRouteContext();
  const plan = usePlan();
  const refreshPlan = useRefreshPlan();
  const toast = useToast();
  const qc = useQueryClient();
  const compose = useServerFn(jukeboxCompose);
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [age, setAge] = useState<Age>("L");
  const [song, setSong] = useState<Composition | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 3) return toast({ title: "Conte sobre o que é a música", variant: "error" });
    setBusy(true);
    const r = await compose({ data: { idea, genre, mood, age } });
    refreshPlan();
    setBusy(false);
    if (!r.ok) return toast({ title: "Não deu para compor", description: r.error, variant: "error" });
    setSong(r.data);
  };
  const save = async () => {
    if (!song) return;
    const { error } = await supabase.from("creations").insert({ user_id: user.id, tool: "jukebox", title: song.title, description: `${genre} · ${song.mood || mood}`, age_rating: age, data: JSON.parse(JSON.stringify({ kind: "composed", genre, ...song })) });
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    toast({ title: "Faixa salva na sua biblioteca", variant: "success" });
    setSong(null); setIdea("");
    qc.invalidateQueries({ queryKey: ["creations", "jukebox"] });
  };

  return (
    <div className="space-y-4">
      <Card variant="glass" padding="lg" className="space-y-4 border-magenta/30">
        <CardTitle className="flex items-center justify-center gap-2 text-lg sm:justify-start"><Wand2 className="size-5 text-magenta" />Nova composição</CardTitle>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="jk-i">Sobre o que é a música?</Label><Input id="jk-i" value={idea} maxLength={600} placeholder="Ex.: um verão em Fortaleza com os amigos" onChange={(e) => setIdea(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label htmlFor="jk-g">Gênero</Label><Select id="jk-g" value={genre} onChange={(e) => setGenre(e.target.value)}>{GENRES.map((g) => <option key={g}>{g}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="jk-m">Clima</Label><Select id="jk-m" value={mood} onChange={(e) => setMood(e.target.value)}>{MOODS.map((g) => <option key={g}>{g}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="jk-a">Classificação</Label><Select id="jk-a" value={age} onChange={(e) => setAge(e.target.value as Age)}>{AGE_RATINGS.map((a) => <option key={a} value={a}>{ageLabel(a)}</option>)}</Select></div>
          </div>
          <Button type="submit" loading={busy} disabled={blocked(plan, "jukebox_compose")} className="w-full sm:w-auto"><Sparkles />{busy ? "Compondo…" : "Compor música"}</Button>
          <QuotaHint feature="jukebox_compose" className="block" />
        </form>
      </Card>
      {song && (
        <Card variant="featured" padding="lg" className="space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">{[`${song.bpm} BPM`, `Tom ${song.key}`, ...song.tags].map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}</div>
          <h2 className="font-display text-2xl font-bold tracking-wide">{song.title}</h2>
          <p className="font-mono text-sm text-cyan">{song.chords.join("  ·  ")}</p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{song.lyrics}</pre>
          <div className="flex flex-col gap-2 sm:flex-row"><CompositionPlayer composition={song} /><Button variant="secondary" onClick={save}><Save />Salvar na biblioteca</Button></div>
          <p className="text-xs text-muted-foreground">A prévia toca a melodia e os acordes com instrumentos sintetizados.</p>
        </Card>
      )}
    </div>
  );
}

function UploadTrack() {
  const { user } = Route.useRouteContext();
  const toast = useToast();
  const qc = useQueryClient();
  const describe = useServerFn(jukeboxDescribe);
  const cover = useServerFn(synthSceneImage);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [age, setAge] = useState<Age>("L");
  const [makeCover, setMakeCover] = useState(true);
  const [step, setStep] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast({ title: "Escolha um arquivo de áudio", variant: "error" });
    if (!file.type.startsWith("audio/") || file.size > 25 * 1024 * 1024) return toast({ title: "Envie um áudio de até 25 MB", variant: "error" });
    setStep("Enviando áudio…");
    const audioPath = `${user.id}/jukebox/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "mp3"}`;
    const up = await supabase.storage.from("creations").upload(audioPath, file, { contentType: file.type });
    if (up.error) { setStep(null); return toast({ title: "Falha no envio do áudio", variant: "error" }); }
    setStep("IA criando título e descrição…");
    const d = await describe({ data: { filename: file.name, notes } });
    const meta = d.ok ? d.data : { title: file.name.replace(/\.[^.]+$/, ""), description: notes, tags: [], cover_prompt: "" };
    let coverPath: string | null = null;
    if (makeCover && meta.cover_prompt) {
      setStep("IA criando a capa…");
      const c = await cover({ data: { prompt: meta.cover_prompt } });
      if (c.ok) coverPath = c.data.path; else toast({ title: "Capa não gerada", description: c.error, variant: "error" });
    }
    const { error } = await supabase.from("creations").insert({ user_id: user.id, tool: "jukebox", title: meta.title, description: meta.description, age_rating: age, audio_path: audioPath, cover_path: coverPath, data: { kind: "upload", tags: meta.tags } });
    setStep(null);
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    toast({ title: "Faixa adicionada", description: meta.title, variant: "success" });
    setFile(null); setNotes("");
    qc.invalidateQueries({ queryKey: ["creations", "jukebox"] });
  };

  return (
    <Card variant="glass" padding="lg" className="space-y-4 border-magenta/30">
      <CardTitle className="flex items-center justify-center gap-2 text-lg sm:justify-start"><Upload className="size-5 text-magenta" />Enviar sua faixa</CardTitle>
      <form onSubmit={submit} className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-magenta/40 p-6 text-center hover:bg-magenta/5">
          <Music2 className="size-8 text-magenta" />
          <span className="text-sm font-medium">{file ? file.name : "Toque para escolher um áudio (MP3, WAV, OGG · até 25 MB)"}</span>
          <input type="file" accept="audio/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div className="space-y-1.5"><Label htmlFor="up-n">Conte sobre a faixa (opcional)</Label><Input id="up-n" value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: funk melódico sobre superação" /></div>
          <div className="space-y-1.5"><Label htmlFor="up-a">Classificação</Label><Select id="up-a" value={age} onChange={(e) => setAge(e.target.value as Age)}>{AGE_RATINGS.map((a) => <option key={a} value={a}>{ageLabel(a)}</option>)}</Select></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={makeCover} onChange={(e) => setMakeCover(e.target.checked)} className="size-4 accent-[var(--magenta)]" />Criar capa com IA</label>
        <Button type="submit" loading={!!step} className="w-full sm:w-auto"><Upload />{step ?? "Enviar faixa"}</Button>
      </form>
    </Card>
  );
}

export function TrackCard({ c, owner }: { c: Creation; owner?: boolean }) {
  const d = c.data as Partial<Composition> & { kind?: string; tags?: string[] };
  const audio = useFileUrl(c.audio_path);
  return (
    <Card padding="none" className="overflow-hidden">
      {c.cover_path ? <FileImage path={c.cover_path} alt={c.title} className="aspect-square w-full object-cover" />
        : <div className="grid aspect-square place-items-center bg-gradient-to-br from-magenta/25 via-violet/20 to-ember/20"><Music2 className="size-12 text-foreground/70" /></div>}
      <div className="space-y-3 p-4 text-center sm:text-left">
        <CardTitle className="truncate">{c.title}</CardTitle>
        {c.description && <p className="line-clamp-2 text-xs text-muted-foreground">{c.description}</p>}
        <CreationMeta c={c} />
        {d.kind === "composed" && d.melody ? <CompositionPlayer composition={d as Composition} className="w-full" />
          : audio ? <audio controls src={audio} className="w-full" preload="none" /> : null}
        {owner && c.status === "blocked" && c.moderation_note && <p className="text-xs text-destructive">{c.moderation_note}</p>}
        {owner && <CreationActions c={c} />}
      </div>
    </Card>
  );
}
