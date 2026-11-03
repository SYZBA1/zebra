import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Star, BadgeCheck, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TemplatePreviewDialog, { type MarketTemplate } from "@/components/marketplace/TemplatePreviewDialog";

type Filter = "all" | "free" | "premium" | "official" | "company";
type DocFilter = "all" | "feasibility" | "business_plan" | "company_profile" | "org_structure" | "performance" | "business_health";

const DOC_TYPES: { value: DocFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "feasibility", label: "Feasibility" },
  { value: "business_plan", label: "Business Plan" },
  { value: "company_profile", label: "Company Profile" },
  { value: "org_structure", label: "Org Structure" },
  { value: "performance", label: "Performance" },
];

const docLabel = (t: string) => DOC_TYPES.find(d => d.value === t)?.label || t;

const Marketplace = () => {
  const [templates, setTemplates] = useState<MarketTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [docFilter, setDocFilter] = useState<DocFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MarketTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("marketplace_templates")
        .select("id,title,description,sector,category,document_type,is_premium,price_cents,owner_name,owner_type,is_verified,rating,rating_count,summary,cover_image_url,created_at,review_status")
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false });
      if (data) setTemplates(data as any);
      setLoading(false);
    };
    load();
  }, []);

  const fuzzyMatch = (t: MarketTemplate, q: string) => {
    if (!q) return true;
    const hay = `${t.title} ${t.description} ${t.sector} ${t.owner_name} ${t.summary || ""}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every(token => hay.includes(token));
  };

  const filtered = useMemo(() => templates.filter((t) => {
    if (filter === "free" && t.is_premium) return false;
    if (filter === "premium" && !t.is_premium) return false;
    if (filter === "official" && t.owner_type !== "official") return false;
    if (filter === "company" && t.owner_type === "community") return false;
    if (docFilter !== "all" && t.document_type !== docFilter) return false;
    if (!fuzzyMatch(t, search)) return false;
    return true;
  }), [templates, filter, docFilter, search]);

  const openPreview = (t: MarketTemplate) => { setSelected(t); setPreviewOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <motion.div className="max-w-2xl mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
              <Sparkles className="inline h-3.5 w-3.5 mr-1" /> Marketplace
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
              Document Blueprints
            </h1>
            <p className="text-muted-foreground text-lg">
              Verified templates from Ethiopian institutions, companies, and the Zebra community. Preview, download, or open directly in the Studio.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-xl mb-5">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, sector, owner, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(["all", "free", "premium", "official", "company"] as Filter[]).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
                {f === "all" ? "All" : f}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {DOC_TYPES.map((d) => (
              <Button key={d.value} variant={docFilter === d.value ? "secondary" : "ghost"} size="sm" onClick={() => setDocFilter(d.value)} className="text-xs">
                {d.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-muted-foreground font-mono text-sm">Loading templates...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground font-mono text-sm py-12 text-center">No templates match your filters.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((t, i) => (
                <motion.button
                  key={t.id}
                  onClick={() => openPreview(t)}
                  className="border border-border p-5 flex flex-col text-left hover:border-primary hover:bg-secondary/50 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-mono">{docLabel(t.document_type)}</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">{t.sector}</Badge>
                    {t.owner_type === "official" && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <BadgeCheck className="h-2.5 w-2.5" /> Official
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold tracking-tight mb-1 group-hover:text-primary transition-colors flex items-start gap-1.5">
                    {t.title}
                    {t.is_verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>

                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-mono text-muted-foreground truncate">{t.owner_name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="font-mono">{Number(t.rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">({t.rating_count})</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {t.is_premium ? (
                      <span className="text-sm font-display font-bold text-primary flex items-center gap-1">
                        <Lock className="h-3 w-3" /> ETB {(t.price_cents / 100).toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-xs font-mono uppercase tracking-widest text-primary">Free</span>
                    )}
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Preview →</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <TemplatePreviewDialog template={selected} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
};

export default Marketplace;
