import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;
const apiUrl = process.env.API_URL || "http://localhost:3001";

if (!email || !password) {
  throw new Error("TEST_USER_EMAIL and TEST_USER_PASSWORD are required");
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
  );
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  if (error || !data.session) {
    throw new Error(`Test account authentication failed: ${error?.message || "No session"}`);
  }

  const response = await fetch(`${apiUrl}/api/draft`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({
      sectionId: "5.1",
      sectionTitle: "Market Analysis",
      projectName: "Hawassa Poultry Farm",
      sector: "Agriculture",
      documentType: "feasibility",
      language: "en",
      serviceDescription: "Egg production for hotels and grocers.",
      phase1Answers: {
        location: "Hawassa, Ethiopia",
        scale: "Small enterprise",
        budget: "ETB 300,000",
        sales: "Egg sales to hotels and grocers",
      },
    }),
  });

  const retrievalSourceCount = response.headers.get("x-zebra-retrieval-source-count");
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Authenticated draft failed (${response.status}): ${body.slice(0, 300)}`);
  }
  if (!response.body) throw new Error("Draft response has no body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let output = "";
  let buffer = "";
  const parseSseChunk = (chunk: string): void => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        output += event.choices?.[0]?.delta?.content || "";
      } catch {
        // Ignore malformed stream fragments.
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      parseSseChunk(decoder.decode());
      break;
    }
    parseSseChunk(decoder.decode(value, { stream: true }));
  }

  console.log(JSON.stringify({
    authenticated: true,
    retrievalSourceCount: Number(retrievalSourceCount || 0),
    output,
  }));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Authenticated draft evaluation failed");
  process.exitCode = 1;
});
