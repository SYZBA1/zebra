import { describe, expect, it } from "vitest";
import { buildProjectPhase1Answers } from "../lib/project-context";

describe("project generation context", () => {
  it("preserves existing answers and saves setup sector, location, and scale", () => {
    const answers = buildProjectPhase1Answers(
      { q4_budget: "ETB 300,000", q2_location: "Old location" },
      { sector: "Agriculture", location: "Hawassa, Ethiopia", businessScale: "Small enterprise" }
    );

    expect(answers).toEqual({
      q1_sector: "Agriculture",
      q2_location: "Hawassa, Ethiopia",
      q3_scale: "Small enterprise",
      q4_budget: "ETB 300,000",
    });
  });

  it("keeps existing location and scale when setup did not provide replacements", () => {
    const answers = buildProjectPhase1Answers(
      { q1_sector: "Retail", q2_location: "Addis Ababa", q3_scale: "SME" },
      { sector: "Retail" }
    );

    expect(answers).toEqual({ q1_sector: "Retail", q2_location: "Addis Ababa", q3_scale: "SME" });
  });
});
