import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Languages, Sun, Moon, FileText, TrendingUp, Building2, Activity, HeartPulse, ClipboardList, Settings, Trash2, Sparkles, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import ProjectSetup from "@/components/studio/ProjectSetup";
import TemplateBrowser from "@/components/studio/TemplateBrowser";
import EditorView from "@/components/studio/EditorView";
import HealthDiagnostic from "@/components/studio/HealthDiagnostic";
import ZIQuestionFlow from "@/components/studio/ZIQuestionFlow";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStoredTheme, setStoredTheme, type Theme } from "@/lib/theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import zebraLogoLight from "@/assets/zebra-logo-light.png";

type StudioView = "home" | "setup" | "templates" | "editor" | "intro" | "health" | "zi-flow";
type DocumentType = "feasibility" | "business-plan" | "business-proposal" | "company-profile" | "strategic-business" | "org-structure" | "performance-tracking" | "business-health";

interface SavedProject {
  id: string;
  name: string;
  sector: string;
  type: string;
  document_type: string;
  contents: Record<string, string>;
  custom_titles: Record<string, string>;
  language: string;
  service_description: string;
  updated_at: string;
}

const DOC_TOOLS: { type: DocumentType; icon: any; label: string; labelAm: string; desc: string; descAm: string }[] = [
  { type: "feasibility", icon: FileText, label: "Feasibility Study", labelAm: "የተግባራዊነት ጥናት", desc: "Market viability, financial projections, and operational feasibility.", descAm: "የገበያ ተገቢነት፣ የፋይናንስ ትንበያ እና ተግባራዊነት።" },
  { type: "business-plan", icon: ClipboardList, label: "Business Plan", labelAm: "የንግድ ዕቅድ", desc: "Company description, strategy, financial plan, and growth roadmap.", descAm: "የድርጅት መግለጫ፣ ስትራቴጂ፣ ፋይናንስ እና ዕድገት።" },
  { type: "business-proposal", icon: Settings, label: "Business Proposal", labelAm: "የንግድ ሐሳብ", desc: "A concise proposal that frames the opportunity, scope, and expected value.", descAm: "እድሉን፣ ወሰኑን እና የተጠበቀውን ዋጋ የሚያቀርብ አጭር ሐሳብ።" },
  { type: "company-profile", icon: Building2, label: "Company Profile", labelAm: "የድርጅት መገለጫ", desc: "Organization overview, mission, core services, and business identity.", descAm: "የድርጅት አጠቃላይ እይታ፣ ተልዕኮ፣ ዋና አገልግሎቶች እና መለያ።" },
  { type: "strategic-business", icon: TrendingUp, label: "Strategic Business Development", labelAm: "ስትራቴጂካዊ የንግድ ልማት", desc: "Growth engine, B2B partnerships, CAC targets, market entry.", descAm: "የእድገት ሞተር፣ B2B አጋርነት፣ CAC ዒላማዎች።" },
  { type: "org-structure", icon: Building2, label: "Organizational Structure", labelAm: "ድርጅታዊ አወቃቀር", desc: "Hierarchy, reporting lines, key roles, recruitment timeline.", descAm: "ተዋረድ፣ ሪፖርት መስመሮች፣ ቁልፍ ሚናዎች።" },
  { type: "performance-tracking", icon: Activity, label: "Performance Tracking", labelAm: "የአፈጻጸም ክትትል", desc: "KPIs, delivery timelines, client retention, pipeline velocity.", descAm: "KPIዎች፣ ጊዜ ሰሌዳ፣ ደንበኛ ማቆየት።" },
  { type: "business-health", icon: HeartPulse, label: "Business Health Analysis", labelAm: "የንግድ ጤና ትንተና", desc: "Cash flow, profit margins, risk matrix, health dashboard.", descAm: "ገንዘብ ፍሰት፣ ትርፍ ህዳግ፣ ስጋት ማትሪክስ።" },
];

const USER_STUDIO_TYPES: DocumentType[] = ["feasibility", "business-plan", "business-proposal", "company-profile"];

const TOOL_COLORS: Record<string, { from: string; to: string; glow: string; iconBg: string }> = {
  "feasibility":          { from: "#1d4ed8", to: "#0891b2", glow: "rgba(56,189,248,0.25)",  iconBg: "rgba(56,189,248,0.15)" },
  "business-plan":        { from: "#7c3aed", to: "#2563eb", glow: "rgba(139,92,246,0.25)",  iconBg: "rgba(139,92,246,0.15)" },
  "business-proposal":    { from: "#ea580c", to: "#dc2626", glow: "rgba(249,115,22,0.25)",  iconBg: "rgba(249,115,22,0.15)" },
  "company-profile":      { from: "#059669", to: "#0891b2", glow: "rgba(16,185,129,0.25)",  iconBg: "rgba(16,185,129,0.15)" },
  "strategic-business":   { from: "#d97706", to: "#ea580c", glow: "rgba(245,158,11,0.25)",  iconBg: "rgba(245,158,11,0.15)" },
  "org-structure":        { from: "#db2777", to: "#7c3aed", glow: "rgba(219,39,119,0.25)",  iconBg: "rgba(219,39,119,0.15)" },
  "performance-tracking": { from: "#dc2626", to: "#d97706", glow: "rgba(220,38,38,0.25)",   iconBg: "rgba(220,38,38,0.15)" },
  "business-health":      { from: "#0891b2", to: "#059669", glow: "rgba(8,145,178,0.25)",   iconBg: "rgba(8,145,178,0.15)" },
};

const TiltCard = ({
  children, onClick, className = "", glowColor,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  glowColor?: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shine: { x: 50, y: 50 } });
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * 16, y: -(px - 0.5) * 16, shine: { x: px * 100, y: py * 100 } });
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0, shine: { x: 50, y: 50 } }); setHovered(false); }}
      className={className}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? "scale(1.03)" : "scale(1)"}`,
        transition: hovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
        boxShadow: hovered && glowColor ? `0 20px 60px ${glowColor}, 0 4px 20px rgba(0,0,0,0.4)` : "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Shine overlay */}
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-20"
          style={{
            background: `radial-gradient(circle at ${tilt.shine.x}% ${tilt.shine.y}%, rgba(255,255,255,0.6), transparent 60%)`,
          }}
        />
      )}
      {children}
    </button>
  );
};

const Studio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isExpertStudio = location.pathname.startsWith("/expert/");
  const isAdminStudio = location.pathname.startsWith("/admin/");
  const hasFullCatalog = isExpertStudio || isAdminStudio;
  const { displayName, userId } = useProfile();
  const { toast } = useToast();
  const [view, setView] = useState<StudioView>("home");
  const [projectName, setProjectName] = useState("");
  const [sector, setSector] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("feasibility");
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [theme, setTheme] = useState<Theme>(getStoredTheme());
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [initialContents, setInitialContents] = useState<Record<string, string>>({});
  const [initialCustomTitles, setInitialCustomTitles] = useState<Record<string, string>>({});
  const [initialLanguage, setInitialLanguage] = useState<"en" | "am">("en");
  const [showFromFeasibility, setShowFromFeasibility] = useState(false);
  const [introChoice, setIntroChoice] = useState<"outline" | "list" | null>(null);
  const [pendingSetup, setPendingSetup] = useState<{ name: string; sector: string; serviceDesc: string; loc?: string; scale?: string } | null>(null);

  // Proposition data passed from BusinessProposition page after save
  const incomingProposition = (location.state as any)?.proposition as Record<string, string> | undefined;
  const incomingPhase1 = (location.state as any)?.phase1Answers as Record<string, string> | undefined;
  const [activeProposition, setActiveProposition] = useState<Record<string, string> | null>(incomingProposition ?? null);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setStoredTheme(next);
  };

  const t = (en: string, am: string) => (language === "en" ? en : am);
  const visibleDocTools = hasFullCatalog ? DOC_TOOLS : DOC_TOOLS.filter((tool) => USER_STUDIO_TYPES.includes(tool.type));

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoadingProjects(true);
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (data) {
        setSavedProjects(data as any);
        // If no proposition passed via route state, pick the most recent saved one
        if (!incomingProposition) {
          const latestProp = (data as any[]).find((p: any) => p.document_type === "business_proposition");
          if (latestProp?.contents) setActiveProposition(latestProp.contents as Record<string, string>);
        }
      }
      setLoadingProjects(false);
    };
    load();
  }, [userId]);

  useEffect(() => {
    const state = location.state as any;
    if (state?.resumeProjectId && savedProjects.length > 0) {
      const project = savedProjects.find((p) => p.id === state.resumeProjectId);
      if (project) {
        handleResumeProject(project);
        window.history.replaceState({}, document.title);
      }
    }
  }, [savedProjects, location.state]);

  // Setup complete → for Business Health, jump straight to the diagnostic wizard.
  // Otherwise go to format choice (intro).
  const handleScratchSetupComplete = (name: string, sec: string, serviceDesc: string, loc?: string, scale?: string) => {
    setPendingSetup({ name, sector: sec, serviceDesc, loc, scale });
    if (documentType === "business-health") {
      setProjectName(name);
      setSector(sec);
      setView("health");
      return;
    }
    setIntroChoice(null);
    setView("intro");
  };

  // After format choice, create project and go to editor
  const handleIntroConfirm = async () => {
    if (!pendingSetup) return;
    const { name, sector: sec, serviceDesc } = pendingSetup;
    setProjectName(name);
    setSector(sec);

    // If "list" (free writing), start with empty outline
    const startContents = introChoice === "list" ? {} : {};
    setInitialContents(startContents);
    setInitialCustomTitles({});

    if (userId) {
      const { data, error } = await supabase.from("projects").insert({
        user_id: userId, name, sector: sec, type: introChoice === "list" ? "free" : "outline",
        document_type: documentType, language, contents: {} as any, custom_titles: {} as any,
        service_description: serviceDesc,
        phase1_answers: (incomingPhase1 ?? {}) as any,
      } as any).select("id").single();
      if (data) setCurrentProjectId(data.id);
      if (error) toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    }
    setView("editor");
  };

  const handleTemplateSelect = (templateId: string, sec: string) => {
    setProjectName(`${sec} — New Project`);
    setSector(sec);
    setView("setup");
  };

  const handleResumeProject = (project: SavedProject) => {
    setProjectName(project.name);
    setSector(project.sector);
    setDocumentType((project.document_type || "feasibility") as DocumentType);
    setCurrentProjectId(project.id);
    setInitialContents(project.contents || {});
    setInitialCustomTitles(project.custom_titles || {});
    setInitialLanguage((project.language || "en") as "en" | "am");
    setIntroChoice(project.type === "free" ? "list" : "outline");
    setView("editor");
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    } else {
      setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast({ title: t("Deleted", "ተሰርዟል"), description: t("Project removed.", "ፕሮጀክት ተወግዷል።") });
    }
  };

  const handleFromFeasibility = (project: SavedProject) => {
    setProjectName(`${project.name} — Business Plan`);
    setSector(project.sector);
    setDocumentType("business-plan");
    setInitialContents({ cover: project.contents?.cover || "", "1": project.contents?.["1"] || "" });
    setInitialCustomTitles({});
    setShowFromFeasibility(false);
    setView("setup");
  };

  const completedFeasibilities = savedProjects.filter(
    (p) => p.document_type === "feasibility" && Object.keys(p.contents || {}).length > 5
  );

  const handleToolSelect = (type: DocumentType) => {
    setDocumentType(type);
    setIntroChoice(null);
    if (type === "company-profile" || type === "business-proposal") {
      setView("zi-flow");
      return;
    }
    // Pre-fill setup from saved proposition when available
    if (activeProposition) {
      setPendingSetup({
        name: activeProposition.businessName || "",
        sector: (incomingPhase1 ?? {})?.q1_sector || activeProposition.businessName || "",
        serviceDesc: activeProposition.solution || "",
      });
    } else {
      setPendingSetup(null);
    }
    setView("setup");
  };

  const handleZIComplete = async (answers: Record<string, any>, contents: Record<string, string>) => {
    // Derive a project name from the answers
    const name =
      answers.identity?.companyName ||
      answers.recipient?.recipientName ||
      (documentType === "company-profile" ? "Company Profile" : "Business Proposal");
    const sector = (incomingPhase1 ?? {})?.q1_sector || activeProposition?.businessName || name;

    setProjectName(name);
    setSector(sector);
    setInitialContents(contents);
    setInitialCustomTitles({});
    setIntroChoice("outline");

    if (userId) {
      const { data, error } = await supabase.from("projects").insert({
        user_id: userId,
        name,
        sector,
        type: "zi",
        document_type: documentType,
        language,
        contents: contents as any,
        custom_titles: {} as any,
        service_description: answers.solution || answers.identity?.oneLiner || "",
        phase1_answers: (incomingPhase1 ?? {}) as any,
      } as any).select("id").single();
      if (data) setCurrentProjectId(data.id);
      if (error) toast({ title: "Error", description: "Failed to save project", variant: "destructive" });
    }

    setView("editor");
  };

  const docTypeLabel = (dt: string) => DOC_TOOLS.find((d) => d.type === dt)?.[language === "am" ? "labelAm" : "label"] || dt;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border h-14 flex items-center px-4 sm:px-6 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
            if (view === "home") navigate(isExpertStudio ? "/expert" : "/");
            else if (view === "intro") setView("setup");
            else setView("home");
          }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={zebraLogoLight} alt="Zebra" className="h-6 object-contain hidden sm:block" />
          <span className="font-display text-base sm:text-lg font-bold tracking-tighter truncate max-w-[150px] sm:max-w-none">
            {displayName || "Studio"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setLanguage(language === "en" ? "am" : "en")}
            className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            <Languages className="h-3.5 w-3.5" />
            {language === "en" ? "EN" : "አማ"}
          </button>
          {view === "home" && (
            <Button size="sm" className="hidden sm:inline-flex" onClick={() => { setDocumentType("feasibility"); setView("setup"); }}>
              {t("New Project", "አዲስ ፕሮጀክት")}
            </Button>
          )}
        </div>
      </header>

      {/* HOME VIEW */}
      {view === "home" && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
                {t("Business Propositions", "የንግድ ሃሳቦች")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("Launch a fresh initiative — choose a document tool to begin.", "አዲስ ተነሳሽነት ይጀምሩ — ለመጀመር የሰነድ መሣሪያ ይምረጡ።")}</p>
            </div>

            {/* Business Proposition foundation banner */}
            {activeProposition && (
              <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">
                    {t("Active Business Proposition", "ንቁ ንግድ ሐሳብ")}
                  </p>
                  <p className="font-display font-bold text-sm truncate">{activeProposition.businessName}</p>
                  {activeProposition.solution && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{activeProposition.solution}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate("/studio/business-proposition")}>
                    {t("Edit", "አርትዕ")}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setActiveProposition(null)}>
                    ✕
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {visibleDocTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button key={tool.type} onClick={() => handleToolSelect(tool.type)}
                    className="border border-border rounded-lg p-4 sm:p-5 hover:bg-secondary transition-colors group text-left flex gap-3">
                    <Icon className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm mb-0.5 group-hover:text-primary transition-colors">
                        {language === "am" ? tool.labelAm : tool.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {language === "am" ? tool.descAm : tool.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Button variant="outline" size="sm" onClick={() => { setDocumentType("feasibility"); setView("templates"); }}>
                {t("Browse Templates", "ቅድመ-ቅርጾችን ያስሱ")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFromFeasibility(true)}>
                {t("From Feasibility Study", "ከተግባራዊነት ጥናት")}
              </Button>
            </div>

            {/* From Feasibility Study */}
            {showFromFeasibility && (
              <div className="mb-8 border border-primary/30 bg-primary/5 p-4 sm:p-6 rounded-lg">
                <h3 className="text-base font-display font-bold mb-2">{t("Select Completed Feasibility Study", "የተጠናቀቀ ጥናት ይምረጡ")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("Create a business plan based on your completed feasibility study.", "ከተጠናቀቀ ጥናት ላይ የንግድ ዕቅድ ይፍጠሩ።")}</p>
                {completedFeasibilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("No completed feasibility studies found.", "የተጠናቀቀ ጥናት አልተገኘም።")}</p>
                ) : (
                  <div className="space-y-2">
                    {completedFeasibilities.map((p) => (
                      <button key={p.id} onClick={() => handleFromFeasibility(p)}
                        className="w-full text-left border border-border rounded-sm p-3 hover:bg-secondary transition-colors">
                        <p className="font-display font-bold text-sm">{p.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.sector} · {Object.keys(p.contents || {}).length} sections</p>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowFromFeasibility(false)}>Cancel</Button>
              </div>
            )}

            {/* Resume Projects */}
            {!loadingProjects && savedProjects.length > 0 && (
              <div className="mt-6">
                <div className="border-t border-border mb-4" />
                <h3 className="text-base font-display font-bold mb-3">
                  {t("Resume a Project", "ፕሮጀክት ይቀጥሉ")}
                </h3>
                <div className="space-y-2">
                  {savedProjects.map((p) => (
                    <div key={p.id} className="w-full border border-border rounded-sm p-3 sm:p-4 hover:bg-secondary transition-colors flex items-center justify-between gap-2">
                      <button onClick={() => handleResumeProject(p)} className="flex-1 text-left min-w-0">
                        <p className="font-display font-bold text-sm truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.sector} · {docTypeLabel(p.document_type || "feasibility")}</p>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <p className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResumeProject(p)} title={t("Settings", "ቅንብሮች")}>
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" title={t("Delete", "ሰርዝ")}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("Delete Project?", "ፕሮጀክት ይሰረዝ?")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t(`Are you sure you want to delete "${p.name}"? This cannot be undone.`, `"${p.name}" ን ለመሰረዝ እርግጠኛ ነዎት? ይህ ሊቀለበስ አይችልም።`)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("Cancel", "ይቅር")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProject(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {t("Delete", "ሰርዝ")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* INTRO VIEW - Document format choice (after setup) */}
      {view === "intro" && (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6 text-center">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
                {docTypeLabel(documentType)}
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
                {t("Which format do you prefer?", "የትኛውን ቅርጸት ይመርጣሉ?")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("Choose a starting structure for your new project.", "ለአዲሱ ፕሮጀክትዎ የመነሻ አወቃቀር ይምረጡ።")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setIntroChoice("outline"); }}
                className={`border rounded-lg p-6 text-left transition-all ${
                  introChoice === "outline" ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-border hover:bg-secondary"
                }`}
              >
                <ClipboardList className="h-8 w-8 text-primary mb-3" />
                <p className="font-display font-bold text-base mb-1">{t("Outline View", "ንድፍ እይታ")}</p>
                <p className="text-xs text-muted-foreground">{t("Follow a structured outline with cover page, numbered sections and subsections.", "በሽፋን ገጽ፣ በቁጥር የተደረደሩ ክፍሎች እና ንዑስ ክፍሎች ይከተሉ።")}</p>
              </button>
              <button
                onClick={() => { setIntroChoice("list"); }}
                className={`border rounded-lg p-6 text-left transition-all ${
                  introChoice === "list" ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-border hover:bg-secondary"
                }`}
              >
                <FileText className="h-8 w-8 text-primary mb-3" />
                <p className="font-display font-bold text-base mb-1">{t("Free Writing", "ነፃ ጽሑፍ")}</p>
                <p className="text-xs text-muted-foreground">{t("Start with an empty workspace. Add, remove, or reorder sections as needed.", "ባዶ የሥራ ቦታ ይጀምሩ። ክፍሎችን እንደፈለጉ ያክሉ፣ ያስወግዱ ወይም ያስተካክሉ።")}</p>
              </button>
            </div>

            <Button className="w-full h-11" disabled={!introChoice} onClick={handleIntroConfirm}>
              {t("Start Writing", "መጻፍ ይጀምሩ")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView("setup")}>
              {t("← Back to Setup", "← ወደ ማዋቀር ተመለስ")}
            </Button>
          </div>
        </main>
      )}

      {view === "setup" && (
        <ProjectSetup onComplete={handleScratchSetupComplete} language={language} />
      )}

      {view === "templates" && (
        <TemplateBrowser onSelect={handleTemplateSelect} onBack={() => setView("home")} />
      )}

      {view === "editor" && (
        <EditorView
          projectName={projectName}
          sector={sector}
          documentType={documentType}
          onBack={() => setView("home")}
          projectId={currentProjectId || undefined}
          initialContents={initialContents}
          initialCustomTitles={initialCustomTitles}
          initialLanguage={initialLanguage}
          useEmptyOutline={introChoice === "list"}
        />
      )}

      {view === "health" && (
        <HealthDiagnostic
          businessName={projectName}
          sector={sector}
          language={language}
          projectId={currentProjectId}
          onBack={() => setView("home")}
        />
      )}

      {view === "zi-flow" && (documentType === "company-profile" || documentType === "business-proposal") && (
        <ZIQuestionFlow
          documentType={documentType}
          initialLanguage={language}
          onComplete={handleZIComplete}
          onBack={() => setView("home")}
        />
      )}
    </div>
  );
};

export default Studio;
