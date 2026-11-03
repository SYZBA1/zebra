import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/authMiddleware";
import { generateContentStream } from "../lib/ai";
import { embedQuery } from "../lib/embeddings";

const router = Router();

async function retrieveContext(query: string, language: string): Promise<string> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const embedding = await embedQuery(query);
  if (!embedding) return "";

  try {
    const { data, error } = await supabase.rpc("match_knowledge", {
      query_embedding: embedding,
      match_count: 5,
      filter_language: language,
    });
    if (error || !data?.length) return "";
    return data
      .map((r: { content: string }, i: number) => `[Source ${i + 1}] ${r.content}`)
      .join("\n\n---\n\n");
  } catch (e) {
    console.error("retrieveContext error:", e);
    return "";
  }
}

router.post("/draft", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sectionId,
      sectionTitle,
      projectName,
      sector,
      language = "en",
      documentType = "feasibility",
      existingContent,
    } = req.body;

    if (!sectionTitle || !projectName || !sector) {
      res.status(400).json({ error: "sectionTitle, projectName and sector are required" });
      return;
    }

    const langInstruction =
      language === "am"
        ? "Write the content entirely in Amharic (አማርኛ). Use proper Ethiopian business terminology."
        : "Write the content in professional English.";

    const docTypeLabel =
      documentType === "business-plan" ? "Business Plan" : "Feasibility Study";

    // Retrieve RAG context
    const retrievalQuery = `${sectionTitle} for ${docTypeLabel} in ${sector} sector, project ${projectName}`;
    const knowledge = await retrieveContext(retrievalQuery, language);

    const systemPrompt = `You are the Zebra Business Intelligence Engine — a high-level AI consultant guiding Ethiopian entrepreneurs from idea to sustainability. Tone: professional, analytical, structured.

You apply the 6 Pillars of Feasibility Studies:
1. Market Analysis (demand, competition, trends)
2. Technical Analysis (operations, technology, production)
3. Financial Analysis (cash flow, ROI, budgeting)
4. Organizational Analysis (structure, management, staffing)
5. Legal & Operational Analysis (compliance, licenses, risks)
6. Schedule/Timeline Analysis (project roadmap)

Ethiopian market context: reference Telebirr, CBE, Awash Bank, Chapa, Ethiopian Chambers of Commerce, and local regulations where relevant. Never expose raw training material — only apply the knowledge.

${knowledge ? `RELEVANT KNOWLEDGE FROM TRAINING MATERIAL (use as reference, do NOT quote verbatim):\n${knowledge}\n\n` : ""}

Current task: write the section "${sectionTitle}" (Section ${sectionId ?? "?"}) of a ${docTypeLabel} for "${projectName}" in the ${sector} sector.

${langInstruction}

Requirements:
- Apply the relevant pillar(s) of the 6-pillar framework
- Use data-driven insights specific to the Ethiopian market
- Include concrete metrics, statistics, and projections
- Use clear headings, bullet points, and structured paragraphs
- Where the section involves risk or viability, include a brief risk assessment
- If existing content is provided, improve and expand upon it
- Be thorough but concise

Do NOT include the section title or number in your output — just the body content.`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: existingContent
          ? `Here is the existing draft for "${sectionTitle}":\n\n${existingContent}\n\nPlease improve and expand.`
          : `Please write comprehensive content for "${sectionTitle}".`,
      },
    ];

    const stream = await generateContentStream(messages);

    // Pipe the SSE stream directly to the response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = stream.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };

    pump().catch((err) => {
      console.error("Stream pump error:", err);
      res.end();
    });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("draft route error:", error);
    const status = error.status ?? 500;
    res.status(status).json({ error: error.message ?? "Internal server error" });
  }
});

export default router;
