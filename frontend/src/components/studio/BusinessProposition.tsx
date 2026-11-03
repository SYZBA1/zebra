import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FIELDS = [
  { id: "businessName",     label: "Business Name",      labelAm: "የንግድ ስም",        placeholder: "What is your business called?",              required: true,  rows: 1 },
  { id: "problemStatement", label: "Problem Statement",  labelAm: "የችግር መግለጫ",      placeholder: "What problem does your business solve?",     required: true,  rows: 4 },
  { id: "solution",         label: "Your Solution",      labelAm: "መፍትሔዎ",           placeholder: "How does your business solve this problem?", required: true,  rows: 4 },
  { id: "targetMarket",     label: "Target Market",      labelAm: "ዒላማ ገበያ",         placeholder: "Who is your ideal customer?",                required: false, rows: 3 },
  { id: "valueProposition", label: "Value Proposition",  labelAm: "ዋጋ ሐሳብ",          placeholder: "What specific value do you deliver?",        required: false, rows: 3 },
  { id: "revenueModel",     label: "Revenue Model",      labelAm: "የገቢ ሞዴል",         placeholder: "How will your business make money?",         required: false, rows: 3 },
] as const;

type FieldId = typeof FIELDS[number]["id"];

const BusinessProposition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const phase1Answers = (location.state as any)?.phase1Answers || {};

  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [languageFlip, setLanguageFlip] = useState(false);
  const [form, setForm] = useState<Record<FieldId, string>>({
    businessName:     phase1Answers.q1_sector ?? "",
    problemStatement: "",
    solution:         "",
    targetMarket:     phase1Answers.q2_location ?? "",
    valueProposition: "",
    revenueModel:     "",
  });

  const t = (en: string, am: string) => (language === "en" ? en : am);

  const handleLanguageToggle = () => {
    setLanguageFlip(true);
    setTimeout(() => { setLanguage((l) => (l === "en" ? "am" : "en")); setLanguageFlip(false); }, 300);
  };

  const handleChange = (id: FieldId, value: string) => setForm((prev) => ({ ...prev, [id]: value }));

  const handleSave = async () => {
    if (!form.businessName || !form.problemStatement || !form.solution) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        toast({ title: "Error", description: "Authentication required", variant: "destructive" });
        setIsSaving(false);
        return;
      }
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: form.businessName,
          sector: phase1Answers.q1_sector || form.businessName,
          type: "proposition",
          document_type: "business_proposition",
          language,
          contents: { ...form, phase1_answers: phase1Answers },
          custom_titles: {},
          service_description: form.solution,
        } as any)
        .select("id")
        .single();
      if (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not save proposition", variant: "destructive" });
        setIsSaving(false);
        return;
      }
      toast({ title: "Saved!", description: "Business Proposition saved. Redirecting to Studio…" });
      navigate("/studio", { state: { propositionId: data?.id, proposition: form, phase1Answers } });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
      setIsSaving(false);
    }
  };

  const completed = FIELDS.filter((f) => form[f.id].trim().length > 0).length;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-20 h-16 flex items-center px-4 sm:px-6 justify-between shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/studio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-display text-base sm:text-lg font-bold tracking-tighter text-foreground">
            {t("Business Proposition", "ንግድ ሐሳብ")}
          </span>
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

            {/* Left — progress stripes */}
            <div className="lg:col-span-1 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">
                {t("Fields", "መስኮች")}
              </p>

              {FIELDS.map((field, idx) => {
                const filled = form[field.id].trim().length > 0;
                return (
                  <div key={field.id} className="relative h-14">
                    <div className={`absolute inset-0 rounded-xl border transition-all duration-500 ${
                      filled ? "bg-green-500/10 border-green-500/40" : "bg-card border-border"
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-foreground">{idx + 1}</span>
                        <span className="text-xs text-muted-foreground truncate flex-1 mx-4">
                          {t(field.label, field.labelAm)}
                          {field.required && <span className="text-primary ml-1">*</span>}
                        </span>
                        {filled && <span className="text-green-500 font-bold">✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Phase 1 context card */}
              {Object.keys(phase1Answers).length > 0 && (
                <div className="mt-6 rounded-2xl border border-border bg-card p-4 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                    {t("From Phase 1", "ከደረጃ 1")}
                  </p>
                  <div className="space-y-2 text-xs">
                    {phase1Answers.q1_sector && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sector</span>
                        <span className="text-foreground font-medium">{phase1Answers.q1_sector}</span>
                      </div>
                    )}
                    {phase1Answers.q2_location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market</span>
                        <span className="text-foreground font-medium">{phase1Answers.q2_location}</span>
                      </div>
                    )}
                    {phase1Answers.q4_budget && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="text-foreground font-medium">{phase1Answers.q4_budget}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completion ring */}
              <div className="mt-6 rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none"
                      stroke={completed === FIELDS.length ? "rgb(34 197 94)" : "hsl(var(--primary))"}
                      strokeWidth="3"
                      strokeDasharray={`${(completed / FIELDS.length) * 94} 94`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                    {completed}/{FIELDS.length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("Progress", "እድገት")}</p>
                  <p className="text-xs text-muted-foreground">
                    {completed === FIELDS.length
                      ? t("Ready to save!", "ለማስቀመጥ ዝግጁ!")
                      : t("3 required fields", "3 አስፈላጊ መስኮች")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-widest text-primary font-semibold">
                    {t("Phase 1 – Document Builder", "ደረጃ 1 – ሰነድ ገንቢ")}
                  </p>
                  <h1 className="text-3xl font-bold text-foreground">
                    {t("Business Proposition", "ንግድ ሐሳብ")}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Define your business fundamentals. This foundation is used across all your Zebra documents.",
                      "ንግድ መሠረቶች ይግለጹ። ይህ መሠረት በሁሉም የዝብላ ሰነዶችዎ ውስጥ ጥቅም ላይ ይውላል።"
                    )}
                  </p>
                </div>

                <div className="space-y-5">
                  {FIELDS.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        {t(field.label, field.labelAm)}
                        {field.required && <span className="text-primary ml-1">*</span>}
                      </label>
                      {field.rows === 1 ? (
                        <input
                          type="text"
                          value={form[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                        />
                      ) : (
                        <textarea
                          rows={field.rows}
                          value={form[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-none"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => navigate("/studio")} disabled={isSaving}>
                    {t("Back to Studio", "ወደ ስቱዲዮ ተመለስ")}
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="sm:min-w-[180px]">
                    {isSaving ? t("Saving…", "በማስቀመጥ ላይ…") : t("Save & Go to Studio", "ያስቀምጡ ወደ ስቱዲዮ ይሂዱ")}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessProposition;
