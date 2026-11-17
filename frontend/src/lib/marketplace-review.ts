export const isHoldExpired = (reviewReadyAt?: string | null) => {
  if (!reviewReadyAt) return false;
  return new Date(reviewReadyAt).getTime() <= Date.now();
};

export const isReviewReady = (reviewStatus?: string | null, reviewReadyAt?: string | null) => {
  if (!reviewStatus || reviewStatus !== "under_review") return true;
  return isHoldExpired(reviewReadyAt);
};

export const isPendingAdminRow = (row: { review_status?: string | null; review_ready_at?: string | null }) => {
  if (row.review_status === "pending_admin" || row.review_status === "rejected") return true;
  if (row.review_status !== "under_review") return false;
  return isReviewReady(row.review_status, row.review_ready_at);
};

export const isActiveHold = (row: { review_status?: string | null; review_ready_at?: string | null }) => {
  if (row.review_status !== "under_review") return false;
  return !isReviewReady(row.review_status, row.review_ready_at);
};
