/**
 * Google Gemini API wrapper — direct calls, no Lovable gateway.
 * Uses the REST API for maximum control and streaming support.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiTool {
  functionDeclarations: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
}

export interface GeminiResponse {
  content: string;
  toolCall?: { name: string; args: Record<string, unknown> };
  finishReason?: string;
}

/**
 * Convert OpenAI-style messages to Gemini format.
 * System message is extracted and returned separately.
 */
export function toGeminiMessages(
  messages: Array<{ role: string; content: string }>
): { systemInstruction?: string; contents: GeminiMessage[] } {
  const systemMessages = messages.filter((m) => m.role === "system");
  const otherMessages = messages.filter((m) => m.role !== "system");

  const systemInstruction = systemMessages.map((m) => m.content).join("\n\n") || undefined;

  const contents: GeminiMessage[] = otherMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  return { systemInstruction, contents };
}

/**
 * Non-streaming chat completion.
 */
export async function generateContent(
  messages: Array<{ role: string; content: string }>,
  tools?: GeminiTool[],
  model: string = DEFAULT_MODEL
): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const { systemInstruction, contents } = toGeminiMessages(messages);

  const requestBody: Record<string, unknown> = { contents };
  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (tools) {
    requestBody.tools = tools;
  }

  const response = await fetch(
    `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw Object.assign(new Error("Rate limit exceeded. Try again shortly."), { status: 429 });
    if (response.status === 402) throw Object.assign(new Error("AI API quota exceeded."), { status: 402 });
    throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
          functionCall?: { name: string; args?: Record<string, unknown> };
        }>;
      };
      finishReason?: string;
    }>;
  };
  const candidate = data.candidates?.[0];
  const part = candidate?.content?.parts?.[0];

  // Check for function call
  if (part?.functionCall) {
    return {
      content: "",
      toolCall: { name: part.functionCall.name, args: part.functionCall.args ?? {} },
      finishReason: candidate?.finishReason,
    };
  }

  return {
    content: part?.text ?? "",
    finishReason: candidate?.finishReason,
  };
}

/**
 * Streaming chat completion — returns a ReadableStream of SSE chunks.
 */
export async function generateContentStream(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL
): Promise<ReadableStream<Uint8Array>> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const { systemInstruction, contents } = toGeminiMessages(messages);

  const requestBody: Record<string, unknown> = { contents };
  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(
    `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw Object.assign(new Error("Rate limit exceeded. Try again shortly."), { status: 429 });
    throw new Error(`Gemini stream error ${response.status}: ${errText.slice(0, 300)}`);
  }

  if (!response.body) throw new Error("No response body from Gemini stream");

  // Transform Gemini SSE format to OpenAI-compatible SSE format
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const transformedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = response.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const geminiChunk = JSON.parse(jsonStr);
              const text = geminiChunk.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Emit as OpenAI-compatible SSE chunk so the frontend parser works unchanged
                const openAiChunk = {
                  choices: [{ delta: { content: text } }],
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`)
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return transformedStream;
}
