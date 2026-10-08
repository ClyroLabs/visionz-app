import { describe, expect, it } from "vitest";
import { OVERLAP, buildTimeline, filmDuration, layersAt, sceneAt } from "./film-engine";

const sc = (d: number, transition: "fade" | "cut" | "wipe" = "fade") => ({ camera: "zoom-in" as const, duration_sec: d, transition });

describe("film engine", () => {
  it("total length subtracts the blend overlaps", () => {
    const s = buildTimeline([sc(5), sc(5), sc(5)]);
    expect(filmDuration(s)).toBeCloseTo(15 - 2 * OVERLAP);
  });
  it("two scenes are visible during a blend, never zero", () => {
    const scenes = [sc(5), sc(5)];
    const s = buildTimeline(scenes);
    const mid = 5 - OVERLAP / 2;
    expect(layersAt(s, scenes, mid).map((l) => l.index)).toEqual([0, 1]);
    for (let t = 0; t <= filmDuration(s); t += 0.1) expect(layersAt(s, scenes, t).length).toBeGreaterThan(0);
  });
  it("seeking maps time to the right scene", () => {
    const s = buildTimeline([sc(4), sc(6), sc(4)]);
    expect(sceneAt(s, 0)).toBe(0);
    expect(sceneAt(s, 5)).toBe(1);
    expect(sceneAt(s, filmDuration(s) - 0.1)).toBe(2);
  });
});
