export interface ProjectSetupContext {
  sector: string;
  location?: string;
  businessScale?: string;
}

export function buildProjectPhase1Answers(
  answers: Record<string, unknown> | null | undefined,
  setup: ProjectSetupContext
): Record<string, unknown> {
  const merged: Record<string, unknown> = {
    ...(answers ?? {}),
    q1_sector: answers?.q1_sector || setup.sector,
  };

  if (setup.location) merged.q2_location = setup.location;
  if (setup.businessScale) merged.q3_scale = setup.businessScale;
  return merged;
}
