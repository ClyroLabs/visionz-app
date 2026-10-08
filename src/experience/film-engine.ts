import type { Camera, Transition } from "@/lib/creator";

/** Seconds the next scene overlaps the current one (blend window). */
export const OVERLAP = 0.8;
const CUT_OVERLAP = 0.15;

export type TimedScene = { camera: Camera; duration_sec: number; transition: Transition };
export type Slot = { index: number; start: number; end: number; inDur: number };

/** Lays scenes on one continuous clock; each scene starts while the previous still plays. */
export function buildTimeline(scenes: TimedScene[], overlap = OVERLAP): Slot[] {
  const out: Slot[] = [];
  let t = 0;
  scenes.forEach((s, i) => {
    const inDur = i === 0 ? 0 : s.transition === "cut" ? CUT_OVERLAP : Math.min(overlap, s.duration_sec / 2);
    const start = i === 0 ? 0 : t - inDur;
    const end = start + s.duration_sec;
    out.push({ index: i, start, end, inDur });
    t = end;
  });
  return out;
}

export const filmDuration = (slots: Slot[]) => (slots.length ? slots[slots.length - 1].end : 0);

/** The scene that "owns" time t (the newest one that has started). */
export function sceneAt(slots: Slot[], t: number): number {
  let k = 0;
  for (const s of slots) if (t >= s.start) k = s.index;
  return k;
}

export type Layer = { index: number; opacity: number; progress: number; reveal: number };

/** Visible layers at time t, bottom to top, with opacity, wipe reveal (0–1) and camera progress (0–1, may overrun into the blend). */
export function layersAt(slots: Slot[], scenes: TimedScene[], t: number): Layer[] {
  const out: Layer[] = [];
  for (const s of slots) {
    if (t < s.start || t > s.end + 0.001) continue;
    const local = t - s.start;
    const fadeIn = s.inDur > 0 ? Math.min(1, local / s.inDur) : 1;
    const ease = fadeIn * fadeIn * (3 - 2 * fadeIn);
    const tr = scenes[s.index].transition;
    out.push({ index: s.index, opacity: tr === "wipe" ? 1 : ease, reveal: tr === "wipe" ? ease : 1, progress: local / (s.end - s.start) });
  }
  return out.length ? out : slots.length ? [{ index: slots.length - 1, opacity: 1, reveal: 1, progress: 1 }] : [];
}

/** Camera move as a CSS transform for progress p (0–1). Continuous, never restarts. */
export function cameraTransform(camera: Camera, p: number): string {
  const e = Math.max(0, Math.min(1.1, p));
  switch (camera) {
    case "zoom-in": return `scale(${1.05 + 0.18 * e})`;
    case "zoom-out": return `scale(${1.25 - 0.18 * e})`;
    case "pan-left": return `scale(1.2) translateX(${6 - 12 * e}%)`;
    case "pan-right": return `scale(1.2) translateX(${-6 + 12 * e}%)`;
    case "tilt-up": return `scale(1.2) translateY(${6 - 12 * e}%)`;
    case "orbit": return `scale(1.22) rotate(${-2 + 4 * e}deg) translateX(${-3 + 6 * e}%)`;
    case "parallax": return `scale(${1.12 + 0.08 * e}) translate(${-4 + 8 * e}%, ${2 - 4 * e}%)`;
    default: return "scale(1.1)";
  }
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
