import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, BadgeCheck, Download, Edit3, Loader2, ListTree } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseTemplateDocument, buildContentsFromTemplate } from "@/lib/parse-template";
import { exportPDF } from "@/lib/export-document";
import PremiumCheckoutDialog from "./PremiumCheckoutDialog";

export interface MarketTemplate {
  id: string;
  title: string;
  description: string;
  sector: string;
  category: string;
  document_type: string;
  is_premium: boolean;
  price_cents: number;
  owner_name: string;
  owner_type: string;
  is_verified: boolean;
  rating: number;
  rating_count: number;
  summary: string | null;
  full_document: string | null;
}

interface Props {
  template: MarketTemplate | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const docTypeLabel = (t: string) => ({
  feasibility: "Feasibility Study",
  business_plan: "Business Plan",
  company_profile: "Company Profile",
  org_structure: "Organizational Structure",
  performance: "Performance Tracking",
  business_health: "Business Health",
}[t] || t);

export default function TemplatePreviewDialog({ template, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<"download" | "studio" | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [fullDoc, setFullDoc] = useState<string>("");

  useEffect(() => {
    setFullDoc("");
    if (!template || !open) return;
    if (template.is_premium) return; // premium preview limited to outline metadata; full doc fetched at checkout
    (supabase.rpc as any)("get_template_full_document", { _template_id: template.id }).then(({ data }: any) => {
      if (typeof data === "string") setFullDoc(data);
    });
  }, [template?.id, open]);

  if (!template) return null;

  const parsed = parseTemplateDocument(fullDoc || "");

  const requireAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return null;
    }
    return session;
  };

  const handleDownload = async () => {
    if (template.is_premium) {
      setCheckoutOpen(true);
      return;
    }
    setBusy("download");
    try {
      const fakeOutline = parsed.titles.map((title, i) => ({
        id: String(i + 1),
        title,
        titleAm: undefined,
        children: [],
      })) as any;
      const { contents } = buildContentsFromTemplate(parsed);
      exportPDF(template.title, fakeOutline, contents, {}, "en");
      toast.success("Opening print preview...");
    } finally {
      setBusy(null);
    }
  };

  const handleUseInStudio = async () => {
    if (template.is_premium) {
      setCheckoutOpen(true);
      return;
    }
    const session = await requireAuth();
    if (!session) return;
    setBusy("studio");
    const { contents, customTitles } = buildContentsFromTemplate(parsed);
    const docTypeMap: Record<string, string> = {
      feasibility: "feasibility",
      business_plan: "business-plan",
      company_profile: "org-structure",
      org_structure: "org-structure",
      performance: "performance-tracking",
      business_health: "business-health",
    };
    const { data, error } = await supabase.from("projects").insert({
      user_id: session.user.id,
      name: `${template.title} — My Copy`,
      sector: template.sector,
      type: "free",
      template_id: template.id,
      document_type: docTypeMap[template.document_type] || "feasibility",
      contents: contents as any,
      custom_titles: customTitles as any,
      language: "en",
    }).select("id").single();
    setBusy(null);
    if (error || !data) {
      toast.error(error?.message || "Could not create project");
      return;
    }
    onOpenChange(false);
    navigate("/studio", { state: { resumeProjectId: data.id } });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-2xl font-display flex items-center gap-2 flex-wrap">
                  {template.title}
                  {template.is_verified && <BadgeCheck className="h-5 w-5 text-primary shrink-0" />}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  by <span className="font-semibold text-foreground">{template.owner_name}</span> ·{" "}
                  <Badge variant="outline" className="text-[10px] ml-1">{docTypeLabel(template.document_type)}</Badge>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                {template.rating.toFixed(1)} ({template.rating_count})
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-3 -mr-3">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Summary</h4>
                <p className="text-sm leading-relaxed">{template.summary || template.description}</p>
              </div>

              {parsed.titles.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ListTree className="h-3.5 w-3.5" /> Document Outline
                  </h4>
                  <ol className="space-y-1.5">
                    {parsed.titles.map((title, i) => (
                      <li key={i} className="text-sm flex gap-3 border-l-2 border-border pl-3 py-1">
                        <span className="font-mono text-xs text-muted-foreground w-6">{i + 1}.</span>
                        <span>{title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {template.is_premium && (
                <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Premium Template</p>
                  <p className="text-2xl font-display font-bold">ETB {(template.price_cents / 100).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    One-time purchase. Download as PDF or open directly in Studio after payment confirmation.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={busy !== null}>
              {busy === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {template.is_premium ? "Buy & Download PDF" : "Download PDF"}
            </Button>
            <Button className="flex-1" onClick={handleUseInStudio} disabled={busy !== null}>
              {busy === "studio" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4 mr-2" />}
              {template.is_premium ? "Buy & Use in Studio" : "Use in Studio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumCheckoutDialog
        template={template}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSuccess={() => {
          setCheckoutOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
