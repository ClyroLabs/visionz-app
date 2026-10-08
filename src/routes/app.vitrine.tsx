import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clapperboard } from "lucide-react";
import { Button, buttonVariants, Card, CardDescription, CardTitle, Dialog, Tabs, TabsContent, TabsList, TabsTrigger } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { allowedForKid, type Rating } from "@/experience/logic";
import { ReportButton } from "@/experience/report-dialog";
import { useExperience } from "@/experience/store";
import { CreationMeta, EmptyLibrary, FileImage, type Creation } from "@/experience/creator-ui";
import { TrackCard } from "./app.jukebox";
import { useState } from "react";
import type { Storyboard } from "@/lib/creator";

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
  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="font-display text-3xl font-bold tracking-wide">Vitrine de criadores</h1>
        <p className="text-muted-foreground">Tudo aqui passou pela análise da IA de moderação.{kids && " Modo infantil ativo: só a classificação permitida."}</p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start"><Link to="/app/synth" className={buttonVariants({ size: "sm", variant: "soft" })}>Criar no Synth</Link><Link to="/app/jukebox" className={buttonVariants({ size: "sm", variant: "soft" })}>Criar no Jukebox</Link></div>
      </header>
      <Tabs defaultValue="synth" className="space-y-6">
        <TabsList><TabsTrigger value="synth">Produções ({synth.length})</TabsTrigger><TabsTrigger value="jukebox">Músicas ({jukebox.length})</TabsTrigger></TabsList>
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
  const d = c.data as unknown as Storyboard & { scene_images?: (string | null)[] };
  return (
    <>
      <Card padding="none" className="overflow-hidden">
        <button type="button" className="block w-full text-left" onClick={() => setOpen(true)} aria-label={`Ver ${c.title}`}>
          {c.cover_path ? <FileImage path={c.cover_path} alt={c.title} className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-muted"><Clapperboard className="size-8" /></div>}
        </button>
        <div className="space-y-3 p-4 text-center sm:text-left">
          <CardTitle className="truncate">{c.title}</CardTitle>
          <CardDescription className="line-clamp-2">{c.description}</CardDescription>
          <CreationMeta c={c} />
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start"><Button size="sm" variant="soft" onClick={() => setOpen(true)}>Ver storyboard</Button><ReportButton titleRef={c.id} title={c.title} /></div>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen} title={c.title} description={c.description ?? undefined}>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {(d.scenes ?? []).map((s, i) => (
            <div key={i} className="space-y-2">
              {d.scene_images?.[i] && <FileImage path={d.scene_images[i]} alt={s.title} className="aspect-video w-full rounded-xl object-cover" />}
              <p className="font-semibold">Cena {i + 1} · {s.title}</p>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              {s.narration && <p className="text-sm italic">“{s.narration}”</p>}
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
}
