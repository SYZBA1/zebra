export const toStudioDocumentType = (documentType?: string | null): string => {
  if (!documentType) return "feasibility";

  const normalized = documentType.trim().toLowerCase();
  const mapping: Record<string, string> = {
    feasibility: "feasibility",
    business_plan: "business-plan",
    "business-plan": "business-plan",
    company_profile: "company-profile",
    "company-profile": "company-profile",
    org_structure: "org-structure",
    "org-structure": "org-structure",
    performance: "performance-tracking",
    performance_tracking: "performance-tracking",
    "performance-tracking": "performance-tracking",
    business_health: "business-health",
    "business-health": "business-health",
    business_proposition: "business-proposal",
    "business-proposal": "business-proposal",
  };

  return mapping[normalized] ?? (normalized.replace(/_/g, "-") || "feasibility");
};
