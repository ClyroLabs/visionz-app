import { describe, expect, it } from "vitest";
import { albumTracks, chapterAt, episodeLabel, groupSeries, nextEpisode, normalizeMeta, parseChapters } from "./catalog-meta";

const ep = (id: string, season: number, episode: number) => ({ id, tool: "video", title: id, created_at: "2026-01-01", age_rating: "10", data: { meta: { series: { id: "s", title: "Série", season, episode } } } });
const list = [ep("b", 1, 2), ep("c", 2, 1), ep("a", 1, 1)];

describe("catalog meta", () => {
  it("uploads default to external, tools to platform", () => {
    expect(normalizeMeta({ ...list[0], data: {} }).origin).toBe("external");
    expect(normalizeMeta({ ...list[0], tool: "synth", data: {} }).origin).toBe("platform");
  });
  it("groups seasons and orders episodes", () => {
    const g = groupSeries(list, "s")!;
    expect(g.seasons.map((s) => s.season)).toEqual([1, 2]);
    expect(g.seasons[0].episodes.map((e) => e.id)).toEqual(["a", "b"]);
  });
  it("next episode crosses seasons", () => {
    expect(nextEpisode(list, list[0])?.id).toBe("c");
    expect(nextEpisode(list, list[1])).toBeNull();
  });
  it("labels episodes T1:E2", () => expect(episodeLabel(normalizeMeta(list[0]).series!)).toBe("T1:E2"));
  it("parses and finds chapters", () => {
    const ch = parseChapters("0:00 Abertura\n1:30 Conflito\n1:02:03 Final");
    expect(ch.map((c) => c.t)).toEqual([0, 90, 3723]);
    expect(chapterAt(ch, 100)?.title).toBe("Conflito");
  });
  it("album tracks ordered", () => {
    const t = (id: string, track: number) => ({ id, tool: "jukebox", title: id, created_at: "2026-01-01", age_rating: "L", data: { meta: { album: { title: "X", track } } } });
    expect(albumTracks([t("2", 2), t("1", 1)], "X").map((x) => x.id)).toEqual(["1", "2"]);
  });
});
