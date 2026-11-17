export const isPublicMarketplaceTemplate = (template?: {
  review_status?: string | null;
  is_verified?: boolean | null;
}) => {
  if (!template) return false;
  return template.review_status === "approved" || (!template.review_status && !!template.is_verified);
};

export const matchesMarketplaceFilter = (
  ownerType: string | null | undefined,
  filter: "all" | "free" | "premium" | "official" | "company"
) => {
  if (filter === "all") return true;
  if (filter === "official") return ownerType === "official";
  if (filter === "company") return ownerType === "company" || ownerType === "official";
  return true;
};
