import { useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/index";
import paper from "@/assets/visionz-litepaper.pdf.asset.json";

/** Full-screen in-page PDF viewer: opens over the home without leaving it. Esc or ✕ closes. */
export function LitepaperViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Litepaper VisionZ" className="fixed inset-0 z-[100] flex flex-col bg-background/80 p-2 animate-rise sm:p-6 [backdrop-filter:blur(6px)]" onClick={onClose}>
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gradient-brand bg-surface shadow-glow-brand" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="font-display text-sm font-semibold tracking-wide md:text-base">Litepaper <span className="text-gradient-brand">VisionZ</span></p>
          <div className="flex items-center gap-2">
            <a href={paper.url} download="VisionZ-Litepaper.pdf"><Button size="sm" variant="soft"><Download />Baixar</Button></a>
            <Button size="sm" variant="ghost" aria-label="Fechar" onClick={onClose}><X /></Button>
          </div>
        </div>
        <iframe src={`${paper.url}#view=FitH`} title="Litepaper VisionZ" className="min-h-0 w-full flex-1 bg-background" />
      </div>
    </div>
  );
}
