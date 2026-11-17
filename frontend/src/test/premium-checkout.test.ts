import { describe, expect, it } from "vitest";
import { getPurchaseStatus, isValidTransactionRef, normalizeTransactionRef } from "../lib/premium-checkout";

describe("premium checkout validation", () => {
  it("normalizes transaction references and accepts valid values", () => {
    expect(normalizeTransactionRef(" ft261241rh1q ")).toBe("FT261241RH1Q");
    expect(isValidTransactionRef("FT261241RH1Q")).toBe(true);
  });

  it("rejects short or repetitive references", () => {
    expect(isValidTransactionRef("ABC123")).toBe(false);
    expect(isValidTransactionRef("AAAAAAA")).toBe(false);
    expect(getPurchaseStatus("FT261241RH1Q")).toBe("approved");
    expect(getPurchaseStatus("AAAAAAA")).toBe("pending");
  });
});
