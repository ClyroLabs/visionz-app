import { describe, expect, it } from "vitest";
import { quote, validateConvert, validateWithdrawVzn, withdrawFiat } from "./convert";

describe("conversão", () => {
  it("cobra 1% e converte R$ 100 em 396 VZN", () => expect(quote("fiat-to-vzn", 100)).toEqual({ fee: 1, receive: 396 }));
  it("converte 100 VZN em R$ 24,75", () => expect(quote("vzn-to-fiat", 100).receive).toBe(24.75));
  it("bloqueia acima do saldo", () => expect(validateConvert("vzn-to-fiat", 50, 10)).toBe("Saldo insuficiente."));
  it("mínimo R$ 5 e 1 VZN", () => {
    expect(validateConvert("fiat-to-vzn", 4, 100)).not.toBeNull();
    expect(validateConvert("vzn-to-fiat", 0.5, 100)).not.toBeNull();
  });
});

describe("saques", () => {
  it("mínimo R$ 50 e TED custa R$ 3,50", () => {
    expect(withdrawFiat(40, "pix", "BRL", 1000).error).not.toBeNull();
    expect(withdrawFiat(100, "ted", "BRL", 1000).total).toBe(103.5);
    expect(withdrawFiat(100, "pix", "BRL", 1000).fee).toBe(0);
  });
  it("VZN mínimo 10 e taxa Ethereum 2 VZN", () => {
    expect(validateWithdrawVzn(5, "solana", 100).error).not.toBeNull();
    expect(validateWithdrawVzn(20, "ethereum", 100).total).toBe(22);
  });
});
