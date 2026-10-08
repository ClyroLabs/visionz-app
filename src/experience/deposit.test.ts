import { describe, expect, it } from "vitest";
import { cardApproved, depositFee, depositLabel, depositTotal, parseDepositLabel, validateAmount } from "./deposit";

describe("deposit gateway (sandbox)", () => {
  it("Pix has no fee", () => expect(depositFee(100, "pix")).toBe(0));
  it("card charges 2.99%", () => { expect(depositFee(100, "card")).toBe(2.99); expect(depositTotal(100, "card")).toBe(102.99); });
  it("enforces R$ 10 min and R$ 5.000 max", () => {
    expect(validateAmount(9.99)).not.toBeNull();
    expect(validateAmount(10)).toBeNull();
    expect(validateAmount(5001)).not.toBeNull();
  });
  it("issuer declines cards above R$ 2.000", () => { expect(cardApproved(2000)).toBe(true); expect(cardApproved(2000.01)).toBe(false); });
  it("labels round-trip", () => expect(parseDepositLabel(depositLabel(false, "Visa •••• 4242", "VZP-ABC123"))).toEqual({ ok: false, method: "Visa •••• 4242", id: "VZP-ABC123" }));
});
