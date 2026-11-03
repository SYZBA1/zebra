import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  appointmentRequest?: { topic?: string; reason?: string } | null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formTopic, setFormTopic] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setAccessToken(session?.access_token ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
      setAccessToken(s?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load chat history on open
  useEffect(() => {
    if (!open || !authed || messages.length > 0) return;
    (async () => {
      const { data: convs } = await supabase
        .from("chat_conversations")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1);
      const latest = convs?.[0]?.id;
      if (latest) {
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("role, content, metadata")
          .eq("conversation_id", latest)
          .order("created_at", { ascending: true });
        if (msgs && msgs.length) {
          setConversationId(latest);
          setMessages(msgs.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            appointmentRequest: m.metadata?.appointment ?? null,
          })));
          return;
        }
      }
      setMessages([{
        role: "assistant",
        content: language === "am"
          ? "ሰላም! እኔ የዜብራ የንግድ ረዳት ነኝ። ስለ ኩባንያችን፣ ፊዚቢሊቲ ጥናት፣ የንግድ ዕቅድ፣ ፋይናንስ ወይም ሌላ ማንኛውም የንግድ ጥያቄ ይጠይቁኝ። ከባለሙያ ጋር 1:1 ቀጠሮ ለመያዝ \"Appointment\" ብለው ይላኩ።"
          : "Hi! I'm the Zebra business assistant. Ask me anything about our company, feasibility studies, business plans, financing, Ethiopian market entry, or any business-related question. For a 1:1 with a real consultant, send me \"Appointment\".",
      }]);
    })();
  }, [open, authed, language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showForm]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!authed || !accessToken) {
      toast.error(language === "am" ? "እባክዎ ይግቡ" : "Please sign in to chat");
      return;
    }
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);

    // Direct trigger: "Appointment" keyword shows form immediately
    if (/^\s*appointment\s*\.?\s*$/i.test(text) || /^\s*ቀጠሮ\s*$/.test(text)) {
      const reply = language === "am"
        ? "እሺ! ከባለሙያ ጋር ቀጠሮ ለመያዝ ከታች ያለውን ቅጽ ይሙሉ።"
        : "Great! Please fill the form below to book a 1:1 with a Zebra consultant.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setFormTopic(undefined);
      setShowForm(true);
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId, message: text, language }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setMessages((m) => [...m, {
        role: "assistant",
        content: data.content,
        appointmentRequest: data.appointmentRequest,
      }]);
      if (data.appointmentRequest) {
        setFormTopic(data.appointmentRequest.topic ?? text);
        setShowForm(true);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Chat error");
      setMessages((m) => [...m, {
        role: "assistant",
        content: language === "am"
          ? "ይቅርታ፣ ስህተት ተፈጥሯል። እንደገና ይሞክሩ።"
          : "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[85vh] w-[380px] max-w-[95vw] flex-col rounded-xl border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="text-sm font-semibold">{language === "am" ? "የዜብራ ረዳት" : "Zebra Assistant"}</div>
              <div className="text-xs text-muted-foreground">{language === "am" ? "በመስመር ላይ" : "Online · Front desk AI"}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "am" : "en")}>
                <Globe className="h-3.5 w-3.5" />{language.toUpperCase()}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-3 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /></div>
              </div>
            )}
            {showForm && (
              <AppointmentForm
                conversationId={conversationId}
                initialTopic={formTopic}
                language={language}
                onBooked={() => setShowForm(false)}
              />
            )}
            {!showForm && messages.length > 1 && (
              <button
                onClick={() => { setFormTopic(undefined); setShowForm(true); }}
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                {language === "am" ? "ከባለሙያ ጋር ቀጠሮ ይያዙ" : "Book a consultant instead →"}
              </button>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={language === "am" ? "መልዕክት ይፃፉ..." : "Ask about feasibility, finance, Telebirr..."}
                rows={2}
                className="min-h-0 resize-none"
                disabled={sending}
              />
              <Button onClick={send} disabled={sending || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
