import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { embedBatch } from "../lib/embeddings";

const router = Router();

interface IngestDoc {
  title: string;
  source?: string;
  sector?: string;
  language?: string;
  description?: string;
  chunks: string[];
}

// Max characters per embedding batch (~32K chars ≈ ~8K tokens, safe for Voyage free tier)
const MAX_BATCH_CHARS = 32000;

router.post(
  "/knowledge/ingest",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    try {
      const { documents, replace = true }: { documents: IngestDoc[]; replace?: boolean } = req.body;

      if (!Array.isArray(documents) || documents.length === 0) {
        res.status(400).json({ error: "documents array is required" });
        return;
      }

      // If replace=true, delete existing docs with the same source before re-inserting
      if (replace) {
        for (const doc of documents) {
          if (doc.source) {
            await supabase.from("knowledge_documents").delete().eq("source", doc.source);
          }
        }
      }

      const results: Array<{ document: string; chunks_inserted: number }> = [];

      for (const doc of documents) {
        if (!doc.title || !Array.isArray(doc.chunks) || doc.chunks.length === 0) {
          console.warn("Skipping doc with missing title or chunks:", doc.title);
          continue;
        }

        // Insert document record
        const { data: docRow, error: docErr } = await supabase
          .from("knowledge_documents")
          .insert({
            title:        doc.title,
            source:       doc.source  ?? null,
            sector:       doc.sector  ?? null,
            language:     doc.language ?? "en",
            description:  doc.description ?? null,
            total_chunks: doc.chunks.length,
          })
          .select()
          .single();

        if (docErr) {
          throw new Error(`Insert doc failed: ${docErr.message}`);
        }

        // Batch embed chunks respecting MAX_BATCH_CHARS
        // Voyage free tier: 3 RPM — sleep 65s between API calls
        let idx = 0;
        let pending: string[] = [];
        let pendingChars = 0;
        let voyageCallCount = 0;

        const flush = async () => {
          if (!pending.length) return;

          // Rate-limit: sleep 65s between Voyage calls (free tier = 3 RPM)
          if (voyageCallCount > 0) {
            await new Promise((r) => setTimeout(r, 65000));
          }
          voyageCallCount++;

          const embeddings = await embedBatch(pending, "document");
          const rows = pending.map((content, j) => ({
            document_id:  docRow.id,
            chunk_index:  idx + j,
            content,
            embedding:    embeddings[j] as unknown,
            metadata:     { source: doc.source, title: doc.title },
          }));

          const { error: chunkErr } = await supabase.from("knowledge_chunks").insert(rows);
          if (chunkErr) throw new Error(`Insert chunks failed: ${chunkErr.message}`);

          idx += pending.length;
          pending = [];
          pendingChars = 0;
        };

        for (const chunk of doc.chunks) {
          if (pendingChars + chunk.length > MAX_BATCH_CHARS && pending.length) {
            await flush();
          }
          pending.push(chunk);
          pendingChars += chunk.length;
        }
        await flush();

        results.push({ document: doc.title, chunks_inserted: doc.chunks.length });
      }

      res.json({ ok: true, results });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("knowledge/ingest route error:", error);
      res.status(500).json({ error: error.message ?? "Internal server error" });
    }
  }
);

export default router;
