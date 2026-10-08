import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clapperboard, Film } from "lucide-react";
import { Button, buttonVariants, Card, CardDescription, CardTitle, Dialog, Tabs, TabsContent, TabsList, TabsTrigger } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { allowedForKid, type Rating } from "@/experience/logic";
import { ReportButton } from "@/experience/report-dialog";
import { useExperience } from "@/experience/store";
import { CreationMeta, EmptyLibrary, FileImage, useFileUrl, type Creation } from "@/experience/creator-ui";
import { TrackCard } from "./app.jukebox";
import { useState } from "react";
import { localizeBoard, type Aspect, type BoardText, type Storyboard } from "@/lib/creator";
import { useServerFn } from "@tanstack/react-start";
import { translateCreation } from "@/lib/creator.functions";
import { useLang } from "@/experience/i18n";
import { FilmPlayer } from "@/experience/scene-motion";

type SynthData = Storyboard & { scene_images?: (string | null)[]; scene_clip_by_index?: (string | null)[]; aspect?: Aspect; resolution?: string };

/** Production text in the viewer's language; translates once on the server and caches it on the record. */
function useBoardText(c: Creation): BoardText {
  const { lang } = useLang();
  const d = c.data as unknown as SynthData;
  const need = (d.lang ?? "pt") !== lang && !d.i18n?.[lang as "en"];
  const tr = useServerFn(translateCreation);
  const { data } = useQuery({
    queryKey: ["synth-tr", c.id, lang], enabled: need, staleTime: Infinity, retry: false,
    queryFn: async () => { const r = await tr({ data: { id: c.id, lang: lang as "en" } }); return r.ok ? r.data : null; },
  });
  return localizeBoard(data ? { ...d, i18n: { ...(d.i18n ?? {}), [lang]: data } } : d, lang);
}

export const Route = createFileRoute("/app/vitrine")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Vitrine de criadores — VisionZ" },
      { name: "description", content: "Produções do Clyro Synth e músicas do Clyro Jukebox publicadas pela comunidade, verificadas pela IA." },
      { property: "og:title", content: "Vitrine de criadores — VisionZ" },
      { property: "og:description", content: "Criações da comunidade VisionZ verificadas pela IA." },
    ],
  }),
  component: Vitrine,
});

function Vitrine() {
  const { kids, kidsMax } = useExperience();
  const { data = [], isLoading } = useQuery({
    queryKey: ["vitrine"],
    queryFn: async () => (await supabase.from("creations").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(60)).data ?? [],
  });
  const visible = kids ? data.filter((c) => allowedForKid(c.age_rating as Rating, kidsMax)) : data;
  const synth = visible.filter((c) => c.tool === "synth");
  const jukebox = visible.filter((c) => c.tool === "jukebox");
  const videos = visible.filter((c) => c.tool === "video");
  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="font-display text-3xl font-bold tracking-wide">Vitrine de criadores</h1>
        <p className="text-muted-foreground">Tudo aqui passou pela análise da IA de moderação.{kids && " Modo infantil ativo: só a classificação permitida."}</p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start"><Link to="/app/publicar" className={buttonVariants({ size: "sm" })}>Publicar vídeo</Link><Link to="/app/synth" className={buttonVariants({ size: "sm", variant: "soft" })}>Criar no Synth</Link><Link to="/app/jukebox" className={buttonVariants({ size: "sm", variant: "soft" })}>Criar no Jukebox</Link></div>
      </header>
      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList className="max-w-full overflow-x-auto"><TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger><TabsTrigger value="synth">Produções ({synth.length})</TabsTrigger><TabsTrigger value="jukebox">Músicas ({jukebox.length})</TabsTrigger></TabsList>
        <TabsContent value="videos">
          {isLoading ? <EmptyLibrary text="Carregando…" /> : videos.length === 0 ? <EmptyLibrary text="Nenhum vídeo publicado ainda." /> :
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{videos.map((c) => <VideoCard key={c.id} c={c} />)}</div>}
        </TabsContent>
        <TabsContent value="synth">
          {isLoading ? <EmptyLibrary text="Carregando…" /> : synth.length === 0 ? <EmptyLibrary text="Nenhuma produção publicada ainda." /> :
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{synth.map((c) => <SynthCard key={c.id} c={c} />)}</div>}
        </TabsContent>
        <TabsContent value="jukebox">
          {isLoading ? <EmptyLibrary text="Carregando…" /> : jukebox.length === 0 ? <EmptyLibrary text="Nenhuma música publicada ainda." /> :
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{jukebox.map((c) => <TrackCard key={c.id} c={c} />)}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SynthCard({ c }: { c: Creation }) {
  const [open, setOpen] = useState(false);
  const d = c.data as unknown as SynthData;
  const t = useBoardText(c);
  const aspect = d.aspect ?? "16:9";
  const film = (d.scenes ?? []).map((s, i) => ({ camera: s.camera ?? "zoom-in", duration_sec: s.duration_sec ?? 5, transition: s.transition ?? "fade", title: t.scenes[i]?.title ?? s.title, narration: t.scenes[i]?.narration ?? s.narration, image: d.scene_images?.[i], clip: d.scene_clip_by_index?.[i] })).filter((s) => s.image || s.clip);
  return (
    <>
      <Card padding="none" className="overflow-hidden">
        <button type="button" className="relative block w-full text-left" onClick={() => setOpen(true)} aria-label={`Assistir ${t.title}`}>
          {c.cover_path ? <FileImage path={c.cover_path} alt={t.title} className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-muted"><Clapperboard className="size-8" /></div>}
          <span className="absolute bottom-2 right-2 flex gap-1 font-mono text-[10px]"><span className="rounded bg-background/80 px-1.5 py-0.5">{aspect}</span>{d.resolution && <span className="rounded bg-background/80 px-1.5 py-0.5">{d.resolution}</span>}<span className="rounded bg-background/80 px-1.5 py-0.5">{`${filmSeconds(film)} s`}</span></span>
        </button>
        <div className="space-y-3 p-4 text-center sm:text-left">
          <CardTitle data-no-translate className="truncate">{t.title}</CardTitle>
          <CardDescription data-no-translate className="line-clamp-2">{t.logline}</CardDescription>
          <CreationMeta c={c} />
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start"><Button size="sm" variant="soft" onClick={() => setOpen(true)}><Film />Assistir</Button><ReportButton titleRef={c.id} title={c.title} /></div>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={t.title} description={t.logline || undefined}>
        <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
          {open && film.length > 0 && <FilmPlayer scenes={film} aspect={aspect} />}
          <div className="space-y-3">
            {(d.scenes ?? []).map((s, i) => (
              <div key={i} className="space-y-1 border-l-2 border-cyan/40 pl-3">
                <p className="font-semibold"><span>Cena</span>{` ${i + 1} · `}<span data-no-translate>{t.scenes[i]?.title}</span></p>
                <p data-no-translate className="text-sm text-muted-foreground">{t.scenes[i]?.description}</p>
                {t.scenes[i]?.narration && <p data-no-translate className="text-sm italic">“{t.scenes[i].narration}”</p>}
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}

const filmSeconds = (f: { duration_sec: number }[]) => f.reduce((n, s) => n + s.duration_sec, 0);

function VideoCard({ c }: { c: Creation }) {
  const [open, setOpen] = useState(false);
  const d = c.data as { video_path?: string; duration_sec?: number | null };
  const url = useFileUrl(open ? d.video_path : null);
  const dur = d.duration_sec ? `${Math.floor(d.duration_sec / 60)}:${String(d.duration_sec % 60).padStart(2, "0")}` : null;
  return (
    <>
      <Card padding="none" className="overflow-hidden">
        <button type="button" className="relative block w-full" onClick={() => setOpen(true)} aria-label={`Assistir ${c.title}`}>
          {c.cover_path ? <FileImage path={c.cover_path} alt={c.title} className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-muted"><Film className="size-8" /></div>}
          {dur && <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">{dur}</span>}
        </button>
        <div className="space-y-3 p-4 text-center sm:text-left">
          <CardTitle className="truncate">{c.title}</CardTitle>
          {c.description && <CardDescription className="line-clamp-2">{c.description}</CardDescription>}
          <CreationMeta c={c} />
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start"><Button size="sm" variant="soft" onClick={() => setOpen(true)}>Assistir</Button><ReportButton titleRef={c.id} title={c.title} /></div>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={c.title} description={c.description ?? undefined}>
        {url ? <video src={url} controls autoPlay className="aspect-video w-full rounded-xl bg-background" /> : <EmptyLibrary text="Carregando…" />}
      </Dialog>
    </>
  );
}
