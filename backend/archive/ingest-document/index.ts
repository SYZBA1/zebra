import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function extractTextFromFile(
  fileBuffer: ArrayBuffer,
  fileType: string,
  fileName: string
): Promise<string> {
  if (fileType === "text/plain") {
    const decoder = new TextDecoder();
    return decoder.decode(fileBuffer);
  }

  if (fileType === "text/csv") {
    const decoder = new TextDecoder();
    return decoder.decode(fileBuffer);
  }

  if (fileType === "application/pdf") {
    // For PDF, we would use pdfjs or similar library
    // For now, return placeholder - in production use pdf-parse or similar
    return await extractPdfText(fileBuffer);
  }

  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // For DOCX, we would use docx-parser or similar
    return await extractDocxText(fileBuffer);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function extractPdfText(fileBuffer: ArrayBuffer): Promise<string> {
  // Placeholder - in production, integrate with pdfjs-dist or similar
  // This is a simplified version that would need proper PDF parsing library
  const text = new TextDecoder().decode(fileBuffer);
  return text.split("\x00").filter((line) => line.trim().length > 0).join("\n");
}

async function extractDocxText(fileBuffer: ArrayBuffer): Promise<string> {
  // Placeholder - in production, integrate with mammoth.js or docx-parser
  // This is a simplified version
  const decoder = new TextDecoder();
  const text = decoder.decode(fileBuffer);
  // Basic extraction of readable text
  return text
    .split(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/) // Remove binary control chars
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);

    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }

    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

async function embedBatch(texts: string[], apiKey: string): Promise<number[][]> {
  const resp = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-3",
      input_type: "document",
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Voyage API error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return data.data.map((d: any) => d.embedding);
}

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const VOYAGE_API_KEY = Deno.env.get("VOYAGE_API_KEY");

  if (!VOYAGE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Voyage API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "Document ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("knowledge_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError) {
      throw new Error(`Failed to fetch document: ${docError.message}`);
    }

    // Mark as processing
    await supabase
      .from("knowledge_documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message || "Unknown error"}`);
    }

    // Extract text from file
    const fileBuffer = await fileData.arrayBuffer();
    const text = await extractTextFromFile(fileBuffer, document.file_type, document.file_path);

    if (!text || text.trim().length === 0) {
      throw new Error("No text content could be extracted from the file");
    }

    // Chunk text
    const chunks = chunkText(text, 1000, 200);

    if (chunks.length === 0) {
      throw new Error("No valid chunks could be created from the document");
    }

    // Generate embeddings and store chunks
    const BATCH_SIZE = 10; // Voyage API limits
    const SLEEP_INTERVAL = 65000; // 65 seconds between batches to respect rate limits

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, Math.min(i + BATCH_SIZE, chunks.length));

      // Sleep between batches
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, SLEEP_INTERVAL));
      }

      // Generate embeddings
      const embeddings = await embedBatch(batchChunks, VOYAGE_API_KEY);

      // Prepare rows for insertion
      const rows = batchChunks.map((content, idx) => ({
        document_id: documentId,
        chunk_index: i + idx,
        content,
        embedding: embeddings[idx],
        metadata: {
          title: document.title,
          source: document.source,
          sector_id: document.sector_id,
        },
      }));

      // Insert chunks
      const { error: insertError } = await supabase.from("knowledge_chunks").insert(rows);

      if (insertError) {
        throw new Error(`Failed to insert chunks: ${insertError.message}`);
      }
    }

    // Mark as processed
    const { data: updatedDoc, error: updateError } = await supabase
      .from("knowledge_documents")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
        total_chunks: chunks.length,
      })
      .eq("id", documentId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update document status: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: updatedDoc,
        chunksCount: chunks.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Try to mark document as failed
    try {
      const body = await req.json();
      const { documentId } = body;
      await supabase
        .from("knowledge_documents")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", documentId);
    } catch {
      // Ignore errors when updating failure status
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handleRequest);
