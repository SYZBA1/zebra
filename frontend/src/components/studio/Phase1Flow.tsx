import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Languages, ArrowLeft, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PHASE1_QUESTIONS } from "@/prompts/phase1Questions";
import { PHASE1_SYSTEM_PROMPT } from "@/prompts/phase1SystemPrompt";

const TrafficLight = ({ status }: { status: "green" | "yellow" | "red" }) => (
  <div className="relative w-24 h-64 bg-card rounded-full shadow-2xl p-3 flex flex-col justify-center items-center gap-3 border border-border">
    {["red", "yellow", "green"].map((light) => (
      <div
        key={light}
        className={`w-16 h-16 rounded-full transition-all duration-500 shadow-lg ${
          light === "red" ? "bg-red-500" : light === "yellow" ? "bg-yellow-400" : "bg-green-500"
        } ${
          (status === "red"    && light === "red")    ? "opacity-100 shadow-red-500/50"    :
          (status === "yellow" && light === "yellow") ? "opacity-100 shadow-yellow-400/50" :
          (status === "green"  && light === "green")  ? "opacity-100 shadow-green-500/50"  :
          "opacity-20"
        }`}
      />
    ))}
  </div>
);

const Phase1Flow = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [recommendationStatus, setRecommendationStatus] = useState<"green" | "yellow" | "red">("green");
  const [languageFlip, setLanguageFlip] = useState(false);
  const navigate = useNavigate();

  const t = (en: string, am: string) => (language === "en" ? en : am);
  const currentQuestion = PHASE1_QUESTIONS[step];

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("Voice recording not supported in your browser"); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-US" : "am-ET";
    recognition.continuous = true;
    recognition.interimResults = true;
    let transcript = "";

    recognition.onstart  = () => { setIsRecording(true); setError(null); };
    recognition.onresult = (event: any) => {
      transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: transcript }));
    };
    recognition.onerror = (event: any) => { setError(`Recording error: ${event.error}`); setIsRecording(false); };
    recognition.onend   = () => setIsRecording(false);
    recognition.start();
    setTimeout(() => recognition.stop(), 30000);
  };

  const handleAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

  const handleNext = () => {
    if (!answers[currentQuestion.id]?.trim()) { setError("Please answer this question to continue."); return; }
    setError(null);
    if (step + 1 < PHASE1_QUESTIONS.length) { setStep(step + 1); return; }
    generateRecommendation();
  };

  const generateRecommendation = async () => {
    setIsSaving(true);
    setError(null);
    const values = PHASE1_QUESTIONS.map((q) => ({ question: q.question, answer: answers[q.id] ?? "" }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: "phase1-questionnaire",
          message: JSON.stringify({ systemPrompt: PHASE1_SYSTEM_PROMPT, questions: values }),
          language: "en",
        }),
      });
      const response = await res.json();
      const content = response?.content || "";
      setSummary(content);
      const m = content.match(/🟢|🟡|🔴/);
      if (m) setRecommendationStatus(m[0] === "🟢" ? "green" : m[0] === "🟡" ? "yellow" : "red");
    } catch (e) {
      console.error(e);
      setError("Unable to generate your recommendation. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => { setStep(0); setAnswers({}); setSummary(null); setError(null); };

  const playVoiceRecommendation = () => {
    if (!summary) return;
    setIsPlayingVoice(true);
    const u = new SpeechSynthesisUtterance(summary);
    u.lang = language === "en" ? "en-US" : "am-ET";
    u.onend = () => setIsPlayingVoice(false);
    window.speechSynthesis.speak(u);
  };

  const handleLanguageToggle = () => {
    setLanguageFlip(true);
    setTimeout(() => { setLanguage((l) => (l === "en" ? "am" : "en")); setLanguageFlip(false); }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-20 h-16 flex items-center px-4 sm:px-6 justify-between shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/studio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">ZI · Zebra Intelligence</p>
            <span className="font-display text-sm font-bold tracking-tighter text-foreground leading-none">
              {t("ZI Assessment", "ዝብላ ግምገማ")}
            </span>
          </div>
        </div>
        <button
          onClick={handleLanguageToggle}
          className={`flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-all duration-300 ${languageFlip ? "scale-95 opacity-50" : "scale-100"}`}
        >
          <Languages className="h-3.5 w-3.5" />
          {language === "en" ? "EN" : "አማ"}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — question stripes + active panel */}
            <div className="lg:col-span-2 space-y-6">

              {/* Stripe progress */}
              <div className="space-y-2.5">
                {PHASE1_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="relative h-14">
                    <div className={`absolute inset-0 rounded-xl border transition-all duration-500 ${
                      idx < step  ? "bg-green-500/10 border-green-500/40" :
                      idx === step ? "bg-primary/15 border-primary shadow-sm shadow-primary/20" :
                      "bg-card border-border"
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className={`text-sm font-bold font-mono w-8 shrink-0 ${
                          idx === step ? "text-primary" : idx < step ? "text-green-500" : "text-muted-foreground"
                        }`}>Q{idx + 1}</span>
                        <span className="text-xs text-muted-foreground truncate flex-1 mx-3">
                          {q.question.substring(0, 42)}…
                        </span>
                        {idx < step && <span className="text-green-500 font-bold shrink-0">✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ZI thinking loader */}
              {isSaving && !summary && (
                <div className="rounded-xl border border-primary/20 bg-card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center shrink-0 animate-pulse shadow-lg shadow-primary/30">
                    <span className="text-white font-black text-sm">ZI</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{t("ZI is analyzing your answers…", "ZI መልሶችዎን እየተነተነ ነው…")}</p>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Question panel */}
              {!summary ? (
                <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-primary font-semibold font-mono">
                      Q{step + 1} / {PHASE1_QUESTIONS.length}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{currentQuestion.question}</h2>
                  </div>

                  <div className="space-y-4">
                    {!currentQuestion.options?.length && (
                      <button type="button" onClick={startVoiceRecording}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border transition-all ${
                          isRecording
                            ? "bg-red-500/15 border-red-500/50 text-red-400"
                            : "bg-secondary border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isRecording ? t("Stop Recording", "ቀረጻ ያቁሙ") : t("Record Voice", "ድምጽ ይቅረጹ")}
                      </button>
                    )}

                    {currentQuestion.options?.length ? (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {currentQuestion.options.map((option) => (
                          <button key={option} type="button"
                            className={`rounded-lg px-4 py-3 text-left text-sm font-medium border transition-all ${
                              answers[currentQuestion.id] === option
                                ? "bg-primary/10 text-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-secondary"
                            }`}
                            onClick={() => handleAnswer(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        rows={5}
                        value={answers[currentQuestion.id] ?? ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                        placeholder="Your answer…"
                        className="w-full rounded-xl border border-border bg-background px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-none"
                      />
                    )}
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex items-center gap-4 justify-between pt-2">
                    <Button onClick={handleNext} disabled={isSaving}>
                      {step + 1 === PHASE1_QUESTIONS.length
                        ? t("Generate Recommendation", "ምክር ፍጠር")
                        : t("Next", "ቀጣይ")}
                    </Button>
                    <span className="text-xs font-mono text-muted-foreground">{step + 1}/{PHASE1_QUESTIONS.length}</span>
                  </div>
                </div>
              ) : (
                /* Summary / recommendation */
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center shadow-lg shadow-primary/30">
                      <span className="text-white font-black text-sm tracking-tight">ZI</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">ZI</span>
                        <span className="text-xs text-muted-foreground font-mono">Zebra Intelligence</span>
                      </div>
                      <div className="rounded-2xl rounded-tl-sm border border-border bg-card p-5 max-h-[420px] overflow-y-auto">
                        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&_h2]:text-primary [&_strong]:text-primary/80">
                          {summary}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pl-13">
                    <button onClick={playVoiceRecommendation}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border transition-all ${
                        isPlayingVoice
                          ? "bg-red-500/15 border-red-500/40 text-red-400"
                          : "bg-secondary border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                      {isPlayingVoice ? t("Playing…", "እየተጫወተ…") : t("Listen to ZI", "ZI ን ያዳምጡ")}
                    </button>
                    <Button onClick={() => navigate("/studio/business-proposition", { state: { phase1Answers: answers } })}>
                      {t("Build Proposition →", "ሐሳብ ይገንቡ →")}
                    </Button>
                    <Button variant="outline" onClick={handleRestart}>
                      {t("Restart", "እንደገና ጀምር")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right — traffic light + voice info */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {summary && (
                <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Status</p>
                  <TrafficLight status={recommendationStatus} />
                  <p className="text-sm text-muted-foreground text-center">
                    {recommendationStatus === "green" ? "Proceed" :
                     recommendationStatus === "yellow" ? "Proceed with Caution" :
                     "Reconsider"}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Voice Available</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "Listen to your recommendation in English or switch to Amharic. All content is available in both languages.",
                    "በአማርኛ ወይም በእንግሊዝኛ መከታተል ይችላሉ። ሁሉም ይዘት በሁለቱም ቋንቋዎች ውስጥ ይገኛል።"
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Phase1Flow;
