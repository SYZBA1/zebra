import type { Question } from "@/prompts/phase1Questions";

export function getCanonicalOptionAnswer(
  question: Question,
  value: string,
): string {
  const englishIndex = question.options?.indexOf(value) ?? -1;
  if (englishIndex >= 0) return value;

  const amharicIndex = question.optionsAm?.indexOf(value) ?? -1;
  if (amharicIndex >= 0) return question.options?.[amharicIndex] ?? value;

  return value;
}
