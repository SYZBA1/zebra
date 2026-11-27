import { describe, expect, it } from "vitest";
import { getCanonicalOptionAnswer } from "../lib/phase1-options";

const scaleQuestion = {
  id: "q3_scale",
  question: "Scale",
  options: ["Pre-launch / Idea stage", "Early stage"],
  optionsAm: ["ከመጀመር በፊት", "መጀመሪያ ደረጃ"],
};

describe("Phase 1 option language handling", () => {
  it("returns canonical English answers for Amharic selections", () => {
    expect(getCanonicalOptionAnswer(scaleQuestion, "ከመጀመር በፊት")).toBe("Pre-launch / Idea stage");
  });

  it("keeps English answers unchanged", () => {
    expect(getCanonicalOptionAnswer(scaleQuestion, "Early stage")).toBe("Early stage");
  });
});
