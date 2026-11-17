import { describe, expect, it } from "vitest";
import { toStudioDocumentType } from "../lib/template-document-type";

describe("template document type mapping", () => {
  it("converts marketplace snake_case document types to Studio kebab-case values", () => {
    expect(toStudioDocumentType("feasibility")).toBe("feasibility");
    expect(toStudioDocumentType("business_plan")).toBe("business-plan");
    expect(toStudioDocumentType("company_profile")).toBe("company-profile");
    expect(toStudioDocumentType("org_structure")).toBe("org-structure");
    expect(toStudioDocumentType("performance")).toBe("performance-tracking");
    expect(toStudioDocumentType("business_health")).toBe("business-health");
  });

  it("keeps Studio document types unchanged", () => {
    expect(toStudioDocumentType("business-plan")).toBe("business-plan");
    expect(toStudioDocumentType("company-profile")).toBe("company-profile");
  });
});
