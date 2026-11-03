import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HeartPulse, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

interface Question {
  id: string;
  pillar: string;
  order_index: number;
  question_en: string;
  question_am: string | null;
  input_type: "text" | "number" | "select";
  options: string[] | null;
}

interface DiagnosticResult {
  assessment_id?: string;
  overall_score: number;
  rating: string;
  summary: string;
  pillar_scores: Record<string, number>;
  gaps: Array<{
    pillar: string;
    title: string;
    current_state: string;
    target_state: string;
    severity: string;
    solutions: string[];
  }>;
}

interface Props {
  businessName: string;
  sector: string;
  language: "en" | "am";
  projectId?: string | null;
  onBack: () => void;
}

const RATING_COLORS: Record<string, string> = {
  Critical: "text-destructive",
  "At Risk": "text-orange-400",
  Stable: "text-yellow-400",
  Healthy: "text-emerald-400",
  Thriving: "text-emerald-300",
};

export default function HealthDiagnostic({ businessName, sector, language, projectId, onBack }: Props) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const t = (en: string, am: string) => (language === "en" ? en : am);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("health_questions")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setQuestions((data ?? []) as any);
      }
      setLoading(false);
    })();
  }, []);

  const current = questions[step];
  const progress = useMemo(
    () => (questions.length ? Math.round(((step + (result ? 1 : 0)) / (questions.length + 1)) * 100) : 0),
    [step, questions.length, result]
  );

  const setAnswer = (val: string) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.question_en]: val }));
  };

  const canAdvance = current && (answers[current.question_en] ?? "").trim().length > 0;

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
      const response = await fetch(`${API_URL}/api/health-diagnose`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessName, sector, language, answers, projectId: projectId ?? null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      setResult(data as DiagnosticResult);
    } catch (e: any) {
      toast({
        title: t("Diagnostic failed", "ምርመራ አልተሳካም"),
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // RESULTS VIEW
  if (result) {
    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <HeartPulse className="h-10 w-10 mx-auto text-primary mb-2" />
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {t("Business Health Diagnostic", "የንግድ ጤና ምርመራ")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1">{businessName}</h2>
          </div>

          <div className="border border-border rounded-lg p-6 bg-secondary/30 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
              {t("Overall Score", "አጠቃላይ ነጥብ")}
            </p>
            <p className="text-6xl font-display font-bold text-primary">{result.overall_score}</p>
            <p className={`mt-2 text-lg font-display font-bold ${RATING_COLORS[result.rating] ?? "text-foreground"}`}>
              {result.rating}
            </p>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">{result.summary}</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-base mb-3">{t("Pillar Scores", "የምሰሶ ነጥቦች")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(result.pillar_scores).map(([pillar, score]) => (
                <div key={pillar} className="border border-border rounded-md p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{pillar}</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="text-2xl font-display font-bold">{score}</p>
                    <p className="text-[10px] text-muted-foreground">/100</p>
                  </div>
                  <Progress value={score} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              {t("Identified Gaps & Solutions", "የተለዩ ክፍተቶች እና መፍትሄዎች")}
            </h3>
            <div className="space-y-3">
              {result.gaps.map((g, i) => (
                <div key={i} className="border border-border rounded-md p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{g.pillar}</p>
                      <p className="font-display font-bold text-sm">{g.title}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        g.severity === "high"
                          ? "bg-destructive/20 text-destructive"
                          : g.severity === "medium"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {g.severity}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase text-muted-foreground mb-0.5">{t("Current", "አሁን")}</p>
                      <p className="text-foreground/90">{g.current_state}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-muted-foreground mb-0.5">{t("Target", "ዒላማ")}</p>
                      <p className="text-foreground/90">{g.target_state}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-mono text-[10px] uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {t("Recommended Solutions", "የተመከሩ መፍትሄዎች")}
                    </p>
                    <ul className="space-y-1.5">
                      {g.solutions.map((s, j) => (
                        <li key={j} className="flex gap-2 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={onBack}>{t("Back to Studio", "ወደ ስቱዲዮ ተመለስ")}</Button>
          </div>
        </div>
      </main>
    );
  }

  // SUBMITTING VIEW
  if (submitting) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg mb-1">
            {t("Analyzing your business…", "ንግድዎን በመተንተን ላይ…")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t(
              "The Zebra engine is scoring 6 pillars and identifying gaps.",
              "የዜብራ ሞተር 6 ምሰሶዎችን እየገመገመ ክፍተቶችን እያገኘ ነው።"
            )}
          </p>
        </div>
      </main>
    );
  }

  // QUESTION VIEW
  if (!current) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t("No questions configured.", "ጥያቄዎች አልተዋቀሩም።")}</p>
      </main>
    );
  }

  const questionText = language === "am" && current.question_am ? current.question_am : current.question_en;
  const isLast = step === questions.length - 1;

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="w-full max-w-xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {t("Question", "ጥያቄ")} {step + 1} / {questions.length}
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary">{current.pillar}</p>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <div className="border border-border rounded-lg p-5 sm:p-6">
          <h3 className="font-display font-bold text-lg sm:text-xl leading-snug mb-5">{questionText}</h3>

          {current.input_type === "select" && current.options ? (
            <div className="space-y-2">
              {current.options.map((opt) => {
                const selected = answers[current.question_en] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswer(opt)}
                    className={`w-full text-left border rounded-md p-3 text-sm transition-colors ${
                      selected ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : current.input_type === "number" ? (
            <Input
              type="number"
              inputMode="numeric"
              value={answers[current.question_en] ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="0"
              className="text-base"
            />
          ) : (
            <Textarea
              value={answers[current.question_en] ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t("Your answer…", "መልስዎ…")}
              rows={3}
              className="text-base"
            />
          )}
        </div>

        <div className="flex justify-between mt-5">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? onBack() : setStep((s) => s - 1))}
          >
            {step === 0 ? t("Cancel", "ይቅር") : t("Back", "ተመለስ")}
          </Button>
          {isLast ? (
            <Button disabled={!canAdvance} onClick={submit}>
              {t("Run Diagnostic", "ምርመራ አሂድ")}
            </Button>
          ) : (
            <Button disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>
              {t("Next", "ቀጣይ")}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
