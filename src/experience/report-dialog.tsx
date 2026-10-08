import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flag } from "lucide-react";
import { Button, Dialog, Label, Select, useToast } from "@/index";
import { reportContent } from "@/lib/moderation.functions";
import { useSession } from "@/lib/use-session";

const REASONS = ["Não é adequado para a idade", "Violência", "Linguagem imprópria", "Conteúdo assustador", "Golpe ou propaganda", "Outro"];

/** "Report" button: sends a parent's report to the moderation queue. */
export function ReportButton({ titleRef, title, className }: { titleRef: string; title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const session = useSession();
  const send = useServerFn(reportContent);
  const toast = useToast();
  const m = useMutation({
    mutationFn: () => send({ data: { titleRef, title, reason, details: details || undefined } }),
    onSuccess: () => { setOpen(false); setDetails(""); toast({ title: "Denúncia enviada", description: "A moderação vai analisar.", variant: "success" }); },
    onError: (e) => toast({ title: "Não foi possível enviar", description: (e as Error).message, variant: "error" }),
  });
  return (
    <>
      <Button size="sm" variant="ghost" className={className} onClick={() => setOpen(true)}><Flag />Denunciar</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Denunciar conteúdo" description={title}>
        {session === null ? <p className="text-sm text-muted-foreground">Entre na sua conta para denunciar.</p> : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
            <div className="space-y-1.5"><Label htmlFor="rp-r">Motivo</Label><Select id="rp-r" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</Select></div>
            <div className="space-y-1.5"><Label htmlFor="rp-d">Detalhes (opcional)</Label><textarea id="rp-d" maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} className="min-h-24 w-full rounded-xl border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <Button type="submit" loading={m.isPending}>Enviar denúncia</Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
