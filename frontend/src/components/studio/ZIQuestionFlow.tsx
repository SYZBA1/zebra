import { useState, useRef } from "react";
import { ArrowRight, Check, Languages, Sparkles } from "lucide-react";
import {
  COMPANY_PROFILE_QUESTIONS,
  BUSINESS_PROPOSAL_QUESTIONS,
  buildCompanyProfileContents,
  buildBusinessProposalContents,
  type QuestionDef,
  type OptionDef,
} from "@/lib/zi-questions";

type DocType = "company-profile" | "business-proposal";
type Lang = "en" | "am";

interface Props {
  documentType: DocType;
  initialLanguage?: Lang;
  onComplete: (answers: Record<string, any>, contents: Record<string, string>) => void;
  onBack: () => void;
}

const cls = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

// ─── Input primitives ─────────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder, multiLine }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiLine?: boolean;
}) {
  const shared = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-none";
  return multiLine
    ? <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={shared} />
    : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={shared} />;
}

function TwoFieldsInput({ field1, field2, value, onChange, lang }: {
  field1: any; field2: any; value: Record<string, string>;
  onChange: (v: Record<string, string>) => void; lang: Lang;
}) {
  const t = (en: string, am: string) => lang === "en" ? en : am;
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2">
          {t(field1.label, field1.labelAm)}
        </label>
        <TextInput
          value={value[field1.id] || ""}
          onChange={(v) => onChange({ ...value, [field1.id]: v })}
          placeholder={t(field1.placeholder || "", field1.placeholderAm || "")}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2">
          {t(field2.label, field2.labelAm)}
        </label>
        <TextInput
          value={value[field2.id] || ""}
          onChange={(v) => onChange({ ...value, [field2.id]: v })}
          placeholder={t(field2.placeholder || "", field2.placeholderAm || "")}
          multiLine={field2.multiLine}
        />
      </div>
    </div>
  );
}

function SelectInput({ options, value, onChange, multi, lang }: {
  options: OptionDef[]; value: string | string[];
  onChange: (v: string | string[]) => void; multi?: boolean; lang: Lang;
}) {
  const t = (en: string, am: string) => lang === "en" ? en : am;
  const selected = multi ? (value as string[]) : [value as string];

  const toggle = (v: string) => {
    if (multi) {
      const arr = value as string[];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cls(
              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150",
              isSelected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary"
            )}
          >
            <span className="flex items-center gap-3">
              <span className={cls(
                "w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
              )}>
                {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              {t(opt.label, opt.labelAm)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DynamicListInput({ value, onChange, maxItems, namePlaceholder, namePlaceholderAm, descPlaceholder, descPlaceholderAm, lang }: {
  value: { name: string; desc: string }[];
  onChange: (v: { name: string; desc: string }[]) => void;
  maxItems: number;
  namePlaceholder: string; namePlaceholderAm: string;
  descPlaceholder: string; descPlaceholderAm: string;
  lang: Lang;
}) {
  const t = (en: string, am: string) => lang === "en" ? en : am;
  const items = value.length ? value : [{ name: "", desc: "" }];

  const update = (idx: number, field: "name" | "desc", val: string) => {
    onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-primary">#{idx + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Remove
              </button>
            )}
          </div>
          <input type="text" value={item.name} onChange={(e) => update(idx, "name", e.target.value)}
            placeholder={t(namePlaceholder, namePlaceholderAm)}
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
          <textarea rows={2} value={item.desc} onChange={(e) => update(idx, "desc", e.target.value)}
            placeholder={t(descPlaceholder, descPlaceholderAm)}
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-none"
          />
        </div>
      ))}
      {items.length < maxItems && (
        <button type="button" onClick={() => onChange([...items, { name: "", desc: "" }])}
          className="w-full py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          + Add another
        </button>
      )}
    </div>
  );
}

function MultiFieldInput({ fields, value, onChange, lang }: {
  fields: any[]; value: Record<string, string>;
  onChange: (v: Record<string, string>) => void; lang: Lang;
}) {
  const t = (en: string, am: string) => lang === "en" ? en : am;
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.id}>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">
            {t(f.label, f.labelAm)}
          </label>
          <input type={f.inputType || "text"} value={value[f.id] || ""}
            onChange={(e) => onChange({ ...value, [f.id]: e.target.value })}
            placeholder={t(f.placeholder || "", f.placeholderAm || f.placeholder || "")}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
        </div>
      ))}
    </div>
  );
}

// ─── Question input collector ─────────────────────────────────────────────────

function QuestionPanel({ q, answer, onAnswer, lang }: {
  q: QuestionDef; answer: any; onAnswer: (v: any) => void; lang: Lang;
}) {
  const t = (en: string, am: string) => lang === "en" ? en : am;

  const [selectValue, setSelectValue] = useState<string | string[]>(() => {
    if (q.input.type === "multi-select") return (answer as string[]) || [];
    if (q.input.type === "single-select") return typeof answer === "object" ? answer?.value || "" : (answer as string) || "";
    return "";
  });
  const [revealText, setRevealText] = useState(() =>
    q.input.type === "single-select" && typeof answer === "object" ? answer?.text || "" : ""
  );
  const [twoFields, setTwoFields] = useState<Record<string, string>>(
    q.input.type === "two-fields" ? (answer as Record<string, string>) || {} : {}
  );
  const [listValue, setListValue] = useState<{ name: string; desc: string }[]>(
    q.input.type === "dynamic-list" ? (answer as any[]) || [{ name: "", desc: "" }] : []
  );
  const [multiFieldValue, setMultiFieldValue] = useState<Record<string, string>>(
    q.input.type === "multi-field" ? (answer as Record<string, string>) || {} : {}
  );
  const [textValue, setTextValue] = useState<string>(
    q.input.type === "text" || q.input.type === "textarea" ? (answer as string) || "" : ""
  );

  const notify = (type: string, val: any) => {
    if (type === "text" || type === "textarea") onAnswer(val);
    else if (type === "two-fields") onAnswer(val);
    else if (type === "dynamic-list") onAnswer(val);
    else if (type === "multi-field") onAnswer(val);
    else if (type === "multi-select") onAnswer(val);
  };

  const handleSelectChange = (v: string | string[]) => {
    setSelectValue(v);
    const inp = q.input as any;
    const selectedOpt = inp.options?.find((o: OptionDef) => o.value === v);
    if (selectedOpt?.revealText) {
      onAnswer({ value: v, text: revealText });
    } else {
      onAnswer(v);
    }
  };

  const handleRevealTextChange = (v: string) => {
    setRevealText(v);
    onAnswer({ value: selectValue, text: v });
  };

  const inp = q.input;
  const selectedOptReveal = inp.type === "single-select"
    ? (inp as any).options?.find((o: OptionDef) => o.value === selectValue)?.revealText
    : false;
  const followUp = inp.type === "single-select" ? (inp as any).followUp : undefined;

  return (
    <div className="space-y-4">
      {(inp.type === "text") && (
        <TextInput value={textValue} onChange={(v) => { setTextValue(v); notify("text", v); }}
          placeholder={t((inp as any).placeholder || "", (inp as any).placeholderAm || "")}
        />
      )}
      {(inp.type === "textarea") && (
        <TextInput value={textValue} onChange={(v) => { setTextValue(v); notify("textarea", v); }}
          placeholder={t((inp as any).placeholder || "", (inp as any).placeholderAm || "")} multiLine
        />
      )}
      {inp.type === "two-fields" && (
        <TwoFieldsInput field1={(inp as any).field1} field2={(inp as any).field2}
          value={twoFields} onChange={(v) => { setTwoFields(v); notify("two-fields", v); }} lang={lang}
        />
      )}
      {inp.type === "single-select" && (
        <div className="space-y-4">
          <SelectInput options={(inp as any).options} value={selectValue as string}
            onChange={(v) => handleSelectChange(v as string)} lang={lang}
          />
          {selectedOptReveal && followUp && (
            <div className="pl-4 border-l-2 border-primary/40 space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                {t(followUp.label, followUp.labelAm)}
              </label>
              <TextInput value={revealText} onChange={handleRevealTextChange}
                placeholder={t(followUp.placeholder || "", followUp.placeholderAm || "")}
                multiLine={followUp.multiLine}
              />
            </div>
          )}
        </div>
      )}
      {inp.type === "multi-select" && (
        <SelectInput options={(inp as any).options} value={selectValue as string[]}
          onChange={(v) => { setSelectValue(v as string[]); notify("multi-select", v); }} multi lang={lang}
        />
      )}
      {inp.type === "dynamic-list" && (
        <DynamicListInput value={listValue} onChange={(v) => { setListValue(v); notify("dynamic-list", v); }}
          maxItems={(inp as any).maxItems}
          namePlaceholder={(inp as any).namePlaceholder} namePlaceholderAm={(inp as any).namePlaceholderAm}
          descPlaceholder={(inp as any).descPlaceholder} descPlaceholderAm={(inp as any).descPlaceholderAm}
          lang={lang}
        />
      )}
      {inp.type === "multi-field" && (
        <MultiFieldInput fields={(inp as any).fields}
          value={multiFieldValue} onChange={(v) => { setMultiFieldValue(v); notify("multi-field", v); }} lang={lang}
        />
      )}
    </div>
  );
}

// ─── Answer preview text for collapsed stripes ───────────────────────────────

function answerPreview(q: QuestionDef, answer: any, lang: Lang): string {
  const t = (en: string, am: string) => lang === "en" ? en : am;
  if (!answer) return "—";
  if (q.input.type === "text" || q.input.type === "textarea") {
    const s = String(answer); return s.slice(0, 80) + (s.length > 80 ? "…" : "");
  }
  if (q.input.type === "two-fields") {
    return Object.values(answer as Record<string, string>).filter(Boolean).slice(0, 2).join(" · ").slice(0, 80);
  }
  if (q.input.type === "single-select") {
    const sel = typeof answer === "object" ? answer.value : answer;
    const opt = (q.input as any).options?.find((o: OptionDef) => o.value === sel);
    return opt ? t(opt.label, opt.labelAm) : sel;
  }
  if (q.input.type === "multi-select") {
    const arr = answer as string[];
    if (!arr?.length) return "—";
    return arr.map((v) => {
      const o = ((q.input as any).options as OptionDef[])?.find((o) => o.value === v);
      return o ? t(o.label, o.labelAm).split(" ")[0] : v;
    }).join(", ").slice(0, 80);
  }
  if (q.input.type === "dynamic-list") {
    const names = (answer as { name: string; desc: string }[]).filter((it) => it.name).map((it) => it.name);
    return names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");
  }
  if (q.input.type === "multi-field") {
    return Object.values(answer as Record<string, string>).filter(Boolean).slice(0, 2).join(" · ").slice(0, 80);
  }
  return "Answered";
}

function isAnswerValid(q: QuestionDef, ans: any): boolean {
  if (!ans) return false;
  if (q.input.type === "text" || q.input.type === "textarea") return String(ans).trim().length > 0;
  if (q.input.type === "two-fields") {
    const v = ans as Record<string, string>;
    const inp = q.input as any;
    return !!(v[inp.field1.id]?.trim() || v[inp.field2.id]?.trim());
  }
  if (q.input.type === "single-select") return !!(typeof ans === "object" ? ans.value : ans);
  if (q.input.type === "multi-select") return (ans as string[]).length > 0;
  if (q.input.type === "dynamic-list") return (ans as { name: string; desc: string }[]).some((it) => it.name.trim());
  if (q.input.type === "multi-field") return Object.values(ans as Record<string, string>).some((v) => v?.trim());
  return true;
}

// ─── Main component ───────────────────────────────────────────────────────────

const ZIQuestionFlow = ({ documentType, initialLanguage = "en", onComplete, onBack }: Props) => {
  const questions = documentType === "company-profile"
    ? COMPANY_PROFILE_QUESTIONS
    : BUSINESS_PROPOSAL_QUESTIONS;

  const [lang, setLang] = useState<Lang>(initialLanguage);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  const t = (en: string, am: string) => lang === "en" ? en : am;

  const handleLangToggle = () => {
    setIsFlipping(true);
    setTimeout(() => { setLang((l) => l === "en" ? "am" : "en"); setIsFlipping(false); }, 350);
  };

  const currentQ = questions[currentIdx];
  const isFinalQuestion = currentIdx === questions.length - 1;

  const handleNext = () => {
    if (isFinalQuestion) {
      setGenerating(true);
      setTimeout(() => {
        const contents = documentType === "company-profile"
          ? buildCompanyProfileContents(answers)
          : buildBusinessProposalContents(answers);
        onComplete(answers, contents);
      }, 1200);
    } else {
      setCurrentIdx((i) => i + 1);
      setTimeout(() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  };

  const docLabel = documentType === "company-profile"
    ? t("Company Profile", "የድርጅት መገለጫ")
    : t("Business Proposal", "የንግድ ሐሳብ");

  // Alternating stripe backgrounds using platform tokens
  const stripeBg = (idx: number) => idx % 2 === 0 ? "bg-background" : "bg-card";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">ZI · Zebra Intelligence</p>
            <p className="text-sm font-display font-bold text-foreground leading-none">{docLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs font-mono text-muted-foreground">
            {currentIdx + 1} / {questions.length}
          </span>
          <div style={{ perspective: "600px" }}>
            <button onClick={handleLangToggle}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-all"
              style={{ transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)", transition: "transform 0.35s ease" }}
            >
              <Languages className="h-3.5 w-3.5" />
              {lang === "en" ? "EN" : "አማ"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Stripe flow ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Completed stripes — collapsed */}
        {questions.slice(0, currentIdx).map((q, idx) => (
          <button key={q.id} type="button" onClick={() => setCurrentIdx(idx)}
            className={`w-full text-left px-4 sm:px-8 py-4 border-b border-border transition-colors hover:bg-secondary ${stripeBg(idx)}`}
          >
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <span className="text-xs font-mono text-primary w-6 shrink-0">{q.stripeNumber}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">
                  {t(q.question.split("\n")[0], q.questionAm.split("\n")[0])}
                </p>
                <p className="text-sm font-medium text-foreground truncate mt-0.5">
                  {answerPreview(q, answers[q.id], lang)}
                </p>
              </div>
              <span className="shrink-0 w-5 h-5 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-500" />
              </span>
            </div>
          </button>
        ))}

        {/* Active stripe — expanded */}
        {!generating && (
          <div ref={activeRef} className={`${stripeBg(currentIdx)} border-b border-border`}>
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 space-y-6">
              {/* Stripe number indicator */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold font-mono text-primary">{currentQ.stripeNumber}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>

              {/* Question + hint */}
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground leading-snug whitespace-pre-line">
                  {t(currentQ.question, currentQ.questionAm)}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t(currentQ.hint, currentQ.hintAm)}
                </p>
              </div>

              {/* Dynamic input */}
              <QuestionPanel
                q={currentQ}
                answer={answers[currentQ.id]}
                onAnswer={(v) => setAnswers((prev) => ({ ...prev, [currentQ.id]: v }))}
                lang={lang}
              />

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button type="button" onClick={handleNext}
                  disabled={!isAnswerValid(currentQ, answers[currentQ.id])}
                  className={cls(
                    "inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold transition-all duration-150",
                    isAnswerValid(currentQ, answers[currentQ.id])
                      ? isFinalQuestion
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                        : "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isFinalQuestion
                    ? <><Sparkles className="h-4 w-4" />{t("Generate Document", "ሰነዱን ፍጠር")}</>
                    : <>{t("Continue", "ቀጥል")}<ArrowRight className="h-4 w-4" /></>
                  }
                </button>

                {currentIdx > 0 && (
                  <button type="button" onClick={() => setCurrentIdx((i) => i - 1)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← {t("Back", "ተመለስ")}
                  </button>
                )}

                {!isFinalQuestion && (
                  <button type="button" onClick={() => setCurrentIdx((i) => i + 1)}
                    className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    {t("Skip", "ዝለል")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generating state */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
            </div>
            <div>
              <p className="text-lg font-display font-bold text-foreground">
                {t("Building your document…", "ሰነድዎን እየገነባን ነው…")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("ZI is assembling your answers into a professional document.", "ZI መልሶቹን ወደ ሙያዊ ሰነድ እያዋቀረ ነው።")}
              </p>
            </div>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className="h-1 w-8 rounded-full bg-primary/30 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}

        <div className="h-32" />
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 h-1 bg-border">
        <div className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>
    </div>
  );
};

export default ZIQuestionFlow;
