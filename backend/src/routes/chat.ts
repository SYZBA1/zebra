import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/authMiddleware";
import { generateContent, GeminiTool } from "../lib/ai";
import { embedQuery } from "../lib/embeddings";

const router = Router();

const SYSTEM_PROMPT = `You are the Zebra Business Intelligence front-desk assistant — a polite, knowledgeable advisor for Ethiopian entrepreneurs and any business-related question worldwide.

Scope (answer ALL of these warmly and thoroughly):
- About the Zebra platform: feasibility studies, business plans, organisational structure, performance tracking, marketplace templates, health diagnostic, pricing, how to use the Studio.
- Any business sector or topic: marketing, finance, accounting, HR, operations, strategy, legal basics, taxation, fundraising, e-commerce, exports, agriculture, manufacturing, services, tech startups, etc.
- Ethiopian context first when relevant: Telebirr, CBE, Chapa, NBE rules, ETB currency, local sectors, MoR tax, investment licenses — but also help with global business questions.
- Use the Zebra 6-pillar framework (Market, Operations, Finance, Legal, Risk, Strategy) when structuring feasibility-style answers.

Style:
- Always polite, encouraging, and professional. Greet warmly on first reply.
- Be concise but complete. Use markdown: short paragraphs, bullets, **bold** key terms.
- When KNOWLEDGE_CONTEXT is provided, prefer it and weave it naturally into the answer.
- Reply in the same language the user writes in (English or Amharic).
- Never refuse a legitimate business question. If outside business scope, gently redirect.

Escalation — call request_consultant_appointment ONLY when:
- The user explicitly asks to talk to a human / consultant / expert / book a meeting / "Appointment".
- The question requires legal, tax, or financial advice specific to their case beyond general guidance.

Otherwise answer directly. End long answers with: "_Want a 1:1 with a Zebra consultant? Just say 'Appointment'._"`;

const APPOINTMENT_TOOL: GeminiTool = {
  functionDeclarations: [
    {
      name: "request_consultant_appointment",
      description: "Trigger an appointment booking form for the user to schedule a 1:1 with a Zebra consultant.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Short topic the user needs help with" },
          reason: { type: "string", description: "Why escalation is helpful" },
        },
        required: ["topic"],
      },
    },
  ],
};

router.post("/chat", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  // Create supabase client inside handler so env vars are loaded
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { conversationId: incomingId, message, language = "en", sectorId } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const userId = req.user!.id;
    let conversationId = incomingId as string | undefined;

    if (!conversationId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: userId,
          language,
          title: message.slice(0, 60),
          metadata: sectorId ? { sector_id: sectorId } : {},
        })
        .select("id")
        .single();
      conversationId = conv?.id;
    }

    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: message,
    });

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);

    let knowledgeContext = "";
    const embedding = await embedQuery(message);
    if (embedding) {
      try {
        const { data: chunks } = sectorId
          ? await supabase.rpc("match_knowledge_by_sector", {
              query_embedding: embedding,
              sector_id: sectorId,
              match_count: 5,
              filter_language: language,
            })
          : await supabase.rpc("match_knowledge", {
              query_embedding: embedding,
              match_count: 4,
              filter_language: language,
            });

        if (chunks?.length) {
          knowledgeContext =
            "\n\nKNOWLEDGE_CONTEXT:\n" +
            chunks.map((c: { content: string }, i: number) => `[${i + 1}] ${c.content}`).join("\n\n");
        }
      } catch (e) {
        console.warn("RAG retrieval failed:", e);
      }
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + knowledgeContext },
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const aiResult = await generateContent(messages, [APPOINTMENT_TOOL]);

    let assistantContent = aiResult.content;
    let appointmentRequest: { topic?: string; reason?: string } | null = null;

    if (aiResult.toolCall?.name === "request_consultant_appointment") {
      appointmentRequest = aiResult.toolCall.args as { topic?: string; reason?: string };
      if (!assistantContent) {
        assistantContent =
          language === "am"
            ? "ይህ ጥያቄ ከባለሙያ ጋር በቀጥታ ቢመለስ ይሻላል። ከታች ያለውን ቅጽ ሞልተው ቀጠሮ ይያዙ።"
            : "This question is best handled with a Zebra consultant. Please fill the appointment form below to book a time.";
      }
    }

    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: assistantContent,
      metadata: appointmentRequest ? { appointment: appointmentRequest } : {},
    });

    res.json({ conversationId, content: assistantContent, appointmentRequest });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("chat route error:", error);
    res.status(error.status ?? 500).json({ error: error.message ?? "Internal server error" });
  }
});

export default router;
