import { useEffect, useRef, useState } from "react";
import { Camera, Eye, ScanFace } from "lucide-react";
import { Button, cn } from "@/index";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";
const LIB_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.esm.js";
type FaceApi = typeof import("@vladmandic/face-api");
let apiPromise: Promise<FaceApi> | null = null;

/** Loads the face library and models once, only in the browser. */
function loadApi() {
  apiPromise ??= (async () => {
    const faceapi = (await import(/* @vite-ignore */ LIB_URL)) as FaceApi;
    const tf = faceapi.tf as unknown as { setBackend: (b: string) => Promise<boolean>; ready: () => Promise<void> };
    try { if (!(await tf.setBackend("webgl"))) throw new Error(); } catch { await tf.setBackend("cpu"); }
    await tf.ready();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return faceapi;
  })().catch((e) => { apiPromise = null; throw e; });
  return apiPromise;
}

type Pt = { x: number; y: number };
const d = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
/** Eye aspect ratio: drops sharply when the eye closes. */
function ear(e: Pt[]) { return (d(e[1], e[5]) + d(e[2], e[4])) / (2 * d(e[0], e[3])); }

export interface FaceCaptureProps {
  samples: number;
  onDone: (descriptors: number[][]) => void;
  className?: string;
}

type Phase = "loading" | "error" | "center" | "blink" | "capturing" | "done";

/** Camera capture with a blink liveness check. Returns face descriptors only; no image leaves the device. */
export function FaceCapture({ samples, onDone, className }: FaceCaptureProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [got, setGot] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null, stop = false, timer = 0;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
        if (stop) return;
        const v = video.current!;
        v.srcObject = stream; await v.play();
        const faceapi = await loadApi();
        if (stop) return;
        setPhase("center");
        const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
        let open = false, blinked = false;
        const list: number[][] = [];
        const tick = async () => {
          if (stop) return;
          const r = await faceapi.detectSingleFace(v, opts).withFaceLandmarks().withFaceDescriptor();
          if (r) {
            const lm = r.landmarks;
            const e = (ear(lm.getLeftEye()) + ear(lm.getRightEye())) / 2;
            if (!blinked) {
              setPhase("blink");
              if (e > 0.27) open = true;
              else if (open && e < 0.2) blinked = true;
            } else if (e > 0.25) {
              setPhase("capturing");
              list.push(Array.from(r.descriptor));
              setGot(list.length);
              if (list.length >= samples) { setPhase("done"); onDone(list); return; }
            }
          } else if (!blinked) setPhase("center");
          timer = window.setTimeout(tick, 120);
        };
        tick();
      } catch (e) {
        console.error(e);
        setError(e instanceof DOMException && e.name === "NotAllowedError" ? "Permita o acesso à câmera para continuar." : "Não foi possível abrir a câmera ou carregar o reconhecimento.");
        setPhase("error");
      }
    })();
    return () => { stop = true; clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hint = {
    loading: "Abrindo câmera e preparando o reconhecimento…",
    error,
    center: "Centralize seu rosto no círculo.",
    blink: "Agora pisque uma vez.",
    capturing: "Ótimo! Fique parado…",
    done: "Pronto!",
  }[phase];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-full border-2 border-cyan/60 bg-background shadow-glow-cyan">
        <video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        {phase === "loading" && <div className="absolute inset-0 grid place-items-center"><Camera className="size-10 animate-pulse text-cyan" /></div>}
        <div className={cn("pointer-events-none absolute inset-3 rounded-full border-2 border-dashed transition-colors", phase === "capturing" || phase === "done" ? "border-success" : "border-cyan/50")} />
      </div>
      <p className={cn("flex items-center justify-center gap-2 text-center text-sm", phase === "error" ? "text-destructive" : "text-foreground/90")} aria-live="polite">
        {phase === "blink" ? <Eye className="size-4 text-cyan" /> : <ScanFace className="size-4 text-cyan" />}{hint}
      </p>
      {samples > 1 && phase !== "error" && <p className="text-center font-mono text-xs text-muted-foreground">{got}/{samples}</p>}
      {phase === "error" && <div className="text-center"><Button size="sm" variant="secondary" onClick={() => window.location.reload()}>Tentar de novo</Button></div>}
    </div>
  );
}
