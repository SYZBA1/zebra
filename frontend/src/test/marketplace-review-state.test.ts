import { describe, expect, it } from "vitest";
import { isReviewReady, isPendingAdminRow } from "../lib/marketplace-review";

describe("marketplace review state", () => {
  it("marks expired hold items as ready for admin review", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isReviewReady("under_review", past)).toBe(true);
  });

  it("keeps active hold items out of the admin queue until the timer expires", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isPendingAdminRow({ review_status: "under_review", review_ready_at: future })).toBe(false);
    expect(isPendingAdminRow({ review_status: "under_review", review_ready_at: new Date(Date.now() - 60_000).toISOString() })).toBe(true);
  });
});
