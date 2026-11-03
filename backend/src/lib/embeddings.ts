/**
 * VoyageAI embeddings wrapper.
 * Used for RAG retrieval in chat, draft, and health-diagnose routes.
 */

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_BASE = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";

export async function embedQuery(text: string): Promise<number[] | null> {
  if (!VOYAGE_API_KEY) {
    console.warn("VOYAGE_API_KEY not set — RAG retrieval disabled");
    return null;
  }

  try {
    const response = await fetch(VOYAGE_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [text.slice(0, 4000)],
        model: VOYAGE_MODEL,
        input_type: "query",
      }),
    });

    if (!response.ok) {
      console.error(`Voyage embed error ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("Voyage embed exception:", err);
    return null;
  }
}

export async function embedBatch(
  texts: string[],
  inputType: "document" | "query" = "document"
): Promise<number[][]> {
  if (!VOYAGE_API_KEY) throw new Error("VOYAGE_API_KEY is not configured");

  const response = await fetch(VOYAGE_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Voyage batch embed error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}
