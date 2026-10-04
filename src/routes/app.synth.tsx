import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clapperboard, ImagePlus, Save, Sparkles, Wand2 } from "lucide-react";
import { Badge, Button, Card, CardDescription, CardTitle, Input, Label, Logo, Progress, Select, useToast } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { AGE_RATINGS, type Age, type Storyboard } from "@/lib/creator";
import { synthSceneImage, synthStoryboard } from "@/lib/creator.functions";
import { CreationActions, CreationMeta, EmptyLibrary, FileImage, useMyCreations } from "@/experience/creator-ui";

export const Route = createFileRoute("/app/synth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Clyro Synth — Estúdio de mídia sintética VisionZ" },
      { name: "description", content: "Transforme uma ideia em roteiro, cenas e imagens com IA no Clyro Synth." },
      { property: "og:title", content: "Clyro Synth — VisionZ" },
      { property: "og:description", content: "Estúdio de mídia sintética com IA." },
    ],
  }),
  component: Synth,
});

const STYLES = ["Animação 3D colorida", "Anime", "Cinema realista", "Aquarela infantil", "Neon futurista", "Documentário"];

function Synth() {
  const { user } = Route.useRouteContext();
  const toast = useToast();
  const qc = useQueryClient();
  const genBoard = useServerFn(synthStoryboard);
  const genImage = useServerFn(synthSceneImage);
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [scenes, setScenes] = useState(4);
  const [age, setAge] = useState<Age>("L");
  const [board, setBoard] = useState<Storyboard | null>(null);
  const [paths, setPaths] = useState<(string | null)[]>([]);
  const [busy, setBusy] = useState<"board" | "images" | "save" | null>(null);
  const [imgIndex, setImgIndex] = useState<number | null>(null);
  const library = useMyCreations("synth");

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 5) return toast({ title: "Descreva sua ideia com pelo menos 5 letras", variant: "error" });
    setBusy("board");
    const r = await genBoard({ data: { idea, style, scenes, age } });
    setBusy(null);
    if (!r.ok) return toast({ title: "Não deu para criar o roteiro", description: r.error, variant: "error" });
    setBoard(r.data); setPaths(r.data.scenes.map(() => null));
  };

  const makeImage = async (i: number) => {
    if (!board) return false;
    setImgIndex(i);
    const r = await genImage({ data: { prompt: board.scenes[i].image_prompt || board.scenes[i].description } });
    setImgIndex(null);
    if (!r.ok) { toast({ title: `Cena ${i + 1}: imagem não gerada`, description: r.error, variant: "error" }); return false; }
    setPaths((p) => p.map((x, j) => (j === i ? r.data.path : x)));
    return true;
  };

  const makeAll = async () => {
    if (!board) return;
    setBusy("images");
    for (let i = 0; i < board.scenes.length; i++) {
      if (paths[i]) continue;
      if (!(await makeImage(i))) break;
    }
    setBusy(null);
  };

  const save = async () => {
    if (!board) return;
    setBusy("save");
    const scenePaths = paths.filter(Boolean) as string[];
    const { error } = await supabase.from("creations").insert({
      user_id: user.id, tool: "synth", title: board.title, description: board.logline, age_rating: age,
      cover_path: scenePaths[0] ?? null,
      data: { ...board, style, scene_paths: scenePaths, scene_images: paths },
    });
    setBusy(null);
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    toast({ title: "Salvo na sua biblioteca", description: "Publique quando quiser mostrar na vitrine.", variant: "success" });
    setBoard(null); setPaths([]); setIdea("");
    qc.invalidateQueries({ queryKey: ["creations", "synth"] });
  };

  const done = paths.filter(Boolean).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Logo brand="clyro-synth" alt="Clyro Synth" className="h-16 w-auto drop-shadow-[0_0_12px_var(--cyan)]" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-gradient-brand">Clyro Synth</h1>
          <p className="text-muted-foreground">Da ideia ao storyboard: roteiro, cenas e imagens criados com IA.</p>
        </div>
      </header>

      <Card variant="glass" padding="lg" className="space-y-4 border-cyan/30">
        <CardTitle className="flex items-center justify-center gap-2 text-lg sm:justify-start"><Wand2 className="size-5 text-cyan" />Nova produção</CardTitle>
        <form onSubmit={createBoard} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sy-i">Sua ideia</Label>
            <textarea id="sy-i" value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={800} rows={3}
              placeholder="Ex.: O Trio Alegria descobre um robô perdido na praia e o ajuda a voltar para casa."
              className="w-full rounded-xl border bg-surface p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-cyan focus-visible:shadow-glow-cyan" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label htmlFor="sy-s">Estilo</Label><Select id="sy-s" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLES.map((s) => <option key={s}>{s}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="sy-n">Cenas</Label><Select id="sy-n" value={scenes} onChange={(e) => setScenes(Number(e.target.value))}>{[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} cenas</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="sy-a">Classificação</Label><Select id="sy-a" value={age} onChange={(e) => setAge(e.target.value as Age)}>{AGE_RATINGS.map((a) => <option key={a} value={a}>{a === "L" ? "Livre" : `${a} anos`}</option>)}</Select></div>
          </div>
          <Button type="submit" loading={busy === "board"} className="w-full sm:w-auto"><Sparkles />{busy === "board" ? "Escrevendo roteiro…" : "Criar storyboard"}</Button>
        </form>
      </Card>

      {board && (
        <section className="space-y-4">
          <Card variant="featured" padding="lg" className="space-y-3 text-center sm:text-left">
            <Badge variant="cyan" className="mx-auto sm:mx-0">{style}</Badge>
            <h2 className="font-display text-2xl font-bold tracking-wide">{board.title}</h2>
            <p className="text-muted-foreground">{board.logline}</p>
            <div className="space-y-1"><div className="flex justify-between text-sm"><span>Imagens das cenas</span><span className="font-mono">{done}/{board.scenes.length}</span></div><Progress value={(done / board.scenes.length) * 100} variant="cyan" label="Imagens geradas" /></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="neon" loading={busy === "images"} disabled={done === board.scenes.length || busy !== null} onClick={makeAll}><ImagePlus />{busy === "images" ? `Gerando cena ${(imgIndex ?? 0) + 1}…` : "Gerar todas as imagens"}</Button>
              <Button loading={busy === "save"} disabled={busy !== null} onClick={save}><Save />Salvar na biblioteca</Button>
            </div>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {board.scenes.map((s, i) => (
              <Card key={i} padding="none" className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {paths[i] ? <FileImage path={paths[i]} alt={s.title} className="size-full object-cover" />
                    : <div className="grid size-full place-items-center">
                        <Button size="sm" variant="soft" loading={imgIndex === i} disabled={busy !== null || imgIndex !== null} onClick={() => makeImage(i)}><ImagePlus />{imgIndex === i ? "Gerando…" : "Gerar imagem"}</Button>
                      </div>}
                  <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-xs">Cena {i + 1}</span>
                </div>
                <div className="space-y-2 p-5 text-center sm:text-left">
                  <CardTitle>{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                  {s.narration && <p className="border-l-2 border-cyan/60 pl-3 text-left text-sm italic text-foreground/85">“{s.narration}”</p>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-center font-display text-xl font-bold tracking-wide sm:text-left">Minhas produções</h2>
        {library.isLoading ? <EmptyLibrary text="Carregando…" /> : (library.data ?? []).length === 0 ? <EmptyLibrary text="Você ainda não salvou nenhuma produção." /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {library.data!.map((c) => {
              const d = c.data as { scenes?: unknown[] };
              return (
                <Card key={c.id} padding="none" className="overflow-hidden">
                  {c.cover_path ? <FileImage path={c.cover_path} alt={c.title} className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-muted"><Clapperboard className="size-8 text-muted-foreground" /></div>}
                  <div className="space-y-3 p-4 text-center sm:text-left">
                    <CardTitle className="truncate">{c.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{d.scenes?.length ?? 0} cenas</p>
                    <CreationMeta c={c} />
                    {c.status === "blocked" && c.moderation_note && <p className="text-xs text-destructive">{c.moderation_note}</p>}
                    <CreationActions c={c} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
