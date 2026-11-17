export const isPendingPurchaseStatus = (status?: string | null) => {
  if (!status) return false;
  return status === "pending" || status === "pending_approval";
};

export const formatPurchaseStatus = (status?: string | null) => {
  if (!status) return "unknown";
  if (status === "pending_approval") return "pending approval";
  return status;
};
