import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/authMiddleware";
import { generateContent, GeminiTool } from "../lib/ai";
import { embedQuery } from "../lib/embeddings";

const router = Router();

const DIAGNOSE_TOOL: GeminiTool = {
  functionDeclarations: [
    {
      name: "diagnose",
      description: "Return structured business health diagnosis.",
      parameters: {
        type: "object",
        properties: {
          overall_score: { type: "integer", minimum: 0, maximum: 100 },
          rating: { type: "string", description: "One of: Critical, At Risk, Stable, Healthy, Thriving" },
          summary: { type: "string", description: "2-4 sentence executive summary" },
          pillar_scores: {
            type: "object",
            properties: {
              Market:        { type: "integer", minimum: 0, maximum: 100 },
              Technical:     { type: "integer", minimum: 0, maximum: 100 },
              Financial:     { type: "integer", minimum: 0, maximum: 100 },
              Organizational:{ type: "integer", minimum: 0, maximum: 100 },
              Legal:         { type: "integer", minimum: 0, maximum: 100 },
              Strategic:     { type: "integer", minimum: 0, maximum: 100 },
            },
            required: ["Market", "Technical", "Financial", "Organizational", "Legal", "Strategic"],
          },
          gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pillar:        { type: "string" },
                title:         { type: "string" },
                current_state: { type: "string" },
                target_state:  { type: "string" },
                severity:      { type: "string", description: "low | medium | high" },
                solutions: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: { type: "string" },
                },
              },
              required: ["pillar", "title", "current_state", "target_state", "severity", "solutions"],
            },
          },
        },
        required: ["overall_score", "rating", "summary", "pillar_scores", "gaps"],
      },
    },
  ],
};

router.post("/health-diagnose", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { businessName, sector, language = "en", answers, projectId } = req.body;

    if (!businessName || !sector || !answers) {
      res.status(400).json({ error: "businessName, sector and answers are required" });
      return;
    }

    // RAG retrieval
    let knowledge = "";
    const summary = Object.entries(answers as Record<string, string>)
      .map(([q, a]) => `${q}: ${a}`)
      .join("; ");

    const embedding = await embedQuery(`Business health diagnosis for ${sector}: ${summary}`);
    if (embedding) {
      try {
        const { data } = await supabase.rpc("match_knowledge", {
          query_embedding: embedding,
          match_count: 6,
          filter_language: language,
        });
        if (data?.length) {
          knowledge = data
            .map((r: { content: string }, i: number) => `[Ref ${i + 1}] ${r.content}`)
            .join("\n\n---\n\n");
        }
      } catch (e) {
        console.error("RAG retrieval failed:", e);
      }
    }

    const langLine =
      language === "am"
        ? "Respond entirely in Amharic (አማርኛ). Use proper Ethiopian business terminology."
        : "Respond in professional English.";

    const systemPrompt = `You are the Zebra Business Intelligence Engine running the Business Health Diagnostic.

Apply the 6-pillar framework (Market, Technical, Financial, Organizational, Legal, Schedule). Use Ethiopian context (Telebirr, CBE, Awash, Chapa, local regulations).

${knowledge ? `RELEVANT KNOWLEDGE (apply, do not quote):\n${knowledge}\n\n` : ""}

Analyze the entrepreneur's diagnostic answers, identify gaps (where they ARE vs where they SHOULD BE), score each pillar 0-100, give an overall score and rating, and propose 3 actionable solutions per gap.

${langLine}

Return STRICTLY valid JSON via the diagnose tool. No prose outside the tool call.`;

    const userPrompt = `Business: ${businessName}
Sector: ${sector}
Diagnostic answers:
${Object.entries(answers as Record<string, string>)
  .map(([q, a]) => `- ${q}\n  Answer: ${a}`)
  .join("\n")}`;

    const result = await generateContent(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      [DIAGNOSE_TOOL]
    );

    if (!result.toolCall) {
      console.error("No tool call in Gemini response");
      res.status(500).json({ error: "Diagnostic could not be structured" });
      return;
    }

    const diagnosis = result.toolCall.args as {
      overall_score: number;
      rating: string;
      summary: string;
      pillar_scores: Record<string, number>;
      gaps: Array<{ pillar: string; title: string; current_state: string; target_state: string; severity: string; solutions: string[] }>;
    };

    // Persist to health_assessments table
    const { data: assessment, error: insErr } = await supabase
      .from("health_assessments")
      .insert({
        user_id: req.user!.id,
        project_id: projectId ?? null,
        business_name: businessName,
        sector,
        language,
        answers,
        overall_score: diagnosis.overall_score,
        rating: diagnosis.rating,
        pillar_scores: diagnosis.pillar_scores,
        gaps: diagnosis.gaps,
        solutions: diagnosis.gaps.flatMap((g) => g.solutions),
        summary: diagnosis.summary,
      })
      .select()
      .single();

    if (insErr) console.error("Save assessment error:", insErr);

    res.json({ ok: true, assessment_id: assessment?.id, ...diagnosis });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("health-diagnose route error:", error);
    res.status(error.status ?? 500).json({ error: error.message ?? "Internal server error" });
  }
});

export default router;
