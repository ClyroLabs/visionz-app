import { describe, expect, it } from "vitest";
import { asAge, chordNotes, normalizeComposition, normalizeStoryboard, stricterRating } from "./creator";

describe("classificação ao publicar", () => {
  it("vale a mais restritiva entre criador e IA", () => {
    expect(stricterRating("L", "12")).toBe("12");
    expect(stricterRating("16", "10")).toBe("16");
  });
  it("classificação desconhecida vira 18 (nunca libera para crianças)", () => {
    expect(asAge("livre")).toBe("18");
  });
});

describe("storyboard do Synth", () => {
  it("respeita o número de cenas pedido", () => {
    const scenes = Array.from({ length: 9 }, (_, i) => ({ description: `c${i}`, image_prompt: "x" }));
    expect(normalizeStoryboard({ title: "T", scenes }, 4).scenes).toHaveLength(4);
  });
});

describe("composição do Jukebox", () => {
  it("limita o andamento entre 60 e 180 BPM", () => {
    expect(normalizeComposition({ bpm: 400 }).bpm).toBe(180);
    expect(normalizeComposition({ bpm: 10 }).bpm).toBe(60);
  });
  it("descarta acordes inválidos", () => {
    expect(normalizeComposition({ chords: ["Am", "xyz", "G7"] }).chords).toEqual(["Am", "G7"]);
  });
  it("Am tem lá, dó e mi", () => {
    expect(chordNotes("Am")).toEqual([57, 60, 64]);
  });
});
