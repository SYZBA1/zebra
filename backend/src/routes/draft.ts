import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/authMiddleware";
import { generateContentStream } from "../lib/ai";
import { embedQuery } from "../lib/embeddings";
import { buildDraftMessages } from "../lib/draft-prompt";

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
      serviceDescription,
      phase1Answers,
      existingContent,
    } = req.body;

    if (!sectionTitle || !projectName || !sector) {
      res.status(400).json({ error: "sectionTitle, projectName and sector are required" });
      return;
    }

    // Retrieve RAG context
    const retrievalQuery = `${sectionTitle} for ${documentType} in ${sector} sector, project ${projectName}${typeof serviceDescription === "string" ? `: ${serviceDescription.slice(0, 300)}` : ""}`;
    const knowledge = await retrieveContext(retrievalQuery, language);
    const messages = buildDraftMessages({
      sectionId,
      sectionTitle,
      projectName,
      sector,
      language,
      documentType,
      serviceDescription,
      phase1Answers,
      existingContent,
      knowledge,
    });

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
