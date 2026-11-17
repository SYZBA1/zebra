import { describe, expect, it } from "vitest";
import { formatPurchaseStatus, isPendingPurchaseStatus } from "../lib/purchase-status";

describe("purchase status handling", () => {
  it("treats both pending states as active review items", () => {
    expect(isPendingPurchaseStatus("pending")).toBe(true);
    expect(isPendingPurchaseStatus("pending_approval")).toBe(true);
    expect(isPendingPurchaseStatus("approved")).toBe(false);
  });

  it("formats pending approval labels clearly for admin users", () => {
    expect(formatPurchaseStatus("pending_approval")).toBe("pending approval");
    expect(formatPurchaseStatus("approved")).toBe("approved");
  });
});
