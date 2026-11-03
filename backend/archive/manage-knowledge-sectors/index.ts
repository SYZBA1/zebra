import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

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
    // GET /sectors - List all sectors
    if (req.method === "GET" && pathname.endsWith("/sectors")) {
      const { data: sectors, error } = await supabase
        .from("knowledge_sectors")
        .select("*")
        .order("name");

      if (error) throw new Error(`Failed to fetch sectors: ${error.message}`);
      return new Response(JSON.stringify({ sectors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /sectors - Create sector
    if (req.method === "POST" && pathname.endsWith("/sectors")) {
      const body = await req.json();
      const { name, description, color } = body;

      if (!name) {
        return new Response(
          JSON.stringify({ error: "Sector name is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: sector, error } = await supabase
        .from("knowledge_sectors")
        .insert({ name, description, color })
        .select()
        .single();

      if (error) throw new Error(`Failed to create sector: ${error.message}`);
      return new Response(JSON.stringify({ sector }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /sectors/:id - Update sector
    if (req.method === "PUT" && pathname.match(/\/sectors\/[a-f0-9-]+$/)) {
      const id = pathname.split("/").pop();
      const body = await req.json();
      const { name, description, color } = body;

      const { data: sector, error } = await supabase
        .from("knowledge_sectors")
        .update({ name, description, color, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update sector: ${error.message}`);
      return new Response(JSON.stringify({ sector }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /sectors/:id - Delete sector
    if (req.method === "DELETE" && pathname.match(/\/sectors\/[a-f0-9-]+$/)) {
      const id = pathname.split("/").pop();
      const { error } = await supabase.from("knowledge_sectors").delete().eq("id", id);

      if (error) throw new Error(`Failed to delete sector: ${error.message}`);
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
