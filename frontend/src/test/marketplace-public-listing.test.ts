import { describe, expect, it } from "vitest";
import { isPublicMarketplaceTemplate, matchesMarketplaceFilter } from "../lib/marketplace-public";

describe("marketplace public listing", () => {
  it("only exposes approved templates to the public catalog", () => {
    expect(isPublicMarketplaceTemplate({ review_status: "approved" })).toBe(true);
    expect(isPublicMarketplaceTemplate({ review_status: "pending_admin" })).toBe(false);
    expect(isPublicMarketplaceTemplate({ review_status: "under_review" })).toBe(false);
  });

  it("keeps company and official filters aligned", () => {
    expect(matchesMarketplaceFilter("official", "company")).toBe(true);
    expect(matchesMarketplaceFilter("company", "company")).toBe(true);
    expect(matchesMarketplaceFilter("expert", "company")).toBe(false);
  });
});
