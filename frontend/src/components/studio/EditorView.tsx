import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FEASIBILITY_OUTLINE, type OutlineNode } from "@/lib/feasibility-outline";
import { BUSINESS_PLAN_OUTLINE } from "@/lib/business-plan-outline";
import { STRATEGIC_BUSINESS_OUTLINE } from "@/lib/strategic-business-outline";
import { ORG_STRUCTURE_OUTLINE } from "@/lib/org-structure-outline";
import { PERFORMANCE_TRACKING_OUTLINE } from "@/lib/performance-tracking-outline";
import { BUSINESS_HEALTH_OUTLINE } from "@/lib/business-health-outline";
import { COMPANY_PROFILE_OUTLINE } from "@/lib/company-profile-outline";
import { BUSINESS_PROPOSAL_OUTLINE } from "@/lib/business-proposal-outline";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateProject } from "@/lib/projects-api";
import { exportPDF, exportDOCX } from "@/lib/export-document";
import WritingProgress from "./WritingProgress";
import PrintPreview from "./PrintPreview";
import {
  ChevronRight, ChevronDown, Sparkles, FileText, ArrowLeft, Plus, Languages,
  Pencil, Paperclip, Image, FileUp, Loader2, Download, Eye, Menu, X, Trash2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent,
} from "@/components/ui/sheet";

type Language = "en" | "am";
type DocumentType = "feasibility" | "business-plan" | "strategic-business" | "org-structure" | "performance-tracking" | "business-health" | "company-profile" | "business-proposal";

interface EditorViewProps {
  projectName: string;
  sector: string;
  documentType: DocumentType;
  onBack: () => void;
  projectId?: string;
  initialContents?: Record<string, string>;
  initialCustomTitles?: Record<string, string>;
  initialOutline?: OutlineNode[];
  initialLanguage?: Language;
  useEmptyOutline?: boolean;
}

const flattenNodes = (nodes: OutlineNode[]): OutlineNode[] => {
  const result: OutlineNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) result.push(...flattenNodes(node.children));
  }
  return result;
};

const NodeItem = ({
  node, depth, activeId, onSelect, language, customTitles, onEditTitle, onDelete,
}: {
  node: OutlineNode; depth: number; activeId: string; onSelect: (id: string) => void;
  language: Language; customTitles: Record<string, string>; onEditTitle: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activeId === node.id;
  const displayTitle = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);

  const handleStartEdit = (e: React.MouseEvent) => { e.stopPropagation(); setEditValue(displayTitle); setEditing(true); };
  const handleSaveEdit = () => { if (editValue.trim()) onEditTitle(node.id, editValue.trim()); setEditing(false); };

  return (
    <div>
      <div
        className={`w-full flex items-center gap-1.5 px-3 py-2 text-sm transition-colors group ${
          isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-secondary text-foreground"
        }`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        <button onClick={() => { onSelect(node.id); if (hasChildren) setExpanded(!expanded); }}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
          {hasChildren ? (expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />) : <FileText className="h-3.5 w-3.5 shrink-0 opacity-50" />}
          <span className="font-mono text-[10px] opacity-50 w-7 shrink-0">{node.id}</span>
          {editing ? (
            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSaveEdit}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditing(false); }}
              className="h-6 text-xs px-1 py-0 bg-background text-foreground" autoFocus onClick={(e) => e.stopPropagation()} />
          ) : <span className="truncate text-xs">{displayTitle}</span>}
        </button>
        {!editing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={handleStartEdit} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} title="Edit">
              <Pencil className="h-3 w-3" />
            </button>
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                className={`${isActive ? "text-primary-foreground hover:text-destructive" : "text-muted-foreground hover:text-destructive"}`} title="Delete">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
      {hasChildren && expanded && (
        <div>{node.children!.map((child) => (
          <NodeItem key={child.id} node={child} depth={depth + 1} activeId={activeId} onSelect={onSelect} language={language} customTitles={customTitles} onEditTitle={onEditTitle} onDelete={onDelete} />
        ))}</div>
      )}
    </div>
  );
};

const EditorView = ({ projectName, sector, documentType, onBack, projectId, initialContents, initialCustomTitles, initialOutline, initialLanguage, useEmptyOutline }: EditorViewProps) => {
  const [activeNodeId, setActiveNodeId] = useState("cover");
  const [contents, setContents] = useState<Record<string, string>>(initialContents || {});
  const [language, setLanguage] = useState<Language>(initialLanguage || "en");
  const [customTitles, setCustomTitles] = useState<Record<string, string>>(initialCustomTitles || {});
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<Record<string, { file: File; url: string }[]>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const outlineMap: Record<DocumentType, OutlineNode[]> = {
    "feasibility": FEASIBILITY_OUTLINE,
    "business-plan": BUSINESS_PLAN_OUTLINE,
    "strategic-business": STRATEGIC_BUSINESS_OUTLINE,
    "org-structure": ORG_STRUCTURE_OUTLINE,
    "performance-tracking": PERFORMANCE_TRACKING_OUTLINE,
    "business-health": BUSINESS_HEALTH_OUTLINE,
    "company-profile": COMPANY_PROFILE_OUTLINE,
    "business-proposal": BUSINESS_PROPOSAL_OUTLINE,
  };

  const baseOutline = outlineMap[documentType] || FEASIBILITY_OUTLINE;

  // If free writing mode, start with just a cover page; otherwise use full outline
  const [outline, setOutline] = useState<OutlineNode[]>(() => {
    if (initialOutline?.length) return initialOutline;
    if (useEmptyOutline) {
      return [{ id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" }];
    }
    return baseOutline;
  });

  const allNodes = flattenNodes(outline);
  const activeNode = allNodes.find((n) => n.id === activeNodeId);
  const currentContent = contents[activeNodeId] || "";
  const currentAttachments = attachments[activeNodeId] || [];

  const activeTitle = customTitles[activeNodeId] || (language === "am" && activeNode?.titleAm ? activeNode.titleAm : activeNode?.title) || "Select a section";

  const handleEditTitle = (id: string, title: string) => setCustomTitles((prev) => ({ ...prev, [id]: title }));

  // Add a new outline section
  const handleAddSection = () => {
    const nextId = `s${outline.length + 1}`;
    const newNode: OutlineNode = { id: nextId, title: `New Section ${outline.length}`, titleAm: `አዲስ ክፍል ${outline.length}` };
    setOutline((prev) => [...prev, newNode]);
    setActiveNodeId(nextId);
    toast({ title: language === "en" ? "Section added" : "ክፍል ተጨምሯል" });
  };

  // Delete an outline section
  const handleDeleteSection = (id: string) => {
    if (outline.length <= 1) {
      toast({ title: language === "en" ? "Cannot delete" : "መሰረዝ አይቻልም", description: language === "en" ? "At least one section is required." : "ቢያንስ አንድ ክፍል ያስፈልጋል።", variant: "destructive" });
      return;
    }
    const removeNode = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes
        .filter((n) => n.id !== id)
        .map((n) => n.children ? { ...n, children: removeNode(n.children) } : n);
    };
    setOutline((prev) => removeNode(prev));
    // Clean up content
    setContents((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setCustomTitles((prev) => { const next = { ...prev }; delete next[id]; return next; });
    if (activeNodeId === id) {
      setActiveNodeId(outline[0]?.id || "cover");
    }
    toast({ title: language === "en" ? "Section deleted" : "ክፍል ተሰርዟል" });
  };

  const saveToDb = useCallback((c: Record<string, string>, ct: Record<string, string>, currentOutline: OutlineNode[]) => {
    if (!projectId) return Promise.resolve(true);
    const save = saveQueue.current
      .catch(() => undefined)
      .then(() => updateProject(projectId, { contents: c, custom_titles: ct, outline: currentOutline, language }))
      .then(() => undefined);
    saveQueue.current = save;
    return save.then(
      () => true,
      (error: unknown) => {
      console.error("Failed to save project:", error);
      toast({ title: "Save failed", description: "Your changes could not be saved. Please try again.", variant: "destructive" });
        return false;
      }
    );
  }, [projectId, language, toast]);

  useEffect(() => {
    if (!projectId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void saveToDb(contents, customTitles, outline);
    }, 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [contents, customTitles, outline, saveToDb, projectId]);

  const handleBack = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (await saveToDb(contents, customTitles, outline)) onBack();
  };

  const handleAIDraft = async () => {
    if (!activeNode) return;
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Error", description: "Not authenticated", variant: "destructive" }); return; }

      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
      const resp = await fetch(`${API_URL}/api/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ sectionId: activeNodeId, sectionTitle: activeTitle, projectName, sector, language, documentType, existingContent: currentContent || undefined }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Generation failed" })); toast({ title: "Error", description: err.error, variant: "destructive" }); return; }
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buffer = ""; let generated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try { const p = JSON.parse(jsonStr); const c = p.choices?.[0]?.delta?.content; if (c) { generated += c; setContents((prev) => ({ ...prev, [activeNodeId]: generated })); } }
          catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) { console.error(e); toast({ title: "Error", description: "AI generation failed.", variant: "destructive" }); }
    finally { setIsGenerating(false); }
  };

  const handleFileSelect = (accept: string) => { if (fileInputRef.current) { fileInputRef.current.accept = accept; fileInputRef.current.click(); } };
  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setAttachments((prev) => ({ ...prev, [activeNodeId]: [...(prev[activeNodeId] || []), ...newAttachments] }));
      toast({ title: `${files.length} file(s) attached` });
    }
    e.target.value = "";
  };
  const removeAttachment = (idx: number) => {
    const att = attachments[activeNodeId]?.[idx];
    if (att) URL.revokeObjectURL(att.url);
    setAttachments((prev) => ({ ...prev, [activeNodeId]: (prev[activeNodeId] || []).filter((_, i) => i !== idx) }));
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const isPDF = (name: string) => /\.pdf$/i.test(name);

  const docLabels: Record<string, string> = {
    "feasibility": "Feasibility Study",
    "business-plan": "Business Plan",
    "strategic-business": "Strategic Business Development",
    "org-structure": "Organizational Structure",
    "performance-tracking": "Performance Tracking",
    "business-health": "Business Health Analysis",
    "company-profile": "Company Profile",
    "business-proposal": "Business Proposal",
  };
  const docLabel = docLabels[documentType] || "Document";

  const sidebarContent = (
    <>
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground truncate">{sector}</p>
          <button onClick={() => setLanguage(language === "en" ? "am" : "en")}
            className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors" title="Toggle language">
            <Languages className="h-3 w-3" />{language === "en" ? "EN" : "አማ"}
          </button>
        </div>
        <p className="font-display font-bold text-sm truncate">{projectName}</p>
        <p className="font-mono text-[9px] uppercase text-muted-foreground tracking-wider mt-0.5">{docLabel}</p>
      </div>

      <WritingProgress outline={outline} contents={contents} language={language} customTitles={customTitles} />

      <ScrollArea className="flex-1">
        <div className="py-1">
          {outline.map((node) => (
            <NodeItem key={node.id} node={node} depth={0} activeId={activeNodeId}
              onSelect={(id) => { setActiveNodeId(id); setSidebarOpen(false); }}
              language={language} customTitles={customTitles} onEditTitle={handleEditTitle}
              onDelete={handleDeleteSection} />
          ))}
        </div>
      </ScrollArea>

      {/* Add new section button */}
      <div className="border-t border-sidebar-border p-2">
        <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs" onClick={handleAddSection}>
          <Plus className="h-3.5 w-3.5" /> {language === "en" ? "Add Section" : "ክፍል ያክሉ"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChosen} />

      {/* Desktop Sidebar */}
      <div className="w-64 lg:w-72 border-r border-border hidden md:flex flex-col bg-sidebar">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 md:hidden flex flex-col">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => void handleBack()} className="h-8 w-8 hidden md:flex shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
            <div className="min-w-0">
              <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Section {activeNodeId}</p>
              <h3 className="font-display font-bold text-sm sm:text-lg tracking-tight leading-tight truncate">{activeTitle}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <PrintPreview projectName={projectName} sector={sector} documentType={documentType} outline={outline} contents={contents} customTitles={customTitles} language={language}>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" title="Print Preview">
                <Eye className="h-4 w-4" />
              </Button>
            </PrintPreview>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9"><Download className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportPDF(projectName, outline, contents, customTitles, language)}>
                  {language === "en" ? "Export as PDF" : "PDF አድርጎ ይላኩ"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportDOCX(projectName, outline, contents, customTitles, language)}>
                  {language === "en" ? "Export as DOCX" : "DOCX አድርጎ ይላኩ"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9"><Plus className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFileSelect(".pdf,.doc,.docx")}><FileUp className="h-4 w-4 mr-2" />{language === "en" ? "Add Document" : "ሰነድ ያክሉ"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileSelect("image/*")}><Image className="h-4 w-4 mr-2" />{language === "en" ? "Add Image" : "ምስል ያክሉ"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileSelect("*")}><Paperclip className="h-4 w-4 mr-2" />{language === "en" ? "Add Reference" : "ማጣቀሻ ያክሉ"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" className="gap-1 font-bold h-8 sm:h-9 px-2 sm:px-3" onClick={handleAIDraft} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="hidden sm:inline">Z</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {currentAttachments.length > 0 && (
            <div className="mb-4 space-y-3">
              <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                {language === "en" ? "Attachments" : "አባሪዎች"} ({currentAttachments.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentAttachments.map((att, idx) => (
                  <div key={idx} className="border border-border rounded-sm overflow-hidden group relative">
                    {isImage(att.file.name) ? (
                      <img src={att.url} alt={att.file.name} className="w-full h-24 sm:h-32 object-cover" />
                    ) : isPDF(att.file.name) ? (
                      <div className="h-24 sm:h-32 flex items-center justify-center bg-secondary">
                        <div className="text-center">
                          <FileUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-1" />
                          <p className="text-[10px] font-mono text-muted-foreground">PDF</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 sm:h-32 flex items-center justify-center bg-secondary">
                        <div className="text-center">
                          <Paperclip className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-1" />
                          <p className="text-[10px] font-mono text-muted-foreground">{att.file.name.split(".").pop()?.toUpperCase()}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-2 flex items-center justify-between">
                      <p className="text-[10px] font-mono text-muted-foreground truncate flex-1">{att.file.name}</p>
                      <button onClick={() => removeAttachment(idx)} className="text-muted-foreground hover:text-destructive ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Textarea
            placeholder={language === "en" ? `Start writing content for "${activeTitle}"...\n\nOr click "Z" to generate professional content using AI.` : `ለ "${activeTitle}" ይዘት መጻፍ ይጀምሩ...\n\nወይም "Z" ን በመጫን AI ሙያዊ ይዘት ያመንጩ።`}
            value={currentContent}
            onChange={(e) => setContents((prev) => ({ ...prev, [activeNodeId]: e.target.value }))}
            className="min-h-[300px] sm:min-h-[400px] resize-none border-none shadow-none text-base leading-relaxed focus-visible:ring-0 p-0"
          />
        </div>
      </div>
    </div>
  );
};

export default EditorView;
