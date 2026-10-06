import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, readLang, translate } from "./index";
import { DICT } from "./dict";

describe("i18n", () => {
  it("defaults to English when nothing is stored", () => {
    expect(DEFAULT_LANG).toBe("en");
    expect(readLang(null)).toBe("en");
    expect(readLang("fr")).toBe("en");
  });
  it("keeps a stored supported language", () => {
    expect(readLang("zh")).toBe("zh");
  });
  it("every entry has EN, ES and ZH", () => {
    for (const [pt, row] of Object.entries(DICT)) {
      expect(row, pt).toHaveLength(3);
      row.forEach((v) => expect(v.trim().length, pt).toBeGreaterThan(0));
    }
  });
  it("translates PT text and preserves surrounding spaces", () => {
    expect(translate(" Como funciona ", "pt")).toBe(" Como funciona ");
    expect(translate(" Como funciona ", "en")).toBe(` ${DICT["Como funciona"][0]} `);
  });
});

import { translate as tr } from "./index";
describe("textos com variável", () => {
  it("traduz pontos do carrossel e classificação indicativa", () => {
    expect(tr("Ir para o item 3", "en")).toBe("Go to item 3");
    expect(tr("Não recomendado para menores de 14 anos", "es")).toBe("No recomendado para menores de 14 años");
    expect(tr("Mês 11", "en")).toBe("Month 11");
    expect(tr("Mês 11", "pt")).toBe("Mês 11");
  });
});
