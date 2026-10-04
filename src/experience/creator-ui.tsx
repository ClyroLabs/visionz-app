import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Globe, Lock, Pause, Play, ShieldAlert, Trash2 } from "lucide-react";
import { AgeRating, AIVerifiedBadge, Badge, Button, Card, useToast, type AgeRatingValue } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { chordNotes, type Composition } from "@/lib/creator";
import { publishCreation, unpublishCreation } from "@/lib/creator.functions";
import type { Tables } from "@/integrations/supabase/types";

export type Creation = Tables<"creations">;

/** Short-lived URL for a private file (works for published files when signed out). */
export function useFileUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["file", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => (await supabase.storage.from("creations").createSignedUrl(path!, 3600)).data?.signedUrl ?? null,
  }).data ?? undefined;
}

export function FileImage({ path, alt, className }: { path?: string | null; alt: string; className?: string }) {
  const url = useFileUrl(path);
  if (!url) return <div className={`animate-pulse bg-muted ${className ?? ""}`} aria-hidden />;
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}

const freq = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Plays an AI composition with synthesized lead, pads and a soft beat. */
export function CompositionPlayer({ composition, className }: { composition: Composition; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    ctxRef.current?.close();
    ctxRef.current = null;
    if (stopTimer.current) clearTimeout(stopTimer.current);
    setPlaying(false);
  };
  useEffect(() => stop, []);

  const play = () => {
    stop();
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    const beat = 60 / composition.bpm;
    const t0 = ctx.currentTime + 0.1;
    // lead
    let t = t0;
    for (const note of composition.melody) {
      const dur = note.d * beat;
      if (note.n !== null) {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = freq(note.n);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
        o.connect(g).connect(master); o.start(t); o.stop(t + dur);
      }
      t += dur;
    }
    const total = t - t0;
    // pads, one chord per bar
    const bar = beat * 4;
    for (let i = 0, ct = t0; ct < t0 + total; i++, ct += bar) {
      for (const m of chordNotes(composition.chords[i % composition.chords.length])) {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq(m);
        g.gain.setValueAtTime(0, ct); g.gain.linearRampToValueAtTime(0.07, ct + 0.3); g.gain.linearRampToValueAtTime(0, ct + bar);
        o.connect(g).connect(master); o.start(ct); o.stop(ct + bar);
      }
    }
    // kick on each beat
    for (let bt = t0; bt < t0 + total; bt += beat) {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.setValueAtTime(120, bt); o.frequency.exponentialRampToValueAtTime(40, bt + 0.15);
      g.gain.setValueAtTime(0.4, bt); g.gain.exponentialRampToValueAtTime(0.001, bt + 0.2);
      o.connect(g).connect(master); o.start(bt); o.stop(bt + 0.2);
    }
    setPlaying(true);
    stopTimer.current = setTimeout(stop, (total + 0.5) * 1000);
  };

  return (
    <Button variant={playing ? "soft" : "primary"} className={className} onClick={playing ? stop : play}>
      {playing ? <Pause /> : <Play />}{playing ? "Parar" : "Ouvir"}
    </Button>
  );
}

export function StatusBadge({ c }: { c: Creation }) {
  if (c.status === "published") return <Badge variant="success"><Globe />Publicado</Badge>;
  if (c.status === "blocked") return <Badge variant="destructive"><ShieldAlert />Bloqueado</Badge>;
  return <Badge variant="neutral"><Lock />Rascunho</Badge>;
}

/** Publish / unpublish / delete controls for one of the creator's items. */
export function CreationActions({ c }: { c: Creation }) {
  const qc = useQueryClient();
  const toast = useToast();
  const pub = useServerFn(publishCreation);
  const unpub = useServerFn(unpublishCreation);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["creations"] }); qc.invalidateQueries({ queryKey: ["vitrine"] }); };
  const publish = useMutation({
    mutationFn: () => pub({ data: { id: c.id } }),
    onSuccess: (r) => {
      refresh();
      if (!r.ok) return toast({ title: "Não foi possível publicar", description: r.error, variant: "error" });
      toast(r.data.allowed
        ? { title: "Publicado na vitrine", description: `Aprovado pela IA · classificação ${r.data.rating}`, variant: "success" }
        : { title: "Bloqueado pela IA", description: r.data.note, variant: "error" });
    },
  });
  const unpublish = useMutation({ mutationFn: () => unpub({ data: { id: c.id } }), onSuccess: refresh });
  const remove = useMutation({
    mutationFn: async () => {
      const d = (c.data ?? {}) as { scene_paths?: string[] };
      const files = [c.cover_path, c.audio_path, ...(d.scene_paths ?? [])].filter(Boolean) as string[];
      if (files.length) await supabase.storage.from("creations").remove(files);
      await supabase.from("creations").delete().eq("id", c.id);
    },
    onSuccess: refresh,
  });
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
      {c.status === "published"
        ? <Button size="sm" variant="soft" loading={unpublish.isPending} onClick={() => unpublish.mutate()}><Lock />Despublicar</Button>
        : <Button size="sm" loading={publish.isPending} onClick={() => publish.mutate()}><Globe />{publish.isPending ? "IA analisando…" : c.status === "blocked" ? "Revisar de novo" : "Publicar"}</Button>}
      <Button size="icon" variant="danger" aria-label="Excluir" loading={remove.isPending} onClick={() => { if (confirm("Excluir esta criação?")) remove.mutate(); }}><Trash2 /></Button>
    </div>
  );
}

export function useMyCreations(tool: "synth" | "jukebox") {
  return useQuery({
    queryKey: ["creations", tool],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      return (await supabase.from("creations").select("*").eq("tool", tool).eq("user_id", u.user.id).order("created_at", { ascending: false })).data ?? [];
    },
  });
}

export function CreationMeta({ c }: { c: Creation }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <AgeRating rating={c.age_rating as AgeRatingValue} />
      <StatusBadge c={c} />
      {c.status === "published" && <AIVerifiedBadge />}
    </div>
  );
}

export function EmptyLibrary({ text }: { text: string }) {
  return <Card className="text-center text-sm text-muted-foreground">{text}</Card>;
}
