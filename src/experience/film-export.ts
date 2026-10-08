import type { Aspect } from "@/lib/creator";
import { buildTimeline, filmDuration, layersAt, type TimedScene } from "./film-engine";

const DIM: Record<Aspect, [number, number]> = { "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [960, 960], "4:3": [1024, 768], "21:9": [1440, 616] };

function camera(ctx: CanvasRenderingContext2D, cam: string, p: number, w: number, h: number) {
  const e = Math.max(0, Math.min(1.1, p));
  let s = 1.2, x = 0, y = 0, r = 0;
  if (cam === "zoom-in") s = 1.05 + 0.18 * e; else if (cam === "zoom-out") s = 1.25 - 0.18 * e;
  else if (cam === "pan-left") x = 0.06 - 0.12 * e; else if (cam === "pan-right") x = -0.06 + 0.12 * e;
  else if (cam === "tilt-up") y = 0.06 - 0.12 * e;
  else if (cam === "orbit") { s = 1.22; r = (-2 + 4 * e) * Math.PI / 180; x = -0.03 + 0.06 * e; }
  else if (cam === "parallax") { s = 1.12 + 0.08 * e; x = -0.04 + 0.08 * e; y = 0.02 - 0.04 * e; }
  ctx.translate(w / 2 + x * w * s, h / 2 + y * h * s); ctx.rotate(r); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
}

function cover(ctx: CanvasRenderingContext2D, src: CanvasImageSource & { width?: number; height?: number; videoWidth?: number; videoHeight?: number }, w: number, h: number) {
  const iw = src.videoWidth || src.width || w, ih = src.videoHeight || src.height || h;
  const k = Math.max(w / iw, h / ih);
  ctx.drawImage(src, (w - iw * k) / 2, (h - ih * k) / 2, iw * k, ih * k);
}

/** Renders the whole film in the browser and downloads one WebM file (preview quality, zero AI cost). */
export async function exportFilm(scenes: (TimedScene & { url?: string; clipUrl?: string; narration?: string })[], aspect: Aspect, name: string, onProgress?: (p: number) => void) {
  const [w, h] = DIM[aspect];
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const media = await Promise.all(scenes.map(async (s) => {
    if (s.clipUrl) { const v = document.createElement("video"); v.src = s.clipUrl; v.crossOrigin = "anonymous"; v.muted = true; v.loop = true; v.playsInline = true; await v.play().catch(() => {}); return v; }
    if (!s.url) return null;
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = s.url; await img.decode().catch(() => {}); return img;
  }));
  const slots = buildTimeline(scenes);
  const total = filmDuration(slots);
  const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm", videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (rec.onstop = () => r()));
  rec.start();
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.fillStyle = "#0b0712"; ctx.fillRect(0, 0, w, h);
      for (const l of layersAt(slots, scenes, Math.min(t, total))) {
        const m = media[l.index]; if (!m) continue;
        ctx.save(); ctx.globalAlpha = l.opacity;
        if (l.reveal < 1) { ctx.beginPath(); ctx.rect(0, 0, w * l.reveal, h); ctx.clip(); }
        camera(ctx, scenes[l.index].camera, l.progress, w, h); cover(ctx, m, w, h); ctx.restore();
      }
      const cur = layersAt(slots, scenes, Math.min(t, total)).at(-1);
      const n = cur && scenes[cur.index].narration;
      if (n) { ctx.font = `${Math.round(h / 28)}px Inter, sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = "rgba(0,0,0,.55)"; const tw = ctx.measureText(n).width + 40; ctx.fillRect((w - tw) / 2, h - h / 8, tw, h / 18); ctx.fillStyle = "#fff"; ctx.fillText(n, w / 2, h - h / 8 + h / 26, w - 60); }
      onProgress?.(Math.min(1, t / total));
      if (t < total) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });
  rec.stop(); await done;
  media.forEach((m) => m instanceof HTMLVideoElement && m.pause());
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(chunks, { type: "video/webm" })); a.download = `${name.replace(/[^\w-]+/g, "_") || "filme"}.webm`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
