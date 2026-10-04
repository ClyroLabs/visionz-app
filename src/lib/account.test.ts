import { describe, expect, it } from "vitest";
import { cardLast4, isValidCpf, profileSchema, walletAddressSchema } from "./account";

describe("cartão guarda só os 4 últimos dígitos", () => {
  it("extrai apenas os 4 finais", () => {
    expect(cardLast4("4111 1111 1111 1234")).toBe("1234");
  });
  it("rejeita número curto demais", () => {
    expect(cardLast4("1234")).toBeNull();
  });
});

describe("CPF", () => {
  it("aceita CPF válido", () => expect(isValidCpf("529.982.247-25")).toBe(true));
  it("rejeita CPF com dígito errado", () => expect(isValidCpf("529.982.247-24")).toBe(false));
  it("perfil com CPF inválido não passa", () => {
    expect(profileSchema.safeParse({ cpf: "111.111.111-11" }).success).toBe(false);
  });
});

describe("carteira", () => {
  it("aceita endereço EVM", () => expect(walletAddressSchema.safeParse("0x" + "a".repeat(40)).success).toBe(true));
  it("rejeita texto qualquer", () => expect(walletAddressSchema.safeParse("minha carteira").success).toBe(false));
});
