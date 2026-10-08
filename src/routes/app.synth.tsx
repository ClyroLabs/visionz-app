import { ApiAccess } from "@/experience/api-access";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clapperboard, Film, ImagePlus, Save, Sparkles, Video, Wand2 } from "lucide-react";
import { Badge, Button, Card, CardDescription, CardTitle, Input, Label, Logo, Progress, Select, useToast } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { AGE_RATINGS, ASPECTS, CAMERAS, RESOLUTIONS, TRANSITIONS, filmLength, type Age, type Aspect, type Resolution, type Scene, type Storyboard } from "@/lib/creator";
import { synthClipStart, synthClipStatus, synthSceneImage, synthStoryboard } from "@/lib/creator.functions";
import { CAMERA_LABEL, FilmPlayer, SceneTimeline, TRANSITION_LABEL } from "@/experience/scene-motion";
import { buildTimeline } from "@/experience/film-engine";
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

/** Example credit costs shown before each AI action. */
const COST = { board: 1, image: 2, clip: 25 } as const;
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
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [res, setRes] = useState<Resolution>("4K");
  const [clips, setClips] = useState<(string | null)[]>([]);
  const [clipIndex, setClipIndex] = useState<number | null>(null);
  const [sel, setSel] = useState(0);
  const [seek, setSeek] = useState<{ t: number; n: number } | undefined>();
  const setPreview = (_: boolean) => {};
  const preview = true;
  const startClip = useServerFn(synthClipStart);
  const clipStatus = useServerFn(synthClipStatus);
  const editScene = (i: number, p: Partial<Scene>) => setBoard((b) => b && { ...b, scenes: b.scenes.map((s, j) => (j === i ? { ...s, ...p } : s)) });

  const makeClip = async (i: number) => {
    if (!board || !paths[i] || clipIndex !== null) return;
    const sc = board.scenes[i];
    setClipIndex(i);
    const r = await startClip({ data: { imagePath: paths[i]!, prompt: sc.image_prompt || sc.description, camera: sc.camera, aspect, seconds: sc.duration_sec } });
    if (!r.ok) { setClipIndex(null); return toast({ title: "Clipe não iniciado", description: r.error, variant: "error" }); }
    for (let n = 0; n < 60; n++) {
      await new Promise((ok) => setTimeout(ok, 6000));
      const st = await clipStatus({ data: { id: r.data.id } });
      if (!st.ok) { setClipIndex(null); return toast({ title: "Clipe interrompido", description: st.error, variant: "error" }); }
      if (st.data.status === "failed") { setClipIndex(null); return toast({ title: "Clipe não gerado", description: `${st.data.error} A imagem da cena pode ser a causa.`, variant: "error" }); }
      if (st.data.status === "done") { const path = st.data.path; setClips((c) => c.map((x, j) => (j === i ? path : x))); setClipIndex(null); return toast({ title: `Cena ${i + 1}: clipe pronto`, variant: "success" }); }
    }
    setClipIndex(null);
    toast({ title: "O clipe está demorando", description: "Tente abrir de novo em alguns minutos.", variant: "error" });
  };
  const library = useMyCreations("synth");

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 5) return toast({ title: "Descreva sua ideia com pelo menos 5 letras", variant: "error" });
    setBusy("board");
    const r = await genBoard({ data: { idea, style, scenes, age, aspect } });
    setBusy(null);
    if (!r.ok) return toast({ title: "Não deu para criar o roteiro", description: r.error, variant: "error" });
    setBoard(r.data); setPaths(r.data.scenes.map(() => null)); setClips(r.data.scenes.map(() => null)); setPreview(false);
  };

  const makeImage = async (i: number) => {
    if (!board) return false;
    setImgIndex(i);
    const r = await genImage({ data: { prompt: board.scenes[i].image_prompt || board.scenes[i].description, aspect } });
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
      data: JSON.parse(JSON.stringify({ ...board, style, aspect, resolution: res, scene_paths: scenePaths, scene_images: paths, scene_clip_by_index: clips, scene_clips: clips.filter(Boolean) })),
    });
    setBusy(null);
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    toast({ title: "Salvo na sua biblioteca", description: "Publique quando quiser mostrar na vitrine.", variant: "success" });
    setBoard(null); setPaths([]); setClips([]); setIdea("");
    qc.invalidateQueries({ queryKey: ["creations", "synth"] });
  };

  const done = paths.filter(Boolean).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Logo brand="clyro-synth" alt="Clyro Synth" className="h-16 w-auto drop-shadow-[0_0_12px_var(--cyan)]" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-gradient-brand">Clyro Synth</h1>
          <p className="text-muted-foreground">Da ideia ao filme: roteiro, cenas em movimento e clipes com IA, em qualquer formato até 8K.</p>
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
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1.5"><Label htmlFor="sy-f">Formato</Label><Select id="sy-f" value={aspect} onChange={(e) => setAspect(e.target.value as Aspect)}>{ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="sy-r">Exportação final</Label><Select id="sy-r" value={res} onChange={(e) => setRes(e.target.value as Resolution)}>{RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="sy-s">Estilo</Label><Select id="sy-s" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLES.map((s) => <option key={s}>{s}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="sy-n">Cenas</Label><Select id="sy-n" value={scenes} onChange={(e) => setScenes(Number(e.target.value))}>{[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} cenas</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="sy-a">Classificação</Label><Select id="sy-a" value={age} onChange={(e) => setAge(e.target.value as Age)}>{AGE_RATINGS.map((a) => <option key={a} value={a}>{a === "L" ? "Livre" : `${a} anos`}</option>)}</Select></div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="submit" loading={busy === "board"} className="w-full sm:w-auto"><Sparkles />{busy === "board" ? "Escrevendo roteiro…" : "Criar filme"}</Button>
            <span className="text-xs text-muted-foreground">{`Roteiro em 4 idiomas numa só chamada · ~${COST.board} crédito de exemplo`}</span>
          </div>
          <p className="text-xs text-muted-foreground">A exportação em 2K, 4K ou 8K é a etapa final (demonstração). Os clipes de IA saem na qualidade máxima do modelo.</p>
        </form>
      </Card>

      {board && (
        <section className="space-y-4">
          <Card variant="featured" padding="lg" className="space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start"><Badge variant="cyan">{style}</Badge><Badge variant="neutral">{aspect}</Badge><Badge variant="neutral">{res}</Badge><Badge variant="neutral">{`${filmLength(board.scenes)} s`}</Badge></div>
            <h2 className="font-display text-2xl font-bold tracking-wide">{board.title}</h2>
            <p className="text-muted-foreground">{board.logline}</p>
            <div className="space-y-1"><div className="flex justify-between text-sm"><span>Imagens das cenas</span><span className="font-mono">{done}/{board.scenes.length}</span></div><Progress value={(done / board.scenes.length) * 100} variant="cyan" label="Imagens geradas" /><p className="text-xs text-muted-foreground">{`~${COST.image} créditos de exemplo por imagem · os movimentos de câmera são gratuitos`}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="neon" loading={busy === "images"} disabled={done === board.scenes.length || busy !== null} onClick={makeAll}><ImagePlus />{busy === "images" ? `Gerando cena ${(imgIndex ?? 0) + 1}…` : "Gerar todas as imagens"}</Button>
              <Button loading={busy === "save"} disabled={busy !== null || clipIndex !== null} onClick={save}><Save />Salvar na biblioteca</Button>
            </div>
          </Card>
          <Card padding="lg" className="space-y-4">
            <FilmPlayer aspect={aspect} title={board.title} seek={seek} scenes={board.scenes.map((s, i) => ({ ...s, image: paths[i], clip: clips[i] }))} />
            <SceneTimeline scenes={board.scenes} paths={paths} clips={clips} aspect={aspect} sel={sel} onPick={(i) => { setSel(i); setSeek({ t: buildTimeline(board.scenes)[i].start, n: Date.now() }); }} />
          </Card>
          {(() => { const i = sel; const s = board.scenes[i]; if (!s) return null; return (
            <Card padding="lg" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><CardTitle><span>Cena</span>{` ${i + 1} · `}<span data-no-translate>{s.title}</span></CardTitle><Badge variant="neutral" size="sm">{`${s.duration_sec} s`}</Badge></div>
              <CardDescription data-no-translate>{s.description}</CardDescription>
              <div className="space-y-1"><Label htmlFor="nar" className="text-xs">Narração</Label><Input id="nar" data-no-translate value={s.narration} maxLength={240} onChange={(e) => editScene(i, { narration: e.target.value })} /></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1"><Label htmlFor="cam" className="text-xs">Câmera</Label><Select id="cam" value={s.camera} onChange={(e) => editScene(i, { camera: e.target.value as Scene["camera"] })}>{CAMERAS.map((c) => <option key={c} value={c}>{CAMERA_LABEL[c]}</option>)}</Select></div>
                <div className="space-y-1"><Label htmlFor="dur" className="text-xs">Duração</Label><Select id="dur" value={s.duration_sec} onChange={(e) => editScene(i, { duration_sec: Number(e.target.value) })}>{[3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{`${n} s`}</option>)}</Select></div>
                <div className="space-y-1"><Label htmlFor="tr" className="text-xs">Transição</Label><Select id="tr" value={s.transition} onChange={(e) => editScene(i, { transition: e.target.value as Scene["transition"] })}>{TRANSITIONS.map((x) => <option key={x} value={x}>{TRANSITION_LABEL[x]}</option>)}</Select></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!paths[i] && <Button size="sm" variant="soft" loading={imgIndex === i} disabled={busy !== null || imgIndex !== null} onClick={() => makeImage(i)}><ImagePlus />{imgIndex === i ? "Gerando…" : "Gerar imagem"}</Button>}
                {paths[i] && <Button size="sm" variant="neon" loading={clipIndex === i} disabled={!!clips[i] || clipIndex !== null || busy !== null} onClick={() => makeClip(i)}><Video />{clips[i] ? "Clipe pronto" : clipIndex === i ? "Gerando clipe…" : "Gerar clipe com IA"}</Button>}
                {paths[i] && !clips[i] && <span className="text-xs text-muted-foreground">{`este clipe usa ~${COST.clip} créditos de exemplo`}</span>}
              </div>
            </Card>); })()}
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
                    <p className="text-xs text-muted-foreground">{`${d.scenes?.length ?? 0} cenas`}</p>
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
      <ApiAccess api="synth" />
    </div>
  );
}
