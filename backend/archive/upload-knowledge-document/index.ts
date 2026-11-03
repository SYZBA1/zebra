import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv"];

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

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Admin access required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    // GET /documents - List all documents
    if (req.method === "GET" && pathname.endsWith("/documents")) {
      const sectorId = url.searchParams.get("sector_id");
      let query = supabase.from("knowledge_documents").select("*").order("created_at", { ascending: false });

      if (sectorId) {
        query = query.eq("sector_id", sectorId);
      }

      const { data: documents, error } = await query;
      if (error) throw new Error(`Failed to fetch documents: ${error.message}`);

      return new Response(JSON.stringify({ documents }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /documents - Upload new document
    if (req.method === "POST" && pathname.endsWith("/documents")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const sectorId = formData.get("sector_id") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      if (!file || !sectorId || !title) {
        return new Response(
          JSON.stringify({ error: "File, sector_id, and title are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: `File type ${file.type} not supported. Allowed: PDF, DOCX, TXT, CSV` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: `File size exceeds 50MB limit` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Upload file to storage
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `knowledge-documents/${sectorId}/${fileName}`;

      const fileBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

      // Create document record in database
      const { data: document, error: docError } = await supabase
        .from("knowledge_documents")
        .insert({
          title,
          description,
          sector_id: sectorId,
          file_path: filePath,
          file_type: file.type,
          file_size_bytes: file.size,
          status: "pending",
        })
        .select()
        .single();

      if (docError) {
        // Delete uploaded file if database insert fails
        await supabase.storage.from("documents").remove([filePath]);
        throw new Error(`Failed to create document record: ${docError.message}`);
      }

      return new Response(JSON.stringify({ document }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /documents/:id - Delete document
    if (req.method === "DELETE" && pathname.match(/\/documents\/[a-f0-9-]+$/)) {
      const id = pathname.split("/").pop();

      // Get document to find file path
      const { data: document, error: fetchError } = await supabase
        .from("knowledge_documents")
        .select("file_path")
        .eq("id", id)
        .single();

      if (fetchError) throw new Error(`Failed to fetch document: ${fetchError.message}`);

      // Delete file from storage
      if (document?.file_path) {
        await supabase.storage.from("documents").remove([document.file_path]);
      }

      // Delete document and its chunks (cascades via FK)
      const { error: delError } = await supabase.from("knowledge_documents").delete().eq("id", id);

      if (delError) throw new Error(`Failed to delete document: ${delError.message}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handleRequest);
